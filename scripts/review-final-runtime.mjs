/** Isolated release evidence: real production bundle, deterministic public API fixture. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build, preview} from 'vite';
import {chromium} from '@playwright/test';
const brands = JSON.parse(await readFile('src/brands/catalog.json', 'utf8'));
const contact = JSON.parse(await readFile('content/authoring/confirmed-business-contact.json', 'utf8'));
const merged = new Map();
for (const f of ['pages.json','editorial-pages.json','search-pages.json'])
  for (const p of JSON.parse(await readFile('src/content/'+f,'utf8'))) merged.set(p.brand+p.path,p);
const themes = ['industrial','editorial','studio'];
const routes = ['/','/iletisim','/yasal','/kvkk-aydinlatma-metni','/gizlilik-politikasi','/cerez-politikasi','/kullanim-kosullari','/basvuru-acik-riza-metni'];
const widths = [1440,390];
const dir = await mkdtemp(join(tmpdir(),'final-runtime-'));
const checks=[], errors=[], thirdParty=[];
let browser,server;
try {
  browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for (const theme of themes) {
    await build({logLevel:'error',envDir:false,build:{outDir:dir,emptyOutDir:true},define:Object.fromEntries(Object.entries({VITE_SUPABASE_URL:'https://release-fixture.invalid',VITE_SUPABASE_PUBLISHABLE_KEY:'public-fixture-key',VITE_SITE_THEME:theme,VITE_TENANT_SLUG:'',VITE_TENANT_HOST:'',VITE_GA4_MEASUREMENT_ID:'',VITE_THEME_3DYANIMDA:'',VITE_THEME_3DSANAYI:'',VITE_THEME_MAKETYANIMDA:'',VITE_THEME_PARCAYANIMDA:''}).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)]))});
    server = await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port:8097,strictPort:true}});
    await Promise.all(brands.map(async(brand,i)=>{
      const page = await browser.newPage({viewport:{width:1440,height:960}});
      await page.emulateMedia({reducedMotion:'reduce'});
      page.on('pageerror',error=>errors.push({brand:brand.slug,theme,error:error.message}));
      const tenantId=`10000000-0000-4000-8000-00000000000${i+1}`;
      await page.route('**/*',async route=>{
        const u=new URL(route.request().url());
        if(u.hostname==='127.0.0.1') return route.continue();
        if(u.hostname!=='release-fixture.invalid') {
          thirdParty.push({brand:brand.slug,theme,host:u.hostname});
          return route.fulfill({status:204,body:''});
        }
        const table=u.pathname.split('/').pop();
        let data=[];
        if(table==='current_tenant_id') data=tenantId;
        if(table==='tenants') data={id:tenantId,slug:brand.slug,name:brand.name,domain:brand.slug+'.com',custom_domain:null,status:'active',settings:{}};
        if(table==='site_settings') data=['contact_info','verified_business_identity'].map(key=>({key,value:contact[key]}));
        if(table==='landing_pages') data=[...merged.values()].filter(p=>p.brand===brand.slug).map(p=>({...p,tenant_id:tenantId,status:'published'}));
        if(route.request().headers().accept?.includes('application/vnd.pgrst.object') && Array.isArray(data)) data=null;
        await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
      });
      for (const route of routes) {
        await page.goto('http://127.0.0.1:8097'+route,{waitUntil:'networkidle'});
        await page.locator('h1').waitFor();
        await page.waitForFunction(()=>document.querySelector('[data-pending-queries]')?.getAttribute('data-pending-queries')==='0');
        assert.equal(await page.locator('.brand-site').getAttribute('data-theme'),theme);
        assert.equal(await page.locator('h1').count(),1);
        const title=await page.locator('h1').innerText();
        assert.doesNotMatch(title,/Sayfa bulunamadı|Site henüz hazır değil/);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://'+brand.slug+'.com'+route);
        // Preview origin must be noindex even though the public fixture has a canonical domain.
        assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
        const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(els=>els.map(el=>JSON.parse(el.textContent)));
        const graph=schemas.find(s=>s['@graph']);
        const organization=graph['@graph'].find(s=>s['@type']==='Organization');
        const workshop=graph['@graph'].find(s=>s['@type']==='ProfessionalService');
        assert.equal(organization.email,contact.contact_info.email);
        assert.equal(organization.telephone,contact.contact_info.phone);
        assert.equal(workshop.address.streetAddress,contact.verified_business_identity.address.streetAddress);
        assert.equal(workshop.url,'https://'+brand.slug+'.com');
        assert.equal(graph['@graph'].filter(s=>s['@type']==='ProfessionalService').length,1);
        const body=await page.locator('body').innerText();
        if(route==='/iletisim') {
          for(const text of [contact.contact_info.address_tr,contact.contact_info.phone_display,contact.contact_info.email,'randevu','İstanbul dışındaki şehirlere','yerinde']) assert.ok(body.includes(text),brand.slug+': missing '+text);
          assert.ok(await page.locator('a[href="mailto:'+contact.contact_info.email+'"]').count());
          assert.ok(await page.locator('a[href="tel:'+contact.contact_info.phone+'"]').count());
        } else if(route!=='/') assert.ok(body.includes('Bu markanın yasal bilgileri henüz yayımlanmadı.'));
        const badImages=await page.locator('main img').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode().catch(()=>{})));return images.filter(img=>!img.naturalWidth).map(img=>img.getAttribute('src'));});
        assert.deepEqual(badImages,[]);
        for(const width of widths) {
          await page.setViewportSize({width,height:960});
          await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),brand.slug+'/'+theme+route+'/'+width+' overflow');
          checks.push({brand:brand.slug,theme,route,width,title,contentHash:createHash('sha256').update(body).digest('hex')});
        }
      }
    }));
    console.log('PASS '+theme+': 4 brands × 8 routes × 2 widths');
    await new Promise(resolve=>server.httpServer.close(resolve));server=null;
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(thirdParty,[],'Unexpected external network attempts');
  await mkdir('docs/audits',{recursive:true});
  await writeFile('docs/audits/final-runtime-review-2026-10-08.json',JSON.stringify({result:'pass',reviewType:'AI-assisted automated production-bundle runtime review',testedAt:new Date().toISOString(),cases:checks.length,brands:brands.map(b=>b.slug),themes,widths,routes,contactFixture:'content/authoring/confirmed-business-contact.json',contactReadbackEvidence:'docs/audits/confirmed-business-contact-2026-10-08.json',checks:['single visible heading','brand/theme rendering','canonical domain per brand','preview noindex','owner-confirmed contact and appointment/delivery/scanning facts','verified JSON-LD identity and one physical workshop','legal empty-state reachable and noindex','no broken main images','no horizontal overflow','zero runtime errors','zero external network attempts'],limitations:['Deterministic public API fixture; this check does not validate production RLS, DNS, TLS or live Supabase availability.','Legal documents are absent in the fixture, matching the last recorded readiness state; actual legal text is not reviewed or approved here.','No quote submission, file storage, email delivery or GA4 receipt tested.','This test does not grant publication approval or change database statuses.'],records:checks},null,2)+'\n');
  console.log('PASS all '+checks.length+' isolated production-bundle cases');
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.httpServer.close(resolve));await rm(dir,{recursive:true,force:true});}
