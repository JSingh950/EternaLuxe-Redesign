(() => {
  const button=document.querySelector('[data-save-offline]');
  const status=document.querySelector('[data-offline-status]');
  if(!button||!status)return;
  if(!('serviceWorker' in navigator)||!isSecureContext){button.hidden=true;status.textContent='Offline saving is not available in this browser.';return;}
  let worker;
  const registration=(navigator.onLine?navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready):navigator.serviceWorker.ready).then(r=>{worker=r.active;return r;});
  registration.catch(()=>{status.textContent='Offline saving could not start. Please reconnect and try again.';});
  const connection=()=>{
    if(!navigator.onLine)status.textContent='You are offline. Saved pages and media remain available. Sending forms requires a connection.';
  };
  addEventListener('offline',connection);connection();
  navigator.serviceWorker.addEventListener('message',event=>{
    if(event.data?.type==='OFFLINE_PROGRESS')status.textContent=`Saving website: ${Math.round(event.data.completed/event.data.total*100)}%. Keep this page open.`;
    if(event.data?.type==='OFFLINE_READY'){status.textContent='Website saved for offline viewing, including images and films. Forms and external links require internet. Browsers may remove saved data if storage is cleared or space is low.';button.disabled=false;button.textContent='Refresh offline copy';}
    if(event.data?.type==='OFFLINE_ERROR'){status.textContent='The full download did not finish. Check your connection and available storage, then try again. Any previous complete copy is kept.';button.disabled=false;}
  });
  button.addEventListener('click',async()=>{
    if(!navigator.onLine){connection();return;}
    button.disabled=true;status.textContent='Preparing the full offline download (about 94 MB)…';
    try{await registration;await navigator.storage?.persist?.();worker.postMessage({type:'SAVE_OFFLINE'});}
    catch{status.textContent='Unable to save the website. Please reconnect and try again.';button.disabled=false;}
  });
})();
