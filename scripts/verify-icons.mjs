import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Copyright is ordinary legal text; all other pictographs and arrow glyphs must
// be SVG geometry so platform emoji fonts cannot change their appearance.
let icons=0;
for(const file of (await fs.readdir('dist')).filter(file=>file.endsWith('.html'))){
  const html=await fs.readFile(`dist/${file}`,'utf8');
  assert(!/[\p{Extended_Pictographic}\u2190-\u21ff]/u.test(html.replaceAll('©','')),`${file}: emoji-capable glyph found`);
  for(const svg of html.matchAll(/<svg class="arrow-icon"[^>]*>/g)){
    assert(svg[0].includes('aria-hidden="true"')&&svg[0].includes('focusable="false"'),`${file}: decorative icon accessibility`);
    icons++;
  }
}
assert(icons>0,'Expected geometric arrows');
console.log(`Verified ${icons} SVG arrows; no emoji-capable arrow glyphs or pictographs in public HTML.`);
