import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import sharp from 'sharp';
import {chromium} from '@playwright/test';
const directory=path.resolve(process.argv[2]||'release/3dyanimda.com');
const manifest=JSON.parse(await readFile(path.join(directory,'search-manifest.json'),'utf8'));
const origin=manifest.origin,edges=new Map(),titles=new Set(),descriptions=new Set(),warnings=[];
const utility=new Set(['/yasal','/kvkk-aydinlatma-metni','/gizlilik-politikasi','/cerez-politikasi','/kullanim-kosullari','/basvuru-acik-riza-metni']);
const routes=new Set([...manifest.pages.map(p=>p.path),...utility]);
const widthSamples=[];
for(const record of manifest.pages){
 const {window}=new JSDOM(await readFile(path.join(directory,record.path.slice(1),'index.html'),'utf8'),{url:origin+record.path});const d=window.document;
 try{
  const title=d.title,description=d.querySelector('meta[name=description]')?.content;
  assert.ok(title&&description);assert.ok(!titles.has(title),'Duplicate title: '+title);assert.ok(!descriptions.has(description),'Duplicate description: '+record.path);titles.add(title);descriptions.add(description);
  assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('link[rel=canonical]')?.href,origin+record.path);
  assert.equal(d.querySelector('meta[property="og:title"]')?.content,title);assert.equal(d.querySelector('meta[property="og:description"]')?.content,description);
  const image=d.querySelector('meta[property="og:image"]')?.content;assert.ok(image?.startsWith(origin+'/brand/identity/'));assert.equal(d.querySelector('meta[name="twitter:image"]')?.content,image);assert.equal(d.querySelector('meta[name="twitter:card"]')?.content,'summary_large_image');
  const meta=await sharp(path.join(directory,new URL(image).pathname)).metadata();assert.equal(meta.width,1200);assert.equal(meta.height,630);assert.equal(meta.format,'png');
  const schemas=[...d.querySelectorAll('script[type="application/ld+json"]')];assert.equal(schemas.length,1);const graph=JSON.parse(schemas[0].textContent)['@graph'];assert.ok(graph.length);assert.equal(new Set(graph.map(n=>n['@id'])).size,graph.length);
  const date=d.querySelector('[data-content-modified]')?.getAttribute('datetime');if(date){assert.equal(Date.parse(record.lastmod),Date.parse(date));for(const node of graph.filter(n=>n.dateModified))assert.equal(Date.parse(node.dateModified),Date.parse(date));}
  const links=new Set();for(const a of d.querySelectorAll('a[href]')){const u=new URL(a.href);if(u.origin!==origin||/^\/(admin|studio|auth)(\/|$)/.test(u.pathname))continue;const target=u.pathname.replace(/\/+$/,'')||'/';if(/\.[a-z0-9]+$/i.test(target))continue;assert.ok(routes.has(target),'Unpublished internal target '+record.path+' -> '+target);if(!utility.has(target))links.add(target);}
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
const result={status:'PASS',kind:'artifact-only SEO contract',origin,testedAt:new Date().toISOString(),pages:manifest.pages.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,orphans:orphans.length,maxClickDepth:Math.max(...depth.values()),socialRasterSize:[1200,630],schema:'one graph with distinct stable IDs; visible/graph/manifest modification-date parity',warnings,snippetWidthMethod:"All titles: 20px Arial; descriptions: 14px Arial. Advisory single-line reference widths 580/920px; not a prediction or guarantee of Google snippets.",snippetWidths,productionChecked:false};
const output='docs/audits/search-contracts-'+new URL(origin).hostname+'-2026-10-11.json';await writeFile(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,snippetWidths:undefined,advisorySnippetOverflows:snippetWidths.filter(x=>x.advisoryOverflow).length,warnings:warnings.length,output}));
