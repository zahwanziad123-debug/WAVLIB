'use client';

import Link from 'next/link';

type Section = { title: string; body: React.ReactNode };

export default function LegalPage({ title, eyebrow, updated, sections }: { title: string; eyebrow: string; updated: string; sections: Section[] }) {
  return (
    <main className="site" style={{ minHeight: '100vh' }}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section style={{ width: '100%', maxWidth: 980, margin: '0 auto', padding: '42px 22px 70px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
          <Link href="/" style={{ color: '#f5f5f5', textDecoration: 'none', fontWeight: 800, letterSpacing: '.18em' }}>WAVLIB</Link>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: 12 }}>Back to WAVLIB</Link>
        </header>
        <article style={{ border: '1px solid #292929', borderRadius: 18, background: 'rgba(10,10,10,.72)', padding: '38px clamp(22px,5vw,56px)', boxShadow: '0 28px 80px rgba(0,0,0,.25)' }}>
          <div style={{ color: '#999', fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase' }}>{eyebrow}</div>
          <h1 style={{ margin: '10px 0 8px', fontSize: 'clamp(34px,5vw,54px)', lineHeight: 1, letterSpacing: '-.05em' }}>{title}</h1>
          <p style={{ color: '#666', fontSize: 12, margin: '0 0 36px' }}>Last updated: {updated}</p>
          <div style={{ display: 'grid', gap: 30 }}>
            {sections.map((section) => (
              <section key={section.title}>
                <h2 style={{ fontSize: 19, margin: '0 0 10px', letterSpacing: '-.02em' }}>{section.title}</h2>
                <div style={{ color: '#999', fontSize: 13, lineHeight: 1.75 }}>{section.body}</div>
              </section>
            ))}
          </div>
        </article>
        <footer style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 22, color: '#666', fontSize: 11 }}>
          <Link href="/terms/" style={{ color: 'inherit' }}>Terms</Link>
          <Link href="/privacy/" style={{ color: 'inherit' }}>Privacy</Link>
          <Link href="/disclaimer/" style={{ color: 'inherit' }}>Disclaimer</Link>
          <Link href="/copyright/" style={{ color: 'inherit' }}>Copyright</Link>
          <span>© WAVLIB</span>
        </footer>
      </section>
    </main>
  );
}
