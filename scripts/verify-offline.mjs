import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const base='http://localhost:4175';
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4175'},stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.on('data',chunk=>{if(String(chunk).includes('Eternaluxe preview:'))resolve();});server.once('error',reject);server.once('exit',code=>reject(Error(`Preview exited: ${code}`)));});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
try{
  const page=await context.newPage();
  await page.goto(base+'/house.html');
  await page.locator('[data-save-offline]').click();
  await page.waitForFunction(()=>document.querySelector('[data-offline-status]').textContent.startsWith('Website saved'),{},{timeout:180000});
  const saved=await page.evaluate(async()=>{const name=(await caches.keys()).find(n=>n.startsWith('eternaluxe-offline-'));return (await (await caches.open(name)).keys()).length;});
  assert(saved>300,'Full assets must be saved');
  // Stop the origin too: some browser versions let worker fetches bypass the
  // automation offline switch. This proves nothing can come from the network.
  server.kill();await once(server,'exit');
  await context.setOffline(true);
  // Explicitly model the device connection indicator as well as blocking network.
  await context.addInitScript(()=>Object.defineProperty(navigator,'onLine',{get:()=>false}));
  const routes=(await fs.readdir('dist')).filter(f=>f.endsWith('.html')&&!['ikebana.html','arrangements.html','bespoke-events.html','accesibility.html'].includes(f));
  let imageCount=0;
  for(const route of routes){
    await page.goto(`${base}/${route}?offline-test=1`);
    assert(await page.locator('main').count(),`${route}: missing content`);
    const result=await page.evaluate(async()=>{
      const imgs=[...document.images];imgs.forEach(img=>img.loading='eager');
      const broken=[];for(const img of imgs)try{await img.decode();}catch{broken.push(img.currentSrc||img.src);}
      await document.fonts.ready;
      return {count:imgs.length,broken,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.deepEqual(result.broken,[],`${route}: offline images`);assert(result.overflow<2,`${route}: overflow`);imageCount+=result.count;
  }
  await page.goto(base+'/collections.html');
  const video=page.locator('video').first();
  await page.locator('[data-film] .film-toggle').first().click();
  await page.waitForFunction(()=>document.querySelector('video').readyState>=1,{},{timeout:20000});
  const range=await page.evaluate(async()=>{const source=document.querySelector('video source');const response=await fetch(source.src,{headers:{Range:'bytes=0-1023'}});return {status:response.status,length:(await response.arrayBuffer()).byteLength};});
  assert.deepEqual(range,{status:206,length:1024});
  await page.goto(base+'/product-royal.html');await page.locator('[data-bag-add]').click();
  await page.goto(base+'/bag.html');await page.getByText('The Royal',{exact:true}).first().waitFor();
  assert((await page.locator('main').innerText()).includes('Royal'),'Offline Bag selection missing');
  await page.goto(base+'/enquiries.html');
  await page.waitForFunction(()=>document.querySelector('[data-offline-status]').textContent.startsWith('You are offline'));
  console.log(`Offline verified: ${routes.length} routes, ${imageCount} decoded images, ${saved} cached resources, video metadata and byte ranges, persisted Bag, and offline messaging.`);
}finally{server.kill();await context.close();await browser.close();}
