'use client';

import { useEffect } from 'react';

const BASE_PATH = '/WAVLIB';

/**
 * Keeps the client-side navigation URL inside the GitHub Pages project path.
 * Never derive the route from window.location.pathname because an earlier
 * navigation can already have landed at the domain root.
 */
export default function PackCardNavigation() {
  useEffect(() => {
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
        const nextUrl = `${BASE_PATH}/#${hash}`;
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (currentUrl !== nextUrl) {
          window.history.pushState(null, '', nextUrl);
        }

        // The page component owns the rendered view. Dispatch a popstate
        // event so it can synchronize immediately without a full reload.
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }

      const backButton = target?.closest<HTMLButtonElement>('.crumbs button');
      if (backButton) {
        event.preventDefault();
        window.history.pushState(null, '', `${BASE_PATH}/#packs`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
