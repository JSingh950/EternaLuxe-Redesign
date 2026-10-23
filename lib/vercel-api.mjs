import {createHash,randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import policies from '../dist/assets/policy-manifest.json' with {type:'json'};
import {contact} from '../src/contact.mjs';

const allowedEvents=new Set(['hero_interaction','product_view','cta_select','checkout','form_start','form_complete']);
const recipient=contact.email;
const jsonHeaders={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const hash=value=>createHash('sha256').update(value).digest('hex');
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{...jsonHeaders,...headers}});
const secureEqual=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const cookie=(request,name)=>(request.headers.get('cookie')||'').split(';').map(value=>value.trim()).find(value=>value.startsWith(`${name}=`))?.slice(name.length+1);
const expectedOrigin=request=>new URL(request.url).origin;
const validOrigin=(request,{allowMissing=false}={})=>{
  const origin=request.headers.get('origin');
  return allowMissing&&!origin||origin===expectedOrigin(request);
};
const configuration=env=>{
  let webhookUrl=null;
  try{webhookUrl=new URL(env.ENQUIRY_WEBHOOK_URL||'');}catch{}
  const webhookSecret=env.ENQUIRY_WEBHOOK_SECRET||'';
  return {
    legalApproved:env.LEGAL_APPROVED==='true',
    ready:webhookUrl?.protocol==='https:'&&webhookSecret.length>=16&&env.LEGAL_APPROVED==='true',
    webhookUrl,
    webhookSecret
  };
};
const receiptFor=value=>/^[a-f0-9]{64}$/.test(value||'')?value:randomBytes(32).toString('hex');

async function parseBody(request){
  if(!(request.headers.get('content-type')||'').startsWith('application/json'))throw Object.assign(Error('JSON required.'),{status:415});
  const raw=await request.text();
  if(Buffer.byteLength(raw)>16384)throw Object.assign(Error('Request too large.'),{status:413});
  try{
    const value=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error();
    return value;
  }catch{throw Object.assign(Error('Invalid request.'),{status:400});}
}

function verifyRequest(request,data){
  if(!validOrigin(request)||request.headers.get('sec-fetch-site')==='cross-site')throw Object.assign(Error('Request origin not allowed.'),{status:403});
  const token=cookie(request,'__Host-eternaluxe_csrf');
  if(!token||!secureEqual(token,data.csrf))throw Object.assign(Error('Your session expired. Refresh the page and try again.'),{status:403});
}

function consentRecord({receipt,kind,source,states,id=randomUUID(),createdAt=new Date().toISOString()}){
  const event={id,subject:hash(receipt),kind,source,policies,states,createdAt,previousHash:null};
  return {...event,eventHash:hash(JSON.stringify(event))};
}

