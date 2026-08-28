'use client';

import { useState } from 'react';

type View = 'home' | 'search' | 'packs';

const demoPacks = [
  { name: 'Cobalt Garage Essentials Vol.2', code: 'CG', tags: ['UK Garage', 'Speed Garage'], count: 128 },
  { name: 'Aurora Cinematic Strings Vol.3', code: 'AC', tags: ['Cinematic', 'Orchestral'], count: 96 },
  { name: 'Voidline Neuro Bass Vol.1', code: 'VN', tags: ['Drum And Bass', 'Neurofunk'], count: 142 },
  { name: 'Prism Future Riddim Vol.2', code: 'PF', tags: ['Future Riddim', 'Dubstep'], count: 118 },
  { name: 'Ember Drill FM Textures Vol.3', code: 'ED', tags: ['Drill', 'Experimental'], count: 84 },
  { name: 'Glasswave Techno Kicks Vol.2', code: 'GT', tags: ['Techno', 'Hard Techno'], count: 110 },
  { name: 'Cinderpath Dark Trap Vol.3', code: 'CD', tags: ['Trap', 'Drill'], count: 102 },
  { name: 'Driftwood Lo-Fi Keys Vol.3', code: 'DL', tags: ['Lo-Fi Hip Hop', 'Jazz'], count: 76 },
  { name: 'Kinetic Bass Music Vol.1', code: 'KB', tags: ['Bass Music', 'Dubstep'], count: 134 },
  { name: 'Paperlight Acoustic Folk Vol.3', code: 'PF', tags: ['Folk', 'Acoustic'], count: 88 },
];

const demoSamples = ['Kick One', 'Snare One', 'Texture One', 'Bass One', 'Vocal Texture', 'Cinematic Hit'];

const Icon = ({ name }: { name: 'home' | 'search' | 'pack' | 'close' | 'menu' | 'play' }) => {
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    pack: <><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    play: <path d="m9 6 9 6-9 6V6Z"/>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = (next: View) => { setView(next); setMenuOpen(false); };

  return (
    <main className="site">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark">W</div><div><strong>WAVLIB</strong><small>SOUND LIBRARY</small></div></div>
        <button className="close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
        <nav>
          <button className={`nav ${view === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}><Icon name="home" /><span>Home</span></button>
          <button className={`nav ${view === 'search' ? 'active' : ''}`} onClick={() => navigate('search')}><Icon name="search" /><span>Search</span></button>
          <button className={`nav ${view === 'packs' ? 'active' : ''}`} onClick={() => navigate('packs')}><Icon name="pack" /><span>Packs</span></button>
        </nav>
        <div className="legal"><span>Terms</span><span>Privacy</span><span>Disclaimer</span><span>Copyright</span></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <button className="menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <div className="mobile-brand">WAVLIB</div>
          <div className="breadcrumb">{view === 'home' ? 'Home' : view === 'search' ? 'Search' : 'Packs'}</div>
          <div className="header-search"><Icon name="search" /><input aria-label="Search sounds" placeholder="Search sounds by genre, mood, instrument, BPM, key..." /><button aria-label="Submit search">→</button></div>
        </header>
        {view === 'home' && <HomeView />}
        {view === 'search' && <SearchView />}
        {view === 'packs' && <PacksView />}
      </section>
    </main>
  );
}

function HomeView() {
  return <div className="view">
    <section className="hero"><div><div className="eyebrow"><span className="live-dot" /> WAVLIB SOUND LIBRARY</div><h1>Find the right sound.<br /><em>Sound fast.</em></h1><p>Explore a growing library of samples, textures, loops and production-ready sounds.</p></div><div className="stat"><strong>204,519</strong><span>sounds in the library</span></div></section>
    <Section title="New Packs" action="See all →" packs={demoPacks.slice(0, 5)} />
    <Section title="Recommended" action="See all →" packs={demoPacks.slice(5, 10)} />
    <section className="samples-section"><div className="section-head"><div><h2>Latest Samples</h2><p>Fresh sounds ready for your next project.</p></div><button>Browse samples →</button></div><div className="sample-list">{demoSamples.map((s, i) => <div className="sample" key={s}><button className="sample-play"><Icon name="play" /></button><div className="sample-main"><strong>{s}</strong><span>{['Drums', 'Percussion', 'Texture', 'Bass', 'Vocal', 'Cinematic'][i]} · WAV</span></div><span className="sample-meta">{['124 BPM', '98 BPM', '—', '140 BPM', '—', '110 BPM'][i]}</span><span className="sample-duration">0:0{i + 3}</span></div>)}</div></section>
  </div>;
}

function Section({ title, action, packs }: { title: string; action: string; packs: typeof demoPacks }) {
  return <section className="pack-section"><div className="section-head"><h2>{title}</h2><button>{action}</button></div><div className="pack-grid">{packs.map(p => <PackCard key={p.name} {...p} />)}</div></section>;
}

function SearchView() {
  return <div className="view"><div className="page-title"><div><div className="eyebrow">DISCOVER</div><h1>Search sounds</h1><p>Search and filter samples by genre, mood, instrument, BPM and key.</p></div><span className="result-count">204,519 sounds</span></div><div className="search-panel"><div className="large-search"><Icon name="search" /><input placeholder="Search anything..." /></div><div className="filters"><button>Genre <span>⌄</span></button><button>Mood <span>⌄</span></button><button>Instrument <span>⌄</span></button><button>BPM <span>⌄</span></button><button>Key <span>⌄</span></button></div></div><div className="search-results">{demoSamples.map((s, i) => <div className="sample" key={s}><button className="sample-play"><Icon name="play" /></button><div className="sample-main"><strong>{s}</strong><span>Demo Pack · WAV · {['Drums','Percussion','Texture','Bass','Vocal','Cinematic'][i]}</span></div><span className="sample-meta">{['124 BPM','98 BPM','—','140 BPM','—','110 BPM'][i]}</span></div>)}</div></div>;
}

function PacksView() {
  return <div className="view"><div className="page-title"><div><div className="eyebrow">SOUND COLLECTIONS</div><h1>Packs</h1><p>Browse curated sample packs and sound collections.</p></div><span className="result-count">{demoPacks.length} packs</span></div><div className="pack-grid packs-page">{demoPacks.map(p => <PackCard key={p.name} {...p} />)}</div></div>;
}

function PackCard({ name, code, tags, count }: { name: string; code: string; tags: string[]; count: number }) {
  return <article className="pack-card"><div className="cover"><span>{code}</span><div className="cover-glow" /></div><div className="pack-info"><h3>{name}</h3><p>{count} sounds</p><div className="tags">{tags.map(t => <span key={t}>{t}</span>)}</div></div></article>;
}
