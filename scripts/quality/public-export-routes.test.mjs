import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicExportRoutes,assertExportedRouteSets} from './public-export-routes.mjs';
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
test('disabled features and scheduled-out inventory do not create routes',()=>{
 const plan=publicExportRoutes(input({features:[{feature_key:'career',enabled:false},{feature_key:'portfolio',enabled:false},{feature_key:'faq',enabled:false}]}));
 for(const path of ['/kariyer','/kariyer/is-basvurusu','/kariyer/makine-isletim','/portfoy','/sss'])assert.ok(!plan.routes.has(path));
 assertExportedRouteSets(plan,output(plan));
});
test('missing API results and unsafe CMS slugs cannot silently produce a release',()=>{
 assert.throws(()=>publicExportRoutes(input({faqs:undefined})),/inventory/);
 assert.throws(()=>publicExportRoutes(input({portfolio:[{slug:'../private'}]})),/Unsafe/);
});
