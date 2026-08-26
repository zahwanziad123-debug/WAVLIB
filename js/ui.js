/* WAVLIB — mobile UI behavior
   Desktop layout remains untouched. Mobile navigation is a real drawer.
*/

(() => {
  'use strict';

  const MOBILE_BREAKPOINT = 768;

  function svgIcon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = path;
    return svg;
  }

  function injectMobileStyles() {
    if (document.getElementById('wavlib-mobile-ui-styles')) return;

    const style = document.createElement('style');
    style.id = 'wavlib-mobile-ui-styles';
    style.textContent = `
      .mobile-menu-toggle,
      .mobile-sidebar-close,
      .mobile-sidebar-scrim { display:none; }

      @media (max-width:${MOBILE_BREAKPOINT}px) {
        html, body {
          width:100%;
          max-width:100%;
          overflow:hidden !important;
          overscroll-behavior:none;
        }

        body,
        button,
        a,
        input,
        .nav-item {
          -webkit-tap-highlight-color:transparent;
        }

        .app {
          position:relative;
          width:100%;
          max-width:100%;
          min-width:0;
          overflow:hidden;
        }

        .main {
          width:100%;
          min-width:0;
          max-width:100%;
        }

        /* Drawer */
        .sidebar {
          position:fixed !important;
          top:0;
          left:0;
          bottom:0;
          width:min(84vw, 330px) !important;
          height:100dvh;
          max-height:100dvh;
          margin:0;
          padding:24px 18px 20px !important;
          background:#050505 !important;
          border-right:1px solid #292929 !important;
          box-shadow:18px 0 55px rgba(0,0,0,.55);
          z-index:1002;
          overflow-y:auto;
          overflow-x:hidden;
          transform:translate3d(-105%,0,0);
          visibility:hidden;
          transition:transform .28s cubic-bezier(.22,.8,.2,1), visibility 0s linear .28s;
          will-change:transform;
        }

        body.mobile-sidebar-open .sidebar {
          transform:translate3d(0,0,0);
          visibility:visible;
          transition:transform .28s cubic-bezier(.22,.8,.2,1), visibility 0s;
        }

        .sidebar .logo {
          width:100%;
          min-height:92px;
          padding:8px 10px 28px !important;
          display:flex;
          align-items:center;
          justify-content:flex-start;
        }

        .sidebar .brand-logo {
          display:block;
          width:190px !important;
          height:auto !important;
          max-width:78%;
          max-height:82px;
          object-fit:contain;
          object-position:left center;
        }

        .sidebar .nav {
          width:100%;
          flex:1 1 auto;
          min-height:0;
          gap:6px !important;
          padding:4px 0;
        }

        .sidebar .nav-item {
          width:100%;
          min-height:50px;
          padding:13px 14px !important;
          border-radius:12px !important;
          gap:13px;
          font-size:15px !important;
          touch-action:manipulation;
          user-select:none;
        }

        .sidebar .nav-item svg {
          width:20px !important;
          height:20px !important;
        }

        .sidebar .signin-btn {
          min-height:48px;
          border-radius:12px;
          margin-top:12px;
        }

        .sidebar .legal {
          padding:14px 6px 4px;
        }

        .mobile-sidebar-close {
          position:absolute;
          top:18px;
          right:16px;
          width:42px;
          height:42px;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid #292929;
          border-radius:12px;
          background:#111;
          color:#f5f5f5;
          z-index:1004;
          touch-action:manipulation;
          -webkit-tap-highlight-color:transparent;
        }

        .mobile-sidebar-close svg {
          width:20px;
          height:20px;
        }

        .mobile-menu-toggle {
          position:fixed;
          top:max(12px, env(safe-area-inset-top));
          left:max(12px, env(safe-area-inset-left));
          width:44px;
          height:44px;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid #292929;
          border-radius:12px;
          background:rgba(8,8,8,.92);
          color:#f5f5f5;
          box-shadow:0 8px 24px rgba(0,0,0,.35);
          z-index:1003;
          touch-action:manipulation;
          -webkit-tap-highlight-color:transparent;
        }

        .mobile-menu-toggle svg {
          width:22px;
          height:22px;
        }

        body.mobile-sidebar-open .mobile-menu-toggle {
          opacity:0;
          pointer-events:none;
        }

        .mobile-sidebar-scrim {
          position:fixed;
          inset:0;
          display:block;
          background:rgba(0,0,0,.64);
          backdrop-filter:blur(3px);
          -webkit-backdrop-filter:blur(3px);
          opacity:0;
          visibility:hidden;
          pointer-events:none;
          z-index:1001;
          transition:opacity .22s ease, visibility 0s linear .22s;
        }

        body.mobile-sidebar-open .mobile-sidebar-scrim {
          opacity:1;
          visibility:visible;
          pointer-events:auto;
          transition:opacity .22s ease, visibility 0s;
        }

        /* Mobile top bar: leave room for the menu button and never exceed viewport. */
        .topbar {
          width:100%;
          max-width:100%;
          min-width:0;
          padding:16px 14px 16px 68px !important;
          gap:10px !important;
          overflow:hidden;
        }

        .topbar .crumb {
          display:none;
        }

        .topbar .search-wrap {
          width:100%;
          min-width:0;
          max-width:none;
          flex:1 1 auto;
        }

        .search-input {
          width:100%;
          min-width:0;
          font-size:13px;
        }

        .content {
          width:100%;
          max-width:100%;
          min-width:0;
          overflow-x:hidden !important;
          padding:20px 16px 48px !important;
        }

        .pack-row {
          max-width:100%;
          grid-auto-columns:minmax(154px, 68vw) !important;
          gap:12px !important;
          overflow-x:auto;
          overscroll-behavior-x:contain;
          -webkit-overflow-scrolling:touch;
        }

        .pack-grid {
          width:100%;
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
          gap:12px !important;
        }

        .pack-card,
        .pack-name,
        .pack-tags,
        .track-info {
          min-width:0;
          max-width:100%;
        }

        /* Any filter/dropdown panel must remain fully inside the phone. */
        .filter-panel {
          position:fixed !important;
          top:76px !important;
          left:12px !important;
          right:12px !important;
          width:auto !important;
          max-width:none !important;
          max-height:calc(100dvh - 92px) !important;
          overflow:auto !important;
          overscroll-behavior:contain;
          z-index:1100 !important;
          border-radius:14px !important;
        }

        .filter-bar {
          width:100%;
          max-width:100%;
          overflow:visible;
        }

        /* Prevent long labels/controls from creating horizontal overflow. */
        .filter-btn,
        .dropdown-simple,
        .tag-search-input,
        .range-inputs,
        .toggle-pair {
          max-width:100%;
        }

        input,
        button,
        select,
        textarea {
          font-size:16px;
        }

        .nav-item:focus,
        .nav-item:focus-visible,
        .mobile-menu-toggle:focus,
        .mobile-menu-toggle:focus-visible,
        .mobile-sidebar-close:focus,
        .mobile-sidebar-close:focus-visible {
          outline:none;
        }
      }
    `;

    document.head.appendChild(style);
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

    const isMobile = () => window.matchMedia(`(max-width:${MOBILE_BREAKPOINT}px)`).matches;

    function setOpen(open) {
      if (!isMobile()) open = false;
      document.body.classList.toggle('mobile-sidebar-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      document.body.style.overflow = open ? 'hidden' : '';
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
    injectMobileStyles();
    setupMobileSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
