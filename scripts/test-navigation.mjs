import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const server=await createServer({server:{host:'127.0.0.1',port:8087}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});let checks=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));mkdirSync('/tmp/brand-menu-previews',{recursive:true});
async function assertRouteMedia(brand,route){
 await page.locator('.content-article').waitFor();
 const expected=await page.evaluate(async({brand,route})=>{
  const [{exportPublicTenant},{demoMode,getSupabase},{exportPublicSeo},{exportPublicSettings},{socialImage}]=await Promise.all([
   import('/src/contexts/TenantContext.tsx'),import('/src/lib/backend-config.ts'),import('/src/hooks/useSeoOverride.ts'),import('/src/hooks/useSiteSettings.ts'),import('/src/lib/social-meta.ts'),
  ]);
  const tenant=exportPublicTenant();if(!tenant||tenant.slug!==brand)throw Error('Unexpected route tenant');
  let record;
  if(demoMode){
   const sources=await Promise.all([import('/src/content/pages.json'),import('/src/content/editorial-pages.json'),import('/src/content/search-pages.json')]);
   const records=new Map();for(const source of sources)for(const row of source.default)records.set(row.brand+row.path,row);
   record=records.get(brand+route);
  }else{
   const result=await (await getSupabase()).from('landing_pages').select('path,image,status,editorial').eq('tenant_id',tenant.id).eq('path',route).eq('status','published').single();
   if(result.error)throw result.error;record=result.data;
  }
  if(!record||record.status!=='published'||!record.image)throw Error('Missing published service image');
  const domain=tenant.custom_domain||tenant.domain,origin=domain?'https://'+domain:location.origin;
  const media=record.editorial?.media;
  const share=socialImage(origin,brand,[exportPublicSeo(tenant.id,route)?.og_image_url,{url:record.image,alt:media?.alt,width:media?.width,height:media?.height}],exportPublicSettings(tenant.id));
  return {image:record.image,media,share,origin};
 },{brand,route});
 await page.waitForFunction(({route,image})=>location.pathname===route&&document.querySelector('.content-article figure img')?.getAttribute('src')===image,{route,image:expected.image});
 const contentImage=page.locator('.content-article figure img');await contentImage.waitFor();await contentImage.scrollIntoViewIfNeeded();await contentImage.evaluate(image=>image.decode());
 assert.equal(await contentImage.getAttribute('src'),expected.image,brand+route+' published visible image');
 const actual=await contentImage.evaluate(image=>({width:image.naturalWidth,height:image.naturalHeight}));
 assert.ok(actual.width>0&&actual.height>0,brand+route+' decoded content image');
 if(expected.media){assert.deepEqual(actual,{width:expected.media.width,height:expected.media.height});assert.equal(await contentImage.getAttribute('alt'),expected.media.alt);}
 await page.waitForFunction(url=>document.querySelector('meta[property="og:image"]')?.content===url,expected.share.url);
 assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'),expected.share.url,brand+route+' SEO/page/fallback selection');
 assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute('content'),expected.share.url);
 assert.equal(await page.locator('meta[property="og:image:type"]').getAttribute('content'),expected.share.mime);
 for(const dimension of ['width','height']){
  const tag=page.locator(`meta[property="og:image:${dimension}"]`);
  if(expected.share[dimension])assert.equal(await tag.getAttribute('content'),String(expected.share[dimension]));
  else assert.equal(await tag.count(),0,'Unknown share dimensions must not be guessed');
 }
 const shareSize=await page.evaluate(async({url,origin})=>{const image=new Image();const source=new URL(url);image.src=source.origin===origin?source.pathname:url;await image.decode();return {width:image.naturalWidth,height:image.naturalHeight};},{url:expected.share.url,origin:expected.origin});
 assert.ok(shareSize.width>0&&shareSize.height>0,'Selected raster image must decode');
 for(const dimension of ['width','height'])if(expected.share[dimension])assert.equal(shareSize[dimension],expected.share[dimension],'Declared share dimension must match raster');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
}
try{
for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])for(const theme of ["industrial", "industrialtwo", "editorial", "studio"])for(const width of [320,390,768,1440]){
 await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:8087/3d-baski?tenant=${brand}&theme=${theme}`,{waitUntil:'networkidle'});await page.locator('.product-header').waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${brand}/${theme}/${width} overflow`);
 const prefix='/brand/identity/'+brand+'/';
 const headerLogo=page.locator('.product-wordmark img');
 assert.equal(await headerLogo.getAttribute('src'),prefix+((theme==='industrial'||theme==='industrialtwo')?'logo_wordmark_light.svg':'logo_wordmark.svg'));
 await headerLogo.evaluate(img=>img.decode());
 assert.equal(await page.locator('.footer-brand-image').getAttribute('src'),prefix+'logo_wordmark_light.svg');
 await page.waitForFunction(p=>document.querySelector('link[rel="icon"]')?.getAttribute('href')===p+'icon-96.png',prefix);
 assert.equal(await page.locator('link[rel="apple-touch-icon"]').getAttribute('href'),prefix+'icon-180.png');
 await assertRouteMedia(brand,'/3d-baski');
 if(width===390&&theme==='industrial')await page.screenshot({path:`/tmp/brand-menu-previews/branding-${brand}.png`});

 if(width<1100){await page.getByRole('button',{name:'Menüyü aç'}).click();await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('navigation',{name:'Mobil ana menü'}).isVisible(),true);await page.getByRole('dialog').getByRole('link',{name:'3D Tarama',exact:false}).first().focus();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});await page.getByRole('button',{name:'Menüyü aç'}).click();await page.getByRole('dialog').getByRole('link',{name:'3D Tarama',exact:false}).first().click();await page.waitForURL(/3d-tarama/);await page.getByRole('dialog').waitFor({state:'hidden'});await assertRouteMedia(brand,'/3d-tarama');}
 else{await page.getByRole('button',{name:'Keşfet menüsü'}).click();await page.getByRole('navigation',{name:'Keşfet',exact:true}).waitFor();assert.equal(await page.locator('.brand-navigation-panel').evaluate(el=>el.getBoundingClientRect().right<=innerWidth),true);await page.keyboard.press('Escape');await page.locator('.brand-navigation-panel').waitFor({state:'hidden'});}
 if(brand==='3dyanimda'&&(width===390||width===1440)){await page.goto(`http://127.0.0.1:8087/3d-baski?tenant=${brand}&theme=${theme}`);await page.locator('.product-header').waitFor();await page.getByRole('button',{name:width<1100?'Menüyü aç':'Keşfet menüsü'}).click();await page.locator(width<1100?'.brand-navigation-drawer':'.brand-navigation-panel').evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))});await page.screenshot({path:`/tmp/brand-menu-previews/${theme}-${width}.png`});}
 checks++;console.log(`PASS ${brand}/${theme}/${width}`);
}
assert.deepEqual(errors,[]);console.log(`PASS ${checks} brand/theme/viewport navigation cases; service links, Escape, mobile sheet, image loading and no horizontal overflow.`);
}finally{await browser.close();await server.close();}
