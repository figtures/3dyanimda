import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicExportRoutes,assertExportedRouteSets,indexableLinkTarget} from './public-export-routes.mjs';
const input=extra=>({landing:['/3d-baski','/3d-tarama','/3d-modelleme'].map(path=>({path})),pages:[],posts:[],seo:[],redirects:[],portfolio:[],features:[],faqs:[{id:'q1'}],...extra});
const output=plan=>({htmlPaths:[...plan.routes.keys()],indexPaths:[...plan.routes.keys()].filter(p=>!plan.noindex.has(p)),approvedPaths:['/3d-baski']});
test('new sections export while an empty portfolio stays reachable and noindex',()=>{
 const plan=publicExportRoutes(input());const actual=output(plan);
 for(const route of ['/sss','/kariyer','/kariyer/is-basvurusu','/kariyer/makine-isletim'])assert.ok(actual.indexPaths.includes(route));
 assert.ok(actual.htmlPaths.includes('/portfoy'));assert.ok(!actual.indexPaths.includes('/portfoy'));assert.equal(plan.noindex.get('/portfoy'),'empty-portfolio');
 assertExportedRouteSets(plan,actual);
 assert.throws(()=>assertExportedRouteSets(plan,{...actual,htmlPaths:actual.htmlPaths.filter(p=>p!=='/kariyer')}),/HTML/);
 assert.throws(()=>assertExportedRouteSets(plan,{...actual,indexPaths:[...actual.indexPaths,'/portfoy']}),/Discovery/);
 assert.throws(()=>assertExportedRouteSets(plan,{...actual,indexPaths:actual.indexPaths.filter(p=>p!=='/sss')}),/Discovery/);
});
test('published portfolio and empty FAQ have their own indexing decisions',()=>{
 const plan=publicExportRoutes(input({portfolio:[{slug:'ornek-proje'}],faqs:[]}));
 assert.ok(plan.routes.has('/portfoy/ornek-proje'));assert.ok(!plan.noindex.has('/portfoy'));assert.equal(plan.noindex.get('/sss'),'empty-faq');
 assertExportedRouteSets(plan,output(plan));
});
test('a populated blog exports its index and published detail routes together',()=>{
 const plan=publicExportRoutes(input({posts:[{slug:'malzeme-secimi',published:true,published_at:'2026-01-01T00:00:00Z',updated_at:'2026-01-02T00:00:00Z'}]}));
 assert.ok(plan.routes.has('/blog'));
 assert.equal(plan.routes.get('/blog/malzeme-secimi'),'2026-01-02T00:00:00Z');
 assert.equal(indexableLinkTarget('/blog',{origin:'https://3dyanimda.com',sourcePath:'/blog/malzeme-secimi',plan}),'/blog');
 assertExportedRouteSets(plan,output(plan));
});
test('empty, disabled and not-yet-public blog inventories do not create an empty blog hub',()=>{
 for(const extra of [
  {},
  {pages:[{slug:'blog'}]},
  {features:[{feature_key:'blog',enabled:false}],posts:[{slug:'existing'}]},
  {posts:[{slug:'draft',published:false},{slug:'future',published_at:'2999-01-01T00:00:00Z'}]},
 ]) {
  const plan=publicExportRoutes(input(extra));
  assert.ok(![...plan.routes.keys()].some(path=>path==='/blog'||path.startsWith('/blog/')));
  assertExportedRouteSets(plan,output(plan));
 }
});
test('disabled features and scheduled-out inventory do not create routes',()=>{
 const plan=publicExportRoutes(input({features:[{feature_key:'career',enabled:false},{feature_key:'portfolio',enabled:false},{feature_key:'faq',enabled:false}]}));
 for(const path of ['/kariyer','/kariyer/is-basvurusu','/kariyer/makine-isletim','/portfoy','/sss'])assert.ok(!plan.routes.has(path));
 assertExportedRouteSets(plan,output(plan));
});
test('missing API results and unsafe CMS slugs cannot silently produce a release',()=>{
 assert.throws(()=>publicExportRoutes(input({faqs:undefined})),/inventory/);
 assert.throws(()=>publicExportRoutes(input({portfolio:[{slug:'../private'}]})),/Unsafe/);
});
test('links to exported noindex collections are valid; missing targets still fail',()=>{
 const plan=publicExportRoutes(input());const options={origin:'https://3dyanimda.com',sourcePath:'/',plan};
 assert.equal(indexableLinkTarget('/portfoy',options),null);
 assert.equal(indexableLinkTarget('/kariyer',options),'/kariyer');
 assert.throws(()=>indexableLinkTarget('/portfoy/missing',options),/Unpublished internal target/);
 assert.equal(indexableLinkTarget('https://example.com/other',options),null);
});
