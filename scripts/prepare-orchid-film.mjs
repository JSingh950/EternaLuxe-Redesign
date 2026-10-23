import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

// Preserve the owner-supplied master; omit its logo/title-card outro from web copies.
const source='assets/source-media/orchid-film.mov';
const stamp=Math.max((await fs.stat(source)).mtimeMs,(await fs.stat(new URL(import.meta.url))).mtimeMs);
for(const format of ['mp4','webm']){
 const output=`dist/assets/media/orchid-film.${format}`;
 const existing=await fs.stat(output).catch(()=>null);
 if(existing&&existing.mtimeMs>stamp)continue;
 const codec=format==='mp4'
  ?['-c:v','libx264','-crf','19','-preset','slow','-movflags','+faststart']
  :['-c:v','libvpx-vp9','-crf','28','-b:v','0','-deadline','good','-cpu-used','2','-row-mt','1'];
 execFileSync(ffmpeg,['-y','-i',source,'-t','6.5','-an','-map_metadata','-1','-vf','setsar=1,format=yuv420p',...codec,output],{stdio:['ignore','ignore','pipe']});
}
