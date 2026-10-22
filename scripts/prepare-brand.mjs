import fs from 'node:fs/promises';
import sharp from 'sharp';
await fs.mkdir('dist/assets/brand',{recursive:true});
await fs.mkdir('dist/assets/scene',{recursive:true});
for(const tone of ['white','champagne']) await sharp(`assets/brand/logo-${tone}.png`).trim().png().toFile(`dist/assets/brand/logo-${tone}.png`);
await sharp('assets/brand/spiral-flower-master.png')
 .resize({width:1254,height:1254,fit:'inside',withoutEnlargement:true})
 .webp({quality:93,alphaQuality:100,smartSubsample:true})
 .toFile('dist/assets/brand/spiral-flower.webp');
await sharp('assets/brand/spiral-flower-master.png')
 .resize({width:860,height:860,fit:'inside',withoutEnlargement:true})
 .webp({quality:91,alphaQuality:100,smartSubsample:true})
 .toFile('dist/assets/brand/spiral-flower-mobile.webp');
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
// Extract independent, transparent generated objects; anchor vase feet to the same surfaces.
const placements={
 coral:[
  ['wall',{left:0,top:0,width:870,height:445},480,300,370,355,0],
  ['table',{left:900,top:0,width:874,height:444},500,350,1285,475,6],
  ['console',{left:200,top:450,width:520,height:437},220,210,940,365,4],
  ['pedestal',{left:1060,top:450,width:650,height:437},190,200,1650,374,4]
 ],
 jewel:[
  ['wall',{left:0,top:0,width:880,height:435},440,310,370,405,0],
  ['table',{left:900,top:0,width:874,height:440},500,340,1285,475,1],
  ['console',{left:0,top:440,width:880,height:447},220,210,940,365,1],
  ['pedestal',{left:1000,top:445,width:774,height:442},190,200,1650,374,1]
 ]
};
for(const [palette,objects] of Object.entries(placements)){
 const sheet=await sharp(`assets/brand/venue-${palette}-sheet.png`).resize(1774,887).png().toBuffer();
 for(const [part,rect,width,height,cx,base,shadow] of objects){
  const crop=await sharp(sheet).extract(rect).png().toBuffer();
  const {data,info}=await sharp(crop).trim({threshold:10}).resize({width,height,fit:'inside'}).png().toBuffer({resolveWithObject:true});
  layers[`${palette}-${part}`]=await sharp(blank).composite([{input:data,left:Math.round(cx-info.width/2),top:base-info.height+shadow}]).png().toBuffer();
 }
}
for(const [name,buffer]of Object.entries(layers)) {
 await sharp(buffer).webp({quality:92}).toFile(`dist/assets/scene/${name}.webp`);
 await sharp(buffer).extract({left:0,top:30,width:1774,height:820}).resize(1200).webp({quality:90}).toFile(`dist/assets/scene/${name}-mobile.webp`);
}
for(const palette of ['coral','jewel'])await sharp(layers.room).composite(['wall','console','pedestal','table'].map(part=>({input:layers[`${palette}-${part}`]}))).jpeg({quality:92}).toFile(`dist/assets/scene/composed-${palette}.jpg`);
await sharp(layers.room).composite([{input:layers.console},{input:layers.pedestal},{input:layers.table},{input:layers.moss}]).jpeg({quality:92}).toFile('dist/assets/scene/composed.jpg');