async function deliver(payload,{env=process.env,fetchImpl=fetch}={}){
  const config=configuration(env);
  if(!config.ready)throw Object.assign(Error('Contact form delivery is not configured.'),{status:503});
  const response=await fetchImpl(config.webhookUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${config.webhookSecret}`,'Idempotency-Key':payload.id},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Object.assign(Error('The delivery service did not accept the request.'),{status:502});
}

function cleanEnquiry(values){
  if(values.website)throw Object.assign(Error('Unable to accept this request.'),{status:400});
  if(typeof values.email!=='string'||values.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))throw Object.assign(Error('Enter a valid email address.'),{status:400});
  if(values.terms!=='on'||values.privacy!=='on')throw Object.assign(Error('Please accept the Terms and acknowledge the Privacy Policy.'),{status:400});
  const clean={email:values.email.trim().toLowerCase()};
  for(const [field,max] of Object.entries({name:120,project:60,date:10,location:180,budget:80,palette:160,scale:160,message:4000})){
    if(typeof (values[field]??'')!=='string'||(values[field]||'').length>max)throw Object.assign(Error(`Check the ${field} field.`),{status:400});
    clean[field]=(values[field]||'').trim();
  }
  if(!clean.name||!clean.location||!clean.message||!['An arrangement','Floral Club','Residential','Hospitality','Corporate','Events','Other'].includes(clean.project))throw Object.assign(Error('Complete your name, project, location and message.'),{status:400});
  clean.marketing=false;
  return clean;
}

function cleanWithdrawal(values){
  if(values.website)throw Object.assign(Error('Unable to accept this request.'),{status:400});
  if(typeof values.email!=='string'||values.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))throw Object.assign(Error('Enter a valid email address.'),{status:400});
  return {email:values.email.trim().toLowerCase(),marketing:false};
}

export function configResponse(request,{env=process.env}={}){
  if(request.method!=='GET')return json({error:'Method not allowed.'},405,{'Allow':'GET'});
  if(!validOrigin(request,{allowMissing:true}))return json({error:'Request origin not allowed.'},403);
  const csrf=randomBytes(32).toString('hex');
  const config=configuration(env);
  return json({mode:'production',csrf,policies,deliveryReady:config.ready,legalApproved:config.legalApproved},200,{'Set-Cookie':`__Host-eternaluxe_csrf=${csrf}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`});
}

export async function consentResponse(request,options={}){
  if(request.method!=='POST')return json({error:'Method not allowed.'},405,{'Allow':'POST'});
  try{
    const data=await parseBody(request);verifyRequest(request,data);
    if(!data.choices||['analytics','preferences','advertising'].some(key=>typeof data.choices[key]!=='boolean'))throw Object.assign(Error('Invalid preferences.'),{status:400});
    const receipt=receiptFor(data.receipt);
    const states={necessary:true,analytics:data.choices.analytics,preferences:data.choices.preferences,advertising:request.headers.get('sec-gpc')==='1'?false:data.choices.advertising};
    const record=consentRecord({receipt,kind:'cookie-preferences',source:'cookie-preferences',states});
    await deliver({id:record.id,kind:'cookie-preferences',createdAt:record.createdAt,consent:record},options);
    return json({id:record.id,receipt});
  }catch(error){if((error.status||500)>=500)console.error('Consent delivery failed',{status:error.status||500});return json({error:error.status?error.message:'The service could not save your choices.'},error.status||500);}
}

export async function formResponse(request,options={}){
  if(request.method!=='POST')return json({error:'Method not allowed.'},405,{'Allow':'POST'});
  try{
    const data=await parseBody(request);verifyRequest(request,data);
    if(!['enquiry','withdrawal'].includes(data.type)||!data.values||typeof data.values!=='object'||Array.isArray(data.values))throw Object.assign(Error('Invalid form.'),{status:400});
    if(typeof data.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(data.requestId))throw Object.assign(Error('Invalid request identifier.'),{status:400});
    const values=data.type==='enquiry'?cleanEnquiry(data.values):cleanWithdrawal(data.values);
    const receipt=receiptFor(data.receipt);const createdAt=new Date().toISOString();
    const consent=consentRecord({receipt,id:data.requestId,kind:data.type==='withdrawal'?'marketing-withdrawal':'form-acceptance',source:data.source||data.type,states:{terms:data.type==='enquiry',privacy:data.type==='enquiry',marketing:false},createdAt});
    const payload={id:data.requestId,kind:data.type,values,createdAt,consent};
    if(data.type==='enquiry')Object.assign(payload,{recipient,replyTo:values.email,subject:`Eternaluxe enquiry — ${values.project} — ${values.name}`});
    await deliver(payload,options);
    return json({id:data.requestId,receipt,message:data.type==='withdrawal'?'Your marketing withdrawal request has been recorded.':`Thank you. Your enquiry has been received. Reference: ${data.requestId.slice(0,8)}.`},201);
  }catch(error){if((error.status||500)>=500)console.error('Form delivery failed',{status:error.status||500});return json({error:error.status?error.message:'The service could not save your request. Please try again.'},error.status||500);}
}

export async function eventResponse(request){
  if(request.method!=='POST')return json({error:'Method not allowed.'},405,{'Allow':'POST'});
  try{
    const data=await parseBody(request);verifyRequest(request,data);
    if(!allowedEvents.has(data.event)||typeof data.page!=='string'||!/^[a-z-]{1,60}$/.test(data.page))throw Object.assign(Error('Invalid event.'),{status:400});
    // No analytics provider is configured. Validate and intentionally discard the event.
    return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
  }catch(error){return json({error:error.status?error.message:'Unable to process event.'},error.status||500);}
}

export {policies,recipient};
