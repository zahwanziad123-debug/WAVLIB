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

  function setupGlobalEmailAndAccountCleanup() {
    const emailPattern = /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/;

    const removeAccountUi = () => {
      document.querySelectorAll('a, button, [role="button"], form, input, textarea').forEach((el) => {
        if (el.closest('.legal')) return;
        const text = [
          el.textContent,
          el.getAttribute('aria-label'),
          el.getAttribute('title'),
          el.getAttribute('href'),
          el.getAttribute('id'),
          el.getAttribute('class')
        ].filter(Boolean).join(' ');
        if (/(?:log\s*in|login|sign\s*in|signin|sign\s*up|signup|register|account|authentication|auth)/i.test(text)) {
          el.remove();
        }
      });
    };

    const cleanInputs = () => {
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

    const clean = () => {
      cleanInputs();
      removeAccountUi();
    };

    clean();
    document.addEventListener('input', clean, true);
    document.addEventListener('change', clean, true);
    document.addEventListener('focusin', clean, true);
    window.addEventListener('pageshow', clean, { passive: true });
    window.addEventListener('load', clean, { passive: true });

    [0, 50, 100, 250, 500, 1000, 2000, 4000, 8000].forEach((delay) => {
      window.setTimeout(clean, delay);
    });

    window.setInterval(clean, 300);

    const observer = new MutationObserver(clean);
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });

    try {
      if (typeof wavlibSupabase !== 'undefined' && wavlibSupabase && wavlibSupabase.auth) {
        wavlibSupabase.auth = undefined;
      }
    } catch (_) {}
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
    input.readOnly = true;

    const isEmail = (value) => /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/.test(value || '');
    const clearEmail = () => {
      if (isEmail(input.value)) input.value = '';
    };
    const clearValue = () => {
      input.value = '';
      input.removeAttribute('value');
    };

    clearValue();
    clearEmail();

    const activateSearch = () => {
      clearValue();
      input.readOnly = false;
      input.removeAttribute('readonly');
      input.focus({ preventScroll: true });
    };

    input.addEventListener('pointerdown', activateSearch, { once: true });
    input.addEventListener('mousedown', activateSearch, { once: true });
    input.addEventListener('touchstart', activateSearch, { once: true, passive: true });
    input.addEventListener('focus', clearEmail);
    input.addEventListener('input', clearEmail);

    [0, 100, 300, 600, 1200, 2000].forEach((delay) => window.setTimeout(clearEmail, delay));
    window.addEventListener('pageshow', clearEmail, { passive: true });
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
    input.readOnly = true;

    const isEmail = (value) => /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/.test(value || '');
    const clearValue = () => {
      input.value = '';
      input.removeAttribute('value');
    };
    const clearEmail = () => {
      if (isEmail(input.value)) {
        clearValue();
        if (typeof window.filterPackSamples === 'function') window.filterPackSamples();
      }
    };

    clearValue();
    clearEmail();

    const activateSearch = () => {
      clearValue();
      input.readOnly = false;
      input.removeAttribute('readonly');
      input.focus({ preventScroll: true });
    };

    input.addEventListener('pointerdown', activateSearch, { once: true });
    input.addEventListener('mousedown', activateSearch, { once: true });
    input.addEventListener('touchstart', activateSearch, { once: true, passive: true });
    input.addEventListener('focus', clearEmail);
    input.addEventListener('input', clearEmail);
    window.addEventListener('pageshow', clearEmail, { passive: true });

    [0, 100, 300, 600, 1200, 2000, 4000, 8000].forEach((delay) => window.setTimeout(clearEmail, delay));

    const autofillGuard = window.setInterval(() => {
      if (!document.documentElement.contains(input)) {
        window.clearInterval(autofillGuard);
        return;
      }
      if (input.readOnly || isEmail(input.value)) clearEmail();
    }, 100);

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

    const links = {
      'Terms': 'terms.html',
      'Privacy': 'privacy.html',
      'Disclaimer': 'disclaimer.html',
      'Copyright': 'copyright.html'
    };

    legal.querySelectorAll('a').forEach((link) => {
      const label = link.textContent.trim();
      if (links[label]) {
        link.href = links[label];
        link.removeAttribute('onclick');
      }
    });
  }

  function setupMobileSearchLayout() {
    const sync = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        document.body.classList.remove('wavlib-mobile-search-tab');
        return;
      }

      const active = Array.from(document.querySelectorAll('.nav-item.active'))
        .some((item) => item.textContent.trim().toLowerCase().includes('search'));
      document.body.classList.toggle('wavlib-mobile-search-tab', active);
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
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
      if (event.target.closest('.nav-item') && isMobile()) window.setTimeout(() => setOpen(false), 80);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('mobile-sidebar-open')) setOpen(false);
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
    setupMobileSearchLayout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();