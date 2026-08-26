/* WAVLIB UI helpers. Kept intentionally lightweight so the app never enters an observer loop. */
(() => {
  'use strict';
  const MOBILE_BREAKPOINT = 768;

  function svgIcon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = path;
    return svg;
  }

  function setupTopSearch() {
    const input = document.querySelector('.topbar .search-input');
    if (!input || input.dataset.wavlibSearchReady === '1') return;

    input.dataset.wavlibSearchReady = '1';
    input.type = 'search';
    input.name = 'wavlib-search-query';
    input.id = 'wavlib-search-query';
    input.placeholder = 'Search sounds by genre, mood, instrument, BPM, key...';
    input.setAttribute('aria-label', 'Search sounds');
    input.setAttribute('autocomplete', 'new-password');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('data-form-type', 'other');
    input.setAttribute('data-lpignore', 'true');
    input.setAttribute('data-1p-ignore', 'true');

    // Chrome/password managers can restore a saved email after DOMContentLoaded.
    // Clear only email-like autofill values; real search text is never touched.
    const clearAutofillEmail = () => {
      if (/^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/.test(input.value)) {
        input.value = '';
      }
    };

    input.value = '';
    input.removeAttribute('value');
    clearAutofillEmail();

    [0, 50, 150, 350, 700, 1200].forEach((delay) => {
      window.setTimeout(clearAutofillEmail, delay);
    });

    input.addEventListener('focus', clearAutofillEmail);
    input.addEventListener('input', () => {
      // If a browser injects an email rather than the user's typed query, remove it.
      clearAutofillEmail();
    });
    window.addEventListener('pageshow', clearAutofillEmail, { passive: true });
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
    toggle.appendChild(svgIcon('<rect x="4.5" y="5.5" width="15" height="13" rx="2"/><path d="M10 5.5v13"/>'));

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

    const media = window.matchMedia(`(max-width:${MOBILE_BREAKPOINT}px)`);
    const isMobile = () => media.matches;

    function setOpen(open) {
      if (!isMobile()) open = false;
      document.body.classList.toggle('mobile-sidebar-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.documentElement.classList.toggle('mobile-sidebar-lock', open);
      document.body.classList.toggle('mobile-sidebar-lock', open);
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

    const handleViewportChange = () => {
      if (!isMobile()) setOpen(false);
    };
    if (media.addEventListener) media.addEventListener('change', handleViewportChange);
    else media.addListener(handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange, { passive: true });

    setOpen(false);
  }

  function boot() {
    setupTopSearch();
    setupMobileSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
