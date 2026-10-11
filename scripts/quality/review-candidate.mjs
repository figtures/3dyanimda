/** Read-only real-public-API rendering of a source candidate. Does not publish or approve a release. */
import {build,loadEnv} from 'vite';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {createPublicApiRelay} from '../public-api-relay.mjs';
const env={...loadEnv('production',process.cwd(),''),...process.env};
const brands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda'];
const records=new Map();
for(const file of ['pages','editorial-pages','search-pages'])for(const p of JSON.parse(await readFile(`src/content/${file}.json`,'utf8')))records.set(p.brand+p.path,p);
const notes=JSON.parse(await readFile('src/content/source-notes.json','utf8'));
const report={status:'RUNNING',startedAt:new Date().toISOString(),kind:'real-public-API candidate render',published:false,cases:[],errors:[]};
const out=env.REVIEW_OUTPUT||'docs/audits/candidate-render-2026-10-11.json';
const captureDir='.cloudflare/candidate-captures';await mkdir(captureDir,{recursive:true});
const browser=await chromium.launch({executablePath:env.CHROMIUM_EXECUTABLE||'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.glb':'model/gltf-binary'};
try {
 for(const theme of ['industrial','editorial','studio']) {
  const root=path.resolve('.cloudflare/candidate-'+theme);
  await build({logLevel:'error',envDir:false,define:Object.fromEntries(Object.entries({VITE_SUPABASE_URL:env.VITE_SUPABASE_URL,VITE_SUPABASE_PUBLISHABLE_KEY:env.VITE_SUPABASE_PUBLISHABLE_KEY,VITE_SITE_THEME:theme}).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),build:{outDir:root,emptyOutDir:true}});
  const shell=await readFile(path.join(root,'index.html'));
  for(const brand of brands){
   const origin='https://'+brand+'.com';const context=await browser.newContext({viewport:{width:1440,height:1000}});
   const relay=createPublicApiRelay();
   await context.route(origin+'/**',async route=>{
    const f=path.resolve(root,'.'+decodeURIComponent(new URL(route.request().url()).pathname));
    if(!f.startsWith(root+path.sep)&&f!==root)return route.fulfill({status:400,body:'Invalid path'});
    try{if((await stat(f)).isFile())return route.fulfill({body:await readFile(f),contentType:mime[path.extname(f)]||'application/octet-stream'});}catch{}
    return route.fulfill({body:shell,contentType:'text/html'});
   });
   await context.route(env.VITE_SUPABASE_URL+'/**',relay);
   const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().startsWith(env.VITE_SUPABASE_URL)&&r.status()>=400)errors.push('API '+r.status()+' '+new URL(r.url()).pathname);});
   const local=[...records.values()].filter(p=>p.brand===brand&&p.kind==='location').slice(0,5).map(p=>p.path);
   const routes=env.REVIEW_ROUTES?env.REVIEW_ROUTES.split(','):[...new Set(['/', '/hizmetler','/cozumler','/malzemeler','/rehber','/bolgeler','/sektorler','/teklif-al','/iletisim','/hakkimizda','/araclar',...local,...Object.keys(notes).filter(p=>records.has(brand+p))])];
   for(const route of routes){
    await page.goto(origin+route,{waitUntil:'networkidle'});await page.locator('h1').waitFor();
    await page.waitForFunction(()=>document.querySelector('[data-pending-queries]')?.getAttribute('data-pending-queries')==='0');
    const data=await page.evaluate(()=>({h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),title:document.title,canonical:document.querySelector('link[rel=canonical]')?.href,robots:document.querySelector('meta[name=robots]')?.content,theme:document.querySelector('.brand-site')?.getAttribute('data-theme'),image:document.querySelector('meta[property="og:image"]')?.content,schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent)),date:document.querySelector('[data-content-modified]')?.getAttribute('datetime'),text:document.querySelector('main')?.textContent||''}));
    assert.equal(data.h1.length,1,brand+route);assert.equal(data.canonical,origin+route);assert.equal(data.theme,theme);assert.doesNotMatch(data.robots,/noindex/);assert.equal(data.schemas.length,1);
    assert.equal(data.image,origin+'/brand/social/'+brand+'-v1.png');
    const nodes=data.schemas[0]['@graph'];assert.equal(nodes.filter(n=>n['@type']==='Organization').length,1);assert.equal(new Set(nodes.map(n=>n['@id'])).size,nodes.length);
    const content=records.get(brand+route);if(content){assert.equal(data.h1[0],content.title);assert.ok(data.text.includes(content.summary));const node=nodes.find(n=>n['@type']==='FAQPage');assert.deepEqual(node.mainEntity.map(n=>[n.name,n.acceptedAnswer.text]),content.faq.map(f=>[f.q,f.a]));assert.equal(nodes.find(n=>n['@id']===origin+route+'#webpage').dateModified,data.date);}
    if(notes[route])assert.ok(data.text.includes(notes[route].text));
    if(route==='/'){await page.screenshot({path:path.join(captureDir,brand+'-'+theme+'.png')});await page.locator('.showcase-section').scrollIntoViewIfNeeded();await page.locator('.part-scene canvas').first().waitFor({timeout:30000});}
    assert.deepEqual(errors,[]);report.cases.push({brand,theme,route,title:data.title,date:data.date||null,textHash:createHash('sha256').update(data.text).digest('hex'),status:'PASS'});
   }
   console.log('PASS candidate '+brand+' / '+theme+': '+routes.length+' routes');await context.close();
  }
 }
 report.status='PASS';
}catch(error){report.status='FAIL';report.errors.push(error.stack);throw error;}
finally{report.finishedAt=new Date().toISOString();await writeFile(out,JSON.stringify(report,null,2)+'\n');await browser.close();console.log(out+' '+report.status+' '+report.cases.length);}
