'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PackDetailClient from './[slug]/PackDetailClient';
import UploadedPackDetail from './UploadedPackDetail';

const BUILT_IN_SLUGS = new Set([
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
]);

export default function PacksRoute() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('slug');
    setSlug(value?.trim() || null);
  }, []);

  if (!slug) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#070707', color: '#aaa' }}><Link href="/WAVLIB/#packs">Back to packs</Link></main>;
  if (BUILT_IN_SLUGS.has(slug)) return <PackDetailClient slug={slug} />;
  return <UploadedPackDetail slug={slug} />;
}
