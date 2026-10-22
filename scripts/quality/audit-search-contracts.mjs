import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import sharp from 'sharp';
import {chromium} from '@playwright/test';
import {publicExportRoutes,indexableLinkTarget} from './public-export-routes.mjs';
const brandAssets=JSON.parse(await readFile(new URL('../../src/brands/assets.json',import.meta.url),'utf8'));
const brandCatalog=JSON.parse(await readFile(new URL('../../src/brands/catalog.json',import.meta.url),'utf8'));
const dimension=value=>Number.isInteger(value)&&value>0?value:undefined;
const rasterUrl=(value,origin,extensions=/\.(png|jpe?g|webp)$/i)=>{
 if(typeof value!=='string'||!value||value.startsWith('//'))return;
 try{const url=new URL(value,origin);if(url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash&&extensions.test(url.pathname))return url;}catch{}
};
/** Resolve only exact candidates from the tenant/route's captured CMS evidence. */
export function expectedSocialImage(snapshot,{origin,route,landingRoute=false}) {
 const host=new URL(origin).hostname,tenant=snapshot?.tenant;
 assert.equal(snapshot?.version,1,'Social image requires a versioned public snapshot');
 assert.equal(snapshot.host,host,'Social image snapshot host');
 assert.equal(snapshot.path,route,'Social image snapshot route');
 assert.equal(snapshot.search||'','','Social image snapshot cannot contain preview state');
 assert.equal(tenant?.status,'active');
 assert.equal(tenant.custom_domain||tenant.domain,host,'Social image tenant domain');
 assert.ok(Object.hasOwn(brandAssets,tenant.slug),'Known social image brand');
 assert.equal(origin,'https://'+tenant.slug+'.com','Social image brand/origin mismatch');
 assert.ok(snapshot.settings&&typeof snapshot.settings==='object','Social image settings evidence');
 assert.ok(Object.hasOwn(snapshot,'seo'),'Social image SEO evidence is required, including an explicit null');
 const fallbackDefault=brandAssets[tenant.slug].og_image,configured=snapshot.settings.og_image;
 const fallback=configured&&rasterUrl(configured.url,origin,/\.(png|jpe?g)$/i)?configured:fallbackDefault;
 const fallbackUrl=rasterUrl(fallback.url,origin);assert.ok(fallbackUrl,'Valid brand fallback raster');
 const queries=snapshot.queries?.queries||[];
 const pageQueries=queries.filter(q=>q.queryKey?.[0]==='landing-page'&&q.queryKey?.[2]===route);
 assert.ok(pageQueries.length<=1,'Duplicate page image evidence');
 if(landingRoute)assert.equal(pageQueries.length,1,'Landing page image evidence is required');
 const pageQuery=pageQueries[0];let page;
 if(pageQuery){
  assert.equal(pageQuery.queryKey[1],tenant.id,'Page image query tenant');assert.equal(pageQuery.state?.status,'success');
  page=pageQuery.state.data;assert.equal(page?.tenant_id,tenant.id,'Page image record tenant');assert.equal(page?.path,route);assert.equal(page?.status,'published');
 }
 let pageImage=page?.image,media=page?.editorial?.media;
 if(route==='/')pageImage=snapshot.settings.hero_content?.image_url||'/brand/industrial/'+brandCatalog.find(brand=>brand.slug===tenant.slug).heroAsset+'.webp';
 if(route.startsWith('/blog/')){
  const posts=queries.filter(q=>q.queryKey?.[0]==='public-page'&&q.queryKey?.[2]===route);
  assert.equal(posts.length,1,'Blog image evidence is required');assert.equal(posts[0].queryKey[1],tenant.id);assert.equal(posts[0].state?.status,'success');
  const post=posts[0].state.data;assert.equal('/blog/'+post?.slug,route);
  const raw=post.cover_image_url?.trim();pageImage=raw;
  if(raw&&!/^(https?:|data:|blob:)/i.test(raw)&&!raw.startsWith('/')){
   assert.ok(snapshot.apiOrigin,'Storage image requires captured public API origin');
   const storagePath=raw.replace(/^public\//,'').replace(/^site-images\//,'').replace(/^storage\/v1\/object\/public\//,'').replace(/^site-images\//,'');
   pageImage=snapshot.apiOrigin.replace(/\/$/,'')+'/storage/v1/object/public/site-images/'+storagePath.split('/').map(encodeURIComponent).join('/');
  }
 }
 for(const candidate of [{url:snapshot.seo?.og_image_url,source:'seo-override'},{url:pageImage,width:media?.width,height:media?.height,source:'page-image'},{...fallback,source:'brand-fallback'}]){
  const url=rasterUrl(candidate.url,origin);if(!url)continue;
  const known=url.href===fallbackUrl.href?fallback:undefined;
  return {url:url.href,source:candidate.source,width:dimension(candidate.width)||dimension(known?.width),height:dimension(candidate.height)||dimension(known?.height),mime:/\.png$/i.test(url.pathname)?'image/png':/\.webp$/i.test(url.pathname)?'image/webp':'image/jpeg'};
 }
 throw Error('No valid reviewed social image');
}
function capturedSocialSnapshot(document,{origin,route}) {
 const parse=id=>{const element=document.getElementById(id);return element?JSON.parse(element.textContent):null;};
 const state=parse('public-render-state'),bootstrap=parse('public-bootstrap');
 if(state)return {...state,apiOrigin:bootstrap?.apiOrigin};
 assert.equal(bootstrap?.host,new URL(origin).hostname,'Public image bootstrap host');assert.equal(bootstrap.path,route,'Public image bootstrap route');
 const read=(table,filters)=>{
  const entries=(bootstrap.entries||[]).filter(entry=>{const [method,request]=JSON.parse(entry.key),url=new URL(request,bootstrap.apiOrigin);return method==='GET'&&url.pathname==='/rest/v1/'+table&&Object.entries(filters).every(([key,value])=>url.searchParams.get(key)==='eq.'+value);});
  assert.equal(entries.length,1,'One scoped social image '+table+' response is required');return JSON.parse(entries[0].body);
 };
 const tenants=read('tenants',{}),tenant=Array.isArray(tenants)?tenants[0]:tenants;
 assert.ok(!Array.isArray(tenants)||tenants.length===1,'One social image tenant');
 const settings=Object.fromEntries(read('site_settings',{tenant_id:tenant.id}).map(row=>[row.key,row.value]));
 const seo=read('seo_meta',{tenant_id:tenant.id,path:route});
 return {version:1,host:bootstrap.host,path:route,tenant,settings,seo:Array.isArray(seo)?seo[0]||null:seo,queries:{queries:[]},apiOrigin:bootstrap.apiOrigin};
}
export async function assertExportedSocialImage(document,{origin,route,directory,landingRoute=false,snapshot}) {
 const expected=expectedSocialImage(snapshot||capturedSocialSnapshot(document,{origin,route}),{origin,route,landingRoute});
 const meta=(key,attribute='property')=>document.querySelector(`meta[${attribute}="${key}"]`)?.content;
 assert.equal(meta('og:image'),expected.url,route+': exact reviewed social image precedence');
 assert.equal(meta('og:image:secure_url'),expected.url);assert.equal(meta('twitter:image','name'),expected.url);assert.equal(meta('twitter:card','name'),'summary_large_image');
 assert.equal(meta('og:image:type'),expected.mime);assert.ok(meta('og:image:alt')?.trim());assert.equal(meta('twitter:image:alt','name'),meta('og:image:alt'));
 for(const key of ['width','height'])assert.equal(meta('og:image:'+key),expected[key]===undefined?undefined:String(expected[key]),route+': declared image '+key);
 const url=new URL(expected.url);
 assert.equal(url.origin,origin,'Artifact-only audit requires a local copy of the exact reviewed social raster');
 const root=path.resolve(directory),file=path.resolve(root,'.'+decodeURIComponent(url.pathname));assert.ok(file.startsWith(root+path.sep),'Social raster must stay within the export');
 const raster=await sharp(file).metadata();assert.ok(raster.width>0&&raster.height>0,'Decoded social raster dimensions');
 assert.equal('image/'+raster.format,expected.mime,'Decoded social raster MIME');
 for(const key of ['width','height'])if(expected[key]!==undefined)assert.equal(raster[key],expected[key],route+': actual image '+key);
 const schemas=[...document.querySelectorAll('script[type="application/ld+json"]')];assert.equal(schemas.length,1);
 const graph=JSON.parse(schemas[0].textContent)['@graph'];
 const page=graph.find(node=>node['@id']===origin+route+'#webpage');assert.ok(page,'Social image WebPage schema');
 const primary=typeof page.primaryImageOfPage?.url==='string'?page.primaryImageOfPage:graph.find(node=>node['@id']===page.primaryImageOfPage?.['@id']);
 assert.equal(primary?.url,expected.url,'WebPage social image parity');
 for(const article of graph.filter(node=>node['@type']==='Article'))assert.equal(article.image,expected.url,'Article social image parity');
 return {...expected,actualWidth:raster.width,actualHeight:raster.height};
}
export async function auditSearchContracts(directory=path.resolve(process.argv[2]||'release/3dyanimda.com')) {
const manifest=JSON.parse(await readFile(path.join(directory,'search-manifest.json'),'utf8'));
const origin=manifest.origin,edges=new Map(),titles=new Set(),descriptions=new Set(),warnings=[];
const routeInputs=JSON.parse(await readFile(path.join(directory,'..',new URL(origin).hostname+'-route-inputs.json'),'utf8'));
assert.equal(routeInputs.origin,origin);const plan=publicExportRoutes(routeInputs);
for(const route of plan.noindex.keys()) {
 const dom=new JSDOM(await readFile(path.join(directory,route.slice(1),'index.html'),'utf8'),{url:origin+route});
 try {assert.equal(dom.window.document.querySelector('link[rel=canonical]')?.href,origin+route);assert.match(dom.window.document.querySelector('meta[name=robots]')?.content,/noindex/);}
 finally {dom.window.close();}
}
const widthSamples=[],socialImages=[];
for(const record of manifest.pages){
 const {window}=new JSDOM(await readFile(path.join(directory,record.path.slice(1),'index.html'),'utf8'),{url:origin+record.path});const d=window.document;
 try{
  const title=d.title,description=d.querySelector('meta[name=description]')?.content;
  assert.ok(title&&description);assert.ok(!titles.has(title),'Duplicate title: '+title);assert.ok(!descriptions.has(description),'Duplicate description: '+record.path);titles.add(title);descriptions.add(description);
  assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('link[rel=canonical]')?.href,origin+record.path);
  assert.equal(d.querySelector('meta[property="og:title"]')?.content,title);assert.equal(d.querySelector('meta[property="og:description"]')?.content,description);
  socialImages.push({path:record.path,...await assertExportedSocialImage(d,{origin,route:record.path,directory,landingRoute:routeInputs.landing.some(page=>page.path===record.path)})});
  const schemas=[...d.querySelectorAll('script[type="application/ld+json"]')];assert.equal(schemas.length,1);const graph=JSON.parse(schemas[0].textContent)['@graph'];assert.ok(graph.length);assert.equal(new Set(graph.map(n=>n['@id'])).size,graph.length);
  const date=d.querySelector('[data-content-modified]')?.getAttribute('datetime');if(date){assert.equal(Date.parse(record.lastmod),Date.parse(date));for(const node of graph.filter(n=>n.dateModified))assert.equal(Date.parse(node.dateModified),Date.parse(date));}
  const links=new Set();for(const a of d.querySelectorAll('a[href]')){const target=indexableLinkTarget(a.href,{origin,sourcePath:record.path,plan});if(target)links.add(target);}
  edges.set(record.path,links);if(title.length>70||description.length>180)warnings.push({path:record.path,titleCharacters:title.length,descriptionCharacters:description.length});
  widthSamples.push({path:record.path,title,description});
 }finally{window.close();}
}
const depth=new Map([['/',0]]),queue=['/'];for(const route of queue)for(const target of edges.get(route)||[])if(!depth.has(target)){depth.set(target,depth.get(route)+1);queue.push(target);}
const orphans=manifest.pages.filter(p=>!depth.has(p.path));assert.equal(orphans.length,0,'Orphan indexable pages');for(const route of ['/teklif-al','/3d-baski','/3d-tarama','/3d-modelleme'])assert.ok(depth.get(route)<=3,'Conversion page too deep: '+route);
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});
let snippetWidths;
try {
 const page=await browser.newPage();
 snippetWidths=await page.evaluate(rows=>{const context=document.createElement('canvas').getContext('2d');return rows.map(row=>{context.font='20px Arial';const titlePixels=Math.round(context.measureText(row.title).width);context.font='14px Arial';const descriptionPixels=Math.round(context.measureText(row.description).width);return {...row,titlePixels,descriptionPixels,advisoryOverflow:titlePixels>580||descriptionPixels>920};});},widthSamples);
} finally {await browser.close();}
const result={status:'PASS',kind:'artifact-only SEO contract',origin,testedAt:new Date().toISOString(),pages:manifest.pages.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,orphans:orphans.length,maxClickDepth:Math.max(...depth.values()),socialImages,schema:'one graph with distinct stable IDs; visible/graph/manifest modification-date parity',warnings,snippetWidthMethod:"All titles: 20px Arial; descriptions: 14px Arial. Advisory single-line reference widths 580/920px; not a prediction or guarantee of Google snippets.",snippetWidths,productionChecked:false};
await mkdir('artifacts/release',{recursive:true});const output='artifacts/release/search-contracts-'+new URL(origin).hostname+'.json';await writeFile(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,socialImages:undefined,socialImagesVerified:socialImages.length,snippetWidths:undefined,advisorySnippetOverflows:snippetWidths.filter(x=>x.advisoryOverflow).length,warnings:warnings.length,output}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await auditSearchContracts();
