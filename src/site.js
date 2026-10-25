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
  const config=fetch(`${apiBase}/api/config`,{cache:'no-store',credentials:'include'}).then(r=>{if(!r.ok)throw Error();return r.json()}).catch(()=>null);
  const header=$('.site-header');
  const overlayHeader=['index','archive'].includes(pageRoot.dataset.page);
  const syncHeader=()=>header?.classList.toggle('is-scrolled',!overlayHeader||scrollY>24);
  addEventListener('scroll',syncHeader,{passive:true});syncHeader();
  const openers=new WeakMap();
  $('.menu-toggle')?.setAttribute('aria-label','Open menu');
  function openDialog(id,trigger){const d=document.getElementById(id);if(!d)return;const parent=trigger.closest('dialog');if(parent){trigger=openers.get(parent)||trigger;parent.close();}openers.set(d,trigger);if(id==='cookie-dialog')for(const k of ['analytics','preferences','advertising'])$(`[name="${k}"]`,d).checked=!!choices?.[k];d.showModal();}
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.open,b)));
  $$('dialog').forEach(d=>{
    d.setAttribute('aria-label',({'menu-dialog':'Navigation','bag-dialog':'Your bag','cookie-dialog':'Your privacy choices'})[d.id]||'Dialog');
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
    if(!c)throw Error('The form service is unavailable. Please try again later.');
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
        const service=await config;
        if(form.dataset.form==='enquiry'&&!service?.deliveryReady){
          const email=form.dataset.contactEmail||'info@eternaluxenet.com';
          const body=Object.entries(values).filter(([key])=>!['website','terms','privacy'].includes(key)).map(([key,value])=>`${key}: ${value}`).join('\n\n')+'\n\nI agree to the Terms and acknowledge the Privacy Policy.';
          location.href=`mailto:${email}?subject=${encodeURIComponent('Eternaluxe enquiry — '+values.name)}&body=${encodeURIComponent(body)}`;
          status.textContent='Your email app will open with your enquiry. Send the message there to contact the atelier.';
          return;
        }
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
  if(enquiry)config.then(service=>{if(!service?.deliveryReady){$('button[type=submit]',enquiry).textContent='Continue to email';$('.form-status',enquiry).textContent='Opens a prepared message in your email app. Send it there to contact the atelier.';}});
  if(enquiry){if(query.get('project'))$('[name=project]',enquiry).value=query.get('project');if(query.get('composition'))$('[name=message]',enquiry).value=`I am interested in ${query.get('composition')}.`;}
  const opening=$('[data-floral-opening]');
  const openingIsActive=()=>pageRoot.classList.contains('floral-opening-active');
  if(opening){
    const cue=$('[data-opening-cue]',opening);
    const surface=$('.floral-opening-surface',opening);
    const logo=$('.floral-opening-logo',opening);
    const layers={
      core:$('.floral-spiral-layer--core',opening),
      inner:$('.floral-spiral-layer--inner',opening),
      middle:$('.floral-spiral-layer--middle',opening),
      outer:$('.floral-spiral-layer--outer',opening),
      edge:$('.floral-spiral-layer--edge',opening)
    };
    const seen=document.documentElement.classList.contains('opening-seen');
    const connection=navigator.connection;
    let finished=seen,finishing=false,target=0,progressTween=null,timeline=null,touchY=null;
    const protectedNodes=[header,...$$('main > :not(.floral-opening)'),$('.invitation'),$('.site-footer')].filter(Boolean);
    const protectSite=value=>protectedNodes.forEach(node=>{node.inert=value;});
    const remember=()=>{try{sessionStorage.setItem('eternaluxe-opening-v1','complete');}catch{/* Continue without session persistence. */}};
    const release=({immediate=false,focusVenue=false}={})=>{
      if(finished)return;
      finished=true;finishing=false;target=1;remember();
      progressTween?.kill();
      if(timeline)timeline.progress(1).pause();
      // Restore the live page before the final visual fade. This ensures the
      // same wheel/touch gesture can continue into the homepage and prevents
      // an invisible opening layer from trapping clicks.
      opening.style.pointerEvents='none';
      pageRoot.classList.remove('floral-opening-active');
      protectSite(false);
      syncHeader();
      dispatchEvent(new CustomEvent('eternaluxe:opening-complete'));
      const done=()=>{
        opening.hidden=true;
        document.documentElement.classList.add('opening-seen');
        if(focusVenue){const venue=$('.venue-hero');venue?.setAttribute('tabindex','-1');venue?.focus({preventScroll:true});}
      };
      if(immediate||!window.gsap)done();
      else gsap.to(opening,{autoAlpha:0,duration:.28,ease:'power2.out',overwrite:true,onComplete:done});
    };
    if(seen){opening.hidden=true;}
    else{
      pageRoot.classList.add('floral-opening-active');
      protectSite(true);
      scrollTo(0,0);
      const staticOpening=reduced.matches||connection?.saveData||!window.gsap;
      if(staticOpening){
        opening.classList.add('is-static');
        cue.firstChild.textContent='A floral study by Eternaluxe';
        cue.setAttribute('role','button');
        cue.setAttribute('tabindex','0');
        cue.setAttribute('aria-label','Enter site');
        cue.addEventListener('click',()=>release({focusVenue:true}));
        cue.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();release({focusVenue:true});}});
      }else{
        timeline=gsap.timeline({paused:true,defaults:{ease:'none'}})
          .to([logo,cue],{autoAlpha:0,y:-10,duration:.18},0)
          .to(layers.edge,{xPercent:28,yPercent:-18,rotation:86,scale:1.18,autoAlpha:0,duration:.72},.06)
          .to(layers.outer,{xPercent:-24,yPercent:18,rotation:-64,scale:1.16,autoAlpha:0,duration:.7},.1)
          .to(layers.middle,{xPercent:18,yPercent:22,rotation:48,scale:1.13,autoAlpha:0,duration:.65},.17)
          .to(layers.inner,{xPercent:-12,yPercent:-12,rotation:-32,scale:1.1,autoAlpha:0,duration:.58},.25)
          .to(layers.core,{rotation:22,scale:1.28,autoAlpha:0,duration:.46},.45)
          .to(surface,{backgroundColor:'rgba(35,31,28,0)',duration:.48},.5)
          .to(opening,{autoAlpha:0,duration:.22},.78);
        const advance=delta=>{
          if(finished||finishing||document.hidden)return;
          const distance=mobile.matches?720:Math.max(980,innerHeight*1.2);
          target=gsap.utils.clamp(0,1,target+delta/distance);
          progressTween?.kill();
          if(target>=.76){
            finishing=true;
            progressTween=gsap.to(timeline,{progress:1,duration:.36,ease:'power2.inOut',overwrite:true,onComplete:()=>release({immediate:true})});
          }else{
            progressTween=gsap.to(timeline,{progress:target,duration:.38,ease:'power2.out',overwrite:true});
          }
        };
        const wheel=e=>{if(finished)return;e.preventDefault();advance(e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?innerHeight:1));};
        const touchStart=e=>{touchY=e.touches[0]?.clientY??null;};
        const touchMove=e=>{if(finished||touchY==null)return;const next=e.touches[0]?.clientY??touchY;const delta=touchY-next;touchY=next;e.preventDefault();advance(delta*1.65);};
        const key=e=>{
          if(finished)return;
          if(['ArrowDown','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();advance(mobile.matches?150:220);}
          if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();advance(mobile.matches?-120:-180);}
          if(e.key==='Escape'){e.preventDefault();release({focusVenue:true});}
        };
        addEventListener('wheel',wheel,{passive:false});
        addEventListener('touchstart',touchStart,{passive:true});
        addEventListener('touchmove',touchMove,{passive:false});
        addEventListener('touchend',()=>{touchY=null;},{passive:true});
        addEventListener('keydown',key);
      }
      $('.skip-link')?.addEventListener('click',()=>release({immediate:true}));
      opening.addEventListener('error',e=>{if(e.target.matches('.floral-spiral img'))opening.classList.add('has-asset-error');},true);
      document.addEventListener('visibilitychange',()=>{if(document.hidden)progressTween?.pause();else progressTween?.resume();});
    }
  }
  const scene=$('[data-venue]');
  if(scene&&window.gsap){
    const primary=[$('.venue-table',scene),$('.venue-console',scene),$('.venue-pedestal',scene),$('.venue-moss',scene)];
    let sets=[primary,['table','console','pedestal','wall'].map(part=>$('.venue-garden-'+part,scene))];
    const layers=sets.flat(),controls=$('.venue-controls'),toggle=$('[data-venue-toggle]'),manual=$('.venue-manual');
    const connection=navigator.connection;
    let ready=false,visible=false,userPaused=false,step=1,staticMode=false;
    let currentEdition=-1;
    const editionNumber=$('[data-venue-edition]'),editionChoices=$$('[data-venue-set]');
    const paletteFor=set=>set[0].dataset.scenePiece.replace('-table','').replace('table','ivory');
    function updateEdition(index){
      if(index===currentEdition)return;
      currentEdition=index;
      const palette=sets[index]?paletteFor(sets[index]):null;
      if(editionNumber)editionNumber.textContent=`${String(index+1).padStart(2,'0')} / ${String(sets.length).padStart(2,'0')}`;
      editionChoices.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.venueSet===palette)));
    }
    const still=()=>reduced.matches||connection?.saveData;
    // Keep each venue edition moving at an editorial pace without a long hold.
    const editionDuration=10;
    const timeline=gsap.timeline({paused:true,repeat:-1});
    const present=index=>{gsap.set(layers,{opacity:0,lazy:false});if(index>0)gsap.set(sets[index-1],{opacity:1,lazy:false});updateEdition(index-1);};
    timeline.eventCallback('onUpdate',()=>updateEdition(Math.min(sets.length-1,Math.floor(timeline.time()/editionDuration))));
    editionChoices.forEach(button=>button.addEventListener('click',()=>{
      const index=sets.findIndex(set=>paletteFor(set)===button.dataset.venueSet);
      if(index<0||!ready)return;
      if(still()){step=index+1;present(step);}
      else{timeline.seek(index*editionDuration+5);sync();}
    }));
    function sync(){
      const running=ready&&visible&&!document.hidden&&!userPaused&&!still()&&!openingIsActive();
      if(still()){timeline.pause();if(!staticMode){step=1;present(step);}}
      else if(running)timeline.play();else timeline.pause();
      staticMode=!!still();toggle.hidden=!!still();manual.hidden=!still();
      toggle.setAttribute('aria-label',running?'Pause room animation':'Play room animation');
      toggle.setAttribute('aria-pressed',String(running));
    }
    toggle.addEventListener('click',()=>{userPaused=!userPaused;sync();});
    function show(delta){step=((step-1+delta+sets.length)%sets.length)+1;present(step);}
    $('[data-scene-prev]').addEventListener('click',()=>show(-1));
    $('[data-scene-next]').addEventListener('click',()=>show(1));
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(scene);
    document.addEventListener('visibilitychange',sync);
    addEventListener('eternaluxe:opening-complete',sync);
    reduced.addEventListener('change',()=>{timeline.pause().seek(5.3);staticMode=false;sync();});
    connection?.addEventListener('change',()=>{timeline.pause().seek(5.3);staticMode=false;sync();});
    const decodeSet=set=>Promise.all(set.map(layer=>$('img',layer).decode()));
    Promise.allSettled(sets.map(decodeSet)).then(results=>{
      sets=sets.filter((set,i)=>results[i].status==='fulfilled');
      editionChoices.forEach(button=>{button.hidden=!sets.some(set=>paletteFor(set)===button.dataset.venueSet);});
      currentEdition=-1;
      // Keep the primary composition visible while later palettes decode.
      if(!sets.length){controls.hidden=true;return;}
      // Sequential fades avoid seeing two incompatible vases at the same location.
      sets.forEach((set,index)=>{
        const at=index*editionDuration;
        timeline.set(layers,{opacity:0},at)
          .to(set[0],{opacity:1,duration:.95,ease:'sine.inOut'},at+.35)
          .to(set[1],{opacity:1,duration:.95,ease:'sine.inOut'},at+1.5)
          .to(set[2],{opacity:1,duration:.95,ease:'sine.inOut'},at+2.65)
          .to(set[3],{opacity:1,duration:1.1,ease:'sine.inOut'},at+3.8)
          .to(set,{opacity:0,duration:1.2,ease:'sine.inOut'},at+8.3);
      });
      // Start on the first three approved arrangements and moss wall during opening.
      // The existing sequential cycle continues from this point after entry.
      // Enter on the completed approved four-piece composition, then hold it
      // for about three seconds before the faster rotation begins.
      ready=true;controls.hidden=false;timeline.seek(5.3);staticMode=false;sync();
    });
  }
  // The compositions are fully visible without JS; only their entry gains depth.
  if(window.gsap&&!navigator.connection?.saveData){
    const campaignMedia=gsap.matchMedia();
    campaignMedia.add('(prefers-reduced-motion: no-preference)',()=>{
      const animations=[];
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        observer.unobserve(entry.target);
        const object=$('[data-campaign-object]',entry.target),field=$('.campaign-color-field',entry.target);
        const reveal=gsap.timeline({defaults:{duration:.95,ease:'power2.out'}})
          .fromTo(field,{scale:.97},{scale:1,clearProps:'transform'},0)
          .fromTo(object,{y:18,opacity:.85},{y:0,opacity:1,clearProps:'transform,opacity'},.08);
        animations.push(reveal);
      }),{threshold:.18});
      $$('[data-campaign]').forEach(panel=>observer.observe(panel));
      return ()=>{observer.disconnect();animations.forEach(animation=>animation.kill());};
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
      $$('[data-reveal]').forEach(el=>{
        // The first copy below the venue must be visible as soon as it enters
        // the viewport, rather than briefly presenting an empty ivory band.
        if(pageRoot.dataset.page==='index'&&el.classList.contains('house-statement'))return;
        observer.observe(el);
      });
      return ()=>observer.disconnect();
    });
  }
  if(window.gsap){
    const flows=$$('[data-flow-scroll]');
    const connection=navigator.connection;
    if(flows.length&&!connection?.saveData){
      const flowMedia=gsap.matchMedia();
      flowMedia.add('(prefers-reduced-motion: no-preference)',()=>{
        const active=new Set();
        const sways=new Map(flows.filter(section=>section.classList.contains('architectural-ribbon')).map(section=>{
          const motion=gsap.timeline({paused:true,repeat:-1,yoyo:true,defaults:{duration:3,ease:'sine.inOut'}})
            .fromTo($('svg',section),{xPercent:-2.5,y:-4},{xPercent:2.5,y:4},0)
            .fromTo($('.ribbon-plane-primary',section),
              {attr:{d:'M -80 148 C 240 34 500 36 798 119 s 544 100 882 -54'}},
              {attr:{d:'M -80 78 C 240 190 500 184 798 103 s 544 -76 882 48'}},0)
            .fromTo($('.ribbon-plane-secondary',section),
              {attr:{d:'M -80 171 C 238 61 497 62 793 141 s 548 91 887 -62'},y:-4},
              {attr:{d:'M -80 101 C 238 204 497 197 793 125 s 548 -67 887 42'},y:4},0);
          return [section,motion];
        }));
        const syncSways=()=>sways.forEach((tween,section)=>{
          if(active.has(section)&&!document.hidden)tween.play();else tween.pause();
        });
        let frame=0;
        const paint=()=>{
          frame=0;
          if(document.hidden)return;
          const viewport=innerHeight||1;
          active.forEach(section=>{
            const plane=$('[data-flow-plane]',section);
            if(!plane)return;
            const rect=section.getBoundingClientRect();
            const progress=gsap.utils.clamp(0,1,(viewport-rect.top)/(viewport+rect.height));
            const range=section.classList.contains('architectural-ribbon')?5:2.5;
            gsap.set(plane,{xPercent:(progress-.5)*range,force3D:true});
          });
        };
        const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
        const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>entry.isIntersecting?active.add(entry.target):active.delete(entry.target));syncSways();schedule();});
        flows.forEach(section=>observer.observe(section));
        addEventListener('scroll',schedule,{passive:true});
        addEventListener('resize',schedule,{passive:true});
        document.addEventListener('visibilitychange',schedule);
        document.addEventListener('visibilitychange',syncSways);
        schedule();
        return ()=>{observer.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);document.removeEventListener('visibilitychange',syncSways);sways.forEach(tween=>tween.kill());if(frame)cancelAnimationFrame(frame);flows.forEach(section=>{const plane=$('[data-flow-plane]',section);if(plane)gsap.set(plane,{clearProps:'transform'});});};
      });
    }
  }
  async function track(event,detail={}){
    if(!choices?.analytics||navigator.globalPrivacyControl||!receipt)return;
    try{await api('/api/events',{event,detail,receipt,page:pageRoot.dataset.page});}catch{/* Analytics cannot interrupt a visit. */}
  }
  $$('[data-track]').forEach(el=>el.addEventListener('click',()=>track(el.dataset.track)));
  if(pageRoot.dataset.page?.startsWith('product-'))track('product_view');
  document.addEventListener('click',e=>{const a=e.target.closest('a.text-link,a.button,a.hero-link');if(a)track('cta_select');});
})();
