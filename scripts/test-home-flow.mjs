/** Home hierarchy regression: CI browser only; no production traffic or writes. */
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
if(process.env.GITHUB_ACTIONS!=='true')throw Error('Run browser review in GitHub Actions.');
const out='/tmp/brand-menu-previews/home-flow';await mkdir(out,{recursive:true});
const server=await createServer({server:{host:'127.0.0.1',port:8091}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});
const errors=[],cases=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])for(const theme of ['industrial','editorial','studio'])for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:8091/?tenant=${brand}&theme=${theme}`,{waitUntil:'networkidle'});await page.locator('.home-flow').waitFor();
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width} horizontal overflow`);
  const order=await page.locator('.home-flow > section').evaluateAll(nodes=>nodes.map(n=>n.className));
  const positions=['home-services','showcase-section','applications-section','process-light','studio-band','engineering-teaser','knowledge-section','local-band'].map(name=>order.findIndex(value=>value.includes(name)));
  assert.ok(positions.every((p,i)=>p>=0&&(i===0||p>positions[i-1])),JSON.stringify(order));
  assert.equal(await page.locator('.home-services .service-card').count(),3);
  assert.equal(await page.locator('.process-four article').count(),4);
  assert.equal(await page.locator('.knowledge-section .editorial-card').count(),3);
  for(const selector of ['.service-card-copy p','.application-list p','.process-four p','.editorial-card p'])for(const p of await page.locator(selector).all())assert.ok(await p.isVisible(),`${selector} hidden`);
  for(const a of await page.locator('.home-chapters a').all()){
   const hash=await a.getAttribute('href');await a.click();await page.waitForURL(url=>url.hash===hash);assert.ok(await page.locator(hash).isVisible());
  }
  const controls=await page.locator('.product-quote,.home-services ~ .showcase-section .brand-button,.immersive-hero .brand-button').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return {background:s.backgroundColor,color:s.color};}));
  function luminance(rgb){return rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);}
  for(const c of controls){const a=luminance(c.background),b=luminance(c.color);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${theme} action contrast: ${JSON.stringify(c)}`);}
  if(theme==='industrial')assert.equal(controls[0].background,'rgb(237, 243, 250)');
  // Load the gallery once; its lazy canvas must still work after reordering.
  if(width===1440||(brand==='3dyanimda'&&width===390)){await page.locator('#ornekler').scrollIntoViewIfNeeded();await page.locator('#ornekler canvas').first().waitFor({timeout:30000});}
  if(brand==='3dyanimda'&&[390,1440].includes(width)){
   await page.evaluate(async()=>{
    if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
    scrollTo({top:0,behavior:'instant'});
    await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   });
   await page.waitForFunction(()=>scrollY===0);
   assert.equal(await page.locator('.home-flow').count(),1);
   await page.screenshot({path:`${out}/${theme}-${width}.png`,fullPage:true,animations:'disabled'});
  }
  cases.push({brand,theme,width,status:'PASS',controls});console.log(`HOME_FLOW_PASS ${brand}/${theme}/${width}`);
 }
 assert.deepEqual(errors,[]);
}finally{
 await writeFile(`${out}/report.json`,JSON.stringify({cases,errors,production:false},null,2)+'\n');await browser.close();await server.close();
}
