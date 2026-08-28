'use client';

import { useState } from 'react';

type View = 'home' | 'search' | 'packs';

const demoPacks = [
  { name: 'Demo Essentials', count: 24 },
  { name: 'Demo Drums', count: 18 },
  { name: 'Demo Textures', count: 12 },
];

const demoSamples = ['Kick One', 'Snare One', 'Texture One', 'Bass One'];

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
  };

  return (
    <main className="site">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">WAVLIB</div>
        <button className="close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
        <nav>
          <button className={view === 'home' ? 'nav active' : 'nav'} onClick={() => navigate('home')}>Home</button>
          <button className={view === 'search' ? 'nav active' : 'nav'} onClick={() => navigate('search')}>Search</button>
          <button className={view === 'packs' ? 'nav active' : 'nav'} onClick={() => navigate('packs')}>Packs</button>
        </nav>
        <div className="legal"><span>Terms</span><span>Privacy</span><span>Disclaimer</span><span>Copyright</span></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <button className="menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button>
          <div className="logo">WAVLIB</div>
          <input aria-label="Search" placeholder="Search samples, packs..." />
        </header>

        {view === 'home' && <HomeView />}
        {view === 'search' && <SearchView />}
        {view === 'packs' && <PacksView />}
      </section>
    </main>
  );
}

function HomeView() {
  return <div className="view"><h1>Sample Library</h1><p>Discover sounds and sample packs.</p><h2>Demo Packs</h2><div className="pack-grid">{demoPacks.map(p => <PackCard key={p.name} {...p} />)}</div><h2>Samples</h2><div className="sample-list">{demoSamples.map(s => <div className="sample" key={s}><span>{s}</span><button>▶</button></div>)}</div></div>;
}

function SearchView() {
  return <div className="view"><h1>Search</h1><input className="search" placeholder="Search samples and packs..." /><div className="filters"><select defaultValue="all"><option value="all">All genres</option><option>Drums</option><option>Textures</option></select><select defaultValue="all"><option value="all">All keys</option><option>C</option><option>D</option></select></div><div className="sample-list">{demoSamples.map(s => <div className="sample" key={s}><span>{s}</span><button>▶</button></div>)}</div></div>;
}

function PacksView() {
  return <div className="view"><h1>Packs</h1><div className="pack-grid">{demoPacks.map(p => <PackCard key={p.name} {...p} />)}</div></div>;
}

function PackCard({ name, count }: { name: string; count: number }) {
  return <article className="pack-card"><div className="cover" /><h3>{name}</h3><span>{count} samples</span></article>;
}
