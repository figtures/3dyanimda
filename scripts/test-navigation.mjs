import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const server=await createServer({server:{host:'127.0.0.1',port:8087}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});let checks=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));mkdirSync('/tmp/brand-menu-previews',{recursive:true});
try{
for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])for(const theme of ['industrial','editorial','studio'])for(const width of [320,390,768,1440]){
 await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:8087/3d-baski?tenant=${brand}&theme=${theme}`);await page.locator('.product-header').waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width} overflow`);
 if(width<1100){await page.getByRole('button',{name:'Menüyü aç'}).click();await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('navigation',{name:'Mobil ana menü'}).isVisible(),true);await page.getByRole('dialog').getByRole('link',{name:'3D Tarama',exact:false}).first().focus();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});await page.getByRole('button',{name:'Menüyü aç'}).click();await page.getByRole('dialog').getByRole('link',{name:'3D Tarama',exact:false}).first().click();await page.waitForURL(/3d-tarama/);await page.getByRole('dialog').waitFor({state:'hidden'});await page.locator(`img[src="/brand/services/${brand}-scan.webp"]`).waitFor();}
 else{await page.getByRole('button',{name:'Keşfet menüsü'}).click();await page.getByRole('navigation',{name:'Keşfet',exact:true}).waitFor();assert.equal(await page.locator('.brand-navigation-panel').evaluate(el=>el.getBoundingClientRect().right<=innerWidth),true);await page.keyboard.press('Escape');await page.locator('.brand-navigation-panel').waitFor({state:'hidden'});}
 if(brand==='3dyanimda'&&(width===390||width===1440)){await page.goto(`http://127.0.0.1:8087/3d-baski?tenant=${brand}&theme=${theme}`);await page.locator('.product-header').waitFor();await page.getByRole('button',{name:width<1100?'Menüyü aç':'Keşfet menüsü'}).click();await page.locator(width<1100?'.brand-navigation-drawer':'.brand-navigation-panel').evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))});await page.screenshot({path:`/tmp/brand-menu-previews/${theme}-${width}.png`});}
 checks++;console.log(`PASS ${brand}/${theme}/${width}`);
}
assert.deepEqual(errors,[]);console.log(`PASS ${checks} brand/theme/viewport navigation cases; service links, Escape, mobile sheet, image loading and no horizontal overflow.`);
}finally{await browser.close();await server.close();}
