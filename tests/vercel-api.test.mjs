import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {configResponse,consentResponse,formResponse,recipient} from '../lib/vercel-api.mjs';

const origin='https://eternaluxe-redesign.vercel.app';
const env={LEGAL_APPROVED:'true',ENQUIRY_WEBHOOK_URL:'https://delivery.example.test/intake',ENQUIRY_WEBHOOK_SECRET:'a-secure-test-secret'};

async function session(){
  const response=configResponse(new Request(`${origin}/api/config`,{headers:{Origin:origin}}),{env});
  const config=await response.json();
  return {config,cookie:response.headers.get('set-cookie').split(';')[0]};
}

test('Vercel form bridge keeps CSRF, policy evidence and designated delivery',async()=>{
  const {config,cookie}=await session();
  assert.equal(config.deliveryReady,true);
  assert.equal(config.policies.privacy.sha256.length,64);
  const deliveries=[];
  const fetchImpl=async(url,options)=>{deliveries.push({url:String(url),options});return new Response(null,{status:204});};
  const values={email:'visitor@example.com',name:'Test Visitor',project:'Hospitality',location:'New York',message:'A private dining room installation',terms:'on',privacy:'on'};
  const requestId=randomUUID();
  const request=new Request(`${origin}/api/forms`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({csrf:config.csrf,type:'enquiry',values,requestId,source:'/enquiries.html'})});
  const response=await formResponse(request,{env,fetchImpl});
  assert.equal(response.status,201);
  const result=await response.json();assert.equal(result.id,requestId);assert.match(result.receipt,/^[a-f0-9]{64}$/);
  assert.equal(deliveries.length,1);
  const delivered=JSON.parse(deliveries[0].options.body);
  assert.equal(delivered.recipient,recipient);
  assert.equal(delivered.replyTo,'visitor@example.com');
  assert.equal(delivered.values.marketing,false);
  assert.equal(delivered.consent.states.terms,true);
  assert.equal(delivered.consent.states.privacy,true);
  assert.equal(delivered.consent.states.marketing,false);
  assert.equal(delivered.consent.policies.terms.sha256.length,64);
  assert.equal(deliveries[0].options.headers.Authorization,`Bearer ${env.ENQUIRY_WEBHOOK_SECRET}`);
  assert.equal(deliveries[0].options.headers['Idempotency-Key'],requestId);
});

test('Vercel bridge rejects missing consent, cross-origin and unavailable delivery',async()=>{
  const {config,cookie}=await session();
  const values={email:'visitor@example.com',name:'Test Visitor',project:'Hospitality',location:'New York',message:'A private dining room installation',terms:'on'};
  const body=JSON.stringify({csrf:config.csrf,type:'enquiry',values,requestId:randomUUID(),source:'/enquiries.html'});
  assert.equal((await formResponse(new Request(`${origin}/api/forms`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body} ),{env})).status,400);
  assert.equal((await formResponse(new Request(`${origin}/api/forms`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://attacker.example',Cookie:cookie},body}),{env})).status,403);
  const complete={...values,privacy:'on'};
  const unavailable=await formResponse(new Request(`${origin}/api/forms`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({csrf:config.csrf,type:'enquiry',values:complete,requestId:randomUUID()})}),{env:{LEGAL_APPROVED:'false'}});
  assert.equal(unavailable.status,503);
});

test('Vercel consent bridge records a GPC-respecting preference event',async()=>{
  const {config,cookie}=await session();const deliveries=[];
  const request=new Request(`${origin}/api/consent`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie,'Sec-GPC':'1'},body:JSON.stringify({csrf:config.csrf,choices:{analytics:true,preferences:true,advertising:true}})});
  const response=await consentResponse(request,{env,fetchImpl:async(url,options)=>{deliveries.push(JSON.parse(options.body));return new Response(null,{status:204});}});
  assert.equal(response.status,200);assert.equal(deliveries[0].consent.states.advertising,false);
});
