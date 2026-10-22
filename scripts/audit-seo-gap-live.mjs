/** Read-only live SEO crawl for the 3D Yanımda gap review. Never writes CMS or hosting. */
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {resolve4,resolve6} from 'node:dns/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {JSDOM} from 'jsdom';
import sharp from 'sharp';

const origin='https://3dyanimda.com';
const output=process.argv[2]||'docs/audits/seo-gap-live-baseline-2026-10-23.json';
const concurrency=6;
const execute=promisify(execFile);
const errors=[];
async function request(url,options={}){
 for(let attempt=0;attempt<2;attempt++){
  const started=Date.now();
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(30000),...options});
   const bytes=Buffer.from(await response.arrayBuffer());
   return {status:response.status,url:response.url,headers:Object.fromEntries(response.headers),bytes,durationMs:Date.now()-started};
  }catch(error){if(attempt===1)return {status:null,url,error:String(error),durationMs:Date.now()-started};}
 }
}
async function mapLimit(values,fn){
 const result=new Array(values.length);let next=0;
 await Promise.all(Array.from({length:Math.min(concurrency,values.length)},async()=>{
  while(next<values.length){const i=next++;result[i]=await fn(values[i],i);}
 }));return result;
}
const locs=xml=>[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1].replaceAll('&amp;','&'));
const text=value=>(value||'').replace(/\s+/g,' ').trim();
function extract(response){
 if(!response.bytes)return {url:response.url,status:response.status,error:response.error};
 const html=response.bytes.toString('utf8');
 const dom=new JSDOM(html,{url:response.url});const d=dom.window.document;
 const meta=(name)=>[...d.querySelectorAll('meta')].filter(e=>e.getAttribute('name')===name||e.getAttribute('property')===name).map(e=>e.getAttribute('content'));
 const metas={};for(const name of ['description','robots','og:title','og:description','og:type','og:url','og:image','og:image:width','og:image:height','og:image:alt','og:image:type','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt','article:published_time','article:modified_time']){const values=meta(name);metas[name]=values.length===1?values[0]:values;}
 const schemas=[];let schemaErrors=0;
 for(const script of d.querySelectorAll('script[type="application/ld+json"]')){try{const value=JSON.parse(script.textContent);schemas.push(...(Array.isArray(value)?value:value['@graph']||[value]));}catch{schemaErrors++;}}
 const article=schemas.find(node=>['Article','BlogPosting','TechArticle'].includes(node['@type']));
 const organization=schemas.find(node=>node['@type']==='Organization');
 const business=schemas.find(node=>node['@type']==='ProfessionalService'||node['@type']==='LocalBusiness');
 const links=[...new Set([...d.querySelectorAll('a[href]')].map(a=>a.href).filter(url=>url.startsWith(origin)))];
 const bootstrap=[...d.querySelectorAll('script:not([src])')].map(s=>({type:s.type,id:s.id,bytes:Buffer.byteLength(s.textContent)})).sort((a,b)=>b.bytes-a.bytes).slice(0,3);
 const images=[...d.querySelectorAll('main img')].map(img=>({src:img.src,alt:img.getAttribute('alt'),width:img.getAttribute('width'),height:img.getAttribute('height'),loading:img.getAttribute('loading')}));
 const result={url:response.url,status:response.status,htmlBytes:response.bytes.length,durationMs:response.durationMs,title:d.title,titleCount:d.querySelectorAll('title').length,h1:[...d.querySelectorAll('h1')].map(h=>text(h.textContent)),canonical:[...d.querySelectorAll('link[rel="canonical"]')].map(e=>e.href),metas,schemaTypes:schemas.map(s=>s['@type']),schemaErrors,article:article?{headline:article.headline,datePublished:article.datePublished||null,dateModified:article.dateModified||null,image:article.image||null,citation:article.citation||null,author:article.author}:null,organization:organization?{name:organization.name,sameAs:organization.sameAs||null,contactPoint:organization.contactPoint||null}:null,business:business?{id:business['@id'],name:business.name,address:business.address,geo:business.geo||null,openingHoursSpecification:business.openingHoursSpecification||null,areaServed:business.areaServed||null,hasMap:business.hasMap||null}:null,images,links,bootstrap,responseHeaders:{contentType:response.headers['content-type'],contentEncoding:response.headers['content-encoding'],cacheControl:response.headers['cache-control'],xRobotsTag:response.headers['x-robots-tag']||null,cfCacheStatus:response.headers['cf-cache-status']||null}};
 dom.window.close();return result;
}

