/* WAVLIB — mobile navigation behavior. */

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
    const handleViewportChange = () => { if (!isMobile()) setOpen(false); };
    if (media.addEventListener) media.addEventListener('change', handleViewportChange);
    else media.addListener(handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange, { passive: true });
    setOpen(false);
  }

  function removeAuthUi() {
    const selectors = [
      '.signin-btn','.login','.login-btn','.logout','.logout-btn','.signup','.signup-btn',
      '.sign-up','.sign-up-btn','.sign-in','.sign-in-btn','.signout','.signout-btn',
      '.auth','.auth-btn','.auth-modal','.auth-dialog','.auth-overlay','.auth-card',
      '#login','#logout','#signin','#sign-in','#signup','#sign-up','#signout',
      '#auth','#auth-overlay','#auth-modal','#auth-dialog',
      '[data-auth]','[data-login]','[data-logout]','[data-signin]','[data-signup]','[data-signout]',
      '[class*="login"]','[class*="logout"]','[class*="signin"]','[class*="signup"]','[class*="sign-in"]','[class*="sign-up"]','[class*="signout"]','[class*="auth"]'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(el => el.remove());

    const authWords = /\b(sign\s*in|sign\s*up|sign\s*out|log\s*in|log\s*out|gmail|google\s+account|email\s+address|password|authentication)\b/i;
    const roots = document.querySelectorAll('header,nav,aside,footer,[role="dialog"],[role="menu"],.modal,.overlay');
    roots.forEach(root => {
      Array.from(root.querySelectorAll('a,button,label,input,p,span,div')).forEach(el => {
        const text = (el.textContent || '').trim();
        if (text && authWords.test(text) && el.children.length < 4) el.remove();
      });
    });
  }

  function boot() {
    setupMobileSidebar();
    removeAuthUi();
    const observer = new MutationObserver(() => removeAuthUi());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
