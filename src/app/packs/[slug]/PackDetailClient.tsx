'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, Heart, Home, Menu, Package, Pause, Play, Search, Share2, X } from 'lucide-react';
import styles from './page.module.css';
import mobileFixes from './mobile-fixes.module.css';
import { getArtworkPublicUrl, getSamplePublicUrl } from '@/lib/pack-storage';
import { supabase } from '@/lib/supabase';

type Sample = {
  id: number | string;
  name: string;
  type: string;
  tags: string[];
  bpm: number | null;
  key: string | null;
  duration: number | null;
  waveform: number[] | null;
  storagePath: string;
};

type Pack = { id?: number | string; name: string; code: string; art: string; tags: string[]; creator?: string; description?: string; artworkUrl?: string | null };
const BASE_PATH = '/WAVLIB';

const fallbackPacks: Pack[] = [
  { name: 'Cobalt Garage Essentials Vol.2', code: 'CG', art: 'cobalt', tags: ['Garage', 'House', 'Drums'] },
  { name: 'Aurora Cinematic Strings Vol.3', code: 'AC', art: 'aurora', tags: ['Cinematic', 'Orchestral', 'Strings'] },
  { name: 'Voidline Neuro Bass Vol.1', code: 'VN', art: 'void', tags: ['Neurofunk', 'Bass', 'Riddim'] },
  { name: 'Prism Future Riddim Vol.2', code: 'PF', art: 'prism', tags: ['Riddim', 'Dubstep', 'Future Bass'] },
  { name: 'Ember Drill FM Textures Vol.3', code: 'ED', art: 'ember', tags: ['Drill', 'Trap', 'FM'] },
  { name: 'Glasswave Techno Kicks Vol.2', code: 'GT', art: 'glass', tags: ['Techno', 'Kicks', 'Industrial'] },
  { name: 'Cinderpath Dark Trap Vol.3', code: 'CD', art: 'cinder', tags: ['Dark Trap', '808', 'Hip Hop'] },
  { name: 'Driftwood Lo-Fi Keys Vol.3', code: 'DL', art: 'drift', tags: ['Lo-fi', 'Keys', 'Chillout'] },
  { name: 'Kinetic Bass Music Vol.1', code: 'KB', art: 'kinetic', tags: ['Bass Music', 'Neurofunk', 'Drum & Bass'] },
  { name: 'Paperlight Acoustic Folk Vol.3', code: 'PF', art: 'paper', tags: ['Acoustic Folk', 'Indie', 'Organic'] },
];

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function classify(name: string, stored?: string | null) {
  const value = name.toLowerCase();
  if (stored && stored.toLowerCase() === 'loop') return 'Loop';
  if (/one[-_ ]?shot|oneshot|hit|stab|kick|snare|clap|hat|perc|tom|crash|impact|riser|fx/.test(value)) return 'One Shot';
  if (/loop|phrase|groove|beat|bassline|melody|chord|arp|sequence/.test(value)) return 'Loop';
  return stored || 'One Shot';
}
function formatDuration(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—';
  const total = Math.max(0, Math.round(value));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
function normalizeWaveform(value: unknown) {
  if (!Array.isArray(value)) return null;
  const numbers = value.map(Number).filter(Number.isFinite);
  return numbers.length ? numbers : null;
}

function Waveform({ values }: { values: number[] | null }) {
  const heights = values?.length ? values : Array.from({ length: 96 }, (_, i) => 4 + ((i * 19) % 18));
  return <div className={styles.waveform} aria-hidden="true">{heights.map((height, i) => <i key={i} style={{ height: `${Math.max(3, Math.min(36, height))}px` }} />)}</div>;
}

function Filter({ label, open, onClick, children }: { label: string; open: boolean; onClick: () => void; children: React.ReactNode }) {
  return <div className={styles.filterWrap}><button type="button" className={`${styles.filterButton} ${open ? styles.filterActive : ''}`} onClick={onClick}>{label}<ChevronDown size={14} /></button>{open && children}</div>;
}

export default function PackDetailClient({ slug }: { slug: string }) {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [openFilter, setOpenFilter] = useState<'bpm' | 'key' | 'type' | 'time' | 'tags' | null>(null);
  const [type, setType] = useState<'All' | 'One Shot' | 'Loop'>('All');
  const [tag, setTag] = useState('All');
  const [keyFilter, setKeyFilter] = useState('All');
  const [bpmFilter, setBpmFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [pack, setPack] = useState<Pack | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const fallback = fallbackPacks.find((item) => slugify(item.name) === slug) ?? fallbackPacks[0];
      const { data: packRow } = await supabase.from('packs').select('id,name,slug,creator,description,tags,artwork_url,artwork_path').eq('slug', slug).maybeSingle();
      if (cancelled) return;
      const current: Pack = packRow ? { id: packRow.id, name: packRow.name, code: packRow.name.split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(), art: fallback.art, tags: Array.isArray(packRow.tags) ? packRow.tags : fallback.tags, creator: packRow.creator, description: packRow.description, artworkUrl: packRow.artwork_url || (packRow.artwork_path ? getArtworkPublicUrl(packRow.artwork_path) : null) } : fallback;
      setPack(current);
      if (packRow?.id) {
        const { data: rows } = await supabase.from('samples').select('id,name,type,bpm,key,duration,waveform,storage_path,audio_url').eq('pack_id', packRow.id).order('created_at', { ascending: true });
        if (!cancelled) setSamples((rows ?? []).map((row) => ({ id: row.id, name: row.name, type: classify(row.name, row.type), tags: [], bpm: row.bpm ?? null, key: row.key ?? null, duration: row.duration ?? null, waveform: normalizeWaveform(row.waveform), storagePath: row.storage_path || row.audio_url } as Sample)));
      } else {
        setSamples([]);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const allTags = useMemo(() => Array.from(new Set([...(pack?.tags ?? []), ...samples.flatMap((s) => s.tags)])).sort(), [pack, samples]);
  const keys = useMemo(() => Array.from(new Set(samples.map((s) => s.key).filter(Boolean) as string[])).sort(), [samples]);
  const bpmOptions = useMemo(() => Array.from(new Set(samples.map((s) => s.bpm).filter((x): x is number => Number.isFinite(x)))).sort((a, b) => a - b), [samples]);
  const filtered = useMemo(() => samples.filter((sample) => {
    const text = `${sample.name} ${sample.type} ${sample.tags.join(' ')} ${sample.key ?? ''} ${sample.bpm ?? ''}`.toLowerCase();
    const duration = sample.duration ?? 0;
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesType = type === 'All' || sample.type === type;
    const matchesTag = tag === 'All' || sample.tags.includes(tag.toLowerCase()) || (pack?.tags ?? []).some((x) => x.toLowerCase() === tag.toLowerCase());
    const matchesKey = keyFilter === 'All' || sample.key === keyFilter;
    const matchesBpm = bpmFilter === 'All' || String(sample.bpm) === bpmFilter;
    const matchesTime = timeFilter === 'All' || (timeFilter === 'Under 5s' ? duration < 5 : timeFilter === '5–15s' ? duration >= 5 && duration <= 15 : duration > 15);
    return matchesQuery && matchesType && matchesTag && matchesKey && matchesBpm && matchesTime;
  }), [samples, query, type, tag, keyFilter, bpmFilter, timeFilter, pack]);

  if (!pack) return null;
  const share = async () => { const url = window.location.href; if (navigator.share) await navigator.share({ title: pack.name, url }); else await navigator.clipboard?.writeText(url); };
  const playSample = (sample: Sample) => {
    if (!sample.storagePath) return;
    if (playing === String(sample.id)) { audioRef.current?.pause(); setPlaying(null); return; }
    audioRef.current?.pause();
    const audio = new Audio(getSamplePublicUrl(sample.storagePath));
    audioRef.current = audio;
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    audio.play().then(() => setPlaying(String(sample.id))).catch(() => setPlaying(null));
  };

  return <main className={`site ${mobileFixes.root}`}>
    <aside className={`sidebar ${menu ? 'open' : ''}`}><div className="brand"><div className="brand-mark">W</div><div><strong>WAVLIB</strong><small>SOUND LIBRARY</small></div></div><button className="close" onClick={() => setMenu(false)} aria-label="Close menu"><X size={18} /></button><nav><a className="nav" href={`${BASE_PATH}/`}><Home size={20}/><span>Home</span></a><a className="nav" href={`${BASE_PATH}/#search`}><Search size={20}/><span>Search</span></a><a className="nav active" href={`${BASE_PATH}/#packs`}><Package size={20}/><span>Packs</span></a></nav><div className="legal"><span>Terms</span><span>Privacy</span><span>Disclaimer</span><span>Copyright © WAVLIB</span></div></aside>
    <section className="content"><header className="topbar"><button className="menu" onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={20}/></button><div className="mobile-brand">WAVLIB</div><div className="breadcrumb">Packs <span>/</span> {pack.name}</div><div className="header-search"><Search size={18}/><input placeholder="Search sounds by genre, mood, instrument, BPM, key..." /><button className="search-submit" aria-label="Search"><ArrowLeft size={17} style={{ transform: 'rotate(180deg)' }}/></button></div></header>
      <div className={styles.page}>
        <div className={styles.crumbs}><button onClick={() => { window.location.href = `${BASE_PATH}/#packs`; }}><ArrowLeft size={15}/> Back to packs</button><span>/</span><span>{pack.name}</span></div>
        <section className={styles.packHeader}>
          <div className={`${styles.packCover} ${styles[`art-${pack.art}`]}`}>{pack.artworkUrl && <img src={pack.artworkUrl} alt="" />}</div>
          <div className={styles.packMeta}><div className={styles.eyebrow}>SAMPLE PACK</div><h1>{pack.name}</h1><div className={styles.packTags}>{pack.tags.map((item) => <span key={item}>{item}</span>)}</div><div className={styles.creator}>{pack.creator || 'WAVLIB Sound Library'}</div>{pack.description && <p>{pack.description}</p>}<div className={styles.actions}><button onClick={share}><Share2 size={15}/> Share</button><button><Download size={15}/> Download the entire pack</button></div></div>
        </section>
        <section className={styles.browser}><div className={styles.searchRow}><div className={styles.localSearch}><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this pack..."/><span>{filtered.length} / {samples.length} sounds</span></div><div className={styles.filters}>
          <Filter label={`BPM: ${bpmFilter}`} open={openFilter === 'bpm'} onClick={() => setOpenFilter(openFilter === 'bpm' ? null : 'bpm')}><div className={styles.popover}>{['All', ...bpmOptions.map(String)].map((item) => <button key={item} onClick={() => { setBpmFilter(item); setOpenFilter(null); }}>{item === 'All' ? 'All BPM' : `${item} BPM`}</button>)}</div></Filter>
          <Filter label={`Key: ${keyFilter}`} open={openFilter === 'key'} onClick={() => setOpenFilter(openFilter === 'key' ? null : 'key')}><div className={styles.popover}>{['All', ...keys].map((item) => <button key={item} onClick={() => { setKeyFilter(item); setOpenFilter(null); }}>{item === 'All' ? 'All keys' : item}</button>)}</div></Filter>
          <Filter label={`Type: ${type}`} open={openFilter === 'type'} onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}><div className={`${styles.popover} ${styles.typePopover}`}>{['All', 'One Shot', 'Loop'].map((item) => <button key={item} onClick={() => { setType(item as typeof type); setOpenFilter(null); }}>{item}</button>)}</div></Filter>
          <Filter label={`Time: ${timeFilter}`} open={openFilter === 'time'} onClick={() => setOpenFilter(openFilter === 'time' ? null : 'time')}><div className={`${styles.popover} ${styles.typePopover}`}>{['All', 'Under 5s', '5–15s', 'Over 15s'].map((item) => <button key={item} onClick={() => { setTimeFilter(item); setOpenFilter(null); }}>{item}</button>)}</div></Filter>
          <Filter label="Tags" open={openFilter === 'tags'} onClick={() => setOpenFilter(openFilter === 'tags' ? null : 'tags')}><div className={`${styles.popover} ${styles.tagsPopover}`}><button onClick={() => { setTag('All'); setOpenFilter(null); }}>All</button>{allTags.map((item) => <button key={item} onClick={() => { setTag(item); setOpenFilter(null); }}>{item}</button>)}</div></Filter>
        </div></div><div className={styles.filterTabs}><button className={type === 'All' ? styles.tabSelected : ''} onClick={() => setType('All')}>All {samples.length}</button><button className={type === 'One Shot' ? styles.tabSelected : ''} onClick={() => setType('One Shot')}>One Shots {samples.filter((s) => s.type === 'One Shot').length}</button><button className={type === 'Loop' ? styles.tabSelected : ''} onClick={() => setType('Loop')}>Loops {samples.filter((s) => s.type === 'Loop').length}</button></div><div className={styles.tagStrip}>{allTags.slice(0, 16).map((item) => <button className={tag === item ? styles.tagSelected : ''} key={item} onClick={() => setTag(tag === item ? 'All' : item)}>{item}</button>)}</div></section>
        <section className={styles.sampleList}><div className={styles.sampleHead}><span></span><span>NAME</span><span>WAVEFORM</span><span>KEY</span><span>BPM</span><span>TYPE</span><span>TIME</span><span></span><span></span></div>
          {loading ? <div className={styles.empty}>Loading samples…</div> : filtered.map((sample) => <article className={styles.sample} key={sample.id}>
            <button type="button" className={styles.play} onClick={() => playSample(sample)} aria-label={playing === String(sample.id) ? `Pause ${sample.name}` : `Play ${sample.name}`}>{playing === String(sample.id) ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" strokeWidth={0} />}</button>
            <div className={styles.sampleInfo}><strong>{sample.name}</strong><div className={styles.sampleTags}>{sample.tags.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div></div>
            <Waveform values={sample.waveform}/><span className={styles.meta}>{sample.key || '—'}</span><span className={styles.meta}>{sample.bpm ?? '—'}</span><span className={styles.typeBadge}>{sample.type}</span><span className={styles.time}>{formatDuration(sample.duration)}</span>
            <button type="button" className={`${styles.iconButton} ${liked[String(sample.id)] ? styles.liked : ''}`} onClick={() => setLiked((current) => ({ ...current, [String(sample.id)]: !current[String(sample.id)] }))} aria-label="Favourite"><Heart size={18} fill={liked[String(sample.id)] ? 'currentColor' : 'none'}/></button>
            <button type="button" className={styles.iconButton} onClick={() => { window.open(getSamplePublicUrl(sample.storagePath), '_blank', 'noopener,noreferrer'); }} aria-label="Download"><Download size={18}/></button>
          </article>)}
          {!loading && !filtered.length && <div className={styles.empty}>No samples match these filters.</div>}
        </section>
      </div>
    </section>
  </main>;
}
