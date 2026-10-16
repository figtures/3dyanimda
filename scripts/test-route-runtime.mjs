import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const server=await createServer({server:{host:'127.0.0.1',port:8091}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[];
try {
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])for(const theme of ['industrial','industrialtwo','editorial','studio']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let release;const gate=new Promise(resolve=>release=resolve);let requested=false, markRequested;const requestedGate=new Promise(resolve=>markRequested=resolve);
  await page.route('**/src/pages/ContentPage.tsx',async route=>{requested=true;markRequested();await gate;await route.continue();});
  await page.goto(`http://127.0.0.1:8091/?tenant=${brand}&theme=${theme}`);
  await page.locator('main h1').waitFor();const before=await page.locator('main h1').innerText();
  await page.evaluate(()=>{window.__loadingFlashes=[];window.__navigationObserver=new MutationObserver(()=>{if(document.querySelector('[data-content-loading]'))window.__loadingFlashes.push('loading');});window.__navigationObserver.observe(document.querySelector('main'),{childList:true,subtree:true});document.querySelector('.footer-directory a[href^="/3d-baski"]').click();});
  await page.getByRole('progressbar',{name:'Sayfa hazırlanıyor'}).waitFor();
  await requestedGate;assert.ok(requested);assert.equal(await page.locator('main h1').innerText(),before);
  release();await page.waitForURL(/\/3d-baski\?/);await page.locator('.content-article').waitFor();
  assert.notEqual(await page.locator('main h1').innerText(),before);assert.deepEqual(await page.evaluate(()=>window.__loadingFlashes),[]);
  assert.equal(await page.locator('[data-content-loading]').count(),0);
  await page.goBack();await page.waitForURL(/\/\?/);await page.waitForFunction(expected=>document.querySelector('main h1')?.innerText===expected,before);
  assert.equal(await page.locator('main h1').innerText(),before);
  await page.goto(`http://127.0.0.1:8091/admin/login?tenant=${brand}&theme=${theme}`);await page.getByLabel('E-posta adresi').waitFor();assert.equal(await page.getByText('Unexpected Application Error!').count(),0);
  assert.deepEqual(errors,[]);results.push({brand,theme,result:'pass'});console.log('PASS transition and admin '+brand+'/'+theme);await page.close();
 }
 // An old or unavailable lazy module recovers once; it never loops indefinitely.
 const page=await browser.newPage();let attempts=0;
 await page.route('**/src/pages/admin/AdminLogin.tsx',async route=>{attempts++;if(attempts===1)await route.abort('failed');else await route.continue();});
 await page.goto('http://127.0.0.1:8091/admin/login?tenant=3dyanimda');
 await page.getByLabel('E-posta adresi').waitFor({timeout:30000});assert.equal(attempts,2);
 results.push({scenario:'failed-admin-module-recovers-once',result:'pass'});await page.close();
 await mkdir('/tmp/quote-flow-previews',{recursive:true});await writeFile('/tmp/quote-flow-previews/route-runtime.json',JSON.stringify(results,null,2));
 console.log(`PASS ${results.length} route runtime cases`);
} finally {await browser.close();await server.close();}
