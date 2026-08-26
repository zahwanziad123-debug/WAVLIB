/* WAVLIB UI helpers. Mobile drawer + safe navigation bridge; desktop behavior unchanged. */
(() => {
  'use strict';
  const MOBILE_BREAKPOINT = 768;

  function svgIcon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = path; return svg;
  }
  function isEmail(value) { return /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/.test(String(value || '')); }

  function cleanAccountAutofill() {
    document.querySelectorAll('input, textarea').forEach((input) => {
      input.setAttribute('autocomplete','new-password'); input.setAttribute('autocorrect','off'); input.setAttribute('autocapitalize','off'); input.setAttribute('spellcheck','false');
      input.setAttribute('data-form-type','other'); input.setAttribute('data-lpignore','true'); input.setAttribute('data-1p-ignore','true');
      if (isEmail(input.value)) { input.value=''; input.removeAttribute('value'); }
    });
  }
  function setupGlobalEmailAndAccountCleanup() {
    cleanAccountAutofill(); window.addEventListener('pageshow',cleanAccountAutofill,{passive:true}); window.addEventListener('load',cleanAccountAutofill,{passive:true});
    document.addEventListener('focusin',cleanAccountAutofill,true); [100,300,700,1400,2500,5000].forEach((d)=>window.setTimeout(cleanAccountAutofill,d));
  }
  function setupTopSearch() {
    const input=document.querySelector('.topbar .search-input'); if(!input||input.dataset.wavlibSearchReady==='1')return;
    input.dataset.wavlibSearchReady='1'; input.type='search'; input.name='wavlib_query_7f3c2a'; input.id='wavlib-search-query';
    input.setAttribute('autocomplete','new-password'); input.setAttribute('autocorrect','off'); input.setAttribute('autocapitalize','off'); input.setAttribute('spellcheck','false'); input.setAttribute('data-form-type','other'); input.setAttribute('data-lpignore','true'); input.setAttribute('data-1p-ignore','true'); input.setAttribute('role','searchbox');
    if(isEmail(input.value))input.value='';
  }
  function setupPackSampleSearch() {
    const input=document.getElementById('pack-sample-query'); if(!input||input.dataset.wavlibPackSearchReady==='1')return Boolean(input);
    input.dataset.wavlibPackSearchReady='1'; input.type='search'; input.name='wavlib_pack_query_91b4d6';
    input.setAttribute('autocomplete','new-password'); input.setAttribute('autocorrect','off'); input.setAttribute('autocapitalize','off'); input.setAttribute('spellcheck','false'); input.setAttribute('data-form-type','other'); input.setAttribute('data-lpignore','true'); input.setAttribute('data-1p-ignore','true'); input.setAttribute('aria-label','Search samples in this pack');
    if(isEmail(input.value))input.value=''; input.addEventListener('input',()=>{if(isEmail(input.value))input.value='';}); return true;
  }
  function watchPackSampleSearch(){ if(setupPackSampleSearch())return; const observer=new MutationObserver(()=>{if(setupPackSampleSearch())observer.disconnect();}); observer.observe(document.body,{childList:true,subtree:true}); }

  function setupLegalLinks(){
    const legal=document.querySelector('.legal'); if(!legal||legal.dataset.wavlibLegalReady==='1')return; legal.dataset.wavlibLegalReady='1';
    const links={Terms:'terms.html',Privacy:'privacy.html',Disclaimer:'disclaimer.html',Copyright:'copyright.html'};
    legal.querySelectorAll('a').forEach((link)=>{const label=link.textContent.trim();if(links[label])link.href=links[label];});
  }

  function setupMobileNavigationBridge(){
    const sidebar=document.querySelector('.sidebar'); const nav=sidebar?.querySelector('.nav'); if(!sidebar||!nav||nav.dataset.wavlibMobileNavReady==='1')return; nav.dataset.wavlibMobileNavReady='1';
    nav.addEventListener('click',(event)=>{
      if(window.innerWidth>MOBILE_BREAKPOINT)return;
      const item=event.target.closest('.nav-item[data-view]'); if(!item)return;
      const view=item.getAttribute('data-view'); if(view!=='home'&&view!=='search'&&view!=='packs')return;
      window.setTimeout(()=>{
        const selectors=[`[data-view="${view}"].view`,`#${view}-view`,`.${view}-view`];
        const target=selectors.map((s)=>document.querySelector(s)).find(Boolean);
        const visible=target && getComputedStyle(target).display!=='none' && target.offsetParent!==null;
        if(!visible && typeof window.switchView==='function'){
          try{ window.switchView(view,item); }catch(_){ /* original handler remains untouched */ }
        }
      },120);
    },false);
  }

  function setupMobileSidebar(){
    const sidebar=document.querySelector('.sidebar'); const nav=sidebar?.querySelector('.nav'); if(!sidebar||!nav||sidebar.dataset.mobileDrawerReady==='1')return; sidebar.dataset.mobileDrawerReady='1';
    const toggle=document.createElement('button'); toggle.className='mobile-menu-toggle'; toggle.type='button'; toggle.setAttribute('aria-label','Open navigation'); toggle.setAttribute('aria-expanded','false'); toggle.appendChild(svgIcon('<rect x="4.5" y="5.5" width="15" height="13" rx="2"/><path d="M10 5.5v13"/>'));
    const close=document.createElement('button'); close.className='mobile-sidebar-close'; close.type='button'; close.setAttribute('aria-label','Close navigation'); close.appendChild(svgIcon('<path d="M6 6l12 12M18 6L6 18"/>'));
    sidebar.appendChild(close); document.body.appendChild(toggle);
    const media=window.matchMedia(`(max-width:${MOBILE_BREAKPOINT}px)`); const isMobile=()=>media.matches;
    function setOpen(open){if(!isMobile())open=false; document.body.classList.toggle('mobile-sidebar-open',open); toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation'); document.documentElement.classList.toggle('mobile-sidebar-lock',open); document.body.classList.toggle('mobile-sidebar-lock',open);}
    toggle.addEventListener('click',()=>setOpen(true)); close.addEventListener('click',()=>setOpen(false));
    nav.addEventListener('click',(event)=>{if(event.target.closest('.nav-item')&&isMobile())window.setTimeout(()=>setOpen(false),300);},false);
    document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&document.body.classList.contains('mobile-sidebar-open'))setOpen(false);});
    const viewport=()=>{if(!isMobile())setOpen(false);}; if(media.addEventListener)media.addEventListener('change',viewport);else media.addListener(viewport); window.addEventListener('orientationchange',viewport,{passive:true}); window.addEventListener('resize',viewport,{passive:true}); setOpen(false);
  }

  function boot(){setupGlobalEmailAndAccountCleanup();setupTopSearch();setupMobileNavigationBridge();setupMobileSidebar();watchPackSampleSearch();setupLegalLinks();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
