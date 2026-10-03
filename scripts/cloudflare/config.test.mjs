import test from 'node:test';
import assert from 'node:assert/strict';
import {loadBrandConfig,brands} from './config.mjs';
import worker from '../../deploy/worker.mjs';
const defaults={SITE_DOMAIN:'3dyanimda.com',WORKER_NAME:'3dyanimda',VITE_SITE_THEME:'studio',VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
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
 return ['/app.html','/404.html','/','/robots.txt'].includes(p)?new Response(p):new Response('missing',{status:404});
}}};
test('unknown public routes return true 404, admin routes get shell with noindex',async()=>{
 const missing=await worker.fetch(new Request('https://3dyanimda.com/not-approved'),env);
 assert.equal(missing.status,404);assert.equal(await missing.text(),'/404.html');
 const admin=await worker.fetch(new Request('https://3dyanimda.com/admin/settings'),env);
 assert.equal(admin.status,200);assert.equal(await admin.text(),'/app.html');assert.equal(admin.headers.get('Cache-Control'),'no-store');assert.match(admin.headers.get('X-Robots-Tag'),/noindex/);
});
test('workers.dev cannot be indexed even with approved artifacts',async()=>{
 const r=await worker.fetch(new Request('https://brand.workers.dev/robots.txt'),env);
 assert.match(await r.text(),/Disallow: \//);
 const home=await worker.fetch(new Request('https://brand.workers.dev/'),env);
 assert.match(home.headers.get('X-Robots-Tag'),/noindex/);
});
