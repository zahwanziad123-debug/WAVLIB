'use client';

import { useEffect } from 'react';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PackCardNavigation() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.pack-card'));
    const go = (card: HTMLElement) => {
      const name = card.querySelector('h3')?.textContent?.trim();
      if (!name) return;
      window.location.assign(`/packs/${slugify(name)}`);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>('.pack-card');
      if (card) go(card);
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
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  return null;
}
