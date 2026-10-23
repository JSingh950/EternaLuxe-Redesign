import fs from 'node:fs/promises';
import sharp from 'sharp';
import {projectWall} from './project-wall.mjs';
await fs.mkdir('dist/assets/brand',{recursive:true});
await fs.mkdir('dist/assets/scene',{recursive:true});
for(const variant of ['desktop','mobile']){
 await sharp(`assets/brand/venue-extended-${variant}.png`).webp({quality:93,smartSubsample:true}).toFile(`dist/assets/scene/venue-extended-${variant}.webp`);
}
for(const tone of ['white','champagne']) await sharp(`assets/brand/logo-${tone}.png`).trim().png().toFile(`dist/assets/brand/logo-${tone}.png`);
await sharp('assets/brand/ceo-acero.jpeg').resize({width:900,withoutEnlargement:true}).webp({quality:92}).toFile('dist/assets/brand/ceo-acero.webp');
await sharp('assets/brand/partner-ramirez.jpg').resize({width:900,withoutEnlargement:true}).webp({quality:92}).toFile('dist/assets/brand/partner-ramirez.webp');
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
// Owner's moss-wall design, isolated from the supplied installation photograph.
// Follow the wall's converging edges instead of tilting both edges with a shear.
const mossCutout=await sharp('assets/brand/venue-owner-moss-wall-v2.png').trim({threshold:10}).png().toBuffer();
const moss=await projectWall(mossCutout);
const table=await sharp(source).extract({left:850,top:90,width:924,height:797}).png().toBuffer();
const blank={create:{width:1774,height:887,channels:4,background:'#00000000'}};
// The supplied cutouts carry a bright red chroma-key fringe around a few
// frames. Remove only those highly saturated edge pixels; the darker burgundy
// botanicals remain untouched, while the wall objects sit cleanly on the room.
const cleanCutout=async input=>{
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<data.length;i+=4){
  const r=data[i],g=data[i+1],b=data[i+2];
  if(r>190&&g<72&&b<72)data[i+3]=0;
 }
 return sharp(data,{raw:info}).png().toBuffer();
};
const layers={room:await sharp('assets/brand/venue-room.webp').png().toBuffer(),table:await sharp(blank).composite([{input:table,left:880,top:0}]).png().toBuffer(),moss};
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
  const crop=await cleanCutout(await sharp(sheet).extract(rect).png().toBuffer());
  const {data,info}=await sharp(crop).trim({threshold:10}).resize({width,height,fit:'inside'}).png().toBuffer({resolveWithObject:true});
  const left=Math.round(cx-info.width/2), top=base-info.height+shadow;
  if(part==='wall'){
   if(palette==='jewel'){
    // Rectify the perspective already baked into each source frame before
    // projecting all three onto the room's near-frontal wall plane.
    const sources=[
     {left:198,right:378,topLeft:28,topRight:51,bottomLeft:417,bottomRight:410},
     {left:394,right:565,topLeft:49,topRight:68,bottomLeft:406,bottomRight:399},
     {left:580,right:737,topLeft:68,topRight:86,bottomLeft:398,bottomRight:390}
    ];
    const cleanSheet=await cleanCutout(sheet);
    const panels=await Promise.all(sources.map((source,index)=>{
     const x=153+index*150;
     return projectWall(cleanSheet,{left:x,right:x+136,topLeft:111-index*3,topRight:108-index*3,bottomLeft:403-index*3,bottomRight:400-index*3,source});
    }));
    layers['jewel-wall']=await sharp(blank).composite(panels.map(input=>({input}))).png().toBuffer();
    continue;
   }
   // Give the installation the same slight architectural pitch as the wall,
   // then anchor it as one clean mounted piece.
   const angled=await sharp(data).rotate(palette==='jewel'?1:-1,{background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
   layers[`${palette}-${part}`]=await sharp(blank).composite([{input:angled,left,top}]).png().toBuffer();
  }else{
   layers[`${palette}-${part}`]=await sharp(blank).composite([{input:data,left,top}]).png().toBuffer();
  }
 }
}
for(const [name,buffer]of Object.entries(layers)) {
 await sharp(buffer).webp({quality:92}).toFile(`dist/assets/scene/${name}.webp`);
 // Keep the entire camera plane on mobile; every layer must have the same crop.
 await sharp(buffer).resize(1200,600).webp({quality:92,alphaQuality:100}).toFile(`dist/assets/scene/${name}-mobile.webp`);
}
for(const palette of ['coral','jewel'])await sharp(layers.room).composite(['wall','console','pedestal','table'].map(part=>({input:layers[`${palette}-${part}`]}))).jpeg({quality:92}).toFile(`dist/assets/scene/composed-${palette}.jpg`);
await sharp(layers.room).composite([{input:layers.console},{input:layers.pedestal},{input:layers.table},{input:layers.moss}]).jpeg({quality:92}).toFile('dist/assets/scene/composed.jpg');
