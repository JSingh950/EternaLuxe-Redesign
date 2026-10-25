import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:4173';
const browser=await chromium.launch();
const setup=()=>localStorage.setItem('eternaluxe-privacy-v1',JSON.stringify({necessary:true,expiresAt:Date.now()+86400000}));
try{
 await fs.mkdir('tmp/collection-review',{recursive:true});
 for(const width of [375,768,1440,1920]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(setup);
  await page.goto(base+'/collections.html',{waitUntil:'networkidle'});
  const cards=page.locator('.collection-grid .collection-item');
  assert.equal(await cards.count(),20);assert.equal(await page.locator('.collection-grid .collection-item:visible').count(),20);
  assert.equal(await page.locator('.filter-bar,.collection-categories,[data-reset-filters],[data-show-more]').count(),0);
  for(const card of await cards.all()){
   await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(i=>i.decode());
  }
  const geometry=await cards.evaluateAll(cards=>cards.map(card=>{
   const frame=card.querySelector('.collection-photo'),picture=frame.querySelector('picture'),image=frame.querySelector('img'),caption=card.querySelector('.item-caption');
   const f=frame.getBoundingClientRect(),p=picture.getBoundingClientRect(),c=caption.getBoundingClientRect(),i=getComputedStyle(image);
   return {width:f.width,height:f.height,radius:getComputedStyle(frame).borderRadius,shape:card.dataset.imageShape,contain:i.objectFit==='contain',noZoom:i.transform==='none',captionFits:c.top>=f.bottom-1&&c.right<=innerWidth+1,photoFits:p.left>=f.left+7&&p.right<=f.right-7&&p.top>=f.top+7&&p.bottom<=f.bottom-7};
  }));
  for(const card of geometry){
   assert(Math.abs(card.height-card.width*1.25)<1,JSON.stringify({width,card}));
   assert.equal(card.shape,'uniform');assert(card.contain&&card.noZoom&&card.captionFits&&card.photoFits,JSON.stringify({width,card}));
   assert(Math.abs(card.width-geometry[0].width)<1);assert.equal(card.radius,geometry[0].radius);
  }
  await cards.first().locator('.collection-photo').hover();
  assert.equal(await cards.first().locator('img').evaluate(i=>getComputedStyle(i).transform),'none');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await page.locator('.collection-introduction video').getAttribute('data-video'),'orchid-film');
  await page.locator('.collection-grid').scrollIntoViewIfNeeded();
  const area=await page.locator('.collection-grid').boundingBox();
  await page.screenshot({path:`tmp/collection-review/collections-${width}.png`,clip:{x:area.x,y:area.y,width:area.width,height:Math.min(area.height,950)},style:'.site-header,.site-header *,.skip-link{visibility:hidden!important}'});
  // Preserve both real-product navigation and concept enquiry handoff.
  await cards.nth(1).locator('.collection-photo').click();await page.waitForURL('**/product-amber.html');
  await page.goto(base+'/collections.html?collection=wall&format=framed-moss&size=Small&style=blue');
  assert.equal(await page.locator('.collection-grid .collection-item:visible').count(),20);
  await page.locator('.collection-grid .collection-item').first().locator('.collection-photo').click();
  await page.waitForURL('**/enquiries.html?**');assert.match(await page.locator('[name=message]').inputValue(),/\(concept\)/);
  assert.deepEqual(errors,[]);await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:812}});
 await nojs.goto(base+'/collections.html?collection=wall');assert.equal(await nojs.locator('.collection-grid .collection-item:visible').count(),20);await nojs.close();
 console.log('Collections verified at 375, 768, 1440 and 1920px: 20 complete photos, identical 4:5 frames, aligned captions, no filters or hover crop, legacy URLs, no-JS visibility, video and product/concept links.');
}finally{await browser.close();}
