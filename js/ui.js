/* WAVLIB — UI behavior entry point
   Keep page interaction code here as the project is split out of index.html.
*/

(() => {
  'use strict';

  function svgIcon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = path;
    return svg;
  }

  function setupMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const nav = sidebar?.querySelector('.nav');
    if (!sidebar || !nav || sidebar.dataset.mobileDrawerReady === '1') return;

    sidebar.dataset.mobileDrawerReady = '1';

    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.appendChild(svgIcon('<path d="M4 6h16M4 12h16M4 18h16"/>'));

    const close = document.createElement('button');
    close.className = 'mobile-sidebar-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close navigation');
    close.appendChild(svgIcon('<path d="M6 6l12 12M18 6L6 18"/>'));

    const scrim = document.createElement('div');
    scrim.className = 'mobile-sidebar-scrim';
    scrim.setAttribute('aria-hidden', 'true');

    sidebar.appendChild(close);
    document.body.appendChild(scrim);
    document.body.appendChild(toggle);

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    function setOpen(open) {
      if (!isMobile()) open = false;
      document.body.classList.toggle('mobile-sidebar-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }

    toggle.addEventListener('click', () => setOpen(true));
    close.addEventListener('click', () => setOpen(false));
    scrim.addEventListener('click', () => setOpen(false));

    nav.addEventListener('click', (event) => {
      if (event.target.closest('.nav-item') && isMobile()) {
        window.setTimeout(() => setOpen(false), 80);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('mobile-sidebar-open')) {
        setOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (!isMobile()) setOpen(false);
    }, { passive: true });

    setOpen(false);
  }

  function boot() {
    setupMobileSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
