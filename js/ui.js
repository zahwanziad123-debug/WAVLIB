/* WAVLIB UI helpers. Mobile navigation is kept isolated from desktop behavior. */
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

  function isEmail(value) {
    return /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/.test(String(value || ''));
  }

  function cleanAccountAutofill() {
    document.querySelectorAll('input, textarea').forEach((input) => {
      input.setAttribute('autocomplete', 'new-password');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('data-form-type', 'other');
      input.setAttribute('data-lpignore', 'true');
      input.setAttribute('data-1p-ignore', 'true');
      if (isEmail(input.value)) {
        input.value = '';
        input.removeAttribute('value');
      }
    });
  }

  function setupGlobalEmailAndAccountCleanup() {
    cleanAccountAutofill();
    window.addEventListener('pageshow', cleanAccountAutofill, { passive: true });
    window.addEventListener('load', cleanAccountAutofill, { passive: true });
    document.addEventListener('focusin', cleanAccountAutofill, true);
    [100, 300, 700, 1400, 2500, 5000].forEach((delay) => window.setTimeout(cleanAccountAutofill, delay));
  }

  function setupTopSearch() {
    const input = document.querySelector('.topbar .search-input');
    if (!input || input.dataset.wavlibSearchReady === '1') return;
    input.dataset.wavlibSearchReady = '1';
    input.type = 'search';
    input.name = 'wavlib_query_7f3c2a';
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
    input.setAttribute('role', 'searchbox');
    if (isEmail(input.value)) input.value = '';
  }

  function setupPackSampleSearch() {
    const input = document.getElementById('pack-sample-query');
    if (!input || input.dataset.wavlibPackSearchReady === '1') return Boolean(input);
    input.dataset.wavlibPackSearchReady = '1';
    input.type = 'search';
    input.name = 'wavlib_pack_query_91b4d6';
    input.setAttribute('autocomplete', 'new-password');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('data-form-type', 'other');
    input.setAttribute('data-lpignore', 'true');
    input.setAttribute('data-1p-ignore', 'true');
    input.setAttribute('aria-label', 'Search samples in this pack');
    if (isEmail(input.value)) input.value = '';
    input.addEventListener('input', () => { if (isEmail(input.value)) input.value = ''; });
    return true;
  }

  function watchPackSampleSearch() {
    if (setupPackSampleSearch()) return;
    const observer = new MutationObserver(() => {
      if (setupPackSampleSearch()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function setupLegalLinks() {
    const legal = document.querySelector('.legal');
    if (!legal || legal.dataset.wavlibLegalReady === '1') return;
    legal.dataset.wavlibLegalReady = '1';
    const links = { Terms: 'terms.html', Privacy: 'privacy.html', Disclaimer: 'disclaimer.html', Copyright: 'copyright.html' };
    legal.querySelectorAll('a').forEach((link) => {
      const label = link.textContent.trim();
      if (links[label]) {
        link.href = links[label];
        link.removeAttribute('onclick');
      }
    });
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

    // Never cancel or replace WAVLIB's existing Search/Packs navigation.
    nav.addEventListener('click', (event) => {
      const item = event.target.closest('.nav-item');
      if (!item) return;
      if (isMobile()) window.setTimeout(() => setOpen(false), 220);
    }, false);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('mobile-sidebar-open')) setOpen(false);
    });

    const handleViewportChange = () => { if (!isMobile()) setOpen(false); };
    if (media.addEventListener) media.addEventListener('change', handleViewportChange);
    else media.addListener(handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange, { passive: true });
    setOpen(false);
  }

  function setupGlobalEmailRemoval() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const clean = () => {
      document.querySelectorAll('input, textarea').forEach((input) => {
        input.setAttribute('autocomplete', 'new-password');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('data-form-type', 'other');
        input.setAttribute('data-lpignore', 'true');
        input.setAttribute('data-1p-ignore', 'true');
        const value = String(input.value || '').trim();
        if (emailPattern.test(value)) {
          input.value = '';
          input.removeAttribute('value');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    };
    clean();
    document.addEventListener('input', clean, true);
    document.addEventListener('change', clean, true);
    document.addEventListener('focusin', clean, true);
    window.addEventListener('pageshow', clean, { passive: true });
    [0,100,250,500,1000,2000,4000,8000].forEach((n) => window.setTimeout(clean, n));
    window.setInterval(clean, 300);
  }

  function boot() {
    setupGlobalEmailAndAccountCleanup();
    setupGlobalEmailRemoval();
    setupTopSearch();
    setupMobileSidebar();
    watchPackSampleSearch();
    setupLegalLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
