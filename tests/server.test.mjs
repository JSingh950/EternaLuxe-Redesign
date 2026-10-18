import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createApp} from '../server.mjs';

test('privacy, forms, immutable evidence and static delivery',async t=>{
 const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'eternaluxe-test-'));
 const app=createApp({dataDir,origin:'http://localhost:4173'});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${app.server.address().port}`;
 t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));await fs.rm(dataDir,{recursive:true,force:true});});
 const response=await fetch(base+'/api/config');const config=await response.json();const cookie=response.headers.get('set-cookie').split(';')[0];
 const post=(route,data,origin='http://localhost:4173')=>fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json','Origin':origin,'Cookie':cookie},body:JSON.stringify({csrf:config.csrf,...data})});
 const values={email:'test@example.com',name:'Test Visitor',project:'Hospitality',location:'New York',message:'A test enquiry',terms:'on',privacy:'on'};
 await t.test('allows only the configured storefront in credentialed CORS',async()=>{
   const ok=await fetch(base+'/api/config',{headers:{Origin:'http://localhost:4173'}});
   assert.equal(ok.headers.get('access-control-allow-origin'),'http://localhost:4173');
   assert.equal(ok.headers.get('access-control-allow-credentials'),'true');
   const rejected=await fetch(base+'/api/config',{headers:{Origin:'https://attacker.example'}});
   assert.equal(rejected.status,403);assert.equal(rejected.headers.get('access-control-allow-origin'),null);
   const preflight=await fetch(base+'/api/forms',{method:'OPTIONS',headers:{Origin:'http://localhost:4173'}});
   assert.equal(preflight.status,204);
 });
 await t.test('rejects cross-origin and missing CSRF requests',async()=>{
   assert.equal((await post('/api/forms',{type:'enquiry',values,requestId:randomUUID()},'https://attacker.example')).status,403);
   assert.equal((await post('/api/forms',{csrf:'wrong',type:'enquiry',values,requestId:randomUUID()})).status,403);
   assert.equal((await post('/api/forms',{csrf:'é'.repeat(64),type:'enquiry',values,requestId:randomUUID()})).status,403);
 });
 await t.test('rejects malformed payloads, oversize fields and honeypot submissions',async()=>{
   const nullBody=await fetch(base+'/api/forms',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:4173',Cookie:cookie},body:'null'});
   assert.equal(nullBody.status,400);
   for(const invalid of [{message:'a'.repeat(4001)},{website:'bot.example'},{name:123}]){
     assert.equal((await post('/api/forms',{type:'enquiry',values:{...values,...invalid},requestId:randomUUID()})).status,400);
   }
 });
 await t.test('requires separate transactional checkboxes',async()=>{
   assert.equal((await post('/api/forms',{type:'enquiry',values:{...values,privacy:undefined},requestId:randomUUID()})).status,400);
 });
 let receipt;
 await t.test('records forms once and does not opt users into marketing',async()=>{
   const requestId=randomUUID();const r=await post('/api/forms',{type:'enquiry',values,requestId});assert.equal(r.status,201);
   const data=await r.json();receipt=data.receipt;assert.match(data.message,/Nothing was emailed/);
   assert.equal((await post('/api/forms',{type:'enquiry',values,requestId})).status,200);
   assert.equal(app.db.prepare('SELECT count(*) n FROM submissions').get().n,1);
   const event=app.db.prepare('SELECT * FROM consent_events').get();assert.equal(JSON.parse(event.states).marketing,false);
   assert.equal(JSON.parse(event.policies).privacy.sha256.length,64);
   const privacy=JSON.parse(event.policies).privacy;
   const snapshot=await fetch(base+'/assets/'+privacy.snapshot);assert.equal(snapshot.status,200);
   assert.throws(()=>app.db.exec("UPDATE consent_events SET kind='tampered'"),/immutable/);
 });
 await t.test('blocks analytics before consent and immediately after withdrawal',async()=>{
   const event={event:'product_view',page:'product-large',receipt};
   assert.equal((await post('/api/events',event)).status,403);
   assert.equal((await post('/api/consent',{receipt,choices:{analytics:true,preferences:false,advertising:false}})).status,200);
   assert.equal((await post('/api/events',event)).status,200);
   assert.equal((await post('/api/consent',{receipt,choices:{analytics:false,preferences:false,advertising:false}})).status,200);
   assert.equal((await post('/api/events',event)).status,403);
   const rows=app.db.prepare('SELECT * FROM consent_events ORDER BY rowid').all();assert.equal(rows[2].previous_hash,rows[1].event_hash);
 });
 await t.test('withdrawals do not require signing transactional policies',async()=>{
   const r=await post('/api/forms',{type:'withdrawal',values:{email:'test@example.com'},receipt,requestId:randomUUID()});assert.equal(r.status,201);
   const row=app.db.prepare('SELECT * FROM consent_events ORDER BY rowid DESC LIMIT 1').get();assert.equal(row.kind,'marketing-withdrawal');
 });
 await t.test('serves video ranges, security headers and permanent redirect',async()=>{
   const home=await fetch(base);assert.equal(home.status,200);assert.ok(home.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
   const range=await fetch(base+'/assets/media/house-film.mp4',{headers:{Range:'bytes=0-99'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,100);
   const redirect=await fetch(base+'/accesibility',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'/accessibility');
   for(const route of ['/ikebana','/ikebana.html']){const moved=await fetch(base+route,{redirect:'manual'});assert.equal(moved.status,301);assert.equal(moved.headers.get('location'),'/house.html#ikebana');}
   assert.equal((await fetch(base+'/.runtime/eternaluxe.sqlite')).status,404);
 });
 await t.test('does not silently enter production without reviewed configuration',()=>{assert.throws(()=>createApp({dataDir,mode:'production',origin:'https://example.com'}),/Production requires/);});
});

test('production enquiry delivery targets the designated inbox',async t=>{
 const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'eternaluxe-delivery-test-'));
 const deliveries=[];
 const app=createApp({
   dataDir,
   mode:'production',
   origin:'https://www.eternaluxe.net',
   legalApproved:true,
   webhookUrl:'https://delivery.example.test/intake',
   webhookSecret:'test-secret',
   enquiryRecipient:'nicky.vanessaus@gmail.com',
   fetchImpl:async(url,options)=>{deliveries.push({url:String(url),options});return new Response(null,{status:204});}
 });
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${app.server.address().port}`;
 t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));await fs.rm(dataDir,{recursive:true,force:true});});
 const configResponse=await fetch(base+'/api/config',{headers:{Origin:'https://www.eternaluxe.net'}});
 const config=await configResponse.json();
 const cookie=configResponse.headers.get('set-cookie').split(';')[0];
 const values={email:'visitor@example.com',name:'Test Visitor',project:'Hospitality',location:'New York',message:'A private dining room installation',terms:'on',privacy:'on'};
 const response=await fetch(base+'/api/forms',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.eternaluxe.net',Cookie:cookie},body:JSON.stringify({csrf:config.csrf,type:'enquiry',values,requestId:randomUUID()})});
 assert.equal(response.status,201);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(deliveries.length,1);
 const delivery=JSON.parse(deliveries[0].options.body);
 assert.equal(delivery.kind,'enquiry');
 assert.equal(delivery.recipient,'nicky.vanessaus@gmail.com');
 assert.equal(delivery.replyTo,'visitor@example.com');
 assert.match(delivery.subject,/Hospitality.*Test Visitor/);
 assert.equal(deliveries[0].options.headers.Authorization,'Bearer test-secret');
 assert.equal(app.db.prepare('SELECT delivery_status FROM submissions').get().delivery_status,'delivered');
});
