'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, Heart, Play, Search, Share2 } from 'lucide-react';
import { getLivePack, getLivePackSamples, type LivePack, type LiveSample } from '@/lib/live-pack-data';
import styles from './[slug]/page.module.css';

function formatTime(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '--:--';
  const seconds = Math.max(0, Math.round(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function fallbackWaveform(index: number) {
  return Array.from({ length: 72 }, (_, i) => 5 + ((i * 17 + index * 13) % 25));
}

function Waveform({ sample, index }: { sample: LiveSample; index: number }) {
  const [bars, setBars] = useState<number[]>(sample.waveform?.length ? sample.waveform : fallbackWaveform(index));

  useEffect(() => {
    if (sample.waveform?.length) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(sample.audioUrl);
        if (!response.ok) return;
        const buffer = await response.arrayBuffer();
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const context = new AudioContextClass();
        const audio = await context.decodeAudioData(buffer.slice(0));
        const channel = audio.getChannelData(0);
        const count = 72;
        const block = Math.max(1, Math.floor(channel.length / count));
        const next = Array.from({ length: count }, (_, i) => {
          const start = i * block;
          const end = Math.min(channel.length, start + block);
          let peak = 0;
          for (let j = start; j < end; j += Math.max(1, Math.floor(block / 80))) peak = Math.max(peak, Math.abs(channel[j]));
          return Math.max(4, Math.round(5 + peak * 29));
        });
        if (!cancelled) setBars(next);
        await context.close();
      } catch { /* Keep a subtle placeholder if the public audio cannot be decoded. */ }
    };
    load();
    return () => { cancelled = true; };
  }, [sample.audioUrl, sample.waveform, index]);

  return <div className={styles.waveform} aria-label="Audio waveform">{bars.map((height, i) => <i key={i} style={{ height: Math.max(4, Math.min(34, Number(height) || 4)) }} />)}</div>;
}

export default function UploadedPackDetail({ slug }: { slug: string }) {
  const [pack, setPack] = useState<LivePack | null>(null);
  const [samples, setSamples] = useState<LiveSample[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [tag, setTag] = useState('All');
  const [key, setKey] = useState('All');
  const [bpm, setBpm] = useState('All');
  const [duration, setDuration] = useState('All');
  const [openFilter, setOpenFilter] = useState<'bpm' | 'key' | 'type' | 'tags' | 'duration' | null>(null);
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
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const allTags = Array.from(new Set(samples.flatMap((sample) => sample.tags)));
  const allKeys = Array.from(new Set(samples.map((sample) => sample.key).filter(Boolean) as string[])).sort();
  const allBpms = Array.from(new Set(samples.map((sample) => sample.bpm).filter((value): value is number => value != null))).sort((a, b) => a - b);
  const typeCounts = useMemo(() => ({ All: samples.length, 'One Shot': samples.filter((s) => s.type === 'One Shot').length, Loop: samples.filter((s) => s.type === 'Loop').length }), [samples]);

  const filtered = useMemo(() => samples.filter((sample) => {
    const text = `${sample.name} ${sample.type} ${sample.tags.join(' ')} ${sample.key ?? ''} ${sample.bpm ?? ''}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesType = type === 'All' || sample.type === type || (type === 'Loop' && sample.tags.some((value) => value.toLowerCase() === 'loop'));
    const matchesTag = tag === 'All' || sample.tags.some((value) => value.toLowerCase() === tag.toLowerCase());
    const matchesKey = key === 'All' || sample.key === key;
    const matchesBpm = bpm === 'All' || String(sample.bpm) === bpm;
    const matchesDuration = duration === 'All' || (duration === '<5s' ? (sample.duration ?? Infinity) < 5 : duration === '5–15s' ? (sample.duration ?? 0) >= 5 && (sample.duration ?? 0) <= 15 : (sample.duration ?? 0) > 15);
    return matchesQuery && matchesType && matchesTag && matchesKey && matchesBpm && matchesDuration;
  }), [samples, query, type, tag, key, bpm, duration]);

  if (loading) return <main className={styles.page}><div className={styles.empty}>Loading pack…</div></main>;
  if (error || !pack) return <main className={styles.page}><div className={styles.empty}>{error || 'Pack not found.'}</div></main>;

  const clearFilters = () => { setType('All'); setTag('All'); setKey('All'); setBpm('All'); setDuration('All'); setQuery(''); };
  const playSample = (sample: LiveSample) => {
    const audio = document.querySelector<HTMLAudioElement>(`audio[data-sample-id="${sample.id}"]`);
    if (!audio) return;
    if (playing === sample.id) { audio.pause(); setPlaying(null); return; }
    document.querySelectorAll<HTMLAudioElement>('audio[data-sample-id]').forEach((item) => item.pause());
    audio.play().then(() => setPlaying(sample.id)).catch(() => setPlaying(null));
    audio.onended = () => setPlaying(null);
  };
  const selectFilter = (setter: (value: string) => void, value: string) => { setter(value); setOpenFilter(null); };

  return <main className={styles.page}>
    <div className={styles.crumbs}><button onClick={() => window.history.back()}><ArrowLeft size={15}/> Back to packs</button><span>/</span><span>{pack.name}</span></div>
    <section className={styles.packHeader}>
      <div className={styles.packCover}>{pack.artworkUrl ? <img src={pack.artworkUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2 }} /> : null}</div>
      <div className={styles.packMeta}>
        <div className={styles.eyebrow}>SAMPLE PACK</div><h1>{pack.name}</h1>
        <div className={styles.packTags}>{pack.tags.map((item) => <span key={item}>{item}</span>)}</div>
        {pack.description ? <p>{pack.description}</p> : null}<div className={styles.creator}>{pack.creator || 'WAVLIB Sound Library'}</div>
        <div className={styles.actions}><button onClick={() => navigator.share?.({ title: pack.name, url: window.location.href })}><Share2 size={16}/> Share</button><button onClick={() => filtered.forEach((sample) => window.open(sample.audioUrl, '_blank', 'noopener,noreferrer'))}><Download size={16}/> Download the entire pack</button></div>
      </div>
    </section>

    <section className={styles.browser}>
      <div className={styles.searchRow}>
        <label className={styles.localSearch}><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this pack…"/><span>{filtered.length} sounds</span></label>
        <div className={styles.filters}>
          <div className={styles.filterWrap}><button className={`${styles.filterButton} ${openFilter === 'bpm' ? styles.filterActive : ''}`} onClick={() => setOpenFilter(openFilter === 'bpm' ? null : 'bpm')}>BPM: {bpm}<ChevronDown size={14}/></button>{openFilter === 'bpm' && <div className={styles.popover}>{['All', ...allBpms.map(String)].map((value) => <button key={value} onClick={() => selectFilter(setBpm, value)}>{value === 'All' ? 'All BPM' : `${value} BPM`}</button>)}</div>}</div>
          <div className={styles.filterWrap}><button className={`${styles.filterButton} ${openFilter === 'key' ? styles.filterActive : ''}`} onClick={() => setOpenFilter(openFilter === 'key' ? null : 'key')}>Key: {key}<ChevronDown size={14}/></button>{openFilter === 'key' && <div className={styles.popover}>{['All', ...allKeys].map((value) => <button key={value} onClick={() => selectFilter(setKey, value)}>{value === 'All' ? 'All Keys' : value}</button>)}</div>}</div>
          <div className={styles.filterWrap}><button className={`${styles.filterButton} ${openFilter === 'type' ? styles.filterActive : ''}`} onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}>Type: {type}<ChevronDown size={14}/></button>{openFilter === 'type' && <div className={styles.popover}>{['All', 'One Shot', 'Loop', 'Drums', 'Bass', 'Texture', 'FX'].map((value) => <button key={value} onClick={() => selectFilter(setType, value)}>{value}{value === 'All' ? ` (${typeCounts.All})` : value === 'One Shot' ? ` (${typeCounts['One Shot']})` : value === 'Loop' ? ` (${typeCounts.Loop})` : ''}</button>)}</div>}</div>
          <div className={styles.filterWrap}><button className={`${styles.filterButton} ${openFilter === 'duration' ? styles.filterActive : ''}`} onClick={() => setOpenFilter(openFilter === 'duration' ? null : 'duration')}>Time: {duration}<ChevronDown size={14}/></button>{openFilter === 'duration' && <div className={styles.popover}>{['All', '<5s', '5–15s', '>15s'].map((value) => <button key={value} onClick={() => selectFilter(setDuration, value)}>{value === 'All' ? 'All durations' : value}</button>)}</div>}</div>
          <div className={styles.filterWrap}><button className={`${styles.filterButton} ${openFilter === 'tags' ? styles.filterActive : ''}`} onClick={() => setOpenFilter(openFilter === 'tags' ? null : 'tags')}>Tags <ChevronDown size={14}/></button>{openFilter === 'tags' && <div className={`${styles.popover} ${styles.tagsPopover}`}>{['All', ...allTags].map((value) => <button key={value} onClick={() => selectFilter(setTag, value)}>{value}</button>)}</div>}</div>
        </div>
      </div>
      <div className={styles.tagStrip}>
        <button className={type === 'All' ? styles.tagSelected : ''} onClick={() => setType('All')}>All {typeCounts.All}</button>
        <button className={type === 'One Shot' ? styles.tagSelected : ''} onClick={() => setType('One Shot')}>One Shots {typeCounts['One Shot']}</button>
        <button className={type === 'Loop' ? styles.tagSelected : ''} onClick={() => setType('Loop')}>Loops {typeCounts.Loop}</button>
        {allTags.slice(0, 12).map((value) => <button key={value} className={tag === value ? styles.tagSelected : ''} onClick={() => setTag(tag === value ? 'All' : value)}>{value}</button>)}
        {(type !== 'All' || tag !== 'All' || key !== 'All' || bpm !== 'All' || duration !== 'All' || query) && <button onClick={clearFilters}>Clear all ×</button>}
      </div>
      <div className={styles.sampleList}>
        <div className={styles.sampleHeader}><span>NAME</span><span>WAVEFORM</span><span>KEY</span><span>BPM</span><span>TYPE</span><span>TIME</span><span>♥</span><span>↓</span></div>
        {filtered.map((sample, index) => <div className={styles.sample} key={sample.id}>
          <button className={styles.play} onClick={() => playSample(sample)} aria-label={playing === sample.id ? 'Pause sample' : 'Play sample'}>{playing === sample.id ? <span style={{ fontSize: 12 }}>Ⅱ</span> : <Play size={14} fill="currentColor" strokeWidth={0}/>}</button>
          <div className={styles.sampleInfo}><strong>{sample.name}</strong><div className={styles.sampleTags}>{sample.tags.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div></div>
          <Waveform sample={sample} index={index}/>
          <span className={styles.sampleKey}>{sample.key || '—'}</span><span className={styles.sampleBpm}>{sample.bpm ?? '—'}</span><span className={styles.sampleType}>{sample.type}</span><span className={styles.time}>{formatTime(sample.duration)}</span>
          <button className={`${styles.iconButton} ${liked[sample.id] ? styles.liked : ''}`} onClick={() => setLiked((current) => ({ ...current, [sample.id]: !current[sample.id] }))} aria-label="Favourite"><Heart size={19} fill={liked[sample.id] ? 'currentColor' : 'none'}/></button>
          <a className={styles.iconButton} href={sample.audioUrl} download={sample.name} aria-label="Download"><Download size={18}/></a>
          <audio data-sample-id={sample.id} src={sample.audioUrl} preload="none" />
        </div>)}
        {!filtered.length && <div className={styles.empty}>No samples match these filters.</div>}
      </div>
    </section>
  </main>;
}
