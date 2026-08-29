import PackDetailClient from './PackDetailClient';

const packSlugs = [
  'cobalt-garage-essentials-vol-2',
  'aurora-cinematic-strings-vol-3',
  'voidline-neuro-bass-vol-1',
  'prism-future-riddim-vol-2',
  'ember-drill-fm-textures-vol-3',
  'glasswave-techno-kicks-vol-2',
  'cinderpath-dark-trap-vol-3',
  'driftwood-lo-fi-keys-vol-3',
  'kinetic-bass-music-vol-1',
  'paperlight-acoustic-folk-vol-3',
];

export function generateStaticParams() {
  return packSlugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function PackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PackDetailClient slug={slug} />;
}
