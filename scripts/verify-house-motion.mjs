import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const files=(await fs.readdir('dist')).filter(f=>f.endsWith('.html'));
for(const file of files){const html=await fs.readFile('dist/'+file,'utf8');assert(!/data-house-motion|motion-track|motion-lane|data-flow-scroll|data-flow-plane|architectural-ribbon|Composed for your world/.test(html),`${file}: removed decorative animation`);}
const js=await fs.readFile('dist/assets/site.js','utf8');assert(!/data-flow-scroll|ribbon-plane|data-house-motion/.test(js));
const browser=await chromium.launch();try{
 const base=process.env.TEST_URL||'http://localhost:4173';
 for(const width of [375,1440]){const page=await browser.newPage({viewport:{width,height:900}});await page.addInitScript(()=>sessionStorage.setItem('eternaluxe-opening-v1','complete'));
 for(const route of ['index','house','collections','floral-club','about']){await page.goto(`${base}/${route}.html`,{waitUntil:'networkidle'});assert.equal(await page.locator('[data-house-motion],[data-flow-scroll],.motion-track,.architectural-ribbon').count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.close();}
}finally{await browser.close();}
console.log(`Removed slideshows and moving decorative lines verified across ${files.length} routes and desktop/mobile pages.`);
