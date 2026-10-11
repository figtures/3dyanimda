import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {inlineCriticalCss} from './critical-css.mjs';
test('export keeps responsive layout with JS on/off and styles newly inserted UI',async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});
 const origin='https://export.test';
 const css='body{margin:0}#hero{color:rgb(12,34,56);width:500px} @media(max-width:600px){#hero{width:200px}} .inserted-menu{color:rgb(120,20,30)}';
 let html='<html><head><link rel="stylesheet" href="/assets/main.css"></head><body><h1 id="hero">Hello</h1></body></html>';
 try{
  const first=await browser.newContext();await first.route(origin+'/**',r=>r.fulfill(r.request().url().endsWith('.css')?{body:css,contentType:'text/css'}:{body:html,contentType:'text/html'}));const p=await first.newPage();await p.goto(origin,{waitUntil:'networkidle'});await inlineCriticalCss(p);html=await p.content();await first.close();
  for(const javaScriptEnabled of [true,false]){
   const c=await browser.newContext({javaScriptEnabled,viewport:{width:400,height:800}});await c.route(origin+'/**',r=>r.fulfill(r.request().url().endsWith('.css')?{body:css,contentType:'text/css'}:{body:html,contentType:'text/html'}));const page=await c.newPage();await page.goto(origin,{waitUntil:'networkidle'});
   assert.deepEqual(await page.locator('#hero').evaluate(e=>({color:getComputedStyle(e).color,width:e.getBoundingClientRect().width})),{color:'rgb(12, 34, 56)',width:200});
   await page.evaluate(()=>{const menu=document.createElement('div');menu.className='inserted-menu';menu.textContent='Menu';document.body.appendChild(menu);});
   assert.equal(await page.locator('.inserted-menu').evaluate(e=>getComputedStyle(e).color),'rgb(120, 20, 30)');await c.close();
  }
 }finally{await browser.close();}
});
