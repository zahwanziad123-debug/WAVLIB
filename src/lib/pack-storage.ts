import { ARTWORK_BUCKET, STORAGE_BUCKET, supabase } from './supabase';
import { analyzeWav } from './audio-metadata';

export type PackUploadInput = { name: string; description?: string; creator?: string; tags?: string[]; artwork?: File | null; samples: File[] };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const unique = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
function cleanFileName(name: string) { return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
function hasToken(value: string, token: string) { return new RegExp(`(?:^|[-_\\s])${token}(?=$|[-_\\s.])`, 'i').test(value); }
function inferSampleType(name: string) {
  const value = name.toLowerCase();
  if (hasToken(value, 'loop') || hasToken(value, 'loops') || /phrase|groove|beat|bassline|melody|chord|arp|sequence/i.test(value)) return 'Loop';
  if (/one[-_ ]?shot|oneshot|hit|stab|kick|snare|clap|hat|perc|tom|crash|impact|riser|fx/i.test(value)) return 'One Shot';
  if (/texture|drone|atmos/i.test(value)) return 'Texture';
  if (/drum/i.test(value)) return 'Drums';
  if (/bass|sub/i.test(value)) return 'Bass';
  if (/vocal/i.test(value)) return 'Vocals';
  return 'One Shot';
}
async function ensureTag(name: string) { const normalized = name.trim(); const { data: existing, error: findError } = await supabase.from('tags').select('id,name').ilike('name', normalized).limit(1).maybeSingle(); if (findError) throw findError; if (existing) return existing; const { data, error } = await supabase.from('tags').insert({ name: normalized }).select('id,name').single(); if (!error && data) return data; const { data: raced, error: raceError } = await supabase.from('tags').select('id,name').ilike('name', normalized).limit(1).maybeSingle(); if (raceError || !raced) throw error || raceError || new Error(`Could not create tag “${normalized}”.`); return raced; }
async function getUniqueSlug(base: string) { const clean = slugify(base) || 'sound-pack'; const { data, error } = await supabase.from('packs').select('slug').ilike('slug', `${clean}%`); if (error) throw error; const used = new Set((data ?? []).map((row) => row.slug).filter(Boolean)); if (!used.has(clean)) return clean; let index = 2; while (used.has(`${clean}-${index}`)) index += 1; return `${clean}-${index}`; }
export async function createPackWithFiles(input: PackUploadInput, onProgress?: (completed: number, total: number) => void) {
  const name = input.name.trim(); const samples = input.samples.filter(Boolean); const tags = unique(input.tags ?? []); if (!name) throw new Error('Pack name is required.'); if (!samples.length) throw new Error('Add at least one WAV sample.'); if (samples.some((file) => !file.name.toLowerCase().endsWith('.wav'))) throw new Error('Only WAV samples can be uploaded.'); if (input.artwork && !input.artwork.type.startsWith('image/')) throw new Error('Pack artwork must be an image.');
  const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('You must be signed in to upload a pack.');
  const slug = await getUniqueSlug(name); const { data: pack, error: packError } = await supabase.from('packs').insert({ name, slug, description: input.description?.trim() || null, creator: input.creator?.trim() || 'WAVLIB Sound Library', tags, owner_id: user.id }).select('*').single(); if (packError) throw packError;
  const uploaded: { bucket: string; path: string }[] = []; const createdSampleIds: number[] = [];
  try {
    if (input.artwork) { const ext = input.artwork.name.split('.').pop()?.toLowerCase() || 'jpg'; const artworkPath = `${slug}/artwork.${ext}`; const { error } = await supabase.storage.from(ARTWORK_BUCKET).upload(artworkPath, input.artwork, { contentType: input.artwork.type || 'image/jpeg', cacheControl: '31536000', upsert: false }); if (error) throw error; uploaded.push({ bucket: ARTWORK_BUCKET, path: artworkPath }); const artworkUrl = supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(artworkPath).data.publicUrl; const { error: updateError } = await supabase.from('packs').update({ artwork_path: artworkPath, artwork_url: artworkUrl }).eq('id', pack.id); if (updateError) throw updateError; pack.artwork_path = artworkPath; pack.artwork_url = artworkUrl; }
    const tagRows = []; for (const tagName of tags) tagRows.push(await ensureTag(tagName)); let completed = 0;
    for (const file of samples) { const safeName = cleanFileName(file.name) || `sample-${completed + 1}.wav`; const storagePath = `${slug}/${crypto.randomUUID()}-${safeName}`; const metadata = await analyzeWav(file); const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, { contentType: 'audio/wav', cacheControl: '31536000', upsert: false }); if (uploadError) throw uploadError; uploaded.push({ bucket: STORAGE_BUCKET, path: storagePath }); const { data: sample, error: sampleError } = await supabase.from('samples').insert({ pack_id: pack.id, name: file.name, audio_url: storagePath, storage_path: storagePath, owner_id: user.id, type: inferSampleType(file.name), bpm: metadata.bpm, key: metadata.key, duration: metadata.duration, waveform: metadata.waveform, metadata: { original_name: file.name, size: file.size, mime_type: 'audio/wav' } }).select('id').single(); if (sampleError) throw sampleError; createdSampleIds.push(sample.id); if (tagRows.length) { const { error: linkError } = await supabase.from('sample_tags').insert(tagRows.map((tag) => ({ sample_id: sample.id, tag_id: tag.id }))); if (linkError) throw linkError; } onProgress?.(++completed, samples.length); }
    return pack;
  } catch (error) { if (createdSampleIds.length) await supabase.from('sample_tags').delete().in('sample_id', createdSampleIds); await supabase.from('samples').delete().eq('pack_id', pack.id); await supabase.from('packs').delete().eq('id', pack.id); for (const item of uploaded) await supabase.storage.from(item.bucket).remove([item.path]); throw error; }
}
export function getSamplePublicUrl(storagePath: string) { return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl; }
export function getArtworkPublicUrl(storagePath: string) { return supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(storagePath).data.publicUrl; }
