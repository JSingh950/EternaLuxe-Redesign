import sharp from 'sharp';
import fs from 'node:fs/promises';
import {projectWall} from './project-wall.mjs';

// One camera plane for furniture, objects, and shadow geometry.
const blank={create:{width:1774,height:887,channels:4,background:'#00000000'}};
const extensionPlane=await sharp('assets/brand/venue-warm-extension.png').resize(1774,2365).png().toBuffer();
const room=await sharp(extensionPlane).extract({left:0,top:732,width:1774,height:887}).webp({quality:93}).toBuffer();
await fs.writeFile('dist/assets/scene/room.webp',room);
await fs.writeFile('dist/assets/scene/warm-room.webp',room);
// Full-width artwork is centered in extended architecture on tall screens.
for(const variant of ['desktop','mobile']){
 const height=variant==='mobile'?3840:2395;
 const top=Math.round((height-887)/2),bottom=height-887-top;
 const ceiling=await sharp(extensionPlane).extract({left:0,top:0,width:1774,height:732}).resize(1774,top,{fit:'fill'}).png().toBuffer();
 const floor=await sharp(extensionPlane).extract({left:0,top:1619,width:1774,height:746}).resize(1774,bottom,{fit:'fill'}).png().toBuffer();
 await sharp({create:{width:1774,height,channels:3,background:'#bda482'}}).composite([{input:ceiling,left:0,top:0},{input:await sharp(room).png().toBuffer(),left:0,top},{input:floor,left:0,top:top+887}]).webp({quality:92}).toFile(`dist/assets/scene/venue-extended-${variant}.webp`);
}
const sets={signature:[['console',1,155,175,285,455],['pedestal',2,195,215,1632,450],['table',3,260,310,1070,651]],garden:[['console',4,155,175,285,455],['pedestal',6,175,235,1632,450],['table',5,340,320,1070,651]]};
const layers={};
for(const [edition,parts] of Object.entries(sets)){
 for(const [part,number,width,height,cx,base] of parts){
  const {data,info}=await sharp(`assets/brand/owner-arrangement-${number}.png`).trim({threshold:8}).resize({width,height,fit:'inside'}).modulate({brightness:.97,saturation:.98}).png().toBuffer({resolveWithObject:true});
  const raw=await sharp(data).ensureAlpha().raw().toBuffer();let weight=0,foot=0;
  for(let y=info.height-5;y<info.height;y++)for(let x=0;x<info.width;x++){const a=raw[(y*info.width+x)*4+3]/255;weight+=a;foot+=x*a;}
  layers[`${edition}-${part}`]=await sharp(blank).composite([{input:data,left:Math.round(cx-(weight?foot/weight:info.width/2)),top:base-info.height}]).webp({quality:93,alphaQuality:100}).toBuffer();
 }
 const input=edition==='signature'?'venue-owner-moss-wall-v2.png':'venue-garden-wall-art.png';
 const art=await sharp(`assets/brand/${input}`).trim({threshold:8}).resize(480,220,{fit:'contain',background:'#00000000'}).png().toBuffer();
 const mounted=await projectWall(art,{left:100,right:580,topLeft:50,topRight:50,bottomLeft:270,bottomRight:270});
 layers[edition==='signature'?'moss':'garden-wall']=await sharp(mounted).webp({quality:93,alphaQuality:100}).toBuffer();
}
for(const [name,input] of Object.entries(layers)){
 await fs.writeFile(`dist/assets/scene/${name}.webp`,input);
 await sharp(input).resize(1200,600).webp({quality:93,alphaQuality:100}).toFile(`dist/assets/scene/${name}-mobile.webp`);
}
