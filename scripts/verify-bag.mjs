import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>localStorage.setItem('eternaluxe-privacy-v1',JSON.stringify({necessary:true,expiresAt:Date.now()+86400000})));
 await page.route('**/api/config',route=>route.fulfill({json:{deliveryReady:false}}));
 await page.goto('http://localhost:4173/product-royal.html');
 await page.waitForFunction(()=>document.querySelector('[data-bag-content]').childElementCount>0);
 await page.getByRole('button',{name:'Add to bag',exact:true}).click();
 const drawer=page.locator('#bag-dialog');await drawer.waitFor({state:'visible'});
 assert.match(await drawer.innerText(),/The Royal/);
 await drawer.getByRole('spinbutton').fill('2');await drawer.getByRole('spinbutton').press('Tab');
 await drawer.getByRole('link',{name:'View your bag',exact:true}).click();
 await page.locator('main .bag-item').waitFor();
 assert.equal(await page.locator('main input[type=number]').inputValue(),'2');
 await page.locator('main').getByRole('link',{name:'Enquire about these pieces'}).click();
 await page.waitForFunction(()=>document.querySelector('[name=message]').value.includes('The Royal × 2'));
 assert.equal(await page.locator('[data-contact-email]').getAttribute('data-contact-email'),'info@eternaluxenet.com');
 assert.equal(await page.getByRole('button',{name:'Continue to email'}).count(),1);
 await page.goto('http://localhost:4173/bag.html');await page.locator('main .bag-item').waitFor();
 await page.locator('main').getByRole('button',{name:'Remove The Royal'}).click();
 assert.match(await page.locator('main').innerText(),/Your bag is empty/);
 for(const width of [375,768,1440,1920]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);
 console.log('Independent bag add, quantity, persistence, removal, enquiry handoff, email fallback and responsive checks passed.');
}finally{await browser.close();}
