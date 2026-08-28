/* WAVLIB mobile compatibility layer. Desktop behavior is untouched. */
(() => {
  'use strict';
  const isMobile = () => window.matchMedia('(max-width:768px)').matches;
  const viewName = item => {
    const raw = item?.getAttribute('onclick') || '';
    const m = raw.match(/switchView\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (m) return m[1].toLowerCase();
    const d = item?.getAttribute('data-view');
    if (d) return d.toLowerCase();
    const t = (item?.textContent || '').toLowerCase();
    return t.includes('search') ? 'search' : t.includes('pack') ? 'packs' : t.includes('home') ? 'home' : '';
  };
  const svg = p => { const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('viewBox','0 0 24 24'); s.setAttribute('fill','none'); s.setAttribute('stroke','currentColor'); s.setAttribute('stroke-width','1.8'); s.setAttribute('stroke-linecap','round'); s.setAttribute('stroke-linejoin','round'); s.innerHTML=p; return s; };

  function setupSidebar() {
    const sidebar=document.querySelector('.sidebar'), nav=sidebar?.querySelector('.nav');
    if(!sidebar||!nav||sidebar.dataset.wavlibMobileReady==='1') return;
    sidebar.dataset.wavlibMobileReady='1';
    const menu=document.createElement('button'); menu.type='button'; menu.className='mobile-menu-toggle'; menu.setAttribute('aria-label','Open navigation'); menu.setAttribute('aria-expanded','false'); menu.appendChild(svg('<path d="M4 7h16M4 12h16M4 17h16"/>'));
    const close=document.createElement('button'); close.type='button'; close.className='mobile-sidebar-close'; close.setAttribute('aria-label','Close navigation'); close.appendChild(svg('<path d="M6 6l12 12M18 6L6 18"/>')); sidebar.appendChild(close); document.body.appendChild(menu);
    const setOpen=open=>{ if(!isMobile()) open=false; document.body.classList.toggle('mobile-sidebar-open',open); document.documentElement.classList.toggle('mobile-sidebar-lock',open); document.body.classList.toggle('mobile-sidebar-lock',open); menu.setAttribute('aria-expanded',String(open)); };
    menu.addEventListener('click',()=>setOpen(true)); close.addEventListener('click',()=>setOpen(false));
    nav.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>{
      if(!isMobile()) return;
      const name=viewName(item);
      // The original onclick runs normally first. If it did not switch the view,
      // retry through the application's own switchView function only.
      setTimeout(()=>{ if(typeof window.switchView==='function' && name) { try { window.switchView(name); } catch(e) {} } },80);
      setTimeout(()=>setOpen(false),160);
    },{passive:true}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
    window.addEventListener('resize',()=>{if(!isMobile())setOpen(false)},{passive:true});
  }

  function setupInputs(){
    document.querySelectorAll('input,textarea').forEach(input=>{
      input.setAttribute('autocomplete','new-password'); input.setAttribute('data-form-type','other'); input.setAttribute('data-lpignore','true'); input.setAttribute('data-1p-ignore','true');
    });
  }
  function boot(){setupSidebar();setupInputs();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
