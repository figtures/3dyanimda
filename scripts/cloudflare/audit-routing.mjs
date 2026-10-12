/** Exercise the real Wrangler asset service, not a mocked ASSETS binding. CI only. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:net';
import https from 'node:https';
import path from 'node:path';
import {JSDOM} from 'jsdom';
if(process.env.SITES_MANAGED_LINUX_CONTAINER==='1')throw Error('Run the asset integration test in GitHub Actions.');
const configFile=path.resolve(process.argv[2]);
const config=JSON.parse(await readFile(configFile,'utf8'));
assert.equal(config.assets.html_handling,'drop-trailing-slash');
const manifest=JSON.parse(await readFile(path.join(config.assets.directory,'search-manifest.json'),'utf8'));
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;await new Promise(resolve=>server.close(resolve));
let logs='';
const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','dev','--local','--config',configFile,'--ip','127.0.0.1','--port',String(port),'--local-protocol','https','--show-interactive-dev-session=false'],{env:{...process.env,CI:'true',WRANGLER_SEND_METRICS:'false',CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV:'false'},stdio:['ignore','pipe','pipe']});
for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{logs=(logs+chunk).slice(-16000);});
function request(route,hostname=config.vars.SITE_DOMAIN){
 return new Promise((resolve,reject)=>{
  // The self-signed certificate exception is restricted to this loopback CI
  // server. Public production probes retain normal TLS verification.
  const req=https.request({hostname:'127.0.0.1',port,path:route,method:'GET',rejectUnauthorized:false,headers:{Host:hostname}},res=>{let body='';res.setEncoding('utf8');res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});
  req.on('error',reject);req.setTimeout(10000,()=>req.destroy(new Error('Local asset request timed out')));req.end();
 });
}
const checks=[];
try{
 let ready=false;
 for(let i=0;i<120;i++){
  if(child.exitCode!==null)throw Error('Wrangler exited before readiness: '+logs);
  try{await request('/robots.txt');ready=true;break;}catch{await new Promise(resolve=>setTimeout(resolve,500));}
 }
 assert.ok(ready,'Wrangler asset service did not start: '+logs);
 for(const page of manifest.pages){
  const result=await request(page.path);assert.equal(result.status,200,page.path+' must serve directly');assert.equal(result.headers.location,undefined,page.path+' must not redirect');assert.ok(!result.headers['x-robots-tag']?.includes('noindex'),page.path+' must be indexable');
  const dom=new JSDOM(result.body);try{assert.equal(dom.window.document.title,page.title,page.path+' title');assert.equal(dom.window.document.querySelector('link[rel="canonical"]')?.href,manifest.origin+page.path,page.path+' canonical');}finally{dom.window.close();}
 }
 checks.push({check:'all canonical manifest pages serve HTML directly',pages:manifest.pages.length,status:'pass'});
 for(const route of ['/admin/login','/admin/settings','/studio']){
  const r=await request(route);assert.equal(r.status,200,route);assert.equal(r.headers.location,undefined,route);assert.match(r.headers['x-robots-tag'],/noindex/);assert.equal(r.headers['cache-control'],'no-store');assert.ok(r.body.includes('type="module"'));}
 checks.push({check:'admin and studio shells preserve the requested URL',status:'pass'});
 const missing=await request('/__missing_asset_integration_test');assert.equal(missing.status,404);assert.equal(missing.headers.location,undefined);assert.ok(missing.body.includes('Sayfa bulunamadı.'));assert.match(missing.headers['x-robots-tag'],/noindex/);
 checks.push({check:'missing page returns 404 HTML without redirect',status:'pass'});
 for(const route of ['/3d-baski/','/3d-baski/index.html']){const r=await request(route);assert.equal(r.status,308);assert.equal(r.headers.location,'https://'+config.vars.SITE_DOMAIN+'/3d-baski');}
 const alias=await request('/hizmetler/3d-baski?utm_source=test');assert.equal(alias.status,301);assert.equal(alias.headers.location,'https://'+config.vars.SITE_DOMAIN+'/3d-baski?utm_source=test');
 checks.push({check:'canonical and legacy redirects terminate in one hop',status:'pass'});
 const preview=await request('/robots.txt','preview.workers.dev');assert.match(preview.body,/Disallow: \//);assert.match(preview.headers['x-robots-tag'],/noindex/);
 const report={result:'pass',testedAt:new Date().toISOString(),origin:manifest.origin,runtime:'Wrangler local HTTPS asset service',productionChecked:false,checks};
 await mkdir('artifacts/release',{recursive:true});await writeFile('artifacts/release/routing-'+config.vars.BRAND_SLUG+'.json',JSON.stringify(report,null,2)+'\n');
 console.log('WORKER_ASSET_ROUTING_VERIFIED '+JSON.stringify(report));
}catch(error){console.error(logs);throw error;}
finally{
 child.kill('SIGTERM');
 await Promise.race([new Promise(resolve=>child.once('exit',resolve)),new Promise(resolve=>setTimeout(()=>{if(child.exitCode===null)child.kill('SIGKILL');resolve();},5000))]);
}
