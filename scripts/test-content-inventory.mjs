import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const merged=new Map();
for(const file of ['pages.json','editorial-pages.json','search-pages.json'])for(const p of JSON.parse(readFileSync('src/content/'+file,'utf8')))merged.set(p.brand+p.path,p);
const records=[...merged.values()].filter(p=>p.status==='published');
const brands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda'];
const themes=['industrial','editorial','studio'];
const utilities=['/','/hizmetler','/sektorler','/cozumler','/malzemeler','/rehber','/bolgeler','/hakkimizda','/iletisim','/teklif-al','/araclar','/araclar/stl-onizle','/araclar/kesit-analizi','/araclar/tarama-goruntuleyici','/sss'];
const server=await createServer({server:{host:'127.0.0.1',port:8091,strictPort:true}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const evidence=[];const failures=[];let cases=0;
mkdirSync('/tmp/brand-editorial-previews',{recursive:true});
try{
 await Promise.all(brands.map(async brand=>{
  const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});page.on('pageerror',e=>failures.push({brand,message:e.message}));
  for(const theme of themes){
   for(const record of [...records.filter(p=>p.brand===brand),...utilities.map(path=>({path}))]){
    await page.setViewportSize({width:1440,height:960});
    await page.goto(`http://127.0.0.1:8091${record.path}?tenant=${brand}&theme=${theme}`);
    if(record.title)await page.locator('.answer-card').waitFor();else await page.locator('h1').waitFor();
    const heading=await page.locator('h1').allTextContents();assert.equal(heading.length,1,`${brand} ${record.path}: one h1`);
    if(record.title)assert.equal(heading[0],record.title);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'http://127.0.0.1:8091'+record.path);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
    if(record.title){
     const visible=await page.locator('.content-article').innerText();
     for(const s of record.sections)assert.ok(visible.includes(s.body),`${brand}${record.path}: section missing`);
     for(const f of record.faq)assert.ok(await page.locator('.content-article details').allTextContents().then(items=>items.some(t=>t.includes(f.a))),`${brand}${record.path}: FAQ missing`);
     const docs=await page.locator('script[type="application/ld+json"]').evaluateAll(els=>els.map(el=>JSON.parse(el.textContent)));
     const faq=docs.find(d=>d['@type']==='FAQPage');assert.equal(faq?.mainEntity.length,record.faq.length);
     assert.ok(!JSON.stringify(docs).includes('https://3dyaninda.com'));
     if(theme==='industrial')evidence.push({brand,path:record.path,title:heading[0],description:await page.locator('meta[name="description"]').getAttribute('content'),contentHash:createHash('sha256').update(visible).digest('hex'),sections:record.sections.length,faqs:record.faq.length});
    }
    const badImages=await page.locator('main img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));return imgs.filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'));});assert.deepEqual(badImages,[],`${brand} ${record.path}: image load`);
    for(const width of [1440,390]){
     await page.setViewportSize({width,height:960});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}${record.path}/${width}: overflow`);cases++;
     if(theme==='industrial'&&record.path==='/malzemeler/pla')await page.screenshot({path:`/tmp/brand-editorial-previews/${brand}-material-${width}.png`,fullPage:true});
     if(theme==='editorial'&&brand==='3dyanimda'&&record.path==='/')await page.screenshot({path:`/tmp/brand-editorial-previews/new-home-${width}.png`});
    }
   }
   console.log(`PASS ${brand}/${theme}: ${records.filter(p=>p.brand===brand).length} content + ${utilities.length} public utility routes, 2 widths`);
  }
 }));
 assert.deepEqual(failures,[]);
 const report={result:'pass',testedAt:new Date().toISOString(),contentRoutes:records.length,utilityRoutes:brands.length*utilities.length,themes,viewports:[1440,390],cases,checks:['visible authored sections','matching FAQ data','single h1','clean canonical','preview noindex','no source-company schema','image loads','no horizontal overflow'],records:evidence};
 writeFileSync('docs/audits/rendered-editorial.json',JSON.stringify(report,null,2)+'\n');
 console.log(`PASS ${cases} rendered cases; ${records.length} unique content routes; ${brands.length*utilities.length} utility routes.`);
}finally{await browser.close();await server.close();}
