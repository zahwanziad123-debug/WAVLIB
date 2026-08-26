/* WAVLIB UI helpers. Mobile-only navigation stability layer; desktop behavior unchanged. */
(() => {
  'use strict';
  const MOBILE_BREAKPOINT = 768;

  function svgIcon(path){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.innerHTML=path;return svg;}
  function isEmail(v){return /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/.test(String(v||''));}
  function cleanAccountAutofill(){document.querySelectorAll('input, textarea').forEach(i=>{i.setAttribute('autocomplete','new-password');i.setAttribute('autocorrect','off');i.setAttribute('autocapitalize','off');i.setAttribute('spellcheck','false');i.setAttribute('data-form-type','other');i.setAttribute('data-lpignore','true');i.setAttribute('data-1p-ignore','true');if(isEmail(i.value)){i.value='';i.removeAttribute('value');}});}
  function setupGlobalEmailAndAccountCleanup(){cleanAccountAutofill();window.addEventListener('pageshow',cleanAccountAutofill,{passive:true});window.addEventListener('load',cleanAccountAutofill,{passive:true});document.addEventListener('focusin',cleanAccountAutofill,true);[100,300,700,1400,2500].forEach(d=>window.setTimeout(cleanAccountAutofill,d));}
  function setupTopSearch(){const i=document.querySelector('.topbar .search-input');if(!i||i.dataset.wavlibSearchReady==='1')return;i.dataset.wavlibSearchReady='1';i.type='search';i.name='wavlib_query_7f3c2a';i.id='wavlib-search-query';i.setAttribute('autocomplete','new-password');i.setAttribute('autocorrect','off');i.setAttribute('autocapitalize','off');i.setAttribute('spellcheck','false');i.setAttribute('data-form-type','other');i.setAttribute('data-lpignore','true');i.setAttribute('data-1p-ignore','true');i.setAttribute('role','searchbox');if(isEmail(i.value))i.value='';}
  function setupPackSampleSearch(){const i=document.getElementById('pack-sample-query');if(!i||i.dataset.wavlibPackSearchReady==='1')return Boolean(i);i.dataset.wavlibPackSearchReady='1';i.type='search';i.name='wavlib_pack_query_91b4d6';i.setAttribute('autocomplete','new-password');i.setAttribute('autocorrect','off');i.setAttribute('autocapitalize','off');i.setAttribute('spellcheck','false');i.setAttribute('data-form-type','other');i.setAttribute('data-lpignore','true');i.setAttribute('data-1p-ignore','true');i.setAttribute('aria-label','Search samples in this pack');if(isEmail(i.value))i.value='';i.addEventListener('input',()=>{if(isEmail(i.value))i.value='';});return true;}
  function watchPackSampleSearch(){if(setupPackSampleSearch())return;const o=new MutationObserver(()=>{if(setupPackSampleSearch())o.disconnect();});o.observe(document.body,{childList:true,subtree:true});}
  function setupLegalLinks(){const l=document.querySelector('.legal');if(!l||l.dataset.wavlibLegalReady==='1')return;l.dataset.wavlibLegalReady='1';const m={Terms:'terms.html',Privacy:'privacy.html',Disclaimer:'disclaimer.html',Copyright:'copyright.html'};l.querySelectorAll('a').forEach(a=>{const k=a.textContent.trim();if(m[k])a.href=m[k];});}

  function getNavView(item){
    const explicit=item.getAttribute('data-view');
    if(['home','search','packs'].includes(explicit))return explicit;
    const t=(item.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(/^search\b/.test(t))return 'search';
    if(/^packs?\b/.test(t))return 'packs';
    if(/^home\b/.test(t))return 'home';
    return null;
  }

  function syncMobileActiveNav(view){
    const nav=document.querySelector('.sidebar .nav');
    if(!nav)return;
    nav.querySelectorAll('.nav-item').forEach(item=>item.classList.remove('active'));
    nav.querySelectorAll('.nav-item').forEach(item=>{if(getNavView(item)===view)item.classList.add('active');});
  }

  function syncMobileViewState(view){
    // Only repair the active class. Never remove inline display styles or rebuild
    // the view, because the main WAVLIB renderer owns pack/sample contents.
    const views=document.querySelectorAll('.view');
    if(!views.length)return;
    let target=null;
    views.forEach(v=>{
      const explicit=v.getAttribute('data-view');
      const id=(v.id||'').toLowerCase();
      const cls=(v.className||'').toLowerCase();
      const matches=explicit===view||id===view||id===view+'-view'||id==='view-'+view||cls.includes(view+'-view')||cls.includes('view '+view);
      if(matches)target=v;
    });
    if(!target)return;
    views.forEach(v=>v.classList.toggle('active',v===target));
  }

  function activateMobileView(view){
    syncMobileActiveNav(view);
    if(typeof window.switchView==='function'){
      try{window.switchView(view);}catch(_){try{window.switchView(view,null);}catch(__){}}
    }
    // Give the real renderer time to populate packs/samples, then only synchronize
    // classes. We deliberately do not manufacture/re-render pack data here.
    window.setTimeout(()=>syncMobileViewState(view),80);
    window.setTimeout(()=>syncMobileViewState(view),350);
  }

  function setupMobileNavigation(){
    const nav=document.querySelector('.sidebar .nav');
    if(!nav||nav.dataset.wavlibMobileNavigationReady==='1')return;
    nav.dataset.wavlibMobileNavigationReady='1';
    nav.addEventListener('click',e=>{
      if(window.innerWidth>MOBILE_BREAKPOINT)return;
      const item=e.target.closest('.nav-item');
      if(!item)return;
      const view=getNavView(item);
      if(!view)return;
      // The original inline handler is allowed to run first. Then we guarantee the
      // same view is activated and the Home highlight is removed.
      window.setTimeout(()=>activateMobileView(view),40);
    },false);
  }

  function setupMobileSidebar(){
    const sidebar=document.querySelector('.sidebar'),nav=sidebar?.querySelector('.nav');
    if(!sidebar||!nav||sidebar.dataset.mobileDrawerReady==='1')return;
    sidebar.dataset.mobileDrawerReady='1';
    const toggle=document.createElement('button');toggle.className='mobile-menu-toggle';toggle.type='button';toggle.setAttribute('aria-label','Open navigation');toggle.setAttribute('aria-expanded','false');toggle.appendChild(svgIcon('<rect x="4.5" y="5.5" width="15" height="13" rx="2"/><path d="M10 5.5v13"/>'));
    const close=document.createElement('button');close.className='mobile-sidebar-close';close.type='button';close.setAttribute('aria-label','Close navigation');close.appendChild(svgIcon('<path d="M6 6l12 12M18 6L6 18"/>'));
    sidebar.appendChild(close);document.body.appendChild(toggle);
    const media=window.matchMedia(`(max-width:${MOBILE_BREAKPOINT}px)`);const mobile=()=>media.matches;
    function open(v){if(!mobile())v=false;document.body.classList.toggle('mobile-sidebar-open',v);toggle.setAttribute('aria-expanded',String(v));toggle.setAttribute('aria-label',v?'Close navigation':'Open navigation');document.documentElement.classList.toggle('mobile-sidebar-lock',v);document.body.classList.toggle('mobile-sidebar-lock',v);}
    toggle.addEventListener('click',()=>open(true));close.addEventListener('click',()=>open(false));
    nav.addEventListener('click',e=>{if(e.target.closest('.nav-item')&&mobile())window.setTimeout(()=>open(false),420);},false);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('mobile-sidebar-open'))open(false);});
    const vp=()=>{if(!mobile())open(false);};if(media.addEventListener)media.addEventListener('change',vp);else media.addListener(vp);window.addEventListener('orientationchange',vp,{passive:true});window.addEventListener('resize',vp,{passive:true});open(false);
  }

  function boot(){setupGlobalEmailAndAccountCleanup();setupTopSearch();setupMobileNavigation();setupMobileSidebar();watchPackSampleSearch();setupLegalLinks();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
