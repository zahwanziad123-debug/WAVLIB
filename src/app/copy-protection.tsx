'use client';

import { useEffect } from 'react';

export default function CopyProtection() {
  useEffect(() => {
    const stop = (event: Event) => event.preventDefault();

    const clearSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) selection.removeAllRanges();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'x', 's', 'u', 'p'].includes(key)) {
        event.preventDefault();
        clearSelection();
      }
      if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key))) {
        event.preventDefault();
      }
    };

    const legalRoutes: Record<string, string> = {
      Terms: '/WAVLIB/terms/',
      Privacy: '/WAVLIB/privacy/',
      Disclaimer: '/WAVLIB/disclaimer/',
    };

    const onLegalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const item = target?.closest('.legal span') as HTMLElement | null;
      if (!item) return;
      const label = item.textContent?.trim() || '';
      if (legalRoutes[label]) {
        event.preventDefault();
        window.location.assign(legalRoutes[label]);
      } else if (label.startsWith('Copyright')) {
        event.preventDefault();
        window.location.assign('/WAVLIB/copyright/');
      }
    };

    document.addEventListener('contextmenu', stop);
    document.addEventListener('selectstart', stop);
    document.addEventListener('dragstart', stop);
    document.addEventListener('copy', stop);
    document.addEventListener('cut', stop);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mouseup', clearSelection);
    document.addEventListener('touchend', clearSelection);
    document.addEventListener('click', onLegalClick);

    clearSelection();

    return () => {
      document.removeEventListener('contextmenu', stop);
      document.removeEventListener('selectstart', stop);
      document.removeEventListener('dragstart', stop);
      document.removeEventListener('copy', stop);
      document.removeEventListener('cut', stop);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mouseup', clearSelection);
      document.removeEventListener('touchend', clearSelection);
      document.removeEventListener('click', onLegalClick);
    };
  }, []);

  return null;
}
