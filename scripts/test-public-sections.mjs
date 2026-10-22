/** Read-only local fixture review, executed by the existing CI browser runner. */
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
if(process.env.GITHUB_ACTIONS!=='true')throw Error('Run browser review in GitHub Actions.');
const out='/tmp/brand-menu-previews/public-sections';await mkdir(out,{recursive:true});
const server=await createServer({server:{host:'127.0.0.1',port:8091}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const cases=[],errors=[];let activePage;
try {
 const brands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda'].filter(brand=>!process.env.REVIEW_BRAND||process.env.REVIEW_BRAND===brand);
 assert.ok(brands.length,'REVIEW_BRAND must name a registered brand');
 for(const brand of brands)for(const theme of ['industrial','industrialtwo','editorial','studio'])for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});activePage=page;page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(20000);
  const q=`?tenant=${brand}&theme=${theme}`,visit=async path=>{console.log('VISIT',brand,theme,width,path);await page.goto('http://127.0.0.1:8091'+path+q,{waitUntil:'domcontentloaded'});await page.locator('main h1').waitFor();};
  const fits=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${brand}/${theme}/${width}: horizontal overflow`);
  const aligned=async()=>{
   const result=await page.evaluate(()=>{
    const logo=document.querySelector('.product-wordmark').getBoundingClientRect();
    const quote=document.querySelector('.product-quote').getBoundingClientRect();
    const edges=[...document.querySelectorAll('main .wrap,main .brand-inner,main .container-page,.brand-footer')].filter(el=>el.getBoundingClientRect().width>0).map(el=>{
     const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
     return {className:el.className,left:rect.left+parseFloat(style.paddingLeft),right:rect.right-parseFloat(style.paddingRight)};
    });
    return {left:logo.left,right:quote.right,edges};
   });
   assert.ok(result.edges.length,'page must expose a content container');
   for(const edge of result.edges){assert.ok(Math.abs(edge.left-result.left)<2,JSON.stringify({brand,theme,width,side:'left',edge,result}));assert.ok(Math.abs(edge.right-result.right)<2,JSON.stringify({brand,theme,width,side:'right',edge,result}));}
  };
  await visit('/');await page.locator('.home-discovery').waitFor();
  await page.locator('.sector-discovery nav a').nth(7).waitFor();assert.equal(await page.locator('.sector-discovery nav a').count(),8);
  for(const path of ['/kariyer','/portfoy','/sss'])assert.ok(await page.locator(`.discover-paths a[href="${path+q}"]`).count());
  if(brand==='3dyanimda') {
   await page.locator('.print-stage[data-scene-state="ready"]').waitFor();
   assert.equal(await page.locator('.printer-scene').getAttribute('data-motion'),'paused','Reduced motion must start paused');
   assert.ok(await page.getByRole('link',{name:'Projenizi başlatın',exact:true}).isVisible());
   await page.screenshot({path:`${out}/${brand}-${theme}-printer-${width}.png`});
   await page.getByRole('button',{name:'Baskı animasyonunu oynat',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.printer-scene')?.dataset.motion==='playing');
   // Reduced motion opens on the finished object. Restart before observing
   // deposition so the check does not time the completed-pose hold on software GPUs.
   await page.getByRole('button',{name:'Baskı animasyonunu baştan göster',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.print-stage-progress span')?.style.transform==='scaleX(0)');
   const before=await page.locator('.print-stage-progress span').getAttribute('style');
   await page.waitForFunction(value=>document.querySelector('.print-stage-progress span')?.getAttribute('style')!==value,before);
   await page.getByRole('button',{name:'Baskı animasyonunu duraklat',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.printer-scene')?.dataset.motion==='paused');
   await page.getByRole('button',{name:'Baskı animasyonunu baştan göster',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.print-stage-progress span')?.style.transform==='scaleX(0)');
   await page.getByRole('button',{name:'Baskı animasyonunu duraklat',exact:true}).click();
   const footerLayout=await page.locator('.print-brand-footer').evaluate(el=>({display:getComputedStyle(el).display,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length}));
   assert.equal(footerLayout.display,'grid');assert.equal(footerLayout.columns,width<960?1:2);
   console.log('PRINTER_REVIEW',JSON.stringify({brand,theme,width,renderer:await page.locator('.printer-scene').getAttribute('data-renderer'),reducedMotion:true,controls:'pass'}));
  } else if(theme==='editorial') {
   await page.locator('.formation-canvas canvas').waitFor();
   await page.waitForFunction(()=>document.querySelector('.formation-canvas canvas')?.style.opacity==='1');
   assert.ok(await page.getByRole('link',{name:'Fikrinizi üretime taşıyın'}).isVisible());
   await page.getByRole('button',{name:'3D animasyonu duraklat'}).click();
   assert.equal(await page.getByRole('button',{name:'3D animasyonu oynat'}).getAttribute('aria-pressed'),'true');
   await page.screenshot({path:`${out}/${brand}-hero-${width}.png`});
  }
  await fits();await aligned();
  await visit('/sss');await page.locator('.public-faq-list details').first().waitFor();
  assert.equal(await page.locator('.public-faq-list details').count(),8);
  await page.locator('.public-faq-list summary').first().click();assert.ok(await page.locator('.public-faq-list details p').first().isVisible());
  await page.getByRole('searchbox').fill('ZZZ-no-matching-question');assert.equal(await page.locator('.public-faq-list details').count(),0);
  await page.getByRole('searchbox').fill('');assert.equal(await page.locator('.public-faq-list details').count(),8);await fits();await aligned();
  if(brand==='3dyanimda'&&theme==='editorial')await page.screenshot({path:`${out}/faq-${width}.png`});
  await visit('/kariyer');await page.locator('.career-role').nth(2).waitFor();assert.equal(await page.locator('.career-role').count(),3);await fits();await aligned();
  const position=await page.locator('.career-role h3').first().innerText();
  await page.locator('.career-role summary').first().click();assert.ok(await page.locator('.career-role-detail').first().isVisible());
  if(theme==='editorial')await page.screenshot({path:`${out}/${brand}-career-${width}.png`,fullPage:true});
  await page.locator('.career-apply').first().click();await page.waitForURL('**/kariyer/is-basvurusu?**');
  await page.waitForFunction(value=>document.querySelector('select[id]')?.value===value,position);
  await page.getByRole('button',{name:'Devam et',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Tanışalım',exact:true}).isVisible());
  await page.getByLabel('Ad soyad *',{exact:true}).fill('Örnek Aday');await page.getByLabel('E-posta *',{exact:true}).fill('preview@example.test');
  await page.getByRole('button',{name:'Devam et',exact:true}).click();await page.getByRole('heading',{name:'Deneyiminiz',exact:true}).waitFor();
  await page.getByLabel('Kendinizden bahsedin').fill('Tasarımdan üretime katkı sağlamak istiyorum.');
  await page.getByRole('button',{name:'Geri',exact:true}).click();assert.equal(await page.getByLabel('Ad soyad *',{exact:true}).inputValue(),'Örnek Aday');
  await page.getByRole('button',{name:'Devam et',exact:true}).click();assert.equal(await page.getByLabel('Kendinizden bahsedin').inputValue(),'Tasarımdan üretime katkı sağlamak istiyorum.');
  await page.getByRole('button',{name:'Devam et',exact:true}).click();await page.getByRole('heading',{name:'Son bir kontrol',exact:true}).waitFor();
  assert.equal(await page.locator('.career-review').getByText(position,{exact:true}).count(),1);
  await page.getByRole('button',{name:'Başvuruyu gönder',exact:true}).click();assert.equal(await page.locator('.career-success').count(),0);
  await page.locator('.career-consent input').check();await page.getByRole('button',{name:'Başvuruyu gönder',exact:true}).click();
  await page.getByText('Tasarım önizlemesindesiniz. Başvurunuz gönderilmedi.').waitFor();await fits();await aligned();
  if(theme==='editorial')await page.screenshot({path:`${out}/${brand}-application-${width}.png`,fullPage:true});
  await visit('/kariyer/makine-isletim');await page.getByLabel('Ad soyad *',{exact:true}).fill('Örnek Üretici');await page.getByLabel('E-posta *',{exact:true}).fill('preview@example.test');
  await page.getByRole('button',{name:'Devam et',exact:true}).click();await page.getByRole('heading',{name:'Ekipmanınız',exact:true}).waitFor();
  await page.getByRole('button',{name:'Devam et',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Ekipmanınız',exact:true}).isVisible());
  await page.getByLabel('Ekipman tipi *').selectOption('FDM (Filament)');await page.getByLabel('Marka *',{exact:true}).fill('Test');await page.getByLabel('Model *',{exact:true}).fill('Test Model');
  await page.getByRole('button',{name:'Devam et',exact:true}).click();await page.getByRole('heading',{name:'İş birliği',exact:true}).waitFor();
  await page.locator('.career-consent input').check();await page.getByRole('button',{name:'İş birliği talebini gönder',exact:true}).click();await page.getByText('Tasarım önizlemesindesiniz. Talebiniz gönderilmedi.').waitFor();await fits();await aligned();
  for(const path of ['/3d-baski','/sektorler','/iletisim','/teklif-al','/araclar','/yasal']) {await visit(path);await fits();await aligned();}
  await visit('/portfoy');await page.locator('.portfolio-project').nth(6).waitFor();
  assert.equal(await page.locator('.portfolio-project').count(),7,`${brand}: seven portfolio applications`);
  assert.equal(await page.locator('.portfolio-project .portfolio-kind').count(),0);
  assert.equal(await page.locator('.portfolio-disclosure').count(),0);
  const assertImagesLoaded=async selector=>{
   const images=page.locator(selector);assert.ok(await images.count(),`${brand}: expected portfolio images`);
   for(const image of await images.all()){
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async img=>{await img.decode();});
    assert.ok(await image.evaluate(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0),`${brand}: image failed to load`);
   }
  };
  await assertImagesLoaded('.portfolio-project img');
  const categoryFilter=page.getByRole('group',{name:'Portföy kategorisi'});
  const selectedCategory=(await categoryFilter.getByRole('button').nth(1).innerText()).trim();
  const initialCategories=await page.locator('.portfolio-project .collection-meta').allTextContents();
  const expectedFiltered=initialCategories.filter(value=>value.trim()===selectedCategory).length;
  assert.ok(expectedFiltered>0&&expectedFiltered<7,`${brand}: category must select a subset`);
  await categoryFilter.getByRole('button',{name:selectedCategory,exact:true}).click();
  await page.waitForFunction(count=>document.querySelectorAll('.portfolio-project').length===count,expectedFiltered);
  assert.equal(await categoryFilter.getByRole('button',{name:selectedCategory,exact:true}).getAttribute('aria-pressed'),'true');
  for(const category of await page.locator('.portfolio-project .collection-meta').allTextContents())assert.equal(category.trim(),selectedCategory);
  await categoryFilter.getByRole('button',{name:'Tümü',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.portfolio-project').length===7);
  await fits();await aligned();
  await page.screenshot({path:`${out}/${brand}-${theme}-portfolio-${width}.png`,fullPage:true});
  const firstProject=page.locator('.portfolio-project').first();
  const projectTitle=(await firstProject.locator('h2').innerText()).trim();
  const projectHref=await firstProject.getAttribute('href');
  assert.ok(projectHref?.startsWith('/portfoy/')&&projectHref.endsWith(q),`${brand}: scoped detail link`);
  await firstProject.click();await page.waitForURL(url=>url.pathname+url.search===projectHref);
  await page.locator('.portfolio-detail .public-prose').waitFor();
  assert.equal((await page.locator('main h1').innerText()).trim(),projectTitle);
  assert.match(await page.locator('.portfolio-detail figcaption').innerText(),/Uygulama görselleştirmesi/);
  assert.ok((await page.locator('.portfolio-detail .public-prose').innerText()).length>500,`${brand}: substantive application detail`);
  await assertImagesLoaded('.portfolio-detail .project-cover');await fits();await aligned();
  await page.screenshot({path:`${out}/${brand}-${theme}-portfolio-detail-${width}.png`,fullPage:true});
  await visit('/portfoy/missing-project');await page.getByText('Bu proje yayında değil.').waitFor();
  assert.ok((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
  cases.push({brand,theme,width,result:'pass'});await writeFile(`${out}/report.json`,JSON.stringify({cases,errors,production:false},null,2)+'\n');console.log(`PUBLIC_SECTIONS_PASS ${brand}/${theme}/${width}`);await page.close();
 }
 assert.deepEqual(errors,[]);
} catch(error) {if(activePage&&!activePage.isClosed()){await activePage.screenshot({path:`${out}/failure.png`});await writeFile(`${out}/failure.txt`,activePage.url()+'\n'+String(error)+'\n'+await activePage.locator('body').innerText());}throw error;}
finally {await writeFile(`${out}/report.json`,JSON.stringify({cases,errors,production:false},null,2)+'\n');await browser.close();await server.close();}
