/** Read-only verification of completed production exports; never publishes or rebuilds. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,readdir,access,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import {assertExportedBusinessProfile} from './exported-business-profile.mjs';
import {assertFAQParity} from './faq-parity.mjs';
import {publicExportRoutes,assertExportedRouteSets,legalRoutes} from './public-export-routes.mjs';
const allBrands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda'];
const selected=process.argv.slice(2).length?process.argv.slice(2):allBrands;
assert.ok(selected.every(brand=>allBrands.includes(brand)));
const readJSON=async file=>JSON.parse(await readFile(file,'utf8'));
const publication=await readJSON('docs/audits/publication-content-manifest.json');
const certificate=await readJSON('content/release-review.json');
const source=new Map();
for(const file of ['pages.json','editorial-pages.json','search-pages.json'])for(const record of await readJSON('src/content/'+file))source.set(record.brand+record.path,record);
const utilityRoutes=legalRoutes;
const results=[];
const complementaryGraphs=[];
const normalize=value=>value.replace(/\s+/g,' ').trim();
const capture=async(file,url)=>{const bytes=await readFile(file);return {bytes,dom:new JSDOM(bytes.toString(),{url})};};
async function collectHTML(dir,prefix=''){
 const files=[];
 for(const item of await readdir(dir,{withFileTypes:true})){
  const relative=path.posix.join(prefix,item.name);
  if(item.isDirectory())files.push(...await collectHTML(path.join(dir,item.name),relative));
  else if(item.name==='index.html')files.push(relative);
 }
 return files;
}
for(const brand of selected){
 const domain=brand+'.com',origin='https://'+domain;
 const directory=path.resolve('.cloudflare',brand,'release',domain);
 const manifest=await readJSON(path.join(directory,'search-manifest.json'));
 const routeInputs=await readJSON(path.join('.cloudflare',brand,'release',domain+'-route-inputs.json'));
 assert.equal(routeInputs.origin,origin);const plan=publicExportRoutes(routeInputs);
 const expected=publication.routes.filter(item=>item.brand===brand);
 const tenantIds=[...new Set(expected.map(item=>item.tenant_id))];assert.equal(tenantIds.length,1,'One approved tenant per brand');
 const manifestPaths=new Set(manifest.pages.map(item=>item.path));
 assert.equal(manifest.origin,origin);assert.equal(manifest.pages.length,manifestPaths.size);assert.equal(expected.length,199);
 for(const item of expected)assert.ok(manifestPaths.has(item.path),brand+': missing approved '+item.path);
 for(const route of utilityRoutes)assert.ok(!manifestPaths.has(route),'Utility excluded from discovery');
 const hash=createHash('sha256');
 for(const item of manifest.pages){
  const file=path.join(directory,item.path.slice(1),'index.html');
  const {dom,bytes}=await capture(file,origin+item.path);const document=dom.window.document;
  try{
   assert.equal(document.querySelectorAll('h1').length,1,brand+item.path+' h1');
   assert.equal(document.querySelector('link[rel="canonical"]')?.getAttribute('href'),origin+item.path);
   assert.equal(document.title,item.title);assert.ok(item.title.length>0);
   const robots=document.querySelector('meta[name="robots"]')?.getAttribute('content');assert.ok(robots);assert.doesNotMatch(robots,/noindex/);
   const schemas=assertExportedBusinessProfile(document,{origin,route:item.path,brand,tenantId:tenantIds[0]});
   assert.equal(manifest.brand,schemas.find(node=>node['@type']==='Organization').name,'Discovery business name matches HTML');
   const pageData={title:document.title,description:document.querySelector('meta[name="description"]')?.getAttribute('content')||'',text:document.querySelector('main')?.textContent||'',images:[...document.querySelectorAll('main img')].map(img=>img.src),structuredData:[...document.querySelectorAll('script[type="application/ld+json"]')].map(el=>el.textContent)};
   assert.equal(createHash('sha256').update(JSON.stringify(pageData)).digest('hex'),item.hash,brand+item.path+' manifest/HTML parity');
   const record=source.get(brand+item.path);
   if(record){
    assert.equal(document.querySelector('h1').textContent,record.title);
    const article=document.querySelector('.content-article');assert.ok(article,brand+item.path+' authored content');
    const visible=normalize(article.textContent);
    for(const text of [record.local_context,record.logistics,record.editorial?.answer,...(record.sections||[]).flatMap(section=>[section.title,section.body])].filter(Boolean))for(const paragraph of text.split(/\n+/).filter(Boolean))assert.ok(visible.includes(normalize(paragraph)),brand+item.path+' authored visible text');
    if(record.faq?.length){for(const entry of record.faq)for(const value of [entry.q,entry.a])assert.ok(visible.includes(normalize(value)),brand+item.path+' visible FAQ');const faq=schemas.find(s=>s['@type']==='FAQPage');assertFAQParity(faq?.mainEntity,record.faq,origin+item.path);}
   }
   hash.update(item.path+'\0').update(bytes).update('\0');
  }finally{dom.window.close();}
 }
 for(const [route,reason] of plan.noindex){
  const {dom}=await capture(path.join(directory,route.slice(1),'index.html'),origin+route);const document=dom.window.document;
  try{assert.equal(document.querySelectorAll('h1').length,1);assert.equal(document.querySelector('link[rel="canonical"]')?.getAttribute('href'),origin+route);assert.match(document.querySelector('meta[name="robots"]')?.getAttribute('content'),/noindex/);if(reason==='legal-utility')assert.ok(document.body.textContent.includes('Bu markanın yasal bilgileri henüz yayımlanmadı.'));if(reason==='empty-portfolio')assert.ok(document.body.textContent.includes('Proje seçkimiz hazırlanıyor.'));if(reason==='empty-faq')assert.ok(document.body.textContent.includes('Sorularınızı iletişim sayfamızdan bize iletebilirsiniz.'));}finally{dom.window.close();}
 }
 const sitemapXML=await readFile(path.join(directory,'sitemap.xml'),'utf8');
 const sitemapLocations=[...sitemapXML.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
 const sitemapURLs=[];
 for(const location of sitemapLocations){assert.ok(location.startsWith(origin+'/sitemaps/'));const xml=await readFile(path.join(directory,new URL(location).pathname.slice(1)),'utf8');sitemapURLs.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]));}
 assert.equal(sitemapURLs.length,manifest.pages.length);assert.deepEqual(new Set(sitemapURLs),new Set(manifest.pages.map(item=>origin+item.path)));
 const {dom:notFound}=await capture(path.join(directory,'404.html'),origin+'/__missing_public_page');
 try{assert.equal(notFound.window.document.querySelector('h1')?.textContent,'Sayfa bulunamadı.');assert.match(notFound.window.document.querySelector('meta[name="robots"]')?.getAttribute('content'),/noindex/);}finally{notFound.window.close();}
 const htmlFiles=await collectHTML(directory);assertExportedRouteSets(plan,{htmlPaths:htmlFiles.map(file=>file==='index.html'?'/':'/'+file.replace(/\/index\.html$/,'')),indexPaths:manifest.pages.map(item=>item.path),approvedPaths:expected.map(item=>item.path)});
 const worker=await readJSON(path.join('.cloudflare',brand,'wrangler.json'));assert.equal(worker.vars.RELEASE_MODE,'approved');assert.equal(worker.vars.SITE_DOMAIN,domain);assert.equal(worker.vars.BRAND_SLUG,brand);assert.equal(worker.assets.directory,directory);assert.equal(worker.assets.run_worker_first,true);assert.equal(worker.assets.not_found_handling,'none');assert.equal(worker.assets.html_handling,'drop-trailing-slash');
 await access(path.join(directory,'app.html'));
 let redirectsPresent=true;try{await access(path.join(directory,'_redirects'));}catch{redirectsPresent=false;}assert.equal(redirectsPresent,false);
 const redirects=await readJSON(path.join(directory,'redirect-manifest.json'));assert.equal(redirects.origin,origin);
 const robots=await readFile(path.join(directory,'robots.txt'),'utf8');assert.ok(robots.includes('Allow: /'));assert.ok(robots.includes('Sitemap: '+origin+'/sitemap.xml'));assert.ok(robots.includes('Disallow: /admin'));
 results.push({brand,domain,result:'pass',approvedLandingRoutes:expected.length,indexEligibleHTML:manifest.pages.length,noindexUtilityHTML:utilityRoutes.length,noindexCollectionHTML:plan.noindex.size-utilityRoutes.length,totalRouteHTML:htmlFiles.length,sitemapURLs:sitemapURLs.length,manifestHTMLHashesMatch:true,exportedHTMLSetHash:hash.digest('hex'),workerReleaseMode:worker.vars.RELEASE_MODE,uploaded:false});
 console.log('PASS '+brand+': '+manifest.pages.length+' index pages + '+plan.noindex.size+' noindex pages; all HTML/manifest/sitemap/config assertions');
}
const complete=selected.length===allBrands.length;
const report={result:complete?'pass':'partial_scope_pass',reviewType:'AI-assisted static verification of real public API HTML exports',testedAt:new Date().toISOString(),releaseSourceHash:certificate.sourceHash,publicationManifestHash:publication.manifestHash,brands:results,structuredDataSemantics:{source:'https://www.w3.org/TR/json-ld11/#embedding-json-ld-in-html-documents',rule:'JSON-LD blocks in one HTML document form one dataset. Same-ID fields are combined, with every overlapping property required to agree; resolved tenant identity must match the rendered fields, including intentional removals.',complementaryGraphs,regressionTests:4},totals:{approvedLandingRoutes:results.reduce((sum,row)=>sum+row.approvedLandingRoutes,0),indexEligibleHTML:results.reduce((sum,row)=>sum+row.indexEligibleHTML,0),noindexUtilityHTML:results.reduce((sum,row)=>sum+row.noindexUtilityHTML,0)},checks:['all approved landing routes present','one h1 and exact authored titles/content','canonical domain','index robots for discovery pages','tenant-owned contact/profile parity and optional single workshop schema','visible FAQ/structured-data parity','all manifest hashes match actual HTML','sitemap and search-manifest exact URL parity','six legal utilities reachable/noindex/excluded from discovery','404 noindex page','Worker approved mode and exact assets path','no Pages redirect file shadowing Worker routes'],limitations:['Verifies generated local artifacts, not deployed URLs.','No Cloudflare upload, DNS, TLS, Search Console indexing, GA4 receipt or transactional email is claimed.','Legal utility pages retain the honest unpublished-document state and are excluded from discovery.']};
await mkdir('artifacts/release',{recursive:true});const output=complete?'artifacts/release/approved-html-export.json':`artifacts/release/approved-html-${selected[0]}.json`;
await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log('Report: '+output);
