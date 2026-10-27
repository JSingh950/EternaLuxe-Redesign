const VERSION='__OFFLINE_VERSION__';
const CACHE=`eternaluxe-offline-${VERSION}`;
const FILES=__OFFLINE_FILES__;
const READY='/__offline-ready__';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
let saving;
async function save(){
  const cache=await caches.open(CACHE);
  let completed=0;
  for(const file of FILES){
    if(!await cache.match(file)){
      const response=await fetch(file,{cache:'reload'});
      if(!response.ok)throw Error(`Unable to save ${file}`);
      await cache.put(file,response);
    }
    completed++;
    for(const client of await self.clients.matchAll())client.postMessage({type:'OFFLINE_PROGRESS',completed,total:FILES.length});
  }
  await cache.put(READY,new Response('ready'));
  // Keep the previous complete copy until the new download has succeeded.
  for(const name of await caches.keys())if(name.startsWith('eternaluxe-offline-')&&name!==CACHE)await caches.delete(name);
}
self.addEventListener('message',event=>{
  if(event.data?.type!=='SAVE_OFFLINE')return;
  event.waitUntil((async()=>{
    try{saving ||= save().finally(()=>saving=null);await saving;event.source?.postMessage({type:'OFFLINE_READY'});}
    catch{event.source?.postMessage({type:'OFFLINE_ERROR'});}
  })());
});
async function cached(request){
  const url=new URL(request.url);
  const key=url.pathname==='/'?'/index.html':url.pathname;
  for(const name of [CACHE,...(await caches.keys()).filter(n=>n.startsWith('eternaluxe-offline-')&&n!==CACHE)]){
    const cache=await caches.open(name);
    if(!await cache.match(READY))continue;
    const response=await cache.match(key);
    if(!response)continue;
    const range=request.headers.get('range');
    if(!range)return response;
    const bytes=await response.arrayBuffer(),match=/^bytes=(\d*)-(\d*)$/.exec(range);
    if(!match)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
    const start=match[1]?Number(match[1]):Math.max(0,bytes.byteLength-Number(match[2]));
    const end=match[1]&&match[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1;
    if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
    return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
  }
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
  event.respondWith((async()=>{
    if(!self.navigator.onLine){const response=await cached(event.request);if(response)return response;}
    // Prefer current pages online, but use the complete saved copy offline.
    try{return await fetch(event.request);}catch{return await cached(event.request)||Response.error();}
  })());
});
