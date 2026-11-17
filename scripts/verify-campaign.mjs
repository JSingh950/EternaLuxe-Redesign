import assert from 'node:assert/strict';
import {chromium} from 'playwright';
// Part 2 replaces the later campaign design; preserve subsequent owner edits.
const base=process.env.TEST_URL||'http://localhost:4173';
const browser=await chromium.launch();
try{
 for(const [width,height] of [[375,812],[768,1024],[1440,900],[1920,1080],[1366,600]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.addInitScript(()=>{sessionStorage.setItem('eternaluxe-opening-v1','complete');localStorage.setItem('eternaluxe-privacy-v1',JSON.stringify({necessary:true,expiresAt:Date.now()+86400000}));});
  for(const route of ['index','house','collections','floral-club','about','enquiries']){
   await page.goto(`${base}/${route}.html`,{waitUntil:'networkidle'});
   assert.equal(await page.locator('[data-campaign],[data-house-motion],.flow-ribbon,#bag-dialog,.filter-bar').count(),0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route}: overflow at ${width}`);
   if(route==='index')assert.equal(await page.locator('[data-venue] .venue-layer').count(),8);
   if(route==='house'){assert(await page.getByRole('heading',{name:'Form becomes feeling'}).isVisible());assert.equal(await page.locator('[data-video="orchid-film"]').count(),1);}
   if(route==='collections'){
    const frames=await page.locator('.collection-grid .collection-photo').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return r.width/r.height;}));
    assert(frames.length>8&&frames.every(r=>Math.abs(r-.8)<.01));
    if(width>700){const r=await page.locator('.collection-opening').boundingBox();assert(r.y+r.height<=height+2,'Complete collection opening fits');}
   }
  }
  await page.goto(`${base}/product-royal.html`);await page.getByRole('link',{name:'Enquire about this piece',exact:true}).click();assert((await page.locator('[name=message]').inputValue()).includes('Royal'));
  await page.close();
 }
 const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:812}});
 for(const route of ['index','house','collections']){await page.goto(`${base}/${route}.html`);assert(await page.locator(route==='index'?'.venue-base img':'main img').first().isVisible());}
 await page.close();
 console.log('Part 2 presentation and retained owner changes verified at five viewports, with enquiry prefill and no-JavaScript content.');
}finally{await browser.close();}
