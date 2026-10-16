/** Read-only local fixture review, executed by the existing CI browser runner. */
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
if(process.env.GITHUB_ACTIONS!=='true')throw Error('Run browser review in GitHub Actions.');
const out='/tmp/brand-menu-previews/public-sections';await mkdir(out,{recursive:true});
const server=await createServer({server:{host:'127.0.0.1',port:8091}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const cases=[],errors=[];
try {
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])for(const theme of ['industrial','industrialtwo','editorial','studio'])for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  const q=`?tenant=${brand}&theme=${theme}`,visit=async path=>{await page.goto('http://127.0.0.1:8091'+path+q);await page.locator('main h1').waitFor();};
  const fits=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${brand}/${theme}/${width}: horizontal overflow`);
  await visit('/');await page.locator('.home-discovery').waitFor();
  assert.equal(await page.locator('.sector-discovery nav a').count(),8);
  for(const path of ['/kariyer','/portfoy','/sss'])assert.ok(await page.locator(`.discover-paths a[href="${path+q}"]`).count());
  if(theme==='editorial') {
   await page.locator('.formation-canvas canvas').waitFor();
   await page.waitForFunction(()=>document.querySelector('.formation-canvas canvas')?.style.opacity==='1');
   assert.ok(await page.getByRole('link',{name:'Fikrinizi üretime taşıyın'}).isVisible());
   await page.getByRole('button',{name:'3D animasyonu duraklat'}).click();
   assert.equal(await page.getByRole('button',{name:'3D animasyonu oynat'}).getAttribute('aria-pressed'),'true');
   await page.screenshot({path:`${out}/${brand}-hero-${width}.png`});
  }
  await fits();
  await visit('/sss');await page.locator('.public-faq-list details').first().waitFor();
  assert.equal(await page.locator('.public-faq-list details').count(),8);
  await page.locator('.public-faq-list summary').first().click();assert.ok(await page.locator('.public-faq-list details p').first().isVisible());
  await page.getByRole('searchbox').fill('ZZZ-no-matching-question');assert.equal(await page.locator('.public-faq-list details').count(),0);
  await page.getByRole('searchbox').fill('');assert.equal(await page.locator('.public-faq-list details').count(),8);await fits();
  if(brand==='3dyanimda'&&theme==='editorial')await page.screenshot({path:`${out}/faq-${width}.png`});
  await visit('/kariyer');await page.getByText('Şu anda yayınlanmış açık pozisyon bulunmuyor.').waitFor();
  await page.getByRole('link',{name:'Genel başvuru',exact:true}).click();await page.waitForURL('**/kariyer/is-basvurusu'+q);
  await page.getByText('Genel Başvuru',{exact:true}).waitFor();await fits();
  await visit('/portfoy');await page.getByText('Proje seçkimiz hazırlanıyor.').waitFor();assert.ok(await page.getByText('Temsili tasarım',{exact:true}).count());await fits();
  await visit('/portfoy/missing-project');await page.getByText('Bu proje yayında değil.').waitFor();
  assert.ok((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
  cases.push({brand,theme,width,result:'pass'});console.log(`PUBLIC_SECTIONS_PASS ${brand}/${theme}/${width}`);await page.close();
 }
 assert.deepEqual(errors,[]);
} finally {await writeFile(`${out}/report.json`,JSON.stringify({cases,errors,production:false},null,2)+'\n');await browser.close();await server.close();}
