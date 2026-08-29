'use client';

import { useEffect } from 'react';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const BASE_PATH = '/WAVLIB';

export default function PackCardNavigation() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.pack-card'));
    const go = (card: HTMLElement) => {
      const name = card.querySelector('h3')?.textContent?.trim();
      if (!name) return;
      window.location.assign(`${BASE_PATH}/packs/${slugify(name)}/`);
    };

    const navigate = (path: string) => window.location.assign(`${BASE_PATH}${path}`);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>('.pack-card');
      if (card) {
        event.preventDefault();
        go(card);
        return;
      }

      const navLink = target?.closest<HTMLAnchorElement>('a.nav');
      if (navLink) {
        const label = navLink.textContent?.trim().toLowerCase() || '';
        event.preventDefault();
        if (label.includes('home')) navigate('/');
        else if (label.includes('search')) navigate('/#search');
        else if (label.includes('packs')) navigate('/#packs');
        return;
      }

      const backButton = target?.closest<HTMLButtonElement>('.crumbs button');
      if (backButton) {
        event.preventDefault();
        navigate('/#packs');
      }
    };

    const syncHashView = () => {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (hash !== 'home' && hash !== 'search' && hash !== 'packs') return;
      const nav = Array.from(document.querySelectorAll<HTMLElement>('.sidebar .nav')).find((item) => item.textContent?.trim().toLowerCase() === hash);
      if (nav instanceof HTMLButtonElement) nav.click();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('.pack-card') : null;
      if (!card) return;
      event.preventDefault();
      go(card);
    };

    cards.forEach((card) => {
      card.tabIndex = 0;
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', `Open ${card.querySelector('h3')?.textContent?.trim() || 'sample pack'}`);
    });

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', syncHashView);
    syncHashView();
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', syncHashView);
    };
  }, []);

  return null;
}
