import {describe,it,expect} from 'vitest';
import base from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';
import catalog from '@/brands/catalog.json';
import {contentStructuredData} from './structured-content';
import type {LandingPage} from './types';
import {composeSchemaGraph} from '@/lib/schema-graph';
import {businessGraph} from '@/lib/structured-data';
import {pageGraph} from '@/lib/search';
import {schemaIntegrity} from '../../scripts/quality/schema-integrity.mjs';
import {validateVocabulary} from '../../scripts/quality/schema-vocabulary.mjs';
const all=new Map<string,LandingPage>();
for(const p of [...base,...editorial,...search] as LandingPage[])all.set(p.brand+p.path,p);
describe('full authored structured-content inventory',()=>{
 it('has complete coverage across four brands',()=>{expect(all.size).toBe(796);expect(new Set([...all.values()].map(p=>p.brand)).size).toBe(4);});
 it('matches Schema.org domains, visible FAQ and resolved brand-specific identities on every record',()=>{
  for(const page of all.values()){
   const origin='https://'+page.brand+'.com';const brand=catalog.find(b=>b.slug===page.brand)!;
   const graph=composeSchemaGraph([businessGraph({name:brand.name,origin}),pageGraph({origin,path:page.path,title:page.title,description:page.summary}),...contentStructuredData(page,origin)],origin,origin+page.path);
   const visible=page.faq.map(f=>f.q+' '+f.a).join(' ');
   expect(validateVocabulary(graph),page.brand+page.path).toEqual([]);
   expect(schemaIntegrity(graph,{origin,visibleText:visible}),page.brand+page.path).toEqual([]);
   expect(JSON.stringify(graph)).not.toMatch(/aggregateRating|priceCurrency|ratingValue/);
   if(page.kind==='location')expect(graph['@graph'].some(n=>n['@type']==='ProfessionalService')).toBe(false);
  }
 });
 it('connects the page, service, breadcrumb and visible FAQ without inventing dates',()=>{
  const p=[...all.values()].find(p=>p.kind==='service')!;const origin='https://'+p.brand+'.com';
  const graph=composeSchemaGraph([pageGraph({origin,path:p.path,title:p.title,description:p.summary}),...contentStructuredData(p,origin)],origin,origin+p.path)['@graph'];
  const page=graph.find(n=>n['@type']==='WebPage')!;
  expect(page.mainEntity).toEqual({'@id':origin+p.path+'#service'});
  expect(page.breadcrumb).toEqual({'@id':origin+p.path+'#breadcrumb'});
  expect(JSON.stringify(graph)).not.toContain('datePublished');
 });
 it('rejects an invented type and a real property on the wrong type',()=>{
  expect(validateVocabulary({'@type':'Service',headline:'Wrong domain'})).toHaveLength(1);
  expect(validateVocabulary({'@type':'AISearchOptimization'})).toHaveLength(1);
 });
});
