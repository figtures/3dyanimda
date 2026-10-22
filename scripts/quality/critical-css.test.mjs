import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {contentSecurityPolicy} from '../../deploy/security-headers.mjs';
const loader=readFileSync(new URL('../../public/deferred-styles.js',import.meta.url),'utf8');
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {inlineCriticalCss,serializedPrerender} from './critical-css.mjs';
test('export keeps responsive layout with JS on/off and styles newly inserted UI',async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});
 const origin='https://export.test';
 const css='@layer base,utilities,overrides; @layer base{body{margin:0}#hero{color:rgb(99,99,99)}} @layer utilities{#hero{color:rgb(12,34,56);width:500px} @media(max-width:600px){#hero{width:200px}.unused-mobile{width:999px}} .inserted-menu{color:rgb(120,20,30)}} @layer overrides{.inserted-menu{font-weight:700}} @keyframes pulse{from{opacity:0.5}to{opacity:1}}';
 let html='<html><head><link rel="stylesheet" href="/assets/main.css"></head><body><h1 id="hero">Hello</h1></body></html>';
 try{
  const first=await browser.newContext();await first.route(origin+'/**',r=>r.fulfill(r.request().url().endsWith('.css')?{body:css,contentType:'text/css'}:r.request().url().endsWith('.js')?{body:loader,contentType:'text/javascript'}:{body:html,contentType:'text/html',headers:{'Content-Security-Policy':contentSecurityPolicy}}));const p=await first.newPage();await p.goto(origin,{waitUntil:'networkidle'});await inlineCriticalCss(p);
  const critical=await p.locator('style[data-static-critical]').textContent();assert.doesNotMatch(critical,/inserted-menu|unused-mobile/);assert.match(critical,/@layer overrides\s*\{\s*\}/);assert.match(critical,/@keyframes pulse/);
  // The inline stylesheet alone must preserve the first render before the
  // complete stylesheet/loader arrives; then serialize the actual export.
  await p.locator('link[data-deferred-stylesheet]').evaluate(link=>link.remove());
  assert.deepEqual(await p.locator('#hero').evaluate(e=>({color:getComputedStyle(e).color,width:e.getBoundingClientRect().width})),{color:'rgb(12, 34, 56)',width:500});
  await p.evaluate(()=>{const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/main.css';link.setAttribute('data-deferred-stylesheet','');document.head.appendChild(link);});html=await serializedPrerender(p);assert.match(html,/rel="preload"/);assert.doesNotMatch(html,/onload=/);assert.match(html,/deferred-styles.js/);await first.close();
  for(const javaScriptEnabled of [true,false]){
   const c=await browser.newContext({javaScriptEnabled,viewport:{width:400,height:800}});await c.route(origin+'/**',r=>r.fulfill(r.request().url().endsWith('.css')?{body:css,contentType:'text/css'}:r.request().url().endsWith('.js')?{body:loader,contentType:'text/javascript'}:{body:html,contentType:'text/html',headers:{'Content-Security-Policy':contentSecurityPolicy}}));const page=await c.newPage();await page.goto(origin,{waitUntil:'networkidle'});
   assert.deepEqual(await page.locator('#hero').evaluate(e=>({color:getComputedStyle(e).color,width:e.getBoundingClientRect().width})),{color:'rgb(12, 34, 56)',width:200});
   await page.evaluate(()=>{const menu=document.createElement('div');menu.className='inserted-menu';menu.textContent='Menu';document.body.appendChild(menu);});
   assert.equal(await page.locator('.inserted-menu').evaluate(e=>getComputedStyle(e).color),'rgb(120, 20, 30)');await c.close();
  }
 }finally{await browser.close();}
});
