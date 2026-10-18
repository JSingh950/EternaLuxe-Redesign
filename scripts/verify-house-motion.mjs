import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://localhost:4173';
for(const width of [375,768,1440,1920]){
 await page.setViewportSize({width,height:1000});await page.goto(base+'/house.html');
 if(await page.locator('.cookie-banner').isVisible())await page.locator('.cookie-banner [data-cookie=reject]').click();
 await page.locator('.house-motion').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await page.locator('.motion-group:not([aria-hidden]) figure').count(),19);
 const a=await page.locator('.motion-track').first().evaluate(e=>getComputedStyle(e).transform);
 await page.waitForTimeout(350);assert.notEqual(await page.locator('.motion-track').first().evaluate(e=>getComputedStyle(e).transform),a);
 await page.locator('[data-motion-toggle]').click();await page.waitForTimeout(100);
 const frozen=await page.locator('.motion-track').first().evaluate(e=>getComputedStyle(e).transform);
 await page.waitForTimeout(200);assert.equal(await page.locator('.motion-track').first().evaluate(e=>getComputedStyle(e).transform),frozen);
 assert.equal(await page.locator('[data-motion-video]').evaluateAll(v=>v.every(x=>x.paused)),true);
 await page.locator('.house-motion').screenshot({path:`/tmp/house-motion-${width}.png`});
}
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);assert.equal(await page.locator('.motion-canvas').evaluate(e=>e.classList.contains('is-static')),true);
await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-motion-toggle]').click();
await page.locator('h1').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
assert.equal(await page.locator('[data-motion-video]').evaluateAll(v=>v.every(x=>x.paused)),true);
const context=await browser.newContext({javaScriptEnabled:false});const fallback=await context.newPage();await fallback.goto(base+'/house.html');assert.equal(await fallback.locator('.motion-canvas.is-static').count(),1);await context.close();
assert.deepEqual(errors,[]);await browser.close();console.log('House motion: responsive layouts, 19 sources, drift, pause, reduced motion, offscreen films and no-JS passed.');
