import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const server=await createServer({server:{host:'127.0.0.1',port:8088}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
mkdirSync('/tmp/quote-flow-previews',{recursive:true});
try {
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']) for(const theme of ['industrial','industrialtwo','editorial','studio']) for(const width of [320,1440]) {
  await page.setViewportSize({width,height:900});
  await page.goto(`http://127.0.0.1:8088/teklif-al?tenant=${brand}&theme=${theme}`);
  await page.getByLabel('3D dosyası').waitFor({state:'attached'});
  // A tab transition must preserve the viewport, even when a shorter step replaces it.
  for (const index of [1,2,0]) {
    const tab=page.getByRole('navigation',{name:'Teklif adımları'}).getByRole('button').nth(index);
    await tab.focus();
    const before=await page.evaluate(()=>scrollY);
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.activeElement?.classList.contains('quote-step-title'));
    assert.ok(Math.abs(await page.evaluate(()=>scrollY)-before)<=1,`${brand}/${theme}/${width} tab scroll`);
    assert.equal(await page.locator('.quote-preview .studio-canvas').isVisible(),true);
    assert.equal(await page.getByLabel('3D dosyası').isVisible(),true);
  }

  await page.getByRole('button',{name:'Dosya olmadan devam et'}).click();
  await page.getByLabel('Adet',{exact:true}).fill('7');
  await page.getByRole('button',{name:'İletişim bilgilerine geç'}).click();
  await page.getByLabel('Ad soyad *',{exact:true}).fill('Test Kullanıcı');
  await page.getByRole('button',{name:'Üretim tercihlerine dön'}).click();
  assert.equal(await page.getByLabel('Adet',{exact:true}).inputValue(),'7');
  await page.getByRole('button',{name:'İletişim bilgilerine geç'}).click();
  assert.equal(await page.getByLabel('Ad soyad *',{exact:true}).inputValue(),'Test Kullanıcı');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width} contact overflow`);
  await page.getByRole('navigation',{name:'Teklif adımları'}).getByRole('button').first().click();
  await page.getByRole('button',{name:'3D Tarama',exact:true}).click();
  await page.getByRole('button',{name:'Dosya olmadan devam et'}).click();
  await page.getByText('Tarama ve modelleme projeleri kapsam üzerinden fiyatlandırılır.').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width} options overflow`);
  await page.getByLabel('3D dosyası').setInputFiles('public/models/inspection-sample.stl');
  await page.getByRole('button',{name:'Modeli yakınlaştır',exact:true}).waitFor();
  const canvas=await page.locator('.quote-preview canvas').elementHandle();
  for (const index of [0,1,2]) {
    await page.getByRole('navigation',{name:'Teklif adımları'}).getByRole('button').nth(index).focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.activeElement?.classList.contains('quote-step-title'));
    assert.equal(await canvas.evaluate(el=>el===document.querySelector('.quote-preview canvas')),true,'model must not remount');
    assert.equal(await page.locator('.quote-preview canvas').isVisible(),true);
  }
  await page.getByRole('button',{name:'Tel kafes görünümü',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Tel kafes görünümü',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Model görünümünü sıfırla',exact:true}).click();
  if(brand==='3dyanimda') await page.screenshot({path:`/tmp/quote-flow-previews/${theme}-${width}.png`,fullPage:true});
  console.log(`PASS quote ${brand}/${theme}/${width}: stable tab scroll, persistent model pane, steps, retained choices, service change, overflow`);
 }
 assert.deepEqual(errors,[]);
} finally {await browser.close();await server.close();}
