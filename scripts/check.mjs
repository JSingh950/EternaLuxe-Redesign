import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {images,videos} from '../src/media.mjs';
const files=(await fs.readdir('dist')).filter(f=>f.endsWith('.html'));
let checked=0;
for(const f of files){
 const html=await fs.readFile(`dist/${f}`,'utf8');
 if(html.includes('http-equiv="refresh"'))continue;
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${f}: one H1`);
 assert.ok(html.includes('lang="en"'),`${f}: language`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`${f}: unique IDs`);
 for(const match of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)){
   const url=match[1];if(/^(https?:|mailto:|#|data:)/.test(url))continue;
   const target=url.split(/[?#]/)[0];if(!target)continue;
   await fs.access(path.join('dist',target)).catch(()=>{throw Error(`${f}: missing ${target}`)});checked++;
 }
 for(const img of html.matchAll(/<img\b[^>]*>/g))assert.ok(/\balt=/.test(img[0]),`${f}: image alternative`);
 assert.ok(!/venue-gallery|hero-overlay|bouquet-3d/.test(html),`${f}: obsolete media`);
 assert.ok(!/search-dialog|newsletter-form|footer-wordmark|form-mode/.test(html),`${f}: removed interface is absent`);
 assert.ok(!/\bConcierge\b/.test(html),`${f}: Contact Us naming`);
 assert.ok(html.includes('href="collections.html"'),`${f}: direct collection navigation`);
 assert.ok(html.includes('class="menu-privacy"'),`${f}: privacy policy in menu`);
}
const media=JSON.parse(await fs.readFile('src/media-manifest.json'));assert.equal(media.length,images.length+videos.length);
const allPages=(await Promise.all(files.map(f=>fs.readFile('dist/'+f,'utf8')))).join('\n');
const house=await fs.readFile('dist/house.html','utf8');
assert.ok(house.includes('data-video="orchid-film"'),'House opens with the supplied orchid film');
assert.ok(house.includes('data-house-motion'),'House includes the live photographic composition');
assert.ok(!house.includes('house-origin-film'),'Rejected dark opening is not served on the House page');
const enquiry=await fs.readFile('dist/enquiries.html','utf8');
assert.equal((enquiry.match(/type="checkbox"[^>]*required/g)||[]).length,2,'Contact Us keeps separate required Terms and Privacy controls');
assert.ok(!enquiry.includes('name="marketing"'),'Contact Us omits optional marketing consent');
const collections=await fs.readFile('dist/collections.html','utf8');
for(const group of ['table','wall','floral-club','bespoke'])assert.ok(collections.includes(`data-collection="`)&&collections.includes(group),`Collection group ${group} is represented`);
const sitemap=await fs.readFile('dist/sitemap.xml','utf8');
assert.ok(sitemap.includes('/about'),'About is present in the sitemap');
for(const item of media){if(item.id!=='house-compositions-film')assert.ok(allPages.includes(item.id),`Asset ${item.id} used`);assert.ok(item.rights.includes('Owner confirmed'));}
console.log(`Checked ${files.length} routes, ${checked} local references and all ${media.length} media assets.`);
