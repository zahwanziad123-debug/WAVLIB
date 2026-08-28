/* WAVLIB UI helpers. Mobile-only drawer/navigation bridge. Main rendering remains untouched. */
(() => {
  'use strict';
  const BREAKPOINT = 768;
  const isMobile = () => window.matchMedia(`(max-width:${BREAKPOINT}px)`).matches;
  const emailPattern = /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/;

  function cleanInputs(){
    document.querySelectorAll('input,textarea').forEach(el=>{
      el.setAttribute('autocomplete','new-password');
      el.setAttribute('data-lpignore','true');
      el.setAttribute('data-1p-ignore','true');
      if(!el.matches(':focus') && emailPattern.test(el.value || '')) el.value='';
    });
  }

  function viewName(item){
    return (item?.dataset?.view || '').trim().toLowerCase();
  }

  function installMobileNavigation(){
    const nav=document.querySelector('.sidebar .nav');
    if(!nav) return;

    nav.querySelectorAll('.nav-item').forEach(item=>{
      if(!item.dataset.wavlibDesktopOnclick) item.dataset.wavlibDesktopOnclick=item.getAttribute('onclick') || '';

      if(isMobile()){
        // Remove the inline handler only on mobile. One handler owns the tap,
        // so switchView cannot be executed twice and the renderer cannot race itself.
        item.removeAttribute('onclick');
        if(item.dataset.wavlibMobileHandler==='1') return;
        item.dataset.wavlibMobileHandler='1';

        item.addEventListener('click',event=>{
          event.preventDefault();
          event.stopPropagation();
          const name=viewName(item);
          if(!name || typeof window.switchView!=='function') return;
          try{
            window.switchView(name,item);
          }catch(error){
            console.error('WAVLIB mobile navigation error:',error);
          }
          closeDrawer();
        },false);
      }else if(item.dataset.wavlibMobileHandler==='1'){
        item.removeEventListener('click',()=>{});
        const original=item.dataset.wavlibDesktopOnclick;
        if(original) item.setAttribute('onclick',original);
      }
    });
  }

  function closeDrawer(){
    document.body.classList.remove('mobile-sidebar-open','mobile-sidebar-lock');
    document.documentElement.classList.remove('mobile-sidebar-lock');
    const toggle=document.querySelector('.mobile-menu-toggle');
    if(toggle){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');}
  }

  function installDrawer(){
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar || sidebar.dataset.wavlibDrawer==='1') return;
    sidebar.dataset.wavlibDrawer='1';

    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='mobile-menu-toggle';
    toggle.setAttribute('aria-label','Open navigation');
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4.5" y="5.5" width="15" height="13" rx="2"/><path d="M10 5.5v13"/></svg>';

    const close=document.createElement('button');
    close.type='button';
    close.className='mobile-sidebar-close';
    close.setAttribute('aria-label','Close navigation');
    close.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    sidebar.appendChild(close);
    document.body.appendChild(toggle);

    const openDrawer=()=>{
      if(!isMobile()) return;
      document.body.classList.add('mobile-sidebar-open','mobile-sidebar-lock');
      document.documentElement.classList.add('mobile-sidebar-lock');
      toggle.setAttribute('aria-expanded','true');
      toggle.setAttribute('aria-label','Close navigation');
    };

    toggle.addEventListener('click',openDrawer);
    close.addEventListener('click',closeDrawer);
    document.addEventListener('keydown',event=>{if(event.key==='Escape')closeDrawer();});
  }

  function setupSearchInputs(){
    document.querySelectorAll('.topbar .search-input,#pack-sample-query').forEach(input=>{
      input.type='search';
      input.setAttribute('autocomplete','new-password');
      input.setAttribute('data-lpignore','true');
      input.setAttribute('data-1p-ignore','true');
      if(!input.matches(':focus') && emailPattern.test(input.value || '')) input.value='';
    });
  }

  function setupLegalLinks(){
    const box=document.querySelector('.legal');
    if(!box) return;
    const routes={Terms:'terms.html',Privacy:'privacy.html',Disclaimer:'disclaimer.html',Copyright:'copyright.html'};
    box.querySelectorAll('a').forEach(link=>{
      const route=routes[link.textContent.trim()];
      if(route) link.href=route;
    });
  }

  function boot(){
    installDrawer();
    installMobileNavigation();
    setupSearchInputs();
    setupLegalLinks();
    cleanInputs();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.addEventListener('resize',()=>{
    if(!isMobile()) closeDrawer();
    installMobileNavigation();
  },{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(installMobileNavigation,0),{passive:true});
})();
