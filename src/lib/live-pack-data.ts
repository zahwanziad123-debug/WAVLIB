import { STORAGE_BUCKET, supabase } from './supabase';

export type LivePack = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  creator: string | null;
  tags: string[];
  artworkUrl: string | null;
  createdAt: string | null;
};

export type LiveSample = {
  id: number;
  name: string;
  type: string;
  tags: string[];
  bpm: number | null;
  key: string | null;
  duration: number | null;
  audioUrl: string;
  waveform: number[] | null;
};

function codeFromName(name: string) {
  const words = name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'WL';
  const letters = words.map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  return letters.padEnd(2, 'W');
}

function mapPack(row: any): LivePack {
  const artworkUrl = row.artwork_url || (row.artwork_path
    ? supabase.storage.from('artwork').getPublicUrl(row.artwork_path).data.publicUrl
    : null);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    creator: row.creator ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    artworkUrl,
    createdAt: row.created_at ?? null,
  };
}

export function packCode(name: string) {
  return codeFromName(name);
}

export async function listLivePacks(limit = 50) {
  const { data, error } = await supabase
    .from('packs')
    .select('id,name,slug,description,creator,tags,artwork_path,artwork_url,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapPack);
}

export async function getLivePack(slug: string) {
  const { data, error } = await supabase
    .from('packs')
    .select('id,name,slug,description,creator,tags,artwork_path,artwork_url,created_at')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPack(data) : null;
}

export async function getLivePackSamples(packId: number) {
  const { data: samples, error } = await supabase
    .from('samples')
    .select('id,name,type,bpm,key,duration,audio_url,storage_path,waveform')
    .eq('pack_id', packId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const ids = (samples ?? []).map((sample) => sample.id);
  const tagMap = new Map<number, string[]>();
  if (ids.length) {
    const { data: links, error: linkError } = await supabase
      .from('sample_tags')
      .select('sample_id,tag_id')
      .in('sample_id', ids);
    if (linkError) throw linkError;

    const tagIds = Array.from(new Set((links ?? []).map((link) => link.tag_id)));
    if (tagIds.length) {
      const { data: tags, error: tagError } = await supabase.from('tags').select('id,name').in('id', tagIds);
      if (tagError) throw tagError;
      const names = new Map((tags ?? []).map((tag) => [tag.id, tag.name]));
      for (const link of links ?? []) {
        const name = names.get(link.tag_id);
        if (!name) continue;
        tagMap.set(link.sample_id, [...(tagMap.get(link.sample_id) ?? []), name]);
      }
    }
  }

  return (samples ?? []).map((sample): LiveSample => ({
    id: sample.id,
    name: sample.name,
    type: sample.type || 'One Shot',
    tags: tagMap.get(sample.id) ?? [],
    bpm: sample.bpm ?? null,
    key: sample.key ?? null,
    duration: sample.duration ?? null,
    audioUrl: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(sample.storage_path || sample.audio_url).data.publicUrl,
    waveform: Array.isArray(sample.waveform) ? sample.waveform : null,
  }));
}
