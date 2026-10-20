import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.avif':'image/avif','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const relative=url.pathname==='/'?'index.html':url.pathname.replace(/^\//,'');
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep))throw Error('Invalid path');
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(4189,'127.0.0.1',resolve));

const pages=(await fs.readdir(root)).filter(name=>name.endsWith('.html')).filter(name=>!['ikebana.html','arrangements.html','bespoke-events.html','accesibility.html'].includes(name));
const viewports=[[375,812],[768,1024],[1440,1000],[1920,1080]];
const browser=await chromium.launch({headless:true});
const failures=[];

try{
  for(const file of pages){
    for(const [width,height] of viewports){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
      const errors=[];page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('404 (Not Found)'))errors.push(message.text());});
      await page.goto(`http://127.0.0.1:4189/${file}`,{waitUntil:'networkidle'});
      await page.evaluate(async()=>{
        const step=Math.max(320,innerHeight*.72);
        for(let y=0;y<document.documentElement.scrollHeight;y+=step){scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,35));}
        scrollTo(0,0);await new Promise(resolve=>setTimeout(resolve,80));
      });
      const report=await page.evaluate(()=>{
        const visible=element=>{const style=getComputedStyle(element),rect=element.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;};
        const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
        const clipped=[];
        for(const element of document.querySelectorAll('h1,h2,h3,[data-content-safe]')){
          if(!visible(element))continue;
          const rect=element.getBoundingClientRect();
          if(rect.left<-.5||rect.right>innerWidth+.5)clipped.push(`${element.tagName}.${element.className||''}: horizontal`);
          let parent=element.parentElement;
          while(parent&&parent!==document.body){
            const style=getComputedStyle(parent);
            if(['hidden','clip'].includes(style.overflow)||['hidden','clip'].includes(style.overflowX)||['hidden','clip'].includes(style.overflowY)){
              const outer=parent.getBoundingClientRect();
              if(rect.left<outer.left-1||rect.right>outer.right+1||rect.top<outer.top-1||rect.bottom>outer.bottom+1){clipped.push(`${element.tagName}.${element.className||''}: clipped by .${parent.className||parent.tagName}`);break;}
            }
            parent=parent.parentElement;
          }
        }
        const collisions=[];
        const decorative=[...document.querySelectorAll('[data-decorative-plane]')].filter(visible).map(element=>({element,rect:element.getBoundingClientRect()}));
        for(const safe of document.querySelectorAll('[data-content-safe]')){
          if(!visible(safe))continue;const rect=safe.getBoundingClientRect();
          for(const decor of decorative)if(intersects(rect,decor.rect))collisions.push(`${safe.className||safe.tagName} with ${decor.element.className}`);
        }
        const cards=[];
        for(const card of document.querySelectorAll('.collection-item:not([hidden])')){
          const image=card.querySelector('.collection-photo'),caption=card.querySelector('.item-caption');
          if(!image||!caption||!visible(card))continue;
          const a=image.getBoundingClientRect(),b=caption.getBoundingClientRect();
          if(a.width<2||a.height<2||b.top-a.bottom>45)cards.push(card.querySelector('h3')?.textContent?.trim()||'unnamed card');
        }
        return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,clipped:[...new Set(clipped)],collisions:[...new Set(collisions)],cards:[...new Set(cards)]};
      });
      if(report.overflow>1||report.clipped.length||report.collisions.length||report.cards.length||errors.length)failures.push({file,width,report,errors});
      await page.close();
    }
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1;}
else console.log(`Layout-safe: ${pages.length} routes across ${viewports.length} viewport sizes.`);
