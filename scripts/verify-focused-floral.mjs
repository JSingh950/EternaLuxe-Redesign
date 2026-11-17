import fs from 'node:fs/promises';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const base=process.env.TEST_URL||'http://localhost:4173';const baseline='rollback/before-focused-floral-2026-11-16';
const strip=url=>url.split('?')[0];
// The review draft retains every existing page, photograph and navigation destination.
for(const file of execFileSync('git',['ls-tree','--name-only',baseline+':dist'],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html'))){let before=execFileSync('git',['show',baseline+':dist/'+file],{encoding:'utf8'});const after=await fs.readFile('dist/'+file,'utf8');
 if(file==='index.html')before=before.replace(/<section class="collection-section[^"]*"[^>]*>[\s\S]*?<\/section>/g,'').replace(/<section class="house-motion"[^>]*>[\s\S]*?<\/section>/g,'');
 for(const attr of ['href','src','poster']){const urls=html=>new Set([...html.matchAll(new RegExp(attr+'="([^"]+)"','g'))].map(m=>strip(m[1])));const old=urls(before),now=urls(after);for(const url of old)assert(now.has(url),`${file}: removed ${attr} ${url}`);}
}
const browser=await chromium.launch();try{
 for(const width of [375,768,1440,1920]){const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await page.addInitScript(()=>sessionStorage.setItem('eternaluxe-opening-v1','complete'));
 for(const route of ['index','collections','archive','atelier','product-royal']){
  await page.goto(base+'/'+route+'.html',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflow '+width);
  if(route==='collections')for(let n=0;n<5&&await page.locator('[data-show-more]').isVisible();n++)await page.locator('[data-show-more]').evaluate(e=>e.click());
  if(route==='collections'||route==='index'){
   const groups=page.locator('.collection-photo-group');
   for(const group of await groups.all()){
    if(!await group.isVisible())continue;
    const photos=await group.locator('.collection-photo:visible').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),img=e.querySelector('img'),p=img.getBoundingClientRect(),s=getComputedStyle(e);return {w:r.width,h:r.height,iw:p.width,ih:p.height,padding:s.padding,fit:getComputedStyle(img).objectFit,crop:1-Math.min((img.naturalWidth/img.naturalHeight)/(r.width/r.height),(r.width/r.height)/(img.naturalWidth/img.naturalHeight))};}));
    for(const x of photos){assert.equal(x.padding,'0px');assert.equal(x.fit,'cover');assert(x.crop<.075,'Background crop remains below 7.5%');assert(Math.abs(x.w-x.iw)<1&&Math.abs(x.h-x.ih)<1,'Actual photograph fills matching dimensions');assert(Math.abs(x.w-photos[0].w)<1&&Math.abs(x.h-photos[0].h)<1,'Photographs in a matching row have equal sizes');}
   }
  }else{
   const results=await page.locator('[data-organic-frame]').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().width>0).map(e=>{const r=e.getBoundingClientRect(),i=e.querySelector('img')||e,s=getComputedStyle(i),p=i.getBoundingClientRect();return {ratio:r.width/r.height,fit:s.objectFit,inside:p.left>=r.left&&p.right<=r.right+1&&p.top>=r.top&&p.bottom<=r.bottom+1};}));
   assert(results.length>0,route+' has frames');for(const r of results){assert(Math.abs(r.ratio-.8)<.01,route+' frame ratio '+width+' '+r.ratio);assert.equal(r.fit,'contain');assert(r.inside,route+' complete image bounds '+width);}
  }
  if(route==='index'){
   assert.equal(await page.locator('.campaign-arrangement').count(),2);
   assert.equal(await page.locator('.collection-section,.house-motion,.architectural-ribbon').count(),0,'Approved Home removals are absent');
   for(const article of await page.locator('.discovery-pair article').all())assert.equal(await article.evaluate(e=>getComputedStyle(e,'::before').content),'none');
   for(const link of await page.locator('.discovery-pair .text-link').all())assert.equal(await link.evaluate(e=>getComputedStyle(e).borderBottomWidth),'0px');
   const club=await page.locator('.club-image').evaluate(e=>({padding:getComputedStyle(e).padding,radius:getComputedStyle(e).borderRadius,bg:getComputedStyle(e).backgroundColor}));assert.equal(club.padding,'0px');assert.equal(club.radius,'12px');assert.equal(club.bg,'rgba(0, 0, 0, 0)');
   assert.equal(await page.locator('.club-feature').evaluate(e=>getComputedStyle(e,'::before').content),'none');
   const tint=await page.locator('.botanical-campaign').evaluate(e=>getComputedStyle(e).getPropertyValue('--campaign-blue').trim());assert.equal(tint,'#e5dccb');
   const images=page.locator('.campaign-arrangement img');for(const i of await images.all()){await i.evaluate(i=>i.decode());const r=await i.boundingBox();assert(r.width>0&&r.height>0);}
   assert.equal(await page.locator('[data-venue] .venue-layer').count(),8);
   assert.equal(await page.locator('.club-price').textContent(),'Large Luxury Bouquet · $299 / month');
  }
 }
 await page.close();}
 const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:812}});await page.goto(base+'/');assert(await page.locator('.campaign-arrangement img').first().isVisible());assert(await page.locator('.club-image img').isVisible());await page.close();
}finally{await browser.close();}
console.log('Revised floral draft verified: matched actual photograph dimensions without mats, retained media/links, rounded Club media, warm neutral scenes, hero layers, pricing and no-JS at four widths.');
