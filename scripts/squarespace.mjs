import fs from 'node:fs/promises';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';
const base=process.env.ASSET_BASE;
if(!base||!/^https:\/\//.test(base))throw Error('Set ASSET_BASE to the HTTPS URL hosting the contents of dist/assets (without a trailing slash).');
const origin=base.replace(/\/$/,'');const destination=process.env.INTEGRATION_OUTPUT||'integration/squarespace';
await fs.mkdir(destination,{recursive:true});
const css=await fs.readFile('src/styles.css','utf8');
const output=await postcss([prefixer({prefix:'.eternaluxe',transform(prefix,selector){
 if(selector===':root'||selector==='body'||selector==='html')return prefix;
 if(selector.startsWith('body')||selector.startsWith('html'))return selector.replace(/^(body|html)/,prefix);
 return `${prefix} ${selector}`;
}})]).process(css,{from:undefined});
await fs.writeFile(`${destination}/eternaluxe.css`,output.css.replaceAll("url('fonts/",`url('${origin}/fonts/`));
const files=(await fs.readdir('dist')).filter(f=>f.endsWith('.html'));
for(const file of files){
 const html=await fs.readFile(`dist/${file}`,'utf8');if(html.includes('http-equiv="refresh"'))continue;
 const attrs=html.match(/<body([^>]*)>/)[1];let body=html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
 body=body.replace(/<script[\s\S]*?<\/script>/g,'').replaceAll('assets/',origin+'/').replace(/href="([a-z-]+)\.html([^\"]*)"/g,(_,slug,extra)=>`href="${slug==='index'?'/':'/'+slug}${extra}"`);
 await fs.writeFile(`${destination}/${file.replace('.html','-block.html')}`,`<div class="eternaluxe" ${attrs.trim()}>${body}</div>`);
}
// Runtime URLs are resolved against the asset host, while routes remain native Squarespace paths.
let js=await fs.readFile('src/site.js','utf8');js=js.replaceAll('assets/media/',origin+'/media/').replaceAll('assets/catalog.json',origin+'/catalog.json').replace(/([a-z-]+)\.html/g,'/$1').replace('`product-${p.id}.html`','`/product-${p.id}`');
await fs.writeFile(`${destination}/eternaluxe.js`,js);
console.log(`Created scoped CSS, script and ${files.length-3} page blocks in ${destination}. Install only after configuring the native commerce blocks and API origin.`);
