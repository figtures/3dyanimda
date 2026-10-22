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
const solutionInventories=new Map();
try{
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])for(const theme of ["industrial", "industrialtwo", "editorial", "studio"])for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:8091/?tenant=${brand}&theme=${theme}`,{waitUntil:'networkidle'});await page.locator('.home-flow').waitFor();
  if(!solutionInventories.has(brand)){
   // Read the selected tenant's authoritative published data, never infer the
   // expected inventory from the rendered cards. CI without an API uses the
   // same reviewed local CMS sources; configured CI reads the public CMS.
   const inventory=await page.evaluate(async()=>{
    const {exportPublicTenant}=await import('/src/contexts/TenantContext.tsx');
    const {demoMode,getSupabase}=await import('/src/lib/backend-config.ts');
    const tenant=exportPublicTenant();
    if(!tenant)throw Error('Home solution inventory has no resolved tenant');
    let rows;
    if(demoMode){
     // Independent of contentQuery and the component's filtering: overlays
     // replace a brand/path record before publication and kind are selected.
     const sources=await Promise.all([import('/src/content/pages.json'),import('/src/content/editorial-pages.json'),import('/src/content/search-pages.json')]);
     const merged=new Map();
     for(const source of sources)for(const row of source.default)merged.set(row.brand+row.path,row);
     rows=[...merged.values()].filter(row=>row.brand===tenant.slug&&row.status==='published'&&row.kind==='solution');
    }else{
     const result=await (await getSupabase()).from('landing_pages').select('tenant_id,path,title,summary,kind,status').eq('tenant_id',tenant.id).eq('status','published').eq('kind','solution').order('path');
     if(result.error)throw result.error;
     rows=result.data;
    }
    return {tenant:tenant.slug,id:tenant.id,source:demoMode?'local-published':'public-cms',rows:rows.map(row=>({brand:row.brand,tenant_id:row.tenant_id,status:row.status,kind:row.kind,path:row.path,title:row.title,summary:row.summary}))};
   });
   assert.equal(inventory.tenant,brand,'Home solution inventory must match the selected brand');
   assert.ok(inventory.rows.length>=5,`${brand}: established solution inventory is unexpectedly incomplete`);
   assert.equal(new Set(inventory.rows.map(row=>row.path)).size,inventory.rows.length,`${brand}: duplicate solution routes`);
   for(const row of inventory.rows){
    assert.equal(row.status,'published',`${brand}${row.path}: draft in public solution inventory`);
    assert.equal(row.kind,'solution',`${brand}${row.path}: wrong home inventory kind`);
    assert.equal(inventory.source==='local-published'?row.brand:row.tenant_id,inventory.source==='local-published'?brand:inventory.id,`${brand}${row.path}: cross-tenant solution`);
    assert.match(row.path,/^\/cozumler\/[a-z0-9-]+$/,`${brand}: invalid solution route`);
    assert.ok(row.title.trim()&&row.summary.trim(),`${brand}${row.path}: incomplete solution copy`);
   }
   solutionInventories.set(brand,inventory);
  }
  const inventory=solutionInventories.get(brand);
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width} horizontal overflow`);
  assert.equal(await page.locator('.home-chapters').count(),0);
  assert.equal(await page.locator('.service-decision').count(),3);
  assert.equal(await page.locator('.process-four > details').count(),4);
  assert.equal(await page.locator('.knowledge-section .editorial-card').count(),3);
  // Every retained service description is reachable by keyboard and its matching visual loads.
  for(let i=0;i<3;i++){
   const button=page.locator(`#service-choice-${i}`);await button.focus();await page.keyboard.press('Enter');
   assert.equal(await button.getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('.service-decision-copy:visible').count(),1);
   assert.ok(await page.locator(`#service-copy-${i}`).isVisible());
   const picture=page.locator('.service-scene picture:visible img');await picture.scrollIntoViewIfNeeded();await picture.evaluate(img=>img.decode());
   assert.ok((await picture.getAttribute('src')).includes(['print','scan','model'][i]));
   const method=page.locator(`#service-copy-${i} details`);await method.locator('summary').click();
   assert.equal(await method.locator('.service-flow li').count(),3);
   assert.ok(await method.locator('.service-flow').isVisible());await method.locator('summary').click();
  }
  await page.locator('#service-choice-0').click();
  for(const selector of ['.application-list > details','.process-four > details','.editorial-card details']){
   const disclosures=page.locator(selector);
   for(const detail of await disclosures.all()){
    if(!(await detail.evaluate(el=>el.open)))await detail.locator('summary').click();
    assert.ok(await detail.locator('p').isVisible(),selector+' content unreachable');
   }
   // Return the intentional compact initial state before captures.
   await disclosures.evaluateAll((nodes,group)=>nodes.forEach((n,i)=>{n.open=group!=='.editorial-card details'&&i===0;}),selector);
  }
  const renderedSolutions=await page.locator('.application-list > details').evaluateAll(nodes=>nodes.map(node=>({
   path:new URL(node.querySelector('.application-copy a').href).pathname,
   title:node.querySelector('summary h3').textContent.replace(/\s+/g,' ').trim(),
   summary:node.querySelector('.application-copy p').textContent.replace(/\s+/g,' ').trim(),
  })));
  assert.deepEqual(renderedSolutions,inventory.rows.map(({path,title,summary})=>({path,title:title.replace(/\s+/g,' ').trim(),summary:summary.replace(/\s+/g,' ').trim()})),`${brand}/${theme}/${width}: rendered solutions differ from published inventory`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width} expanded overflow`);
  const controls=await page.locator('.product-quote,.home-services ~ .showcase-section .brand-button,.immersive-hero .brand-button').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return {background:s.backgroundColor,color:s.color};}));
  function luminance(rgb){return rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);}
  for(const c of controls){const a=luminance(c.background),b=luminance(c.color);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${theme} action contrast: ${JSON.stringify(c)}`);}
  if(theme==='industrial')for(const c of controls)assert.equal(c.color,'rgb(255, 255, 255)','Industrial primary action text must stay white');
  // Load the gallery once; its lazy canvas must still work after reordering.
  if(width===1440||(brand==='3dyanimda'&&width===390)){await page.locator('#ornekler').scrollIntoViewIfNeeded();await page.locator('#ornekler [data-model-status="ready"]').first().waitFor({timeout:30000});}
  if(brand==='3dyanimda'&&[390,1440].includes(width)){
   await page.evaluate(async()=>{
    if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
    scrollTo({top:0,behavior:'instant'});
    await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   });
   await page.waitForFunction(()=>scrollY===0);
   assert.equal(await page.locator('.home-flow').count(),1);
   await page.screenshot({path:`${out}/${theme}-${width}.png`,fullPage:width>390,animations:'disabled'});
   // Capture the WebGL gallery while in view: offscreen rendering intentionally pauses.
   if(width===1440)await page.locator('.showcase-section').screenshot({path:`${out}/${theme}-${width}-showcase-section.png`,style:'.product-header{visibility:hidden !important}',animations:'disabled'});
   // Keep mobile captures below Chromium's tall GPU surface limit.
   if(width===390)for(const selector of ['.home-services','.showcase-section','.applications-section','.process-light','.studio-band','.engineering-teaser','.knowledge-section','.local-band','.brand-footer']){
    await page.locator(selector).screenshot({style:'.product-header{visibility:hidden !important}',path:`${out}/${theme}-${width}-${selector.slice(1)}.png`,animations:'disabled'});
   }
  }
  cases.push({brand,theme,width,status:'PASS',controls,solutionSource:inventory.source,solutionPaths:inventory.rows.map(row=>row.path)});console.log(`HOME_FLOW_PASS ${brand}/${theme}/${width}`);
 }
 assert.deepEqual(errors,[]);
}finally{
 await writeFile(`${out}/report.json`,JSON.stringify({cases,errors,production:false},null,2)+'\n');await browser.close();await server.close();
}
