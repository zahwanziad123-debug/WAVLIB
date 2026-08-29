'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, Heart, Home, Menu, Package, Play, Search, Share2, X, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

type Pack = { name: string; code: string; art: string; tags: string[] };
type PackSample = { name: string; type: string; tags: string[]; bpm: number; key: string; time: string; variant: number };

const BASE_PATH = '/WAVLIB';

const packs: Pack[] = [
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

const templates = [
  ['DRUM_LOOP', 'Drums', ['drums', 'loop'], 128, 'C Min', '0:12'],
  ['BASS_LOOP', 'Bass', ['bass', 'loop'], 140, 'F Min', '0:11'],
  ['TOP_LOOP', 'Percussion', ['hats', 'percussion', 'loop'], 124, 'G Min', '0:09'],
  ['ONE_SHOT', 'One Shot', ['impact', 'one-shot'], 128, 'C Min', '0:03'],
  ['TEXTURE', 'Texture', ['ambient', 'texture'], 110, 'D Min', '0:14'],
  ['RHYTHM', 'Percussion', ['groove', 'rhythm'], 132, 'A Min', '0:08'],
  ['STAB', 'Synth', ['stabs', 'synth'], 128, 'E Min', '0:04'],
  ['FX_RISER', 'FX', ['riser', 'fx'], 140, 'F Min', '0:07'],
  ['MELODY', 'Melody', ['melodic', 'loop'], 118, 'G Min', '0:13'],
  ['FILL', 'Drums', ['fill', 'drums'], 150, 'C Min', '0:05'],
] as const;

function makeSamples(pack: Pack): PackSample[] {
  return templates.map(([label, type, tags, bpm, key, time], index) => ({
    name: `${pack.code}_${label}_${String(index + 1).padStart(2, '0')}.wav`,
    type,
    tags: [...tags, ...pack.tags.slice(0, 1).map((tag) => tag.toLowerCase())],
    bpm,
    key,
    time,
    variant: index,
  }));
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function Waveform({ variant }: { variant: number }) {
  const heights = Array.from({ length: 42 }, (_, i) => 6 + ((i * 17 + variant * 13) % 25));
  return <div className={styles.waveform} aria-hidden="true">{heights.map((height, i) => <i key={i} style={{ height }} />)}</div>;
}

function Filter({ label, open, onClick, children }: { label: string; open: boolean; onClick: () => void; children?: React.ReactNode }) {
  return <div className={styles.filterWrap}><button className={`${styles.filterButton} ${open ? styles.filterActive : ''}`} onClick={onClick}>{label}<ChevronDown size={14} /></button>{open && children}</div>;
}

export default function PackDetailClient({ slug }: { slug: string }) {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [openFilter, setOpenFilter] = useState<'bpm' | 'key' | 'type' | 'tags' | null>(null);
  const [type, setType] = useState('All');
  const [tag, setTag] = useState('All');
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const pack = packs.find((item) => slugify(item.name) === slug) ?? packs[0];
  const packSamples = useMemo(() => makeSamples(pack), [pack]);
  const filtered = packSamples.filter((sample) => {
    const text = `${sample.name} ${sample.type} ${sample.tags.join(' ')}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesType = type === 'All' || (type === 'Loop' ? sample.tags.includes('loop') : sample.type === 'One Shot');
    const matchesTag = tag === 'All' || sample.tags.includes(tag.toLowerCase());
    return matchesQuery && matchesType && matchesTag;
  });
  const allTags = Array.from(new Set(packSamples.flatMap((sample) => sample.tags)));

  const toggle = (name: typeof openFilter) => setOpenFilter(openFilter === name ? null : name);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: pack.name, url });
    else await navigator.clipboard?.writeText(url);
  };

  return <main className="site">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
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
          <div className={`${styles.packCover} ${styles[`art-${pack.art}`]}`}><span>{pack.code}</span><div /></div>
          <div className={styles.packMeta}>
            <div className={styles.eyebrow}>SAMPLE PACK</div>
            <h1>{pack.name}</h1>
            <div className={styles.packTags}>{pack.tags.map((item) => <span key={item}>{item}</span>)}</div>
            <div className={styles.creator}>WAVLIB Sound Library</div>
            <p>Production-ready sounds from this WAVLIB collection. Browse, preview and organize the individual samples inside the pack.</p>
            <div className={styles.actions}><button onClick={share}><Share2 size={15} /> Share</button><button><Download size={15} /> Download the entire pack</button></div>
            <button className={styles.report}><AlertTriangle size={12} /> Report copyright infringement</button>
          </div>
        </section>

        <section className={styles.browser}>
          <div className={styles.searchRow}><div className={styles.localSearch}><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this pack..." /><span>{filtered.length} / {packSamples.length}</span></div>
            <div className={styles.filters}>
              <Filter label="BPM" open={openFilter === 'bpm'} onClick={() => toggle('bpm')}><div className={styles.popover}><div className={styles.rangeHead}><strong>From</strong><strong>To</strong></div><div className={styles.rangeValues}><span>60</span><span>200</span></div><div className={styles.rangeLine}><i /><i /></div><button onClick={() => setOpenFilter(null)}>Apply</button></div></Filter>
              <Filter label="Key" open={openFilter === 'key'} onClick={() => toggle('key')}><div className={styles.popover}><div className={styles.mode}><button>Major</button><button>Minor</button></div><div className={styles.piano}>{['C','D','E','F','G','A','B'].map((key) => <span key={key}>{key}</span>)}</div></div></Filter>
              <Filter label={`Type: ${type}`} open={openFilter === 'type'} onClick={() => toggle('type')}><div className={`${styles.popover} ${styles.typePopover}`}>{['All', 'Loop', 'One-shot'].map((item) => <button key={item} onClick={() => { setType(item); setOpenFilter(null); }}>{item}</button>)}</div></Filter>
              <Filter label="Tags" open={openFilter === 'tags'} onClick={() => toggle('tags')}><div className={`${styles.popover} ${styles.tagsPopover}`}><button onClick={() => { setTag('All'); setOpenFilter(null); }}>All</button>{allTags.map((item) => <button key={item} onClick={() => { setTag(item); setOpenFilter(null); }}>{item}</button>)}</div></Filter>
            </div>
          </div>
          <div className={styles.tagStrip}>{allTags.slice(0, 16).map((item) => <button className={tag === item ? styles.tagSelected : ''} key={item} onClick={() => setTag(tag === item ? 'All' : item)}>{item}</button>)}</div>
        </section>

        <section className={styles.sampleList}>
          {filtered.map((sample) => <article className={styles.sample} key={sample.name}>
            <button className={styles.play} aria-label={`Play ${sample.name}`}><Play size={15} fill="currentColor" strokeWidth={0} /></button>
            <div className={styles.sampleInfo}><strong>{sample.name}</strong><small>{pack.name}</small><div className={styles.sampleTags}>{sample.tags.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div></div>
            <Waveform variant={sample.variant} />
            <span className={styles.time}>{sample.time}</span><span className={styles.meta}>{sample.key}</span><span className={styles.meta}>{sample.bpm}</span>
            <button className={`${styles.iconButton} ${liked[sample.name] ? styles.liked : ''}`} onClick={() => setLiked((current) => ({ ...current, [sample.name]: !current[sample.name] }))} aria-label="Favourite"><Heart size={17} /></button>
            <button className={styles.iconButton} aria-label="Download"><Download size={17} /></button>
          </article>)}
          {filtered.length === 0 && <div className={styles.empty}>No samples match these filters.</div>}
        </section>
      </div>
    </section>
  </main>;
}
