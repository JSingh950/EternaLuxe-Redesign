import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.TEST_URL||'http://localhost:4173';
const browser=await chromium.launch();
try{
 for(const width of [375,768,1440,1920]){
  const page=await browser.newPage({viewport:{width,height:width===1440?768:900},reducedMotion:'reduce',javaScriptEnabled:false});
  for(const route of ['house','collections','floral-club']){
   await page.goto(`${base}/${route}.html`);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.equal(await page.locator('#menu-dialog a[href="atelier.html"],#menu-dialog a[href="archive.html"]').count(),0);
   if(route==='house'){assert.equal(await page.locator('.selected-work-grid figure').count(),6);assert.equal(await page.locator('.selected-work-film video').count(),1);}
   if(route==='collections'){assert.equal(await page.locator('#commissions .commission-process article').count(),3);assert.equal(await page.locator('.collection-item').count(),20);}
   if(route==='floral-club')assert.equal(await page.locator('.club-intro video').evaluate(e=>getComputedStyle(e).objectFit),'contain');
   if(width===375||width===1440){await page.locator('img').evaluateAll(async es=>Promise.all(es.map(e=>{e.loading='eager';return e.decode().catch(()=>{})})));await page.screenshot({path:`output/page-accent-migration/after-${route}-${width}.png`,fullPage:true});}
  }
  await page.goto(`${base}/atelier.html`);await page.waitForURL('**/collections.html#commissions');
  await page.goto(`${base}/archive.html`);await page.waitForURL('**/house.html#selected-work');
  await page.close();
 }
 const manifest=JSON.parse(await fs.readFile('dist/offline-manifest.json'));
 assert.ok(manifest.pages.includes('collections.html')&&!manifest.pages.includes('atelier.html'));
 for(const asset of manifest.assets)await fs.access('dist/'+asset);
 console.log('Migration, four viewports, no-JavaScript, reduced-motion presentation, media framing, redirects and local offline inventory verified.');
}finally{await browser.close();}
