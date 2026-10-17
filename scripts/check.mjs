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
}
const media=JSON.parse(await fs.readFile('src/media-manifest.json'));assert.equal(media.length,images.length+videos.length);
const allPages=(await Promise.all(files.map(f=>fs.readFile('dist/'+f,'utf8')))).join('\n');
const house=await fs.readFile('dist/house.html','utf8');
assert.ok(house.includes('data-video="orchid-film"'),'House opens with the supplied orchid film');
assert.ok(house.includes('data-video="house-compositions-film"'),'House includes its composition film');
assert.ok(!house.includes('house-origin-film'),'Rejected dark opening is not served on the House page');
for(const item of media){assert.ok(allPages.includes(item.id),`Asset ${item.id} used`);assert.ok(item.rights.includes('Owner confirmed'));}
console.log(`Checked ${files.length} routes, ${checked} local references and all ${media.length} media assets.`);
