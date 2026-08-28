/* WAVLIB UI: mobile shell only. Application navigation and rendering remain untouched. */
(() => {
  'use strict';
  const MOBILE_QUERY = '(max-width:768px)';
  const isMobile = () => window.matchMedia?.(MOBILE_QUERY).matches === true;

  function makeIcon(markup) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox','0 0 24 24');
    s.setAttribute('fill','none'); s.setAttribute('stroke','currentColor');
    s.setAttribute('stroke-width','1.8'); s.setAttribute('stroke-linecap','round'); s.setAttribute('stroke-linejoin','round');
    s.setAttribute('aria-hidden','true'); s.innerHTML = markup; return s;
  }

  function setupSidebar() {
    if (!isMobile()) return;
    const sidebar = document.querySelector('.sidebar');
    const nav = sidebar?.querySelector('.nav');
    if (!sidebar || !nav || sidebar.dataset.wavlibMobileShell === '1') return;
    sidebar.dataset.wavlibMobileShell = '1';

    const menu = document.createElement('button');
    menu.type='button'; menu.className='mobile-menu-toggle';
    menu.setAttribute('aria-label','Open navigation'); menu.setAttribute('aria-expanded','false');
    menu.appendChild(makeIcon('<path d="M5 7h14M5 12h14M5 17h14"/>'));

    const close = document.createElement('button');
    close.type='button'; close.className='mobile-sidebar-close';
    close.setAttribute('aria-label','Close navigation');
    close.appendChild(makeIcon('<path d="M6 6l12 12M18 6L6 18"/>'));
    sidebar.appendChild(close); document.body.appendChild(menu);

    const setOpen = open => {
      if (!isMobile()) open=false;
      document.body.classList.toggle('mobile-sidebar-open',open);
      document.documentElement.classList.toggle('mobile-sidebar-lock',open);
      document.body.classList.toggle('mobile-sidebar-lock',open);
      menu.setAttribute('aria-expanded',String(open));
    };
    menu.addEventListener('click',()=>setOpen(true));
    close.addEventListener('click',()=>setOpen(false));

    // Deliberately do NOT intercept navigation. The original application handlers
    // own Home/Search/Packs and all data/rendering.
    nav.addEventListener('click', event => {
      if (event.target.closest('.nav-item')) window.setTimeout(()=>setOpen(false),180);
    }, false);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
    const resize=()=>{if(!isMobile())setOpen(false);};
    window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('orientationchange',resize,{passive:true});
    setOpen(false);
  }

  function setupLegalLinks() {
    const legal=document.querySelector('.legal'); if(!legal) return;
    const map={Terms:'terms.html',Privacy:'privacy.html',Disclaimer:'disclaimer.html',Copyright:'copyright.html'};
    legal.querySelectorAll('a').forEach(a=>{const href=map[a.textContent.trim()]; if(href) a.setAttribute('href',href);});
  }

  function boot(){setupSidebar();setupLegalLinks();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
