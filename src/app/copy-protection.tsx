'use client';

import { useEffect } from 'react';

export default function CopyProtection() {
  useEffect(() => {
    const stop = (event: Event) => event.preventDefault();

    // Remove any selection that may already exist when the page hydrates.
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

    document.addEventListener('contextmenu', stop);
    document.addEventListener('selectstart', stop);
    document.addEventListener('dragstart', stop);
    document.addEventListener('copy', stop);
    document.addEventListener('cut', stop);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mouseup', clearSelection);
    document.addEventListener('touchend', clearSelection);

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
    };
  }, []);

  return null;
}
