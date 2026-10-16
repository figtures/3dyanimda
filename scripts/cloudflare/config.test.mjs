import test from 'node:test';
import assert from 'node:assert/strict';
import {loadBrandConfig,brands} from './config.mjs';
import worker from '../../deploy/worker.mjs';
const defaults={SITE_DOMAIN:'3dyanimda.com',WORKER_NAME:'3dyanimda',VITE_SITE_THEME:'studio',VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
test('empty Cloudflare Builds settings use independent public brand defaults without credentials',()=>{
 for(const brand of brands){const c=loadBrandConfig(brand,{},null,()=>false);assert.equal(c.domain,brand+'.com');assert.equal(c.name,brand);assert.deepEqual(c.credentials,{});assert.equal(c.customDomain,false);assert.equal(c.publicEnv.VITE_GA4_MEASUREMENT_ID,brand==='3dyanimda'?'G-HBTDHJ45M7':'');}
});
test('origin-shaped domains normalize safely, wrong brands and URL extras fail closed',()=>{
 const c=loadBrandConfig('maketyanimda',{SITE_DOMAIN:' HTTPS://MAKETYANIMDA.COM/ '},null,()=>false);assert.equal(c.domain,'maketyanimda.com');
 for(const SITE_DOMAIN of ['3dyanimda.com','https://maketyanimda.com/path','https://maketyanimda.com/?x=1','https://maketyanimda.com/#x','https://user@maketyanimda.com','https://maketyanimda.com:8443','maketyanimda.com.attacker.test','javascript:alert(1)'])assert.throws(()=>loadBrandConfig('maketyanimda',{SITE_DOMAIN},null,()=>false),/SITE_DOMAIN/);
});
test('all four brands have independent config; local values beat CI defaults',()=>{
 for(const brand of brands){const c=loadBrandConfig(brand,defaults,()=>`SITE_DOMAIN=${brand}.com\nWORKER_NAME=${brand}\nVITE_SITE_THEME=industrial`,()=>true);assert.equal(c.domain,brand+'.com');assert.equal(c.publicEnv.VITE_SITE_THEME,'industrial');assert.equal(c.brand,brand);}
});
test('management credentials and unexpected VITE keys cannot enter public settings',()=>{
 const c=loadBrandConfig('3dyanimda',{...defaults,CLOUDFLARE_API_TOKEN:'private-token'},null,()=>false);
 assert.equal(JSON.stringify(c.publicEnv).includes('private-token'),false);
 assert.throws(()=>loadBrandConfig('3dyanimda',defaults,()=> 'VITE_SERVICE_ROLE_KEY=secret',()=>true),/Unrecognized/);
 assert.throws(()=>loadBrandConfig('3dyanimda',{...defaults,VITE_SUPABASE_PUBLISHABLE_KEY:'sb_secret_private'},null,()=>false),/publishable/);
 assert.throws(()=>loadBrandConfig('../escape',defaults),/Select/);
});
const env={SITE_DOMAIN:'3dyanimda.com',RELEASE_MODE:'approved',ASSETS:{fetch:async request=>{
 const p=new URL(request.url).pathname;
 // Model Cloudflare's HTML asset redirects instead of treating .html aliases
 // as direct 200 responses (the old mock hid the production redirect defect).
 if(['/app.html','/404.html'].includes(p))return new Response(null,{status:307,headers:{Location:p.replace('.html','')}});
 return ['/app','/404','/','/robots.txt'].includes(p)?new Response(p):new Response('missing',{status:404});
}}};
test('unknown public routes return true 404, admin routes get shell with noindex',async()=>{
 const missing=await worker.fetch(new Request('https://3dyanimda.com/not-approved'),env);
 assert.equal(missing.status,404);assert.equal(await missing.text(),'/404');assert.equal(missing.headers.get('Location'),null);
 const admin=await worker.fetch(new Request('https://3dyanimda.com/admin/settings'),env);
 assert.equal(admin.status,200);assert.equal(await admin.text(),'/app');assert.equal(admin.headers.get('Location'),null);assert.equal(admin.headers.get('Cache-Control'),'no-store');assert.match(admin.headers.get('X-Robots-Tag'),/noindex/);
});
test('workers.dev cannot be indexed even with approved artifacts',async()=>{
 const r=await worker.fetch(new Request('https://brand.workers.dev/robots.txt'),env);
 assert.match(await r.text(),/Disallow: \//);
 const home=await worker.fetch(new Request('https://brand.workers.dev/'),env);
 assert.match(home.headers.get('X-Robots-Tag'),/noindex/);
});