const sitemap=await request(origin+'/sitemap.xml');
if(sitemap.status!==200)throw new Error('Sitemap unavailable: '+JSON.stringify(sitemap));
const mapURLs=locs(sitemap.bytes.toString());
const sitemapFiles=await mapLimit(mapURLs,async url=>{const r=await request(url);return {url,status:r.status,xml:r.bytes?.toString()||'',error:r.error};});
const urls=[...new Set(sitemapFiles.flatMap(r=>locs(r.xml)))];
console.log('Crawling '+urls.length+' sitemap URLs');
const pages=await mapLimit(urls,async(url,i)=>{const row=extract(await request(url));if((i+1)%25===0)console.log('Fetched '+(i+1)+'/'+urls.length);return row;});
const urlSet=new Set(urls);
const reached=new Set([origin+'/']);const queue=[origin+'/'];const byUrl=new Map(pages.map(row=>[row.url,row]));
while(queue.length){const url=queue.shift();for(const href of byUrl.get(url)?.links||[]){const u=new URL(href);u.search='';u.hash='';const clean=u.href;if(urlSet.has(clean)&&!reached.has(clean)){reached.add(clean);queue.push(clean);}}}
const duplicates=(field)=>Object.entries(Object.groupBy(pages,row=>field(row))).filter(([key,rows])=>key&&rows.length>1).map(([value,rows])=>({value,urls:rows.map(r=>r.url)}));
const uniqueOG=[...new Set(pages.map(p=>p.metas?.['og:image']).filter(v=>typeof v==='string'))];
const ogImages=await mapLimit(uniqueOG,async url=>{const r=await request(url);let dimensions=null;try{if(r.bytes)dimensions=await sharp(r.bytes).metadata();}catch{}return {url,status:r.status,type:r.headers?.['content-type']||null,bytes:r.bytes?.length||0,width:dimensions?.width||null,height:dimensions?.height||null,error:r.error};});
const extraPaths=['/robots.txt','/llms.txt','/llms-full.txt','/search-manifest.json'];
const discovery=await mapLimit(extraPaths,async route=>{const r=await request(origin+route);return {url:origin+route,status:r.status,contentType:r.headers?.['content-type'],text:route.endsWith('.txt')?r.bytes?.toString():undefined,bytes:r.bytes?.length,error:r.error};});
const variants=['http://3dyanimda.com/','https://www.3dyanimda.com/','https://www.3dyanimda.com/3d-baski?utm_source=seo-audit','https://3dyanimda.com/3d-baski/','https://3dyanimda.com/3d-baski?utm_source=seo-audit','https://3dyanimda.com/__seo-audit-missing-20261023','https://3dyanimda.com/portfoy','https://3dyanimda.com/blog'];
const redirects=await mapLimit(variants,async url=>{
 const hops=[];let current=url;
 for(let i=0;i<6;i++){const r=await request(current,{redirect:'manual'});hops.push({url:current,status:r.status,location:r.headers?.location||null,error:r.error});if(r.status>=300&&r.status<400&&r.headers?.location){current=new URL(r.headers.location,current).href;continue;}return {requested:url,hops,page:r.headers?.['content-type']?.includes('html')?extract(r):null};}
 return {requested:url,hops,error:'Too many redirects'};
});
const userAgents=[['facebookexternalhit','facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],['Twitterbot','Twitterbot/1.0'],['OAI-SearchBot','Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot']];
const botChecks=await mapLimit(userAgents,async([name,ua])=>{
 const rows=await mapLimit(['/','/3d-baski','/rehber/stl-dosya-hazirlama'],async route=>{const p=extract(await request(origin+route,{headers:{'User-Agent':ua}}));return {url:origin+route,status:p.status,title:p.title,canonical:p.canonical,og:p.metas?.['og:image'],robots:p.metas?.robots,error:p.error};});return {name,checks:rows};
});
const dns={};for(const host of ['3dyanimda.com','www.3dyanimda.com']){dns[host]={};for(const [type,fn] of [['A',resolve4],['AAAA',resolve6]]){try{dns[host][type]=await fn(host);}catch(e){dns[host][type]={localResolverError:e.code||String(e)};const doh=await request('https://dns.google/resolve?name='+host+'&type='+type);if(doh.status===200){try{dns[host][type].httpsResolver=JSON.parse(doh.bytes.toString());}catch{}}}}}
// The environment's fetch transport does not support plain HTTP consistently. curl uses its configured HTTP transport.
try{const {stdout}=await execute('curl',['-sS','-I','--max-time','20','http://3dyanimda.com/']);const status=Number(stdout.match(/^HTTP\/[^ ]+ (\d+)/m)?.[1]);const location=stdout.match(/^location:\s*(.*?)\r?$/im)?.[1];const row=redirects.find(r=>r.requested==='http://3dyanimda.com/');if(status&&row){row.transportNote='curl HEAD independently verified the first hop after fetch transport failed';row.hops=[{url:row.requested,status,location:location||null}];}}catch{}
const localPages=pages.filter(p=>new URL(p.url).pathname.startsWith('/bolgeler/'));
const articles=pages.filter(p=>p.article);
const report={origin,observedAt:new Date().toISOString(),source:'Live public HTTP responses; direct server response only, no browser hydration or account access.',limits:['No Search Console, Google Business Profile, WAF account logs, GA4 receipt, backlink profile or CrUX field metrics are claimed.','Bot User-Agent probes use the audit client network, not verified search engine source IPs.','HTTP HTML bytes are decoded response bytes, not compressed wire transfer size.'],summary:{sitemapFiles:sitemapFiles.length,sitemapUrls:urls.length,pages200:pages.filter(p=>p.status===200).length,oneH1:pages.filter(p=>p.h1?.length===1).length,selfCanonical:pages.filter(p=>p.canonical?.length===1&&p.canonical[0]===p.url).length,indexEligible:pages.filter(p=>typeof p.metas?.robots==='string'&&!/noindex/i.test(p.metas.robots)).length,uniqueTitles:new Set(pages.map(p=>p.title)).size,uniqueDescriptions:new Set(pages.map(p=>p.metas?.description)).size,uniqueOG:uniqueOG.length,articles:articles.length,articlesWithDatePublished:articles.filter(p=>p.article.datePublished).length,articlesWithImage:articles.filter(p=>p.article.image).length,articlesWithVisibleContentImage:articles.filter(p=>p.images.some(i=>!i.src.includes('/brand/'))).length,localPages:localPages.length,linksReachableFromHome:reached.size},issues:{non200:pages.filter(p=>p.status!==200).map(p=>({url:p.url,status:p.status,error:p.error})),wrongH1:pages.filter(p=>p.h1?.length!==1).map(p=>({url:p.url,h1:p.h1})),wrongCanonical:pages.filter(p=>p.canonical?.length!==1||p.canonical[0]!==p.url).map(p=>({url:p.url,canonical:p.canonical})),noindexInSitemap:pages.filter(p=>/noindex/i.test(p.metas?.robots)).map(p=>p.url),duplicateTitles:duplicates(p=>p.title),duplicateDescriptions:duplicates(p=>p.metas?.description),notReachableFromHome:urls.filter(u=>!reached.has(u)),longDescriptions:pages.filter(p=>typeof p.metas?.description==='string'&&p.metas.description.length>180).map(p=>({url:p.url,length:p.metas.description.length})),schemaErrors:pages.filter(p=>p.schemaErrors),ogFailed:ogImages.filter(i=>i.status!==200||!i.width)},sitemapFiles:sitemapFiles.map(({xml,...r})=>({...r,urlCount:locs(xml).length,lastmods:[...new Set([...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m=>m[1]))]})),dns,redirects,botChecks,discovery,ogImages,pages};
await mkdir(path.dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report)+'\n');
console.log(JSON.stringify({output,summary:report.summary,issues:{...report.issues,longDescriptions:report.issues.longDescriptions.length}},null,2));
