import { supabase, STORAGE_BUCKET } from './supabase';

export type PackUploadInput = {
  name: string;
  description?: string;
  creator?: string;
  tags?: string[];
  artwork?: File | null;
  samples: File[];
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const unique = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));

function cleanFileName(name: string) {
  return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
}

async function ensureTag(name: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const normalized = name.trim();
  const { data: existing, error: findError } = await supabase.from('tags').select('id,name').ilike('name', normalized).limit(1).maybeSingle();
  if (findError) throw findError;
  if (existing) return existing;
  const { data, error } = await supabase.from('tags').insert({ name: normalized }).select('id,name').single();
  if (error) throw error;
  return data;
}

export async function createPackWithFiles(input: PackUploadInput, onProgress?: (completed: number, total: number) => void) {
  if (!supabase) throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  if (!input.name.trim()) throw new Error('Pack name is required.');
  if (!input.samples.length) throw new Error('Add at least one WAV sample.');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to upload a pack.');

  const slug = slugify(input.name);
  const { data: pack, error: packError } = await supabase.from('packs').insert({
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    creator: input.creator?.trim() || 'WAVLIB Sound Library',
    tags: unique(input.tags ?? []),
    owner_id: user.id,
  }).select('*').single();
  if (packError) throw packError;

  try {
    let artworkPath: string | null = null;
    if (input.artwork) {
      const ext = input.artwork.name.split('.').pop()?.toLowerCase() || 'jpg';
      artworkPath = `${slug}/artwork.${ext}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(artworkPath, input.artwork, {
        contentType: input.artwork.type || 'image/jpeg',
        upsert: false,
      });
      if (error) throw error;
      await supabase.from('packs').update({ artwork_path: artworkPath }).eq('id', pack.id);
    }

    const tagRows = [];
    for (const tagName of unique(input.tags ?? [])) tagRows.push(await ensureTag(tagName));

    let completed = 0;
    const total = input.samples.length;
    for (const file of input.samples) {
      const safeName = cleanFileName(file.name);
      const storagePath = `${slug}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
        contentType: file.type || 'audio/wav',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: sample, error: sampleError } = await supabase.from('samples').insert({
        pack_id: pack.id,
        name: file.name,
        audio_url: storagePath,
        storage_path: storagePath,
        owner_id: user.id,
        type: file.type || 'audio/wav',
        metadata: { original_name: file.name, size: file.size, mime_type: file.type || 'audio/wav' },
      }).select('id').single();
      if (sampleError) throw sampleError;

      if (tagRows.length) {
        const { error: linkError } = await supabase.from('sample_tags').insert(tagRows.map((tag) => ({ sample_id: sample.id, tag_id: tag.id })));
        if (linkError) throw linkError;
      }
      completed += 1;
      onProgress?.(completed, total);
    }

    return pack;
  } catch (error) {
    // Keep database/storage consistent when an upload fails midway.
    await supabase.from('samples').delete().eq('pack_id', pack.id);
    await supabase.storage.from(STORAGE_BUCKET).remove([`${slug}/artwork.jpg`, `${slug}/artwork.jpeg`, `${slug}/artwork.png`, `${slug}/artwork.webp`]);
    const { data: objects } = await supabase.storage.from(STORAGE_BUCKET).list(slug);
    if (objects?.length) await supabase.storage.from(STORAGE_BUCKET).remove(objects.map((object) => `${slug}/${object.name}`));
    await supabase.from('packs').delete().eq('id', pack.id);
    throw error;
  }
}

export function getSamplePublicUrl(storagePath: string) {
  if (!supabase) return '';
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
