'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, Heart, Play, Search, Share2 } from 'lucide-react';
import { getLivePack, getLivePackSamples, type LivePack, type LiveSample, packCode } from '@/lib/live-pack-data';
import styles from './[slug]/page.module.css';

function formatTime(value: number | null) {
  if (!value || !Number.isFinite(value)) return '--:--';
  const seconds = Math.max(0, Math.round(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function waveformFor(sample: LiveSample, index: number) {
  if (sample.waveform?.length) return sample.waveform;
  return Array.from({ length: 42 }, (_, i) => 6 + ((i * 17 + index * 13) % 25));
}

function Waveform({ sample, index }: { sample: LiveSample; index: number }) {
  return <div className={styles.waveform} aria-hidden="true">{waveformFor(sample, index).map((height, i) => <i key={i} style={{ height: Math.max(4, Math.min(34, Number(height) || 4)) }} />)}</div>;
}

export default function UploadedPackDetail({ slug }: { slug: string }) {
  const [pack, setPack] = useState<LivePack | null>(null);
  const [samples, setSamples] = useState<LiveSample[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [tag, setTag] = useState('All');
  const [openFilter, setOpenFilter] = useState<'type' | 'tags' | null>(null);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [playing, setPlaying] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await getLivePack(slug);
        if (!result) throw new Error('This pack could not be found.');
        const rows = await getLivePackSamples(result.id);
        if (!cancelled) { setPack(result); setSamples(rows); }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this pack.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const filtered = useMemo(() => samples.filter((sample) => {
    const text = `${sample.name} ${sample.type} ${sample.tags.join(' ')}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesType = type === 'All' || (type === 'Loop' ? sample.type === 'Loop' || sample.tags.some((value) => value.toLowerCase() === 'loop') : sample.type === type);
    const matchesTag = tag === 'All' || sample.tags.some((value) => value.toLowerCase() === tag.toLowerCase());
    return matchesQuery && matchesType && matchesTag;
  }), [samples, query, type, tag]);

  const allTags = Array.from(new Set(samples.flatMap((sample) => sample.tags))).slice(0, 30);

  if (loading) return <main className={styles.page}><div className={styles.empty}>Loading pack…</div></main>;
  if (error || !pack) return <main className={styles.page}><div className={styles.empty}>{error || 'Pack not found.'}</div></main>;

  const playSample = (sample: LiveSample) => {
    const audio = document.querySelector<HTMLAudioElement>(`audio[data-sample-id="${sample.id}"]`);
    if (!audio) return;
    if (playing === sample.id) { audio.pause(); setPlaying(null); return; }
    document.querySelectorAll<HTMLAudioElement>('audio[data-sample-id]').forEach((item) => item.pause());
    audio.play().then(() => setPlaying(sample.id)).catch(() => setPlaying(null));
    audio.onended = () => setPlaying(null);
  };

  return <main className={styles.page}>
    <div className={styles.crumbs}><button onClick={() => window.history.back()}><ArrowLeft size={15}/> Back to packs</button><span>/</span><span>{pack.name}</span></div>
    <section className={styles.packHeader}>
      <div className={styles.packCover}>
        {pack.artworkUrl ? <img src={pack.artworkUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
        <span>{packCode(pack.name)}</span>
      </div>
      <div className={styles.packMeta}>
        <div className={styles.eyebrow}>SAMPLE PACK</div>
        <h1>{pack.name}</h1>
        <div className={styles.packTags}>{pack.tags.map((item) => <span key={item}>{item}</span>)}</div>
        {pack.description ? <p>{pack.description}</p> : null}
        <div className={styles.creator}>{pack.creator || 'WAVLIB Sound Library'}</div>
        <div className={styles.actions}>
          <button onClick={() => navigator.share?.({ title: pack.name, url: window.location.href })}><Share2 size={16}/> Share</button>
          <button onClick={() => filtered.forEach((sample) => window.open(sample.audioUrl, '_blank', 'noopener,noreferrer'))}><Download size={16}/> Download the entire pack</button>
        </div>
      </div>
    </section>

    <section className={styles.browser}>
      <div className={styles.searchRow}>
        <label className={styles.localSearch}><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this pack…"/><span>{filtered.length} sounds</span></label>
        <div className={styles.filters}>
          <div className={styles.filterWrap}><button className={styles.filterButton} onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}>Type: {type}<ChevronDown size={14}/></button>{openFilter === 'type' ? <div className={styles.popover}>{['All','Loop','One Shot','Drums','Bass','Texture','FX'].map((value) => <button key={value} onClick={() => { setType(value); setOpenFilter(null); }}>{value}</button>)}</div> : null}</div>
          <div className={styles.filterWrap}><button className={styles.filterButton} onClick={() => setOpenFilter(openFilter === 'tags' ? null : 'tags')}>Tags <ChevronDown size={14}/></button>{openFilter === 'tags' ? <div className={`${styles.popover} ${styles.tagsPopover}`}>{['All', ...allTags].map((value) => <button key={value} onClick={() => { setTag(value); setOpenFilter(null); }}>{value}</button>)}</div> : null}</div>
        </div>
      </div>
      <div className={styles.tagStrip}>{['All', ...allTags].map((value) => <button key={value} className={tag === value ? styles.tagSelected : ''} onClick={() => setTag(value)}>{value}</button>)}</div>
      <div className={styles.sampleList}>
        {filtered.map((sample, index) => <div className={styles.sample} key={sample.id}>
          <button className={styles.play} onClick={() => playSample(sample)} aria-label={playing === sample.id ? 'Pause sample' : 'Play sample'}>{playing === sample.id ? <span style={{ fontSize: 12 }}>Ⅱ</span> : <Play size={14} fill="currentColor" strokeWidth={0}/>}</button>
          <div className={styles.sampleInfo}><strong>{sample.name}</strong><div className={styles.sampleTags}>{sample.tags.map((item) => <span key={item}>{item}</span>)}{sample.bpm ? <span>{sample.bpm} BPM</span> : null}{sample.key ? <span>{sample.key}</span> : null}</div></div>
          <Waveform sample={sample} index={index}/>
          <span className={styles.time}>{formatTime(sample.duration)}</span>
          <button className={`${styles.iconButton} ${liked[sample.id] ? styles.liked : ''}`} onClick={() => setLiked((current) => ({ ...current, [sample.id]: !current[sample.id] }))} aria-label="Favourite"><Heart size={19} fill={liked[sample.id] ? 'currentColor' : 'none'}/></button>
          <a className={styles.iconButton} href={sample.audioUrl} download={sample.name} aria-label="Download"><Download size={18}/></a>
          <audio data-sample-id={sample.id} src={sample.audioUrl} preload="none" />
        </div>)}
        {!filtered.length ? <div className={styles.empty}>No samples match this search.</div> : null}
      </div>
    </section>
  </main>;
}
