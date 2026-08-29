'use client';

import { useEffect } from 'react';

const BASE_PATH = '/WAVLIB';

/**
 * Keeps client-side navigation inside the GitHub Pages project path.
 * The page component owns the rendered view; this only synchronizes the URL.
 */
export default function PackCardNavigation() {
  useEffect(() => {
    const sync = (hash: string) => {
      const nextUrl = `${BASE_PATH}/#${hash}`;
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentUrl !== nextUrl) {
        window.history.pushState(null, '', nextUrl);
      }
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const navButton = target?.closest<HTMLButtonElement>('.sidebar .nav');

      if (navButton) {
        const label = navButton.textContent?.trim().toLowerCase() || '';
        const hash = label.includes('search')
          ? 'search'
          : label.includes('packs')
            ? 'packs'
            : 'home';
        event.preventDefault();
        sync(hash);
        return;
      }

      const backButton = target?.closest<HTMLButtonElement>('.crumbs button');
      if (backButton) {
        event.preventDefault();
        sync('packs');
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
