'use client';

import { useEffect } from 'react';

const OPTIONS: Record<string, string[]> = {
  Genre: ['All', 'Trap', 'Cinematic', 'House', 'Techno', 'Ambient', 'Drill', 'Garage', 'Dubstep', 'Hip Hop'],
  Mood: ['All', 'Dark', 'Deep', 'Bright', 'Aggressive', 'Calm', 'Chill', 'Epic', 'Warm', 'Atmospheric'],
  Instrument: ['All', 'Drums', 'Bass', 'Guitar', 'Piano', 'Synth', 'Vocals', 'Percussion', 'Strings', 'Keys'],
};

export default function FilterDropdownFix() {
  useEffect(() => {
    const onCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('.filter-button') as HTMLButtonElement | null;
      if (!button) return;
      const label = button.childNodes[0]?.textContent?.trim() || '';
      if (!(label in OPTIONS)) return;

      event.preventDefault();
      event.stopPropagation();

      const parent = button.parentElement;
      if (!parent) return;
      const existing = parent.querySelector(':scope > .generic-filter-menu') as HTMLElement | null;
      document.querySelectorAll('.generic-filter-menu').forEach((node) => {
        if (node !== existing) node.remove();
      });
      if (existing) {
        existing.remove();
        button.classList.remove('active');
        return;
      }

      const menu = document.createElement('div');
      menu.className = 'dropdown generic-filter-menu';
      menu.setAttribute('role', 'menu');
      const title = document.createElement('div');
      title.className = 'menu-title';
      title.textContent = label;
      menu.appendChild(title);

      OPTIONS[label].forEach((option) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.textContent = option;
        item.setAttribute('role', 'menuitem');
        item.addEventListener('click', (clickEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          button.childNodes[0].textContent = option;
          button.classList.add('active');
          menu.remove();
        });
        menu.appendChild(item);
      });

      parent.appendChild(menu);
      button.classList.add('active');
    };

    const close = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.filter-button, .generic-filter-menu')) return;
      document.querySelectorAll('.generic-filter-menu').forEach((node) => node.remove());
      document.querySelectorAll('.filter-button.active').forEach((node) => node.classList.remove('active'));
    };

    document.addEventListener('click', onCapture, true);
    document.addEventListener('click', close);
    return () => {
      document.removeEventListener('click', onCapture, true);
      document.removeEventListener('click', close);
      document.querySelectorAll('.generic-filter-menu').forEach((node) => node.remove());
    };
  }, []);

  return null;
}
