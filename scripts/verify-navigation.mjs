import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.env.TEST_URL||'http://localhost:4173';
const files=(await fs.readdir('dist')).filter(f=>f.endsWith('.html'));
const graph=new Map();
for(const file of files){
 const html=await fs.readFile(`dist/${file}`,'utf8');
 if(html.includes('http-equiv="refresh"'))continue;
 graph.set(file,[...html.matchAll(/href="([^"?#]+\.html)(?:[^" ]*)"/g)].map(m=>m[1]));
 assert(!html.includes('class="desktop-nav"')&&!html.includes('class="header-quick-nav"'),'Obsolete header navigation row: '+file);
}
const reached=new Set(['index.html']);
for(const source of reached)for(const target of graph.get(source)||[])if(graph.has(target))reached.add(target);
assert.deepEqual([...graph.keys()].filter(f=>!reached.has(f)),[],'Public page unreachable from homepage');

const browser=await chromium.launch();
try{
 await fs.mkdir('tmp/navigation-review',{recursive:true});
 for(const width of [320,375,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.addInitScript(()=>{
   sessionStorage.setItem('eternaluxe-opening-v1','complete');
   localStorage.setItem('eternaluxe-privacy-v1',JSON.stringify({necessary:true,expiresAt:Date.now()+86400000}));
  });
  await page.goto(`${base}/collections.html`,{waitUntil:'networkidle'});
  const controls=page.locator('.site-header .menu-toggle,.site-header .contact-link,.site-header .bag-button');
  assert.equal(await controls.count(),3);
  const bounds=await controls.evaluateAll(links=>links.map(a=>{const r=a.getBoundingClientRect(),s=getComputedStyle(a);return r.left>=0&&r.right<=innerWidth&&r.height>=44&&parseFloat(s.fontSize)>=14&&s.display!=='none';}));assert(bounds.every(Boolean),`Larger header controls fit at ${width}px`);
  for(const label of ['Menu','Bag'])assert(await page.locator('.site-header').getByText(label,{exact:true}).isVisible());
  const total=await page.locator('.collection-grid .collection-item').count();assert(total>8);
  assert.equal(await page.locator('.collection-grid .collection-item:visible').count(),total,'No compositions hidden by pagination');
  assert.equal(await page.locator('.filter-bar,.collection-categories,[data-reset-filters]').count(),0,'No collection filter controls');
  await page.goto(`${base}/collections.html?collection=wall&size=Small&style=blue`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.collection-grid .collection-item:visible').count(),total,'Old filter URLs show the full collection');
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  const menu=page.getByRole('dialog',{name:'Navigation'});
  for(const name of ['Home','The House','Collections','The Floral Club','Atelier','Archive','About','Contact Us','Your bag','All pages'])assert(await menu.getByRole('link',{name,exact:true}).isVisible(),`${name} is directly available`);
  await page.keyboard.press('Escape');assert(await page.getByRole('button',{name:'Open menu',exact:true}).evaluate(e=>e===document.activeElement));
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await menu.getByRole('link',{name:'The Floral Club',exact:true}).click();await page.waitForURL('**/floral-club.html');
  await page.locator('.site-header').screenshot({path:`tmp/navigation-review/header-${width}.png`});
  await page.locator('.site-footer').getByRole('link',{name:'All pages',exact:true}).click();
  const links=await page.locator('.site-directory a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  for(const file of graph.keys())if(file!=='site-map.html')assert(links.includes(file),`${file} missing from directory`);
  assert(await page.getByRole('link',{name:'Email preferences',exact:true}).first().isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.close();
 }
 console.log(`Navigation verified: ${graph.size} public routes reachable, complete page directory, removed navigation row, larger visible Menu/Contact/Bag controls, Floral Club through Menu, keyboard return, and full Collections on current and legacy URLs at 320, 375, 768 and 1440px.`);
}finally{await browser.close();}
