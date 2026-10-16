/** Production build + real security policy; local customer files never leave the browser. */
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {contentSecurityPolicy} from '../deploy/security-headers.mjs';
import {threeMf,obj,stl} from './fixtures/model-formats.mjs';
if(process.env.GITHUB_ACTIONS!=='true')throw Error('Run browser review in GitHub Actions.');
const root=resolve('dist'),out='/tmp/model-format-previews';await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://127.0.0.1:8097'),file=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  let body;try{body=await readFile(file);}catch{if(extname(file)){res.writeHead(404);res.end();return;}body=await readFile(root+'/index.html');}
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'text/html','Content-Security-Policy':contentSecurityPolicy,'X-Content-Type-Options':'nosniff'});res.end(body);
 }catch{res.writeHead(500);res.end();}
});await new Promise(r=>server.listen(8097,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();page.setDefaultTimeout(15000);await page.emulateMedia({reducedMotion:'reduce'});
const errors=[],cases=[],violations=[];let uploaded=false;
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(/Content Security Policy|Refused to.*(worker|script|WebAssembly)/i.test(m.text()))violations.push(m.text());});
page.on('request',req=>{if(uploaded&&req.method()==='POST')errors.push('Unexpected upload while previewing: '+req.url());});
const step=await readFile('node_modules/occt-import-js/test/testfiles/cube-10x10mm/Cube 10x10.stp'),iges=await readFile('node_modules/occt-import-js/test/testfiles/cube-10x10mm/Cube 10x10.igs');
const fixtures=[['cube.stl',Buffer.from(stl)],['cube.obj',Buffer.from(obj)],['assembly.3mf',Buffer.from(threeMf({unit:'centimeter',scale:.1,assembly:true}))],['cube.step',step],['cube.stp',step],['cube.iges',iges],['cube.igs',iges]];
try {
 for(const [index,brand] of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'].entries())for(const width of [390,1440]) {
  const theme=['industrial','industrialtwo','editorial','studio'][index];
  await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:8097/teklif-al?tenant=${brand}&theme=${theme}`);await page.getByLabel('3D dosyası').waitFor({state:'attached'});
  assert.equal(await page.locator('.brand-site').getAttribute('data-theme'),theme);
  assert.equal(await page.locator('.studio-viewer canvas').count(),0);
  for(const [name,buffer] of fixtures) {
   uploaded=true;await page.getByLabel('3D dosyası').setInputFiles({name,mimeType:'application/octet-stream',buffer});
   await page.waitForFunction(()=>['ready','error'].includes(document.querySelector('[data-model-state]')?.getAttribute('data-model-state')),{},{timeout:50000});
   assert.equal(await page.locator('[data-model-state]').getAttribute('data-model-state'),'ready',`${brand}/${width}/${name}: ${await page.locator('[role=alert]').allTextContents()}`);
   const metrics=await page.locator('.studio-metrics').innerText();
   assert.ok(metrics.includes(name.endsWith('.3mf')?'2.00 cm³':'1.00 cm³'),metrics);
   assert.ok(metrics.includes(name.endsWith('.3mf')?'40.0 × 10.0 × 10.0 mm':'10.0 × 10.0 × 10.0 mm'),metrics);
   const canvas=await page.locator('.quote-preview canvas').elementHandle();
   for(const i of [1,2,0]) {
    await page.locator('.quote-steps button').nth(i).focus();const y=await page.evaluate(()=>scrollY);await page.keyboard.press('Enter');await page.waitForFunction(()=>document.activeElement?.classList.contains('quote-step-title'));
    assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)<=1);assert.equal(await canvas.evaluate(el=>el===document.querySelector('.quote-preview canvas')),true);
   }
   await page.getByRole('button',{name:'Modeli yakınlaştır',exact:true}).click();await page.getByRole('button',{name:'Model görünümünü sıfırla',exact:true}).click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   cases.push({brand,theme,width,file:name,metrics,status:'PASS'});console.log(`MODEL_FORMAT_PASS ${brand}/${theme}/${width}/${name}`);
   if(name.endsWith('.3mf'))await page.screenshot({path:`${out}/${brand}-${width}-3mf.png`});
  }
  // Rapid replacement cancels old parsing and cannot restore stale geometry.
  await page.getByLabel('3D dosyası').setInputFiles({name:'pending.step',mimeType:'application/octet-stream',buffer:step});
  await page.getByLabel('3D dosyası').setInputFiles({name:'latest.obj',mimeType:'text/plain',buffer:Buffer.from(obj)});
  await page.locator('[data-model-state=ready]').waitFor();assert.ok((await page.locator('.studio-metrics').innerText()).includes('OBJ'));
  await page.getByLabel('3D dosyası').setInputFiles({name:'broken.3mf',mimeType:'application/octet-stream',buffer:Buffer.from('not a zip')});
  await page.locator('[data-model-state=error]').waitFor();assert.equal(await page.locator('.studio-metrics').count(),0);
  await page.getByRole('button',{name:'Dosyayı kaldır',exact:true}).click();assert.equal(await page.locator('.studio-viewer canvas').count(),0);uploaded=false;
 }
 assert.deepEqual(errors,[]);assert.deepEqual(violations,[]);
} catch(error) {await page.screenshot({path:`${out}/failure.png`});throw error;}
finally {await writeFile(`${out}/report.json`,JSON.stringify({cases,errors,violations,production:false},null,2));await browser.close();await new Promise(r=>server.close(r));}
