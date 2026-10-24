import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.env.TEST_URL||'http://localhost:4173';
const browser=await chromium.launch();
const setup=()=>{
 sessionStorage.setItem('eternaluxe-opening-v1','complete');
 localStorage.setItem('eternaluxe-privacy-v1',JSON.stringify({necessary:true,expiresAt:Date.now()+86400000}));
};
try{
 await fs.mkdir('tmp/campaign-review',{recursive:true});
 for(const [width,height]of [[375,812],[768,1024],[1440,1000],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(setup);await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-campaign]').count(),2);
  assert.equal(await page.locator('[data-venue] .venue-layer').count(),8);
  for(const panel of await page.locator('[data-campaign]').all()){
   await panel.scrollIntoViewIfNeeded();
   await panel.locator('.campaign-arrangement img').evaluate(image=>image.decode());
   const report=await panel.evaluate(element=>{
    const image=element.querySelector('.campaign-arrangement img'),rect=image.getBoundingClientRect();
    const title=element.querySelector('h2').getBoundingClientRect();
    const stage=element.querySelector('.campaign-stage').getBoundingClientRect();
    return {complete:image.complete&&image.naturalWidth>0,fit:getComputedStyle(image).objectFit,
     productFits:rect.left>=-.5&&rect.right<=innerWidth+.5&&rect.top>=stage.top-1&&rect.bottom<=stage.bottom+1,
     titleFits:title.left>=0&&title.right<=innerWidth+1,
     overlap:Math.min(title.right,rect.right)>Math.max(title.left,rect.left)+1&&Math.min(title.bottom,rect.bottom)>Math.max(title.top,rect.top)+1};
   });
   assert(report.complete&&report.productFits&&report.titleFits&&!report.overlap,JSON.stringify({width,report}));
   assert.equal(report.fit,'contain');
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await page.getByRole('link',{name:'Explore the collection',exact:false}).getAttribute('href'),'collections.html?collection=table');
  assert.equal(await page.getByRole('link',{name:'Discover the Atelier',exact:false}).getAttribute('href'),'atelier.html');
  await page.locator('.botanical-campaign').screenshot({path:`tmp/campaign-review/campaign-${width}.png`,style:'.site-header,.site-header *,.skip-link{visibility:hidden!important}'});
  assert.deepEqual(errors,[]);await page.close();
 }
 const noScript=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:812}});
 await noScript.goto(base);assert(await noScript.locator('.campaign-arrangement').first().isVisible());
 assert(await noScript.getByRole('heading',{name:'A softer kind of statement.'}).isVisible());await noScript.close();
 const animated=await browser.newPage({viewport:{width:1440,height:1000}});await animated.addInitScript(setup);
 await animated.goto(base,{waitUntil:'networkidle'});
 await animated.locator('[data-campaign]').first().scrollIntoViewIfNeeded();
 await animated.waitForFunction(()=>{const e=document.querySelector('[data-campaign-object]');return getComputedStyle(e).transform==='none'&&getComputedStyle(e).opacity==='1';});
 await animated.close();
 console.log('Campaign verified at 375, 768, 1440 and 1920px: full products, readable copy, working links, reduced motion, no-JS and completed reveals.');
}finally{await browser.close();}
