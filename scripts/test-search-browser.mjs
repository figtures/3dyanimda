import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const server = await createServer({server:{host:'127.0.0.1',port:8088,strictPort:true}});
await server.listen();
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage();
await page.emulateMedia({reducedMotion:'reduce'});
const failures=[];page.on('pageerror',e=>failures.push(e.message));
const guides={
  '3dyanimda':'prototip-maliyetini-ne-belirler',
  '3dsanayi':'fikstur-numune-kabul-plani',
  'maketyanimda':'mimari-maket-olcek-secimi',
  'parcayanimda':'kirik-parca-yeniden-uretim',
};
mkdirSync('/tmp/brand-search-previews',{recursive:true});
let checked=0;
try {
  for(const [brand,slug] of Object.entries(guides)) for(const theme of ['industrial','editorial','studio']) for(const width of [390,1440]) {
    await page.setViewportSize({width,height:960});
    await page.goto(`http://127.0.0.1:8088/rehber/${slug}?tenant=${brand}&theme=${theme}`);
    await page.locator('.answer-card').waitFor();
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('.decision-table').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width}: overflow`);
    const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
    assert.equal(canonical,`http://127.0.0.1:8088/rehber/${slug}`);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
    const types=await page.locator('script[type="application/ld+json"]').evaluateAll(els=>els.flatMap(el=>{const doc=JSON.parse(el.textContent);return (doc['@graph']||[doc]).map(n=>n['@type']);}));
    assert.ok(types.includes('Article'));assert.ok(types.includes('WebSite'));assert.ok(types.includes('FAQPage'));
    assert.equal(await page.locator('.content-article details').count(),3);
    if(brand==='3dyanimda'&&theme==='industrial')await page.screenshot({path:`/tmp/brand-search-previews/guide-${width}.png`,fullPage:true});
    checked++;
  }
  for(const brand of Object.keys(guides)) {
    await page.goto(`http://127.0.0.1:8088/3d-tarama?tenant=${brand}&theme=industrial`);
    await page.locator('.answer-card').waitFor();
    const title=await page.locator('h1').innerText();
    await page.getByRole('link',{name:'Projeniz için teklif alın',exact:false}).click();
    await page.locator('.quote-service-choice').waitFor();
    assert.equal(await page.getByRole('button',{name:'3D Tarama',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('textarea[name="part_description"]').inputValue(),title);
  }
  assert.deepEqual(failures,[]);
  console.log(`PASS ${checked} guide brand/theme/viewport cases; canonical, preview noindex, structured data, tables, FAQ and no overflow. PASS 4 service-to-quote transfers.`);
} finally { await browser.close();await server.close(); }
