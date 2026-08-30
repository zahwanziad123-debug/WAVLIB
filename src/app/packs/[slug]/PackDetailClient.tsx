'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, Heart, Home, Menu, Pause, Play, Package, Search, Share2, X } from 'lucide-react';
import styles from './page.module.css';
import mobileFixes from './mobile-fixes.module.css';
import browserFixes from './pack-browser-fixes.module.css';
import { getArtworkPublicUrl, getSamplePublicUrl } from '@/lib/pack-storage';
import { supabase } from '@/lib/supabase';

type Sample = { id: number | string; name: string; type: string; tags: string[]; bpm: number | null; key: string | null; duration: number | null; waveform: number[] | null; storagePath: string };
type Pack = { id?: number | string; name: string; code: string; art: string; tags: string[]; creator?: string; description?: string; artworkUrl?: string | null };
const BASE_PATH = '/WAVLIB';
const PAGE_SIZE = 50;
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
function formatDuration(value: number | null) { if (value == null || !Number.isFinite(value)) return '—'; const total = Math.max(0, Math.round(value)); return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`; }
function normalizeWaveform(value: unknown) { if (!Array.isArray(value)) return null; const numbers = value.map(Number).filter(Number.isFinite); return numbers.length ? numbers : null; }
function Waveform({ values }: { values: number[] | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const source = values?.length ? values : [];
      if (!source.length) return;
      const bars = Math.min(72, source.length);
      const step = width / bars;
      const mid = height / 2;
      ctx.fillStyle = '#858585';
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < bars; i++) {
        const v = Math.max(0.04, Math.min(1, Math.abs(Number(source[Math.floor(i * source.length / bars)]) || 0)));
        const bh = Math.max(2, v * height * 0.82);
        ctx.fillRect(i * step, mid - bh / 2, Math.max(1, step - 1), bh);
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [values]);
  return <canvas ref={ref} className={`${styles.waveform} ${browserFixes.waveform}`} aria-hidden="true" />;
}

export default function PackDetailClient({ slug }: { slug: string }) {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [pack, setPack] = useState<Pack | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const fallback = fallbackPacks.find(x => slugify(x.name) === slug) || fallbackPacks[0];
      const { data: row } = await supabase.from('packs').select('id,name,slug,creator,description,tags,artwork_url,artwork_path').eq('slug', slug).maybeSingle();
      if (cancelled) return;
      const current: Pack = row
        ? {
            id: row.id,
            name: row.name,
            code: row.name.split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(),
            art: fallback.art,
            tags: Array.isArray(row.tags) ? row.tags : fallback.tags,
            creator: row.creator,
            description: row.description,
            artworkUrl: row.artwork_url || (row.artwork_path ? getArtworkPublicUrl(row.artwork_path) : null),
          }
        : fallback;
      setPack(current);
      if (row?.id) {
        const { data } = await supabase.from('samples').select('id,name,type,bpm,key,duration,storage_path,audio_url').eq('pack_id', row.id).order('created_at', { ascending: true });
        if (!cancelled) {
          setSamples((data ?? []).map(r => ({
            id: r.id,
            name: r.name,
            type: r.type || '',
            tags: [],
            bpm: r.bpm ?? null,
            key: r.key ?? null,
            duration: r.duration ?? null,
            waveform: null,
            storagePath: r.storage_path || r.audio_url,
          })));
        }
      } else setSamples([]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return samples;
    return samples.filter(s => `${s.name} ${s.key ?? ''} ${s.bpm ?? ''} ${s.tags.join(' ')}`.toLowerCase().includes(needle));
  }, [samples, query]);
  const visibleSamples = filtered.slice(0, visibleCount);

  if (!pack) return <main className={`site ${mobileFixes.root}`}><div className={styles.empty}>Loading pack…</div></main>;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: pack.name, url });
    else await navigator.clipboard?.writeText(url);
  };

  const playSample = (s: Sample) => {
    if (!s.storagePath) return;
    if (playing === String(s.id)) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(getSamplePublicUrl(s.storagePath));
    audioRef.current = audio;
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    audio.play().then(() => setPlaying(String(s.id))).catch(() => setPlaying(null));
  };

  const downloadSample = (s: Sample) => {
    if (!s.storagePath) return;
    const a = document.createElement('a');
    a.href = getSamplePublicUrl(s.storagePath);
    a.download = s.name;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <main className={`site ${mobileFixes.root}`}>
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark">W</div><div><strong>WAVLIB</strong><small>SOUND LIBRARY</small></div></div>
        <button className="close" onClick={() => setMenu(false)} aria-label="Close menu"><X size={18} /></button>
        <nav>
          <a className="nav" href={`${BASE_PATH}/`}><Home size={20} /><span>Home</span></a>
          <a className="nav" href={`${BASE_PATH}/#search`}><Search size={20} /><span>Search</span></a>
          <a className="nav active" href={`${BASE_PATH}/#packs`}><Package size={20} /><span>Packs</span></a>
        </nav>
        <div className="legal"><span>Terms</span><span>Privacy</span><span>Disclaimer</span><span>Copyright © WAVLIB</span></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <button className="menu" onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="mobile-brand">WAVLIB</div>
          <div className="breadcrumb">Packs <span>/</span> {pack.name}</div>
          <div className="header-search"><Search size={18} /><input placeholder="Search sounds by genre, mood, instrument, BPM, key..." /><button className="search-submit" aria-label="Search"><ArrowLeft size={17} style={{ transform: 'rotate(180deg)' }} /></button></div>
        </header>

        <div className={styles.page}>
          <div className={styles.crumbs}><button onClick={() => { window.location.href = `${BASE_PATH}/#packs`; }}><ArrowLeft size={15} /> Back to packs</button><span>/</span><span>{pack.name}</span></div>

          <section className={styles.packHeader}>
            <div className={`${styles.packCover} ${browserFixes.packCover}`}>
              {pack.artworkUrl ? <img src={pack.artworkUrl} alt={`${pack.name} artwork`} /> : null}
            </div>
            <div className={styles.packMeta}>
              <div className={styles.eyebrow}>SAMPLE PACK</div>
              <h1>{pack.name}</h1>
              <div className={styles.packTags}>{pack.tags.map(item => <span key={item}>{item}</span>)}</div>
              <div className={styles.creator}>{pack.creator || 'WAVLIB Sound Library'}</div>
              {pack.description && <p>{pack.description}</p>}
              <div className={styles.actions}><button onClick={share}><Share2 size={15} /> Share</button><button><Download size={15} /> Download the entire pack</button></div>
            </div>
          </section>

          <section className={styles.browser}>
            <div className={`${styles.searchRow} ${browserFixes.simpleSearchRow}`}>
              <div className={styles.localSearch}><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search this pack..." /><span>{filtered.length} / {samples.length} sounds</span></div>
            </div>
          </section>

          <section className={`${styles.sampleList} ${browserFixes.simpleSampleList}`}>
            <div className={`${styles.sampleHead} ${browserFixes.sampleHead}`}><span></span><span>NAME</span><span>WAVEFORM</span><span>KEY</span><span>BPM</span><span>TIME</span><span></span><span></span></div>
            {loading ? <div className={styles.empty}>Loading samples…</div> : visibleSamples.length === 0 ? <div className={styles.empty}>No sounds found.</div> : visibleSamples.map(s => (
              <article className={`${styles.sample} ${browserFixes.sample}`} key={s.id}>
                <button type="button" className={styles.play} onClick={() => playSample(s)} aria-label={playing === String(s.id) ? `Pause ${s.name}` : `Play ${s.name}`}>
                  {playing === String(s.id) ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" strokeWidth={0} />}
                </button>
                <div className={styles.sampleInfo}><strong>{s.name}</strong></div>
                <Waveform values={s.waveform} />
                <span className={styles.meta}>{s.key || '—'}</span>
                <span className={styles.meta}>{s.bpm != null ? String(s.bpm) : '—'}</span>
                <span className={styles.time}>{formatDuration(s.duration)}</span>
                <button type="button" className={`${styles.iconButton} ${liked[String(s.id)] ? styles.liked : ''}`} onClick={() => setLiked(v => ({ ...v, [String(s.id)]: !v[String(s.id)] }))} aria-label={liked[String(s.id)] ? `Remove ${s.name} from favourites` : `Add ${s.name} to favourites`}><Heart size={20} fill={liked[String(s.id)] ? 'currentColor' : 'none'} /></button>
                <button type="button" className={styles.iconButton} onClick={() => downloadSample(s)} aria-label={`Download ${s.name}`}><Download size={20} /></button>
              </article>
            ))}
            {!loading && visibleCount < filtered.length && <button type="button" className={browserFixes.loadMore} onClick={() => setVisibleCount(v => v + PAGE_SIZE)}>Load more sounds</button>}
          </section>
        </div>
      </section>
    </main>
  );
}
