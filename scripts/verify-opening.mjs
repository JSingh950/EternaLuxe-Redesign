import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.TEST_URL||'http://localhost:4173';
const browser=await chromium.launch({headless:true});
const allowCookies=()=>localStorage.setItem('eternaluxe-privacy-v1',JSON.stringify({necessary:true,analytics:false,preferences:false,advertising:false,version:'2026-10-16',expiresAt:Date.now()+86400000}));

try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(allowCookies);
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'networkidle'});
  assert.deepEqual(await page.locator('[data-venue] .venue-layer').evaluateAll(layers=>layers.map(e=>e.dataset.scenePiece).sort()),[
    'garden-console','garden-pedestal','garden-table','garden-wall','moss','signature-console','signature-pedestal','signature-table'
  ],'venue includes only the six approved arrangements and two approved wall artworks');
  assert.equal(await page.locator('[data-venue-set]').count(),2,'only two approved editions are selectable');
  const opening=page.locator('[data-floral-opening]');
  assert.equal(await opening.isVisible(),true,'first visit shows the floral opening');
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('floral-opening-active')),true,'opening locks the underlying site');
  assert.equal(await page.locator('.site-header').evaluate(e=>getComputedStyle(e).visibility),'hidden','site navigation stays behind the opening');
  assert.equal(await page.evaluate(()=>scrollY),0,'virtual scroll leaves the venue anchored at the top');
  await page.mouse.wheel(0,520);await page.waitForTimeout(480);
  assert.notEqual(await page.locator('.floral-spiral-layer--outer').evaluate(e=>getComputedStyle(e).transform),'none','scroll separates the floral layers');
  for(const selector of ['.venue-table','.venue-console','.venue-pedestal','.venue-moss']){
    assert.equal(await page.locator(selector).evaluate(e=>getComputedStyle(e).opacity),'1','original pieces are composed behind the opening');
  }
  assert.equal(await page.evaluate(()=>gsap.globalTimeline.getChildren().find(t=>t.repeat?.()===-1&&t.getChildren?.().some(c=>c.targets?.().some(e=>document.querySelector('[data-venue]').contains(e))))?.paused()),true,'venue cycle waits while the floral opening is active');
  for(let i=0;i<5;i++)await page.mouse.wheel(0,320);
  await page.waitForTimeout(1100);
  assert.equal(await opening.isHidden(),true,'scroll completes and removes the opening');
  assert.equal(await page.locator('.venue-moss').evaluate(e=>getComputedStyle(e).opacity),'1','entry reveals the supplied moss wall immediately');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('eternaluxe-opening-v1')),'complete','completion is stored for the session');
  assert.equal(await page.evaluate(()=>scrollY),0,'completion does not jump the page');
  assert.equal(await page.locator('.site-header').evaluate(e=>getComputedStyle(e).visibility),'visible','header returns without another click');
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('floral-opening-active')),false,'opening releases the page immediately');
  await page.mouse.wheel(0,520);await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>scrollY>0),true,'the next scroll moves the homepage without an intervening click');
  await page.evaluate(()=>scrollTo(0,0));
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await opening.isHidden(),true,'repeat visits in the same session open directly to the venue');
  const hero=await page.locator('.venue-hero').boundingBox();
  const desktopScene=await page.locator('.venue-table').boundingBox();
  assert.equal(Math.abs(desktopScene.width/desktopScene.height-2)<.01,true,'desktop venue preserves the entire 2:1 camera frame');
  assert.equal(Math.abs(hero.height-1000)<2,true,'desktop venue fills the viewport');
  assert.equal(await page.locator('.venue-caption').count(),0,'homepage hero copy is removed');
  await context.close();

  const openingContext=await browser.newContext({viewport:{width:768,height:900}});
  await openingContext.addInitScript(allowCookies);
  const openingPage=await openingContext.newPage();await openingPage.goto(base,{waitUntil:'networkidle'});
  assert.equal(await openingPage.locator('[data-opening-skip]').count(),0,'floral opening skip control is removed');
  await openingContext.close();

  const reduced=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
  await reduced.addInitScript(allowCookies);
  const reducedPage=await reduced.newPage();await reducedPage.goto(base,{waitUntil:'networkidle'});
  assert.equal(await reducedPage.getByRole('button',{name:'Enter site'}).isVisible(),true,'reduced motion uses a manual Enter action');
  await reducedPage.mouse.wheel(0,1200);await reducedPage.waitForTimeout(150);
  assert.equal(await reducedPage.locator('[data-floral-opening]').isVisible(),true,'reduced motion does not scrub the composition');
  await reducedPage.getByRole('button',{name:'Enter site'}).click();await reducedPage.waitForTimeout(650);
  assert.equal(await reducedPage.locator('[data-floral-opening]').isHidden(),true,'manual reduced-motion entry works');
  await reduced.close();

  const touch=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
  await touch.addInitScript(allowCookies);
  const touchPage=await touch.newPage();await touchPage.goto(base,{waitUntil:'networkidle'});
  await touchPage.evaluate(()=>{
    const target=document.querySelector('[data-floral-opening]');
    let y=710;
    const send=(type,next)=>{
      const point=new Touch({identifier:1,target,clientX:190,clientY:next,pageX:190,pageY:next,screenX:190,screenY:next});
      target.dispatchEvent(new TouchEvent(type,{touches:type==='touchend'?[]:[point],changedTouches:[point],bubbles:true,cancelable:true}));
    };
    send('touchstart',y);
    for(let i=0;i<7;i++){y-=95;send('touchmove',y);}
    send('touchend',y);
  });
  await touchPage.waitForTimeout(1100);
  assert.equal(await touchPage.locator('[data-floral-opening]').isHidden(),true,'touch swipes complete the mobile opening');
  assert.equal(await touchPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile opening has no horizontal overflow');
  const mobileHero=await touchPage.locator('.venue-hero').boundingBox();
  const mobileScene=await touchPage.locator('.venue-table').boundingBox();
  assert.equal(Math.abs(mobileScene.width/mobileScene.height-2)<.01,true,'mobile venue preserves the full room without cropping');
  assert.equal(Math.abs(mobileHero.height-812)<2,true,'mobile venue fills the viewport');
  assert.equal(await touchPage.locator('.venue-caption').count(),0,'mobile homepage hero copy is removed');
  await touch.close();

  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});
  const staticPage=await nojs.newPage();await staticPage.goto(base,{waitUntil:'networkidle'});
  await staticPage.locator('[data-floral-opening]').waitFor({state:'hidden'});
  assert.equal(await staticPage.locator('[data-floral-opening]').isHidden(),true,'no-JavaScript fallback never blocks the website');
  assert.equal(await staticPage.locator('.venue-scene').isVisible(),true,'no-JavaScript fallback exposes the venue');
  await nojs.close();

  console.log('Spiral opening first visit, session, scroll, reduced motion, touch and no-JavaScript checks passed.');
}finally{await browser.close();}
