/* WAVLIB UI helpers. Mobile-only compatibility; app rendering stays untouched. */
(() => {
  'use strict';
  const mq = () => window.matchMedia('(max-width: 768px)').matches;
  const email = /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/;

  function cleanInputs(){
    document.querySelectorAll('input,textarea').forEach(el=>{
      el.setAttribute('autocomplete','new-password');
      el.setAttribute('data-lpignore','true');
      el.setAttribute('data-1p-ignore','true');
      if(email.test(el.value||'') && !el.matches(':focus')) el.value='';
    });
  }

  function nameFor(item){
    const oc=item.getAttribute('onclick')||'';
    const m=oc.match(/switchView\s*\(\s*["']([^"']+)["']\s*\)/i);
    if(m)return m[1].toLowerCase();
    const d=item.dataset.view||item.getAttribute('data-view')||'';
    if(d)return d.toLowerCase();
    const t=(item.textContent||'').trim().toLowerCase();
    if(t.includes('search'))return 'search';
    if(t.includes('pack'))return 'packs';
    if(t.includes('home'))return 'home';
    return '';
  }

  function bindNavigation(){
    const nav=document.querySelector('.sidebar .nav');
    if(!nav||nav.dataset.mobileBound==='1')return;
    nav.dataset.mobileBound='1';
    nav.addEventListener('click',e=>{
      if(!mq())return;
      const item=e.target.closest('.nav-item');
      if(!item||!nav.contains(item))return;
      const name=nameFor(item);
      if(!name)return;
      // The original handler gets first chance. This fallback runs after it.
      setTimeout(()=>{
        if(typeof window.switchView==='function'){
          try{window.switchView(name);}catch(err){console.error('WAVLIB navigation:',err);}
        }
        // Only synchronize the nav highlight. Never touch .view display/classes here.
        nav.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',nameFor(n)===name));
        document.body.classList.remove('mobile-sidebar-open','mobile-sidebar-lock');
        document.documentElement.classList.remove('mobile-sidebar-lock');
      },0);
    });
  }

  function bindDrawer(){
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar||sidebar.dataset.mobileDrawer==='1')return;
    sidebar.dataset.mobileDrawer='1';
    const nav=sidebar.querySelector('.nav');
    const toggle=document.createElement('button');
    toggle.type='button';toggle.className='mobile-menu-toggle';toggle.setAttribute('aria-label','Open navigation');toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4.5" y="5.5" width="15" height="13" rx="2"/><path d="M10 5.5v13"/></svg>';
    const close=document.createElement('button');
    close.type='button';close.className='mobile-sidebar-close';close.setAttribute('aria-label','Close navigation');
    close.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    sidebar.appendChild(close);document.body.appendChild(toggle);
    const setOpen=open=>{if(!mq())open=false;document.body.classList.toggle('mobile-sidebar-open',open);document.documentElement.classList.toggle('mobile-sidebar-lock',open);document.body.classList.toggle('mobile-sidebar-lock',open);toggle.setAttribute('aria-expanded',String(open));};
    toggle.addEventListener('click',()=>setOpen(true));
    close.addEventListener('click',()=>setOpen(false));
    nav?.addEventListener('click',()=>{if(mq())setTimeout(()=>setOpen(false),100);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
  }

  function searchSetup(){
    const a=document.querySelector('.topbar .search-input');
    if(a){a.type='search';a.setAttribute('autocomplete','new-password');a.setAttribute('data-lpignore','true');a.setAttribute('data-1p-ignore','true');if(email.test(a.value||''))a.value='';}
    const b=document.getElementById('pack-sample-query');
    if(b){b.type='search';b.setAttribute('autocomplete','new-password');b.setAttribute('data-lpignore','true');b.setAttribute('data-1p-ignore','true');if(email.test(b.value||''))b.value='';}
  }

  function legal(){
    const box=document.querySelector('.legal');if(!box)return;
    const routes={Terms:'terms.html',Privacy:'privacy.html',Disclaimer:'disclaimer.html',Copyright:'copyright.html'};
    box.querySelectorAll('a').forEach(a=>{const r=routes[a.textContent.trim()];if(r)a.href=r;});
  }

  function boot(){bindDrawer();bindNavigation();searchSetup();legal();cleanInputs();setTimeout(()=>{bindNavigation();searchSetup();},250);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
