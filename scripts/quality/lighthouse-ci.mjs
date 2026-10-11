/** Diagnostic lab of candidate artifacts served with real HTTP gzip.
 * API responses come from the actual public Supabase API. Never a production score. */
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import {schemaIntegrity} from './schema-integrity.mjs';
import {validateVocabulary} from './schema-vocabulary.mjs';
import puppeteer from 'puppeteer-core';
import {loadEnv,build} from 'vite';
import {createServer as createHttpServer} from 'node:http';
import {createSecureServer as createHttpsServer} from 'node:http2';
import {execFileSync} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {inlineCriticalCss,serializedPrerender} from './critical-css.mjs';
import {capturePublicBootstrap} from './public-bootstrap.mjs';
const env={...loadEnv('production',process.cwd(),''),...process.env};
if(process.env.GITHUB_ACTIONS!=='true')throw new Error('Run this browser lab in GitHub Actions, not the managed workspace.');
const brand=process.env.LAB_BRAND;
if(!['3dyanimda','3dsanayi','maketyanimda','parcayanimda'].includes(brand))throw new Error('Invalid lab brand');
const repeats=Number(process.env.LAB_REPEATS||3);
if(![1,3].includes(repeats))throw new Error('Expected 1 diagnostic run or 3 final repetitions');
const canonicalLab=process.env.LAB_ORIGIN_MODE==='canonical';
let certDir,tls;
if(canonicalLab){
 certDir=await mkdtemp(path.join(tmpdir(),'brand-lab-'));
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',path.join(certDir,'key.pem'),'-out',path.join(certDir,'cert.pem'),'-days','1','-subj','/CN='+brand+'.com','-addext','subjectAltName=DNS:'+brand+'.com'],{stdio:'ignore'});
 tls={key:await readFile(path.join(certDir,'key.pem')),cert:await readFile(path.join(certDir,'cert.pem'))};
}
const output=`artifacts/lighthouse-${brand}/summary.json`;
const raw=`artifacts/lighthouse-${brand}/raw`;await mkdir(raw,{recursive:true});
let report={kind:'candidate-artifact-lab',production:false,fieldData:false,transport:canonicalLab?'HTTP/2 with HTTP/1.1 fallback':'HTTP/1.1',originMode:canonicalLab?'isolated-canonical-host-with-local-test-certificate':'localhost-noindex',publicDnsOrTlsVerified:false,api:'actual public API; no cached fixtures during measurement',sourceCommit:process.env.GITHUB_SHA,workflowRun:process.env.GITHUB_RUN_ID,startedAt:new Date().toISOString(),runs:[],errors:[],limitations:['Real loopback HTTP/2 HTTPS server with gzip in canonical-host mode; CDN, public DNS, public TLS and production availability are not measured. Previous baseline used HTTP/1.1, so score changes include a transport-method change.',canonicalLab?'Canonical hostname is mapped to loopback in Chrome. Local self-signed TLS is trusted only in this CI browser; public DNS/TLS, production availability and indexing are NOT verified.':'Localhost correctly uses noindex. Local SEO score therefore is not a production SEO score.','Simulated mobile throttling. TBT is not field INP. No CrUX, indexing or AI engine visibility assertion.']};
const browser=await puppeteer.launch({executablePath:env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,defaultViewport:null,ignoreDefaultArgs:['--enable-automation'],args:[...(canonicalLab?['--ignore-certificate-errors','--no-proxy-server','--host-resolver-rules=MAP '+brand+'.com 127.0.0.1']:[]),'--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.glb':'model/gltf-binary'};
const routes=(process.env.LAB_ROUTES||'/,/3d-baski,/teklif-al').split(',');
const devices=process.env.LAB_DEVICE?[process.env.LAB_DEVICE]:['mobile','desktop'];
if(devices.some(device=>!['mobile','desktop'].includes(device)))throw new Error('Invalid lab device');
const targets=routes.flatMap(route=>devices.map(device=>({brand,route,device})));
const built=new Map();let server;
try {
 for(const target of targets) {
  const completed=report.runs.filter(r=>r.brand===target.brand&&r.route===target.route&&r.device===target.device);
  if(completed.length===repeats)continue;
  const root=path.resolve('.cloudflare/lab-'+target.brand);
  if(!built.has(target.brand)){
   await build({logLevel:'error',envDir:false,define:Object.fromEntries(Object.entries({VITE_SUPABASE_URL:env.VITE_SUPABASE_URL,VITE_SUPABASE_PUBLISHABLE_KEY:env.VITE_SUPABASE_PUBLISHABLE_KEY,VITE_PRIVATE_PREVIEW_HOST:'',VITE_SITE_THEME:'industrial',VITE_TENANT_HOST:target.brand+'.com'}).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),build:{outDir:root,emptyOutDir:true}});built.set(target.brand,root);
  }
  const shell=await readFile(path.join(root,'index.html'));let rendered;
  const serve=async(req,res)=>{
   const pathname=new URL(req.url,'http://localhost').pathname;
   const file=path.resolve(root,'.'+decodeURIComponent(pathname));
   if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(400);return res.end();}
   let body,type='text/html',cache='no-cache';
   if(pathname==='/robots.txt'){body=Buffer.from('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /studio\n');type='text/plain';}
   else{try{if((await stat(file)).isFile()){body=await readFile(file);type=mime[path.extname(file)]||'application/octet-stream';cache='public, max-age=31536000, immutable';}}catch{}}
   body ||= Buffer.from(rendered||shell);
   const compressed=/(text|javascript|svg)/.test(type)&&req.headers['accept-encoding']?.includes('gzip');
   if(compressed)body=gzipSync(body);
   res.writeHead(200,{'content-type':type,'cache-control':cache,'content-length':body.length,...(compressed?{'content-encoding':'gzip','vary':'Accept-Encoding'}:{})});res.end(body);
  };
  server=canonicalLab?createHttpsServer({...tls,allowHTTP1:true},serve):createHttpServer(serve);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=(canonicalLab?'https://'+brand+'.com':'http://127.0.0.1')+':'+server.address().port;
  const context=await browser.createBrowserContext();const page=await context.newPage();page.setDefaultTimeout(45000);
  const bootstrap=capturePublicBootstrap(page,env.VITE_SUPABASE_URL,target.brand+'.com');
  await page.setRequestInterception(true);
  page.on('request',async request=>{
   try{
    const url=new URL(request.url());
    if(url.origin===env.VITE_SUPABASE_URL){
     const headers={...request.headers()};delete headers.host;delete headers['content-length'];
     const response=await fetch(request.url(),{method:request.method(),headers,...(!['GET','HEAD'].includes(request.method())?{body:request.postData()}:{}),signal:AbortSignal.timeout(20000)});
     const resultHeaders=Object.fromEntries(response.headers);delete resultHeaders['content-encoding'];delete resultHeaders['content-length'];resultHeaders['access-control-allow-origin']='*';
     return request.respond({status:response.status,headers:resultHeaders,body:Buffer.from(await response.arrayBuffer())});
    }
    return request.continue();
   }catch(error){report.errors.push(String(error));await request.abort();}
  });
  await page.goto(origin+target.route,{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>document.querySelector('h1')&&!document.querySelector('h1').textContent.includes('hazır değil')&&document.querySelector('[data-pending-queries]')?.getAttribute('data-pending-queries')==='0');
  await page.evaluate(()=>{document.getElementById('root').dataset.prerendered='true';});
  const contract=await page.evaluate(()=>({h1:document.querySelectorAll('h1').length,canonical:document.querySelector('link[rel=canonical]')?.href,og:document.querySelector('meta[property="og:url"]')?.content,robots:document.querySelector('meta[name=robots]')?.content,schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)),text:document.querySelector('main')?.textContent||''}));
  if(contract.h1!==1||contract.canonical!=='https://'+brand+'.com'+target.route||contract.og!==contract.canonical||contract.schemas.length!==1)throw Error('Rendered SEO contract failed: '+target.route);
  if(canonicalLab&&contract.robots?.includes('noindex'))throw Error('Public-host candidate unexpectedly noindex: '+target.route);
  if(!canonicalLab&&!contract.robots?.includes('noindex'))throw Error('Local preview lost noindex protection');
  const schemaErrors=[...schemaIntegrity(contract.schemas[0],{origin:'https://'+brand+'.com',visibleText:contract.text}),...validateVocabulary(contract.schemas[0])];
  if(schemaErrors.length)throw Error(JSON.stringify(schemaErrors));
  report.renderContracts||=[];report.renderContracts.push({...target,status:'PASS',h1:contract.h1,canonical:contract.canonical,schemaNodes:contract.schemas[0]['@graph'].length,robots:contract.robots});
  await inlineCriticalCss(page);
  await bootstrap.embed();
  rendered=await serializedPrerender(page);
  await page.evaluateOnNewDocument(()=>{document.addEventListener('DOMContentLoaded',()=>{window.__initialHeading=document.querySelector('main h1');},{once:true});});
  await page.goto(origin+target.route,{waitUntil:'networkidle0'});
  const hydration=await page.evaluate(()=>({mode:document.querySelector('#root')?.getAttribute('data-hydration'),error:document.querySelector('[data-hydration-error]')!==null,preserved:window.__initialHeading===document.querySelector('main h1')}));
  if(hydration.mode==='react-ssg-v1'&&(hydration.error||!hydration.preserved))throw Error('Hydration DOM preservation failed: '+JSON.stringify(hydration));
  report.hydrationChecks||=[];report.hydrationChecks.push({...target,...hydration});
  for(let repeat=1;repeat<=repeats;repeat++){
   if(completed.some(r=>r.repeat===repeat))continue;
   await page.evaluate(()=>{window.scrollTo({top:0,left:0,behavior:'instant'});sessionStorage.removeItem('react-router-scroll-positions');});
   const result=await lighthouse(origin+target.route,{logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],},target.device==='desktop'?desktopConfig:undefined,page);
   const scrollY=await page.evaluate(()=>window.scrollY);if(scrollY!==0)throw Error('Measurement did not start/end at page top: '+scrollY);
   const lhr=result.lhr;if(lhr.configSettings.formFactor!==target.device)throw Error('Lighthouse device mismatch');if(lhr.runtimeError)throw Error(JSON.stringify(lhr.runtimeError));
   const file=path.join(raw,target.brand+'-'+(target.route.slice(1)||'home')+'-'+target.device+'-'+repeat+'.json.gz');const bytes=gzipSync(JSON.stringify(lhr));await writeFile(file,bytes);
   const metrics=Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(id=>[id,lhr.audits[id].numericValue]));
   const issues=Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue}));
   await writeFile(file.replace('.json.gz','.html'),Array.isArray(result.report)?result.report.find(r=>r.startsWith('<!doctype')||r.startsWith('<!DOCTYPE'))||result.report[0]:result.report);
   report.runs.push({...target,repeat,version:lhr.lighthouseVersion,formFactor:lhr.configSettings.formFactor,throttling:lhr.configSettings.throttling,screenEmulation:lhr.configSettings.screenEmulation,fetchTime:lhr.fetchTime,scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics,issues,raw:file,sha256:createHash('sha256').update(bytes).digest('hex')});
   await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log('LIGHTHOUSE_RUN '+JSON.stringify(report.runs.at(-1)));
  }
  if(target.route==='/'||target.route==='/teklif-al'){
   await page.setViewport({width:390,height:844});
   await page.click('.product-menu-toggle');await page.waitForSelector('dialog, [role=dialog]',{visible:true});
   await page.keyboard.press('Escape');await page.waitForSelector('dialog, [role=dialog]',{hidden:true});
   if(target.route==='/teklif-al'){
    await page.type('input[name=full_name]','Browser verification');
    await page.click('.quote-service-choice button:nth-child(2)');
    const state=await page.evaluate(()=>({pressed:document.querySelector('.quote-service-choice button:nth-child(2)')?.getAttribute('aria-pressed'),name:document.querySelector('input[name=full_name]')?.value,valid:document.querySelector('form')?.checkValidity()}));
    if(state.pressed!=='true'||state.name!=='Browser verification'||state.valid!==false)throw Error('Interactive quote state/validation regression');
   }
   report.interactionChecks||=[];report.interactionChecks.push({...target,mobileMenu:'PASS',quote:target.route==='/teklif-al'?'PASS_WITHOUT_SUBMISSION':'NOT_APPLICABLE'});
  }
  await context.close();
  await new Promise(resolve=>server.close(resolve));server=undefined;
 }
}catch(error){report.errors.push(error.stack);process.exitCode=2;}
finally{report.status=report.errors.length?'ERROR':report.runs.length===targets.length*repeats?'MEASURED':'INCOMPLETE';report.expectedRuns=targets.length*repeats;report.finishedAt=new Date().toISOString();await writeFile(output,JSON.stringify(report,null,2)+'\n');await browser.close();if(certDir)await rm(certDir,{recursive:true,force:true});if(server)await new Promise(resolve=>server.close(resolve));console.log('LIGHTHOUSE_SUMMARY '+JSON.stringify(report));}
