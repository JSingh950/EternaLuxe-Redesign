import fs from 'node:fs/promises';
import sharp from 'sharp';
import {concepts} from '../src/concepts.mjs';
await fs.mkdir('dist/assets/concepts',{recursive:true});
for(const item of concepts){
 for(const width of [480,960])await sharp(`assets/concepts/${item.id}.png`).resize({width,withoutEnlargement:true}).webp({quality:85}).toFile(`dist/assets/concepts/${item.id}-${width}.webp`);
}
