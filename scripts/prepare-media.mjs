import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import {images,videos} from '../src/media.mjs';
const input=process.env.MEDIA_INPUT || '/Users/jeeyanmhajan/Downloads';
const originals='assets/source-media';
const out='dist/assets/media';
const compositionFrames=['branch-study','amber-composition','window-garden','plum-study','garden-light','branch-study'];
await fs.mkdir(originals,{recursive:true}); await fs.mkdir(out,{recursive:true});
const register=[];
for(const item of images){
  const dest=path.join(originals,item.id+path.extname(item.original).toLowerCase());
  try{await fs.access(dest)}catch{await fs.copyFile(path.join(input,item.original),dest)}
  const meta=await sharp(dest).metadata();
  const widths=[480,800,1280,1920,2560].filter(w=>w<=meta.width);
  const largest=Math.min(meta.width,2560);
  if(largest>1920&&!widths.includes(largest))widths.push(largest);
  if(!widths.includes(meta.width)&&meta.width<800) widths.push(meta.width);
  for(const w of widths){
    for(const format of ['webp','avif']){
      const filename=`${out}/${item.id}-${w}.${format}`;
      await sharp(dest).rotate().resize({width:w,withoutEnlargement:true,kernel:'lanczos3'}).toColourspace('srgb').sharpen({sigma:.45,m1:.55,m2:.25}).toFormat(format,{quality:format==='avif'?70:88,effort:5}).toFile(filename);
    }
  }
  await sharp(dest).rotate().resize({width:Math.min(1920,meta.width),withoutEnlargement:true,kernel:'lanczos3'}).toColourspace('srgb').sharpen({sigma:.45,m1:.55,m2:.25}).jpeg({quality:91,mozjpeg:true}).toFile(`${out}/${item.id}.jpg`);
  register.push({...item,width:meta.width,height:meta.height,widths,rights:'Owner confirmed commercial web rights, 2026-10-16',originalPath:dest,focalPoint:'50% 50%'});
  console.log(`Prepared ${item.id}`);
}
for(const item of videos){
  const dest=`${originals}/${item.id}${path.extname(item.original).toLowerCase()}`;
  try{await fs.access(dest)}catch{
    if(item.sourceUrl)execFileSync(ffmpeg,['-y','-allowed_extensions','ALL','-i',item.sourceUrl,'-c','copy','-movflags','+faststart',dest],{stdio:['ignore','ignore','pipe']});
    else await fs.copyFile(path.join(input,item.original),dest);
  }
  for(const format of ['mp4','webm']){
    const output=`${out}/${item.id}.${format}`;
    if(item.id==='house-compositions-film'){
      const seconds=6,fade=1.2,fps=30;
      const inputs=compositionFrames.flatMap(id=>['-loop','1','-t',String(seconds),'-i',`${originals}/${id}${path.extname(images.find(image=>image.id===id).original).toLowerCase()}`]);
      const prepared=compositionFrames.map((_,index)=>`[${index}:v]scale=1600:1200:force_original_aspect_ratio=increase,crop=1600:1200,zoompan=z='${index===compositionFrames.length-1?'1':`min(zoom+0.00022,1.04)`}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${seconds*fps}:s=1440x1080:fps=${fps},trim=duration=${seconds},setpts=PTS-STARTPTS[v${index}]`);
      let previous='v0';
      for(let index=1;index<compositionFrames.length;index++){
        const next=index===compositionFrames.length-1?'film':`x${index}`;
        prepared.push(`[${previous}][v${index}]xfade=transition=fade:duration=${fade}:offset=${(seconds-fade)*index}[${next}]`);
        previous=next;
      }
      const codec=format==='mp4'?['-c:v','libx264','-crf','18','-preset','slow','-movflags','+faststart']:['-c:v','libvpx-vp9','-crf','25','-b:v','0','-deadline','good','-cpu-used','2','-row-mt','1'];
      execFileSync(ffmpeg,['-y',...inputs,'-filter_complex',prepared.join(';'),'-map','[film]','-an','-map_metadata','-1','-pix_fmt','yuv420p',...codec,output],{stdio:['ignore','ignore','pipe']});
    }else{
      const duration=item.id==='house-film'?13:item.duration;
      const args=['-y',...(item.id==='house-film'?['-ss','6']:[]),'-i',dest,'-t',String(duration),'-an','-map_metadata','-1','-vf','setsar=1,format=yuv420p'];
      args.push(...(format==='mp4'?['-c:v','libx264','-crf','19','-preset','slow','-movflags','+faststart']:['-c:v','libvpx-vp9','-crf','28','-b:v','0','-deadline','good','-cpu-used','2','-row-mt','1']));
      execFileSync(ffmpeg,[...args,output],{stdio:['ignore','ignore','pipe']});
    }
  }
  const posterSource=item.id==='house-compositions-film'?`${out}/${item.id}.mp4`:dest;
  execFileSync(ffmpeg,['-y','-ss',item.id==='house-film'?'6':'0.2','-i',posterSource,'-frames:v','1','-q:v','2',`${out}/${item.id}-poster.jpg`],{stdio:['ignore','ignore','pipe']});
  register.push({...item,rights:'Owner confirmed commercial web rights, 2026-10-16',originalPath:dest});
  console.log(`Prepared ${item.id}`);
}
await fs.writeFile('src/media-manifest.json',JSON.stringify(register,null,2)+'\n');
const csv=['asset_filename,source_filename,owner,permission,usage_scope,confirmation_date,provenance,status',...register.map(i=>[i.id,i.original,'Eternaluxe','User confirmation in project conversation','Commercial website and campaign use','2026-10-16',i.provenance||'Owner supplied; photographer not specified','APPROVED FOR PRODUCTION'].map(v=>'"'+v.replaceAll('"','""')+'"').join(','))].join('\n');
await fs.writeFile('image-rights-register.csv',csv+'\n');
await fs.mkdir('dist/assets/fonts',{recursive:true});
for(const [family,files] of Object.entries({'cormorant-garamond':['latin-400-normal','latin-400-italic'],'manrope':['latin-400-normal','latin-500-normal']})){
 for(const file of files) await fs.copyFile(`node_modules/@fontsource/${family}/files/${family}-${file}.woff2`,`dist/assets/fonts/${family}-${file}.woff2`);
 await fs.copyFile(`node_modules/@fontsource/${family}/LICENSE`,`dist/assets/fonts/${family}-LICENSE.txt`);
}
