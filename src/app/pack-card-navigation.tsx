'use client';

import { useEffect } from 'react';

/**
 * Keeps the URL in sync with the client-side navigation without causing a
 * hashchange event. The page component owns the actual view state.
 *
 * The previous implementation wrote window.location.hash on every sidebar
 * click. That fired the page's hashchange listener while React was already
 * changing the view, which could leave the URL at #search/#packs while the
 * rendered view had fallen back to Home.
 */
export default function PackCardNavigation() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      const navButton = target?.closest<HTMLButtonElement>('.sidebar .nav');
      if (navButton) {
        const label = navButton.textContent?.trim().toLowerCase() || '';
        const hash = label.includes('search')
          ? '#search'
          : label.includes('packs')
            ? '#packs'
            : '';

        // React's nav() updates the view. Only update the address bar here;
        // replaceState deliberately does not emit hashchange, so it cannot
        // race the view state back to Home.
        const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
        if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
          window.history.replaceState(null, '', nextUrl);
        }
        return;
      }

      const backButton = target?.closest<HTMLButtonElement>('.crumbs button');
      if (backButton) {
        event.preventDefault();
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#packs`);
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
