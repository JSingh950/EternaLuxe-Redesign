import fs from 'node:fs/promises';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const base=process.env.TEST_URL||'http://localhost:4173';const baseline='rollback/before-focused-floral-2026-11-16';
const strip=url=>url.split('?')[0];
// The review draft retains every existing page, photograph and navigation destination.
for(const file of execFileSync('git',['ls-tree','--name-only',baseline+':dist'],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html'))){const before=execFileSync('git',['show',baseline+':dist/'+file],{encoding:'utf8'}),after=await fs.readFile('dist/'+file,'utf8');
 for(const attr of ['href','src','poster']){const urls=html=>new Set([...html.matchAll(new RegExp(attr+'="([^"]+)"','g'))].map(m=>strip(m[1])));const old=urls(before),now=urls(after);for(const url of old)assert(now.has(url),`${file}: removed ${attr} ${url}`);}
}
const browser=await chromium.launch();try{
 for(const width of [375,768,1440,1920]){const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await page.addInitScript(()=>sessionStorage.setItem('eternaluxe-opening-v1','complete'));
 for(const route of ['index','collections','archive','atelier','product-royal']){
  await page.goto(base+'/'+route+'.html',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflow '+width);
  const results=await page.locator('[data-organic-frame]').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().width>0).map(e=>{const r=e.getBoundingClientRect(),i=e.querySelector('img')||e,s=getComputedStyle(i),p=i.getBoundingClientRect();return {ratio:r.width/r.height,fit:s.objectFit,inside:p.left>=r.left&&p.right<=r.right+1&&p.top>=r.top&&p.bottom<=r.bottom+1};}));
  assert(results.length>0,route+' has frames');for(const r of results){assert(Math.abs(r.ratio-.8)<.01,route+' frame ratio '+width+' '+r.ratio);assert.equal(r.fit,'contain');assert(r.inside,route+' complete image bounds '+width);}
  if(route==='index'){
   assert.equal(await page.locator('.campaign-arrangement').count(),2);
   const images=page.locator('.campaign-arrangement img');for(const i of await images.all()){await i.evaluate(i=>i.decode());const r=await i.boundingBox();assert(r.width>0&&r.height>0);}
   assert.equal(await page.locator('[data-venue] .venue-layer').count(),8);
   assert.equal(await page.locator('.club-price').textContent(),'Large Luxury Bouquet · $299 / month');
  }
 }
 await page.close();}
 const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:812}});await page.goto(base+'/');assert(await page.locator('.campaign-arrangement img').first().isVisible());assert(await page.locator('[data-organic-frame]').first().isVisible());await page.close();
}finally{await browser.close();}
console.log('Focused floral draft: original pages/media/links retained; organic 4:5 frames and full photos at four widths; restored scenes, hero layers, Club price and no-JS verified.');
