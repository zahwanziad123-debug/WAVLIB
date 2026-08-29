'use client';

import { useEffect } from 'react';

const BASE_PATH = '/WAVLIB';

/**
 * The root page uses buttons for its three in-app views. Pack detail pages
 * use real links so GitHub Pages can leave /packs/[slug]/ and load the root
 * document with the requested hash.
 *
 * Important: this handler must NEVER intercept navigation from a pack-detail
 * page. Doing so with history.pushState changes the address bar but leaves
 * the pack-detail React tree mounted, which is what caused #search to show
 * the pack page instead of Search.
 */
export default function PackCardNavigation() {
  useEffect(() => {
    const isRootPage = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '');
      return pathname === BASE_PATH;
    };

    const navigateRootView = (hash: 'home' | 'search' | 'packs') => {
      if (!isRootPage()) return;

      const nextHash = hash === 'home' ? '' : `#${hash}`;
      const nextUrl = `${BASE_PATH}/${nextHash}`;
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (currentUrl !== nextUrl) {
        window.history.pushState(null, '', nextUrl);
      }

      // pushState does not fire hashchange by itself. The root page listens
      // for hashchange to update its rendered view without a reload.
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const navButton = target?.closest<HTMLButtonElement>('.sidebar .nav');

      // Only intercept the root page's actual buttons. Pack-detail navigation
      // uses <a href="/WAVLIB/#..."> and must be allowed to perform a real
      // document navigation.
      if (!navButton || navButton.tagName !== 'BUTTON' || !isRootPage()) return;

      const label = navButton.textContent?.trim().toLowerCase() || '';
      const hash = label.includes('search')
        ? 'search'
        : label.includes('packs')
          ? 'packs'
          : 'home';

      event.preventDefault();
      navigateRootView(hash);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
