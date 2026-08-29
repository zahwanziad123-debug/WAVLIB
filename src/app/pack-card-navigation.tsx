'use client';

import { useEffect } from 'react';

export default function PackCardNavigation() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const navButton = target?.closest<HTMLButtonElement>('.sidebar .nav');
      if (navButton) {
        const label = navButton.textContent?.trim().toLowerCase() || '';
        const hash = label.includes('search') ? '#search' : label.includes('packs') ? '#packs' : '';
        if (window.location.hash !== hash) window.location.hash = hash;
        return;
      }

      const backButton = target?.closest<HTMLButtonElement>('.crumbs button');
      if (backButton) {
        event.preventDefault();
        window.location.hash = '#packs';
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
