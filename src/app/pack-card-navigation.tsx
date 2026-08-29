'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PackCardNavigation() {
  const router = useRouter();

  useEffect(() => {
    const navigate = (path: string) => router.push(path);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
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

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [router]);

  return null;
}
