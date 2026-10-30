import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {localUrlMap,publicLocalPath,contentLocalPath,publicLocalContent} from '../../src/lib/local-urls.mjs';
import {publicExportRoutes,assertExportedRouteSets} from '../quality/public-export-routes.mjs';
import worker from '../../deploy/worker.mjs';
const input=(brand='3dyanimda')=>({origin:`https://${brand}.com`,landing:['/3d-baski','/3d-tarama','/3d-modelleme',...Object.keys(localUrlMap)].map(path=>({path,updated_at:'2026-10-23T00:00:00Z'})),pages:[],posts:[],seo:[],redirects:[],portfolio:[],features:[],faqs:[{id:'1'}]});
test('every known local route round-trips without collisions or altering other brands',()=>{
 const to=Object.values(localUrlMap);assert.equal(to.length,new Set(to).size);
 for(const [old,path] of Object.entries(localUrlMap)){
  assert.match(path,/^\/[a-z0-9-]+$/);assert.equal(contentLocalPath(path,'3dyanimda'),old);
  assert.equal(publicLocalPath(old+'?utm_source=test#sorular','3dyanimda'),path+'?utm_source=test#sorular');
  for(const brand of ['3dsanayi','maketyanimda','parcayanimda'])assert.equal(publicLocalPath(old,brand),old);
 }
 assert.equal(publicLocalPath('/bolgeler/istanbul/3d-baski','3dyanimda'),'/istanbul-3d-baski');
 assert.equal(publicLocalPath('/bolgeler/istanbul/kadikoy/3d-baski','3dyanimda'),'/kadikoy-3d-baski');
});
test('export keeps only canonical destinations and flattens pre-existing redirects',()=>{
 const data=input();data.redirects=[{from_path:'/eski-kadikoy',to_path:'/bolgeler/istanbul/kadikoy/3d-baski'}];
 const plan=publicExportRoutes(data);
 assert.equal(plan.redirectMap['/eski-kadikoy'],'/kadikoy-3d-baski');
 for(const [old,path] of Object.entries(localUrlMap)){assert.ok(!plan.routes.has(old));assert.ok(plan.routes.has(path));assert.equal(plan.redirectMap[old],path);assert.equal(plan.routes.get(path),'2026-10-23T00:00:00Z');}
 assertExportedRouteSets(plan,{htmlPaths:[...plan.routes.keys()],indexPaths:[...plan.routes.keys()].filter(p=>!plan.noindex.has(p)),approvedPaths:data.landing.map(p=>p.path)});
 for(const brand of ['3dsanayi','maketyanimda','parcayanimda']){const other=publicExportRoutes(input(brand));assert.ok(other.routes.has('/bolgeler/istanbul/3d-baski'));assert.ok(!other.routes.has('/istanbul-3d-baski'));}
});
test('excluded and unpublished local routes do not gain redirects or index entries',()=>{
 const data=input();data.seo=[{path:'/bolgeler/istanbul/3d-baski',noindex:true}];
 data.landing=data.landing.filter(p=>p.path!=='/bolgeler/istanbul/kadikoy/3d-tarama');
 const plan=publicExportRoutes(data);
 for(const old of ['/bolgeler/istanbul/3d-baski','/bolgeler/istanbul/kadikoy/3d-tarama']){assert.ok(!plan.routes.has(publicLocalPath(old,'3dyanimda')));assert.equal(plan.redirectMap[old],undefined);}
 const collision=input();collision.landing.push({path:'/istanbul-3d-baski'});assert.throws(()=>publicExportRoutes(collision),/collision/);
});
test('published authored content preserves text and maps related links without changing CMS input',()=>{
 for(const file of ['pages','editorial-pages','search-pages'])for(const page of JSON.parse(readFileSync(`src/content/${file}.json`))){
  const copy=JSON.stringify(page),publicPage=publicLocalContent(page,page.brand);
  assert.equal(JSON.stringify(page),copy);assert.equal(publicPage.title,page.title);assert.equal(publicPage.summary,page.summary);
  if(page.brand!=='3dyanimda')assert.deepEqual(publicPage,page);
  else for(const link of publicPage.editorial?.relatedPaths||[])assert.ok(!localUrlMap[link]);
 }
});
test('Worker serves one-hop permanent redirects, preserving query parameters',async()=>{
 const plan=publicExportRoutes(input());
 const env={SITE_DOMAIN:'3dyanimda.com',RELEASE_MODE:'approved',ASSETS:{fetch:async()=>Response.json({origin:'https://3dyanimda.com',redirects:plan.redirectMap})}};
 for(const [old,path] of Object.entries(localUrlMap)){
  const response=await worker.fetch(new Request('https://www.3dyanimda.com'+old+'/?utm_source=search'),env);
  assert.equal(response.status,301);assert.equal(response.headers.get('Location'),'https://3dyanimda.com'+path+'?utm_source=search');
 }
});
