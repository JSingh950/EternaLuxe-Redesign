import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const out=path.resolve(process.env.OUTPUT_DIR||'output/focused-floral-review-20261117');const beforeBase=process.env.BASELINE_URL||'http://127.0.0.1:4181';const draftBase=process.env.DRAFT_URL||'http://localhost:4173';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch();
const proposedCSS=`.house-motion,.architectural-ribbon{display:none!important}body[data-page="index"] .discovery-pair article:before{content:none!important}.discovery-pair article{border-top:0!important}.text-link{border-bottom:0!important;text-decoration:none!important}`;
async function open(base,route,preview=false,width=1440){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 await page.addInitScript(()=>{sessionStorage.setItem('eternaluxe-opening-v1','complete');localStorage.setItem('eternaluxe-privacy-v1',JSON.stringify({necessary:true,expiresAt:Date.now()+86400000}));});
 await page.goto(base+'/'+route+'.html',{waitUntil:'networkidle'});
 if(route==='collections')for(let n=0;n<5&&await page.locator('[data-show-more]').isVisible();n++)await page.locator('[data-show-more]').evaluate(button=>button.click());
 await page.addStyleTag({content:'.site-header,.skip-link,.cookie-banner{visibility:hidden!important}'+(preview?proposedCSS:'')});
 await page.evaluate(async()=>{for(const image of document.images){image.loading='eager';try{await image.decode()}catch{}}await document.fonts.ready;window.gsap?.set('[data-reveal]',{autoAlpha:1,y:0});window.gsap?.globalTimeline.pause();document.querySelectorAll('video').forEach(v=>v.pause());});
 return page;
}
async function mark(page,selector,label,mode='section'){await page.locator(selector).first().evaluate((e,{label,mode})=>{let r=e.getBoundingClientRect();if(mode==='rule')r={left:r.left,top:r.top,width:parseFloat(getComputedStyle(e,'::before').width)||r.width*.38,height:4};if(mode==='underline')r={left:r.left,top:r.bottom-2,width:r.width,height:4};const box=document.createElement('div');Object.assign(box.style,{position:'absolute',left:(r.left+scrollX)+'px',top:(r.top+scrollY)+'px',width:r.width+'px',height:Math.max(r.height,8)+'px',outline:'3px solid #a63e38',zIndex:9999,pointerEvents:'none'});const t=document.createElement('div');t.textContent=label;Object.assign(t.style,{position:'absolute',left:'0',top:'0',transform:'translateY(-100%)',background:'#a63e38',color:'white',font:'600 17px Arial',padding:'8px 12px',whiteSpace:'nowrap'});box.append(t);document.body.append(box);},{label,mode});}
async function crop(page,selector,file,margin=60,windowHeight){
 const r=await page.locator(selector).first().boundingBox();const height=await page.evaluate(()=>document.documentElement.scrollHeight);
 const scrollY=await page.evaluate(()=>window.scrollY);const y=Math.max(0,r.y+scrollY-margin);await page.screenshot({path:path.join(out,file),fullPage:true,clip:{x:0,y,width:page.viewportSize().width,height:Math.min(windowHeight||r.height+margin*2,height-y)}});
}
const items=[];
try{
 if(!process.argv.includes('--finish')){
 const home=await open(beforeBase,'index');
 await mark(home,'.house-motion','1 · HOME: moving gallery and its controls');await crop(home,'.house-motion','remove-1-before.png');
 await home.close();
 const h=await open(beforeBase,'house');await mark(h,'.house-motion','2 · THE HOUSE: moving gallery and its controls');await crop(h,'.house-motion','remove-2-before.png');await h.close();
 for(const [name,route,selector] of [['3a','index','.home-ribbon'],['3b','house','.house-ribbon'],['3c','house','.house-ikebana-ribbon']]){const p=await open(beforeBase,route);await mark(p,selector,name+' · DECORATIVE RIBBON');await crop(p,selector,'remove-'+name+'-before.png',160);await p.close();}
 for(const [number,selector,label]of [[4,'.discovery-pair','4 · SHORT RULES above these two text blocks'],[5,'.discovery-pair','5 · UNDERLINES below the two CTA links']]){const p=await open(beforeBase,'index');for(const [i,target]of (number===4?['.discovery-pair article:nth-child(1)','.discovery-pair article:nth-child(2)']:['.discovery-pair article:nth-child(1) .text-link','.discovery-pair article:nth-child(2) .text-link']).entries())await mark(p,target,number+'.'+(i+1)+(number===4?' · short rule':' · link underline'),number===4?'rule':'underline');await crop(p,selector,'remove-'+number+'-before.png',60);await p.close();}
 const afterHome=await open(draftBase,'index',true);await crop(afterHome,'.collection-section','remove-1-after.png',160);await crop(afterHome,'.discovery-pair','remove-3a-after.png',70);await crop(afterHome,'.discovery-pair','remove-4-after.png',60);await crop(afterHome,'.discovery-pair','remove-5-after.png',60);await afterHome.close();
 const afterHouse=await open(draftBase,'house',true);await crop(afterHouse,'#house-philosophy','remove-2-after.png',160);await crop(afterHouse,'#house-philosophy','remove-3b-after.png',100);await crop(afterHouse,'#ikebana','remove-3c-after.png',80,650);await afterHouse.close();
 for(const [key,selector]of [['frames','.editorial-collection'],['club','.club-feature']]){const before=await open(beforeBase,'index');await crop(before,selector,key+'-before.png',40);await before.close();const after=await open(draftBase,'index',true);await crop(after,selector,key+'-after.png',40);await after.close();}
 for(const width of [375,1440]){const p=await open(draftBase,'index',true,width);await crop(p,'.botanical-campaign','restored-scenes-'+width+'.png',24);await crop(p,'.club-feature','club-'+width+'.png',24);await p.screenshot({path:path.join(out,'homepage-proposed-'+width+'.png'),fullPage:true});await p.close();}

 }
 const cp=await open(draftBase,'collections',true);
 for(let n=0;n<5&&await cp.locator('[data-show-more]').isVisible();n++)await cp.locator('[data-show-more]').evaluate(button=>button.click());
 await cp.evaluate(()=>{window.gsap?.set('[data-reveal]',{autoAlpha:1,y:0});});
 await crop(cp,'.collection-grid','collections-all-after.png',24);
 for(const group of ['editorial','landscape','portrait'])await crop(cp,`[data-photo-layout="${group}"]`,'collections-'+group+'-after.png',24);
 await cp.close();
 const cv=await open(draftBase,'floral-club',true);await crop(cv,'.club-intro .film','club-video-after.png',24);await cv.close();
 // Preserve the previous draft in the before column for the requested revisions.
 const previous=path.resolve('output/focused-floral-review-20261116');
 await fs.copyFile(path.join(previous,'frames-after.png'),path.join(out,'frames-before.png'));
 await fs.copyFile(path.join(previous,'club-after.png'),path.join(out,'club-before.png'));
 await fs.copyFile(path.join(previous,'restored-scenes-1440.png'),path.join(out,'scenes-before.png'));
}finally{await browser.close();}
console.log('Created marked before/after screenshots at '+out);
