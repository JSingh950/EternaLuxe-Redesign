import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
export async function prepareOffline(){
  await fs.copyFile('src/offline.js','dist/assets/offline.js');
  const files=[];
  async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(/\.(html|js|css|json|svg|woff2|png|jpe?g|webp|avif|mp4|webm)$/.test(file)&&!file.endsWith('/sw.js'))files.push(file);}}
  await walk('dist');files.sort();
  const hash=createHash('sha256');
  for(const file of files){hash.update(file);hash.update(await fs.readFile(file));}
  const template=await fs.readFile('src/offline-worker.js','utf8');hash.update(template);
  await fs.writeFile('dist/sw.js',template.replace('__OFFLINE_VERSION__',hash.digest('hex').slice(0,16)).replace('__OFFLINE_FILES__',JSON.stringify(files.map(file=>'/'+file.slice(5)))));
}
