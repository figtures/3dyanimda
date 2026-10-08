import test from 'node:test';
import assert from 'node:assert/strict';
import {compileRedirects} from './redirects.mjs';
import worker from '../../deploy/worker.mjs';
test('redirect chains flatten; inactive rows are omitted',()=>{
 assert.deepEqual(compileRedirects([{from_path:'/old',to_path:'/middle'},{from_path:'/middle',to_path:'/new'},{from_path:'/ignored',to_path:'/missing',active:false}],new Set(['/new'])),{'/old':'/new','/middle':'/new'});
});
test('cycles, external targets, private paths and unpublished targets fail closed',()=>{
 for(const rows of [[{from_path:'/a',to_path:'/b'},{from_path:'/b',to_path:'/a'}],[{from_path:'/a',to_path:'//evil.com'}],[{from_path:'/a',to_path:'/admin'}],[{from_path:'/a',to_path:'/draft'}]]) assert.throws(()=>compileRedirects(rows,new Set(['/ready'])));
});
test('published worker serves CMS redirects with one canonical hop and preserves campaign parameters',async()=>{
 const env={SITE_DOMAIN:'3dyanimda.com',RELEASE_MODE:'approved',ASSETS:{fetch:async()=>Response.json({origin:'https://3dyanimda.com',redirects:{'/old':'/3d-baski'}})}};
 const result=await worker.fetch(new Request('http://www.3dyanimda.com/old/?utm_source=test'),env);
 assert.equal(result.status,301);assert.equal(result.headers.get('location'),'https://3dyanimda.com/3d-baski?utm_source=test');
});
test('another brand manifest cannot redirect this brand',async()=>{
 const env={SITE_DOMAIN:'3dyanimda.com',RELEASE_MODE:'approved',ASSETS:{fetch:async()=>Response.json({origin:'https://3dsanayi.com',redirects:{'/old':'/wrong'}})}};
 const result=await worker.fetch(new Request('https://3dyanimda.com/old'),env);
 assert.equal(result.headers.get('location'),null);
});
test('all 652 proposed geographic redirects terminate at an authored page of the same brand',async()=>{
 const {readFile}=await import('node:fs/promises');
 const proposal=JSON.parse(await readFile('docs/audits/geographic-consolidation-proposal.json','utf8'));
 const records=[];
 for(const file of ['pages','editorial-pages','search-pages']) records.push(...JSON.parse(await readFile('src/content/'+file+'.json','utf8')));
 assert.equal(proposal.routes.length,652);
 for(const brand of new Set(proposal.routes.map(r=>r.brand))){
  const rows=proposal.routes.filter(r=>r.brand===brand).map(r=>({from_path:r.from,to_path:r.to}));
  const targets=new Set(records.filter(r=>r.brand===brand&&r.status==='published').map(r=>r.path));
  const result=compileRedirects(rows,targets);
  assert.equal(Object.keys(result).length,163);
 }
});
