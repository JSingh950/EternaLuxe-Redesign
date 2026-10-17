import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,randomUUID,createHash,timingSafeEqual} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';

const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const allowedEvents=new Set(['hero_interaction','product_view','cta_select','checkout','form_start','form_complete']);
const hash=v=>createHash('sha256').update(v).digest('hex');
const safeEqual=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function createApp({dataDir=process.env.DATA_DIR||path.join(root,'.runtime'),mode=process.env.NODE_ENV==='production'?'production':'preview',origin=process.env.SITE_ORIGIN||'http://localhost:4173',legalApproved=process.env.LEGAL_APPROVED==='true'}={}){
  if(mode==='production'&&(!legalApproved||!origin.startsWith('https://')||!process.env.ENQUIRY_WEBHOOK_URL||!process.env.ENQUIRY_WEBHOOK_SECRET))throw Error('Production requires reviewed policies, HTTPS SITE_ORIGIN and an authenticated enquiry delivery webhook. See deployment documentation.');
  fs.mkdirSync(dataDir,{recursive:true,mode:0o700});fs.chmodSync(dataDir,0o700);
  const db=new DatabaseSync(path.join(dataDir,'eternaluxe.sqlite'));
  fs.chmodSync(path.join(dataDir,'eternaluxe.sqlite'),0o600);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS consent_events(id TEXT PRIMARY KEY,subject TEXT NOT NULL,kind TEXT NOT NULL,source TEXT NOT NULL,policies TEXT NOT NULL,states TEXT NOT NULL,created_at TEXT NOT NULL,previous_hash TEXT,event_hash TEXT NOT NULL);
    CREATE TRIGGER IF NOT EXISTS immutable_consent_update BEFORE UPDATE ON consent_events BEGIN SELECT RAISE(ABORT,'Consent events are immutable'); END;
    CREATE TRIGGER IF NOT EXISTS immutable_consent_delete BEFORE DELETE ON consent_events BEGIN SELECT RAISE(ABORT,'Use approved retention archive procedure'); END;
    CREATE TABLE IF NOT EXISTS submissions(id TEXT PRIMARY KEY,subject TEXT NOT NULL,kind TEXT NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL,request_id TEXT UNIQUE NOT NULL,delivery_status TEXT NOT NULL DEFAULT 'pending');
    CREATE TABLE IF NOT EXISTS analytics(id TEXT PRIMARY KEY,event TEXT NOT NULL,page TEXT NOT NULL,kind TEXT,created_at TEXT NOT NULL);
  `);
  const policies=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/policy-manifest.json'),'utf8'));
  const scriptHashes=fs.readdirSync(path.join(root,'dist')).filter(f=>f.endsWith('.html')).flatMap(f=>[...fs.readFileSync(path.join(root,'dist',f),'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)).join(' ');
  const sessions=new Map(),rates=new Map();
  const maxSessions=5000;
  const cleanup=setInterval(()=>{const now=Date.now();for(const[k,v]of sessions)if(v.exp<now)sessions.delete(k);for(const[k,v]of rates)if(v.reset<now)rates.delete(k);},60000);cleanup.unref();
  function cookie(req,key){return (req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(key+'='))?.slice(key.length+1);}
  function session(req,res){
    let token=cookie(req,'eternaluxe_session'),s=sessions.get(token);
    if(!s||s.exp<Date.now()){
      if(sessions.size>=maxSessions)sessions.delete(sessions.keys().next().value);
      token=randomBytes(24).toString('hex');s={csrf:randomBytes(32).toString('hex'),exp:Date.now()+2*3600000};sessions.set(token,s);
      res.setHeader('Set-Cookie',`eternaluxe_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200${mode==='production'?'; Secure':''}`);
    }
    return s;
  }
  function appendConsent({subject,kind,source,states,id=randomUUID()}){
    const created_at=new Date().toISOString();const prev=db.prepare('SELECT event_hash FROM consent_events ORDER BY rowid DESC LIMIT 1').get()?.event_hash||null;
    const event={id,subject,kind,source,policies:JSON.stringify(policies),states:JSON.stringify(states),created_at,previous_hash:prev};
    const digest=hash(JSON.stringify(event));
    db.prepare('INSERT INTO consent_events VALUES(?,?,?,?,?,?,?,?,?)').run(event.id,event.subject,event.kind,event.source,event.policies,event.states,event.created_at,event.previous_hash,digest);
    return id;
  }
  function subjectFor(receipt){return /^[a-f0-9]{64}$/.test(receipt||'')&&db.prepare('SELECT id FROM consent_events WHERE subject=? LIMIT 1').get(hash(receipt))?{receipt,subject:hash(receipt)}:(()=>{const r=randomBytes(32).toString('hex');return {receipt:r,subject:hash(r)};})();}
  function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
  async function body(req){let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>16384)throw Object.assign(Error('Request too large.'),{status:413});chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks).toString())}catch{throw Object.assign(Error('Invalid request.'),{status:400})}}
  function limited(req){const key=hash(req.socket.remoteAddress||'unknown');const now=Date.now();let r=rates.get(key);if(!r||r.reset<now){if(rates.size>10000)rates.clear();r={count:0,reset:now+60000};rates.set(key,r);}return ++r.count>60;}
  async function deliver(id){
    if(mode!=='production')return;
    const item=db.prepare('SELECT * FROM submissions WHERE id=?').get(id);
    if(!item||item.delivery_status==='delivered')return;
    try{
      const url=new URL(process.env.ENQUIRY_WEBHOOK_URL);if(url.protocol!=='https:')throw Error('HTTPS required');
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.ENQUIRY_WEBHOOK_SECRET}`,'Idempotency-Key':id},body:JSON.stringify({id,kind:item.kind,values:JSON.parse(item.payload),createdAt:item.created_at}),signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw Error('Delivery failed');db.prepare("UPDATE submissions SET delivery_status='delivered' WHERE id=?").run(id);
    }catch{db.prepare("UPDATE submissions SET delivery_status='retry' WHERE id=?").run(id);}
  }
  const retry=setInterval(()=>{if(mode==='production')for(const item of db.prepare("SELECT id FROM submissions WHERE delivery_status!='delivered' LIMIT 10").all())void deliver(item.id);},60000);retry.unref();
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self' ${scriptHashes}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`);
    if(mode==='production')res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
    try{
      const url=new URL(req.url,origin);
      if(url.pathname.startsWith('/api/')){
        res.setHeader('Cache-Control','no-store');
        if(req.headers.origin===origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Vary','Origin');}
        if(req.method==='OPTIONS'){
          if(req.headers.origin!==origin)return json(res,403,{error:'Request origin not allowed.'});
          res.writeHead(204,{'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'});return res.end();
        }
        if(limited(req))return json(res,429,{error:'Please wait a minute before trying again.'});
        if(url.pathname==='/api/config'&&req.method==='GET'){
          if(req.headers.origin&&req.headers.origin!==origin)return json(res,403,{error:'Request origin not allowed.'});
          const s=session(req,res);return json(res,200,{mode,csrf:s.csrf,policies});
        }
        if(req.method!=='POST')return json(res,405,{error:'Method not allowed.'});
        const sentOrigin=req.headers.origin;
        if(sentOrigin!==origin||req.headers['sec-fetch-site']==='cross-site')return json(res,403,{error:'Request origin not allowed.'});
        if(!(req.headers['content-type']||'').startsWith('application/json'))return json(res,415,{error:'JSON required.'});
        const data=await body(req);
        if(!data||typeof data!=='object'||Array.isArray(data))return json(res,400,{error:'Invalid request.'});
        const s=sessions.get(cookie(req,'eternaluxe_session'));
        if(!s||s.exp<Date.now()||!safeEqual(data.csrf,s.csrf))return json(res,403,{error:'Your session expired. Refresh the page and try again.'});
        if(url.pathname==='/api/consent'){
          const {receipt,subject}=subjectFor(data.receipt);const c=data.choices;
          if(!c||['analytics','preferences','advertising'].some(k=>typeof c[k]!=='boolean'))return json(res,400,{error:'Invalid preferences.'});
          const states={necessary:true,analytics:c.analytics,preferences:c.preferences,advertising:c.advertising};
          if(req.headers['sec-gpc']==='1')states.advertising=false;
          const id=appendConsent({subject,kind:'cookie-preferences',source:'cookie-preferences',states});return json(res,200,{id,receipt});
        }
        if(url.pathname==='/api/events'){
          if(!allowedEvents.has(data.event)||typeof data.page!=='string'||!/^[a-z-]{1,60}$/.test(data.page))return json(res,400,{error:'Invalid event.'});
          if(!/^[a-f0-9]{64}$/.test(data.receipt||''))return json(res,403,{error:'Analytics consent required.'});
          const latest=db.prepare("SELECT states FROM consent_events WHERE subject=? AND kind='cookie-preferences' ORDER BY rowid DESC LIMIT 1").get(hash(data.receipt));
          if(!latest||!JSON.parse(latest.states).analytics)return json(res,403,{error:'Analytics consent required.'});
          const kind=['hero','editorial','newsletter','enquiry','withdrawal'].includes(data.detail?.kind)?data.detail.kind:null;
          db.prepare('INSERT INTO analytics VALUES(?,?,?,?,?)').run(randomUUID(),data.event,data.page,kind,new Date().toISOString());return json(res,200,{ok:true});
        }
        if(url.pathname==='/api/forms'){
          const v=data.values;const type=data.type;
          if(!['enquiry','newsletter','withdrawal'].includes(type)||!v||typeof v!=='object')return json(res,400,{error:'Invalid form.'});
          if(v.website)return json(res,400,{error:'Unable to accept this request.'});
          if(typeof v.email!=='string'||v.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))return json(res,400,{error:'Enter a valid email address.'});
          if(type!=='withdrawal'&&(v.terms!=='on'||v.privacy!=='on'))return json(res,400,{error:'Please accept the Terms and acknowledge the Privacy Policy.'});
          const clean={email:v.email.trim().toLowerCase()};
          if(type==='enquiry'){
            for(const [field,max]of Object.entries({name:120,project:60,date:10,location:180,budget:80,palette:160,scale:160,message:4000})){
              if(typeof (v[field]??'')!=='string'||(v[field]||'').length>max)return json(res,400,{error:`Check the ${field} field.`});clean[field]=(v[field]||'').trim();
            }
            if(!clean.name||!clean.location||!clean.message||!['An arrangement','Floral Club','Residential','Hospitality','Corporate','Events','Other'].includes(clean.project))return json(res,400,{error:'Complete your name, project, location and message.'});
          }
          const requestId=data.requestId;
          if(typeof requestId!=='string'||!/^[a-f0-9-]{36}$/.test(requestId))return json(res,400,{error:'Invalid request identifier.'});
          const prior=db.prepare('SELECT id,subject FROM submissions WHERE request_id=?').get(requestId);
          const identity=subjectFor(data.receipt);
          if(prior)return json(res,200,{id:prior.id,message:'This request has already been recorded.'});
          const id=randomUUID(),now=new Date().toISOString();
          clean.marketing=type==='withdrawal'?false:v.marketing==='on';
          db.exec('BEGIN IMMEDIATE');
          try{
            db.prepare('INSERT INTO submissions(id,subject,kind,payload,created_at,request_id,delivery_status) VALUES(?,?,?,?,?,?,?)').run(id,identity.subject,type,JSON.stringify(clean),now,requestId,mode==='preview'?'local-only':'pending');
            appendConsent({id,subject:identity.subject,kind:type==='withdrawal'?'marketing-withdrawal':'form-acceptance',source:type,states:{terms:type==='withdrawal'?false:true,privacy:type==='withdrawal'?false:true,marketing:clean.marketing}});
            db.exec('COMMIT');
          }catch(e){db.exec('ROLLBACK');throw e;}
          void deliver(id);
          const message=mode==='preview'?`Saved locally for preview. Nothing was emailed or subscribed. Reference: ${id.slice(0,8)}.`:type==='withdrawal'?'Your marketing withdrawal request has been recorded.':type==='newsletter'?(clean.marketing?'Your email preferences have been recorded.':'Your preference was recorded. You have not opted in to marketing.'):`Thank you. Your enquiry has been received. Reference: ${id.slice(0,8)}.`;
          return json(res,201,{id,receipt:identity.receipt,message});
        }
        return json(res,404,{error:'Not found.'});
      }
      if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed.'});
      const redirects={'/accesibility':'/accessibility','/accesibility.html':'/accessibility.html','/arrangements':'/collections','/bespoke-events':'/atelier'};
      if(redirects[url.pathname]){res.writeHead(301,{Location:redirects[url.pathname]});return res.end();}
      let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return json(res,400,{error:'Invalid path.'})}
      if(pathname.includes('\0')||pathname.split('/').some(p=>p.startsWith('.')))return json(res,404,{error:'Not found.'});
      const dist=path.join(root,'dist');let file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(dist+path.sep)&&file!==dist)return json(res,404,{error:'Not found.'});
      if(pathname.endsWith('/'))file=path.join(file,'index.html');else if(!path.extname(file))file+='.html';
      // Serve only published asset classes, never source or runtime databases.
      if(!mime[path.extname(file)])return json(res,404,{error:'Not found.'});
      let stat;try{stat=fs.statSync(file);if(!stat.isFile())throw Error()}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});return res.end('<!doctype html><html lang="en"><title>Not found | Eternaluxe</title><body><h1>This page has moved.</h1><a href="/">Return to Eternaluxe</a></body></html>');}
      res.setHeader('Content-Type',mime[path.extname(file)]);res.setHeader('Cache-Control',/\.(html|json)$/.test(file)?'no-cache':'public, max-age=86400');
      if(/\.(mp4|webm)$/.test(file))res.setHeader('Accept-Ranges','bytes');
      const range=req.headers.range;
      if(range&&/\.(mp4|webm)$/.test(file)){
        const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
        const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;
        if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
        res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});if(req.method==='HEAD')return res.end();return fs.createReadStream(file,{start,end}).pipe(res);
      }
      res.setHeader('Content-Length',stat.size);res.writeHead(200);if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
    }catch(error){if(!res.headersSent)json(res,error.status||500,{error:error.status?error.message:'The service could not save your request. Please try again.'});else res.end();}
  });
  server.on('close',()=>{clearInterval(cleanup);clearInterval(retry);db.close();});
  return {server,db};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);const {server}=createApp();server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Eternaluxe preview: http://localhost:${port}`));
}
