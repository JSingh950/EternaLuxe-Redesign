import fs from 'node:fs/promises';
import sharp from 'sharp';
await fs.mkdir('dist/assets/brand',{recursive:true});
await fs.mkdir('dist/assets/scene',{recursive:true});
for(const tone of ['white','champagne']) await sharp(`assets/brand/logo-${tone}.png`).trim().png().toFile(`dist/assets/brand/logo-${tone}.png`);
for(const weight of [400,600]) await fs.copyFile(`node_modules/@fontsource/nunito-sans/files/nunito-sans-latin-${weight}-normal.woff2`,`dist/assets/fonts/nunito-sans-latin-${weight}-normal.woff2`);
await fs.copyFile('node_modules/@fontsource/nunito-sans/LICENSE','dist/assets/fonts/nunito-sans-LICENSE.txt');
const source='assets/brand/venue-additions.png';
const moss=await sharp(source).extract({left:0,top:0,width:750,height:887}).png().toBuffer();
const table=await sharp(source).extract({left:850,top:90,width:924,height:797}).png().toBuffer();
const blank={create:{width:1774,height:887,channels:4,background:'#00000000'}};
const layers={room:await sharp('assets/brand/venue-room.webp').png().toBuffer(),table:await sharp(blank).composite([{input:table,left:880,top:0}]).png().toBuffer(),moss:await sharp(blank).composite([{input:moss,left:0,top:0}]).png().toBuffer()};
const extras=await sharp('assets/brand/venue-extra-arrangements.png').resize(1774,887).png().toBuffer();
const consoleFlowers=await sharp(extras).extract({left:650,top:100,width:450,height:330}).png().toBuffer();
const pedestalFlowers=await sharp(extras).extract({left:1450,top:100,width:324,height:340}).png().toBuffer();
layers.console=await sharp(blank).composite([{input:consoleFlowers,left:730,top:80}]).png().toBuffer();
layers.pedestal=await sharp(blank).composite([{input:pedestalFlowers,left:1462,top:67}]).png().toBuffer();
for(const [name,buffer]of Object.entries(layers)) {
 await sharp(buffer).webp({quality:92}).toFile(`dist/assets/scene/${name}.webp`);
 await sharp(buffer).extract({left:0,top:30,width:1774,height:820}).resize(1200).webp({quality:90}).toFile(`dist/assets/scene/${name}-mobile.webp`);
}
await sharp(layers.room).composite([{input:layers.console},{input:layers.pedestal},{input:layers.table},{input:layers.moss}]).jpeg({quality:92}).toFile('dist/assets/scene/composed.jpg');
