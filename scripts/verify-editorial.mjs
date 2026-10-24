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
 await fs.mkdir('tmp/editorial-review',{recursive:true});
 for(const width of [375,768,1440,1920]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.addInitScript(setup);
  await page.goto(`${base}/archive.html`,{waitUntil:'networkidle'});
  for(const card of await page.locator('.archive-chapter').all()){
   await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(i=>i.decode());
  }
  const captions=await page.locator('.archive-chapter').evaluateAll(cards=>{
   const rect=e=>e.getBoundingClientRect();
   return cards.map(card=>{
    const picture=rect(card.querySelector('picture')),caption=rect(card.querySelector('figcaption')),outer=rect(card);
    const covered=cards.some(other=>{if(other===card)return false;const b=rect(other);return Math.min(b.right,caption.right)>Math.max(b.left,caption.left)+1&&Math.min(b.bottom,caption.bottom)>Math.max(b.top,caption.top)+1;});
    return {separated:caption.top>=picture.bottom+12,contained:caption.bottom<=outer.bottom+1&&!covered,text:card.querySelector('figcaption').textContent};
   });
  });
  assert.equal(captions.length,6);assert(captions.every(c=>c.separated&&c.contained),JSON.stringify({width,captions}));
  await page.locator('.editorial-chapters').screenshot({path:`tmp/editorial-review/archive-${width}.png`,style:'.site-header,.site-header *,.skip-link{visibility:hidden!important}'});
  for(const route of ['house','collections','atelier','floral-club']){
   await page.goto(`${base}/${route}.html`,{waitUntil:'networkidle'});
   const scene=page.locator('.editorial-campaign');assert.equal(await scene.count(),1);
   await scene.scrollIntoViewIfNeeded();await scene.locator('.campaign-arrangement img').evaluate(i=>i.decode());
   const report=await scene.evaluate(el=>{
    const image=el.querySelector('.campaign-arrangement img'),r=image.getBoundingClientRect(),title=el.querySelector('h2').getBoundingClientRect(),stage=el.querySelector('.campaign-stage').getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth>innerWidth+1,imageFits:r.left>=0&&r.right<=innerWidth+1&&r.top>=stage.top-1&&r.bottom<=stage.bottom+1,contain:getComputedStyle(image).objectFit==='contain',titleFits:title.left>=0&&title.right<=innerWidth+1,overlap:Math.min(r.right,title.right)>Math.max(r.left,title.left)+1&&Math.min(r.bottom,title.bottom)>Math.max(r.top,title.top)+1};
   });
   assert(!report.overflow&&report.imageFits&&report.contain&&report.titleFits&&!report.overlap,JSON.stringify({width,route,report}));
   const href=await scene.locator('.text-link').getAttribute('href');assert((await page.request.get(new URL(href,`${base}/`).href)).ok());
   if([375,1440].includes(width))await scene.screenshot({path:`tmp/editorial-review/${route}-${width}.png`,style:'.site-header,.site-header *,.skip-link{visibility:hidden!important}'});
  }
  await page.close();
 }
 const noJS=await browser.newPage({javaScriptEnabled:false});await noJS.goto(`${base}/archive.html`);assert.equal(await noJS.locator('.archive-chapter figcaption:visible').count(),6);await noJS.goto(`${base}/atelier.html`);assert(await noJS.locator('.editorial-campaign .campaign-arrangement img').isVisible());await noJS.close();
 console.log('Archive captions and four interior campaign scenes verified at 375, 768, 1440 and 1920px, including complete imagery, CTA destinations, reduced-motion layout and no-JS visibility.');
}finally{await browser.close();}
