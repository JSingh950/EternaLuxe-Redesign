(() => {
  'use strict';
  const scope=document.querySelector('[data-eternaluxe-root]')||document;
  const $=(s,r=scope)=>r.querySelector(s), $$=(s,r=scope)=>[...r.querySelectorAll(s)];
  const pageRoot=scope===document?document.body:scope;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const assetVersion=pageRoot.dataset.assetVersion||'1';
  const apiBase=document.querySelector('meta[name="eternaluxe-api"]')?.content||'';
  const mobile=matchMedia('(max-width: 700px)');
  const storage={get(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}};
  const defaults={necessary:true,analytics:false,preferences:false,advertising:false};
  let choices=storage.get('eternaluxe-privacy-v1');
  if(!choices?.expiresAt||choices.expiresAt<Date.now())choices=null;
  let receipt=storage.get('eternaluxe-receipt-v1');
  let settings=null;
  const config=fetch(`${apiBase}/api/config`,{cache:'no-store',credentials:'include'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(c=>{
    settings=c;
    $$('.form-mode').forEach(el=>el.textContent=c.mode==='preview'?'Local preview: submissions are saved on this computer and are not sent to Eternaluxe.':'');
    return c;
  }).catch(()=>{ $$('.form-mode').forEach(el=>el.textContent='Open this preview through its local server to use the forms.');return null; });
  const openers=new WeakMap();
  $('.menu-toggle')?.setAttribute('aria-label','Open menu');
  function openDialog(id,trigger){const d=document.getElementById(id);if(!d)return;const parent=trigger.closest('dialog');if(parent){trigger=openers.get(parent)||trigger;parent.close();}openers.set(d,trigger);if(id==='cookie-dialog')for(const k of ['analytics','preferences','advertising'])$(`[name="${k}"]`,d).checked=!!choices?.[k];d.showModal();}
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.open,b)));
  $$('dialog').forEach(d=>{
    d.setAttribute('aria-label',({'menu-dialog':'Navigation','bag-dialog':'Your bag','cookie-dialog':'Your privacy choices','search-dialog':'Search the House'})[d.id]||'Dialog');
    $('[data-close]',d)?.addEventListener('click',()=>d.close());
    d.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();d.close();}});
    d.addEventListener('close',()=>openers.get(d)?.focus());
    d.addEventListener('click',e=>{if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();}});
  });
  const banner=$('.cookie-banner');
  if(!choices)banner.hidden=false;
  function cookieStatus(message){$$('.cookie-status').forEach(el=>el.textContent=message);}
  async function api(path,payload){
    const c=await config;
    if(!c)throw Error('The form service is unavailable. Please open the preview at http://localhost:4173 or try again later.');
    const r=await fetch(`${apiBase}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,csrf:c.csrf}),credentials:'include'});
    let result;try{result=await r.json()}catch{throw Error('The service is unavailable. Please try again later.')}
    if(!r.ok)throw Error(result.error||'Please try again later.');return result;
  }
  let consentBusy=false;
  async function saveChoices(action){
    if(consentBusy)return;consentBusy=true;
    const next={...defaults};
    for(const k of ['analytics','preferences','advertising'])next[k]=action==='accept'||(action==='save'&&$(`#cookie-dialog [name="${k}"]`).checked);
    // Apply rejection immediately, including when the evidence service is unavailable.
    choices={...next,version:'2026-10-16',expiresAt:Date.now()+180*86400000};
    const stored=storage.set('eternaluxe-privacy-v1',choices);
    cookieStatus('');
    // The visitor's choice takes effect locally even when the optional evidence API is offline.
    // Close the UI immediately so a static deployment never appears unresponsive.
    banner.hidden=true;
    const preferences=$('#cookie-dialog');
    if(preferences?.open)preferences.close();
    try{
      const result=await api('/api/consent',{choices:next,receipt,source:'cookie-preferences'});
      receipt=result.receipt;storage.set('eternaluxe-receipt-v1',receipt);
      if(!stored)cookieStatus('Your choices apply to this visit. Browser storage is unavailable.');
    }catch(error){/* Local privacy choices remain applied when evidence sync is unavailable. */}
    finally{consentBusy=false;}
  }
  $$('[data-cookie]').forEach(b=>b.addEventListener('click',()=>saveChoices(b.dataset.cookie)));
  $$('[data-form]').forEach(form=>{
    let requestId=null;
    form.addEventListener('input',()=>requestId=null);
    form.addEventListener('submit',async e=>{
      e.preventDefault();if(!form.reportValidity())return;
      const button=$('button[type=submit]',form),status=$('.form-status',form);
      button.disabled=true;status.removeAttribute('data-error');status.textContent='Sending…';
      const values=Object.fromEntries(new FormData(form));
      requestId ||= crypto.randomUUID();
      try{
        const result=await api('/api/forms',{type:form.dataset.form,values,receipt,requestId,source:location.pathname});
        receipt=result.receipt||receipt;storage.set('eternaluxe-receipt-v1',receipt);
        status.textContent=result.message;form.reset();requestId=null;
        track('form_complete',{kind:form.dataset.form});
      }catch(error){status.dataset.error='true';status.textContent=error.message;}
      finally{button.disabled=false;}
    });
    form.addEventListener('focusin',()=>track('form_start',{kind:form.dataset.form}),{once:true});
  });
  const query=new URLSearchParams(location.search);
  const enquiry=$('[data-form=enquiry]');
  if(enquiry){if(query.get('project'))$('[name=project]',enquiry).value=query.get('project');if(query.get('composition'))$('[name=message]',enquiry).value=`I am interested in ${query.get('composition')}.`;}
  const filters=$('.filter-bar');
  const searchInput=$('#house-search');
  if(searchInput){
    const entries=[['The House','Philosophy, Ikebana, line, space and floral art','house.html'],['The Collection','Floral arrangements','collections.html'],['The Atelier','Hospitality, interiors and commissions','atelier.html'],['The Archive','Campaigns and installations','archive.html'],['The Floral Club','Monthly floral service','floral-club.html']];
    const renderSearch=()=>{
      const q=searchInput.value.trim().toLowerCase();const matches=entries.filter(e=>e.join(' ').toLowerCase().includes(q));
      const results=$('.search-results');results.replaceChildren();
      for(const [name,description,url] of matches){const a=document.createElement('a');a.href=url;const strong=document.createElement('strong');strong.textContent=name;const small=document.createElement('small');small.textContent=description;a.append(strong,small);results.append(a);}
      $('.search-status').textContent=`${matches.length} result${matches.length===1?'':'s'}`;
    };
    fetch(`assets/catalog.json?v=${assetVersion}`).then(r=>r.json()).then(items=>{items.forEach(p=>entries.push([p.name,`${p.subtitle||'AI design concept'} · ${p.size} · ${p.style}`,p.concept?`enquiries.html?project=Residential&composition=${encodeURIComponent(p.name+' (concept)')}`:`product-${p.id}.html`]));renderSearch();}).catch(()=>renderSearch());
    searchInput.addEventListener('input',renderSearch);renderSearch();
  }
  if(filters){
    const items=$$('.collection-grid .collection-item'),more=$('[data-show-more]');
    let limit=6;
    for(const key of ['size','type','occasion','style','format']){
      const field=filters.elements.namedItem(key),value=query.get(key);
      if(field&&value&&[...field.options].some(o=>o.value===value))field.value=value;
    }
    const filter=()=>{
      const vals=Object.fromEntries(new FormData(filters));
      const matches=items.filter(item=>Object.entries(vals).every(([k,v])=>!v||(item.dataset[k]||'').split(' ').includes(v)));
      items.forEach(item=>{item.hidden=true;});
      matches.slice(0,limit).forEach(item=>{item.hidden=false;});
      $('.filter-count').textContent=`Showing ${Math.min(limit,matches.length)} of ${matches.length} compositions`;
      $('.empty-state').hidden=matches.length!==0;more.hidden=matches.length<=limit;
      more.textContent=`Show more compositions (${Math.max(0,matches.length-limit)} remaining)`;
    };
    filters.addEventListener('change',()=>{limit=6;filter();});
    filters.addEventListener('reset',()=>queueMicrotask(()=>{limit=6;filter();}));
    more.addEventListener('click',()=>{limit+=6;filter();});
    $('[data-reset-filters]')?.addEventListener('click',()=>filters.reset());
    filter();
  }
  const scene=$('[data-venue]');
  if(scene&&window.gsap){
    const primary=[$('.venue-table',scene),$('.venue-console',scene),$('.venue-pedestal',scene),$('.venue-moss',scene)];
    let sets=[primary,...['coral','jewel'].map(palette=>['table','console','pedestal','wall'].map(part=>$('.venue-'+palette+'-'+part,scene)))];
    const layers=sets.flat(),controls=$('.venue-controls'),toggle=$('[data-venue-toggle]'),manual=$('.venue-manual');
    const connection=navigator.connection;
    let ready=false,visible=false,userPaused=false,step=1,staticMode=false;
    const still=()=>reduced.matches||connection?.saveData;
    const timeline=gsap.timeline({paused:true,repeat:-1});
    const present=index=>{gsap.set(layers,{opacity:0});if(index>0)gsap.set(sets[index-1],{opacity:1});};
    function sync(){
      const running=ready&&visible&&!document.hidden&&!userPaused&&!still();
      if(still()){timeline.pause();if(!staticMode){step=1;present(step);}}
      else if(running)timeline.play();else timeline.pause();
      staticMode=!!still();toggle.hidden=!!still();manual.hidden=!still();
      toggle.setAttribute('aria-label',running?'Pause room animation':'Play room animation');
      toggle.setAttribute('aria-pressed',String(running));
    }
    toggle.addEventListener('click',()=>{userPaused=!userPaused;sync();});
    function show(delta){step=(step+delta+sets.length+1)%(sets.length+1);present(step);}
    $('[data-scene-prev]').addEventListener('click',()=>show(-1));
    $('[data-scene-next]').addEventListener('click',()=>show(1));
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(scene);
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',()=>{timeline.restart().pause();staticMode=false;sync();});
    connection?.addEventListener('change',()=>{timeline.restart().pause();staticMode=false;sync();});
    const decodeSet=set=>Promise.all(set.map(layer=>$('img',layer).decode()));
    Promise.allSettled(sets.map(decodeSet)).then(results=>{
      sets=sets.filter((set,i)=>results[i].status==='fulfilled');
      gsap.set(layers,{opacity:0});
      if(!sets.length){controls.hidden=true;return;}
      // Sequential fades avoid seeing two incompatible vases at the same location.
      sets.forEach((set,index)=>{
        const at=index*16;
        timeline.set(layers,{opacity:0},at)
          .to(set[0],{opacity:1,duration:1.6,ease:'sine.inOut'},at+1.2)
          .to(set[1],{opacity:1,duration:1.6,ease:'sine.inOut'},at+2.7)
          .to(set[2],{opacity:1,duration:1.6,ease:'sine.inOut'},at+4.2)
          .to(set[3],{opacity:1,duration:1.8,ease:'sine.inOut'},at+5.7)
          .to(set,{opacity:0,duration:1.8,ease:'sine.inOut'},at+14.2);
      });
      ready=true;controls.hidden=false;timeline.seek(0);staticMode=false;sync();
    });
  }
  $$('[data-house-motion]').forEach(montage=>{
  if(window.gsap){
    const button=$('[data-motion-toggle]',montage),tracks=$$('.motion-track',montage);
    const films=$$('video[data-motion-video]',montage).map(video=>({video,visible:false,loaded:false}));
    const connection=navigator.connection;
    let visible=false,paused=false,tweens=[];
    const staticView=()=>reduced.matches||connection?.saveData;
    function sync(){
      const moving=visible&&!paused&&!document.hidden&&!staticView();
      tweens.forEach(t=>moving?t.play():t.pause());
      button.setAttribute('aria-label',paused?'Play moving collection':'Pause moving collection');
      button.setAttribute('aria-pressed',String(!paused));button.querySelector('span').textContent=paused?'▷':'Ⅱ';
      films.forEach(item=>{
        if(!moving||!item.visible){item.video.pause();return;}
        if(!item.loaded){item.loaded=true;item.video.src=`assets/media/${item.video.dataset.motionVideo}.mp4?v=${assetVersion}`;}
        item.video.play().catch(()=>{});
      });
    }
    function configure(){
      tweens.forEach(t=>t.kill());tweens=[];gsap.set(tracks,{clearProps:'transform'});
      montage.classList.toggle('is-static',!!staticView());button.hidden=!!staticView();
      if(!staticView())tracks.forEach((track,i)=>{
        const right=track.dataset.direction==='1';
        tweens.push(gsap.fromTo(track,{xPercent:right?-50:0},{xPercent:right?0:-50,duration:Math.max(100,track.scrollWidth/2/24),ease:'none',repeat:-1,paused:true}));
      });
      sync();
    }
    button.addEventListener('click',()=>{paused=!paused;sync();});
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(montage);
    const filmObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{const item=films.find(f=>f.video===e.target);item.visible=e.isIntersecting;});sync();},{threshold:.15});
    films.forEach(f=>filmObserver.observe(f.video));
    document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',configure);connection?.addEventListener('change',configure);
    configure();
  }
  });
  const players=[];
  function player(video,button,isHero=false){
    const state={video,button,visible:false,userPaused:false,loaded:false,id:null,manual:false};players.push(state);
    const update=()=>{
      const playing=!video.paused;
      button.setAttribute('aria-label',playing?'Pause film':'Play film');button.setAttribute('aria-pressed',String(playing));
      const label=$(isHero?'[data-hero-label]':'[data-film-label]',button);if(label)label.textContent=playing?'Pause film':'Play film';
      const symbol=$('[aria-hidden]',button);if(symbol)symbol.textContent=playing?'Ⅱ':'▷';
      if(isHero)video.classList.toggle('is-playing',playing||video.currentTime>0);
    };
    const load=()=>{
      const id=isHero?(mobile.matches?'orchid-film':'house-film'):video.dataset.video;
      if(state.id===id)return;
      state.id=id;video.poster=`assets/media/${id}-poster.jpg?v=${assetVersion}`;
      video.preload='auto';
      video.replaceChildren(...['mp4','webm'].map(format=>{const s=document.createElement('source');s.src=`assets/media/${id}.${format}?v=${assetVersion}`;s.type=`video/${format}`;return s;}));
      video.load();state.loaded=true;
    };
    state.sync=()=>{
      if(!state.visible||document.hidden||state.userPaused||((reduced.matches||navigator.connection?.saveData)&&!state.manual)){video.pause();update();return;}
      load();video.play().catch(()=>update());
    };
    button.addEventListener('click',()=>{
      if(!video.paused){state.userPaused=true;video.pause();}else{state.userPaused=false;state.manual=true;state.visible=true;state.sync();}update();track('hero_interaction',{kind:isHero?'hero':'editorial'});
    });
    video.addEventListener('play',update);video.addEventListener('pause',update);video.addEventListener('error',()=>{if(isHero)video.classList.remove('is-playing');update();});
    if(isHero)video.addEventListener('timeupdate',()=>video.classList.toggle('is-seam',Number.isFinite(video.duration)&&video.currentTime>video.duration-.75));
    const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;state.sync();},{threshold:.2});observer.observe(video);
    if(isHero)mobile.addEventListener('change',()=>{state.id=null;video.pause();video.classList.remove('is-playing');state.sync();});
    update();
  }
  const hero=$('[data-responsive-video]');if(hero)player(hero,$('[data-hero-toggle]'),true);
  $$('[data-film]').forEach(el=>player($('video',el),$('[data-film-toggle]',el)));
  document.addEventListener('visibilitychange',()=>players.forEach(p=>p.sync()));
  reduced.addEventListener('change',()=>players.forEach(p=>{p.manual=false;p.sync();}));
  if(window.gsap){
    const mm=gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;observer.unobserve(entry.target);
        gsap.fromTo(entry.target,{y:16,autoAlpha:0,willChange:'transform,opacity'},{y:0,autoAlpha:1,duration:1.25,ease:'power3.out',clearProps:'transform,opacity,visibility,willChange'});
        const photograph=entry.target.querySelector('picture img');
        if(photograph)gsap.fromTo(photograph,{scale:1.02},{scale:1,duration:2.2,ease:'sine.out',clearProps:'transform'});
      }),{threshold:.08});
      $$('[data-reveal]').forEach(el=>observer.observe(el));
      return ()=>observer.disconnect();
    });
  }
  async function track(event,detail={}){
    if(!choices?.analytics||navigator.globalPrivacyControl||!receipt)return;
    try{await api('/api/events',{event,detail,receipt,page:pageRoot.dataset.page});}catch{/* Analytics cannot interrupt a visit. */}
  }
  $$('[data-track]').forEach(el=>el.addEventListener('click',()=>track(el.dataset.track)));
  if(pageRoot.dataset.page?.startsWith('product-'))track('product_view');
  document.addEventListener('click',e=>{const a=e.target.closest('a.text-link,a.button,a.hero-link');if(a)track('cta_select');});
})();
