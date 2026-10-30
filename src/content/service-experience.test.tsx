import {describe,it,expect,afterEach} from 'vitest';
import {render,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import defaults from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';
import publication from '../../docs/audits/publication-content-manifest.json';
import type {LandingPage} from './types';
import {serviceExperience,visibleServiceFaq} from './service-experience.mjs';
import {publicLocalContent,publicLocalPath} from '@/lib/local-urls.mjs';
import {contentStructuredData,contentBreadcrumbs} from './structured-content';
import {composeSchemaGraph} from '@/lib/schema-graph';
import {businessGraph} from '@/lib/structured-data';
import {pageGraph} from '@/lib/search';
import ContentFaq from '@/components/brand/ContentFaq';
import ServiceConnections from '@/components/brand/ServiceConnections';
import {schemaIntegrity} from '../../scripts/quality/schema-integrity.mjs';
import {validateVocabulary} from '../../scripts/quality/schema-vocabulary.mjs';
import {assertFAQParity} from '../../scripts/quality/faq-parity.mjs';

const pages=[...new Map([...defaults,...editorial,...search].map(p=>[p.brand+p.path,p])).values()] as LandingPage[];
const published=new Set([...publication.routes.filter(p=>p.brand==='3dyanimda'),...pages.filter(p=>p.brand==='3dyanimda'&&p.status==='published')].map(p=>publicLocalPath(p.path,'3dyanimda')));
const origin='https://3dyanimda.com';
afterEach(cleanup);
describe('visible service experience and dynamic schema',()=>{
 for(const path of ['/bolgeler/istanbul/3d-baski','/bolgeler/istanbul/uskudar/3d-baski','/3d-baski','/3d-tarama','/3d-modelleme','/cozumler/yedek-parca-uretimi']){
  it(`keeps visible FAQ, four services and canonical identities in agreement on ${path}`,()=>{
   const source=pages.find(p=>p.brand==='3dyanimda'&&p.path===path)!;
   const page=publicLocalContent(source,'3dyanimda') as LandingPage;
   const view=render(<MemoryRouter><ContentFaq page={page} brand="3dyanimda"/><ServiceConnections page={page} brand="3dyanimda"/></MemoryRouter>);
   const visible=view.container.textContent||'';
   const graph=composeSchemaGraph([businessGraph({name:'3D Yanımda',origin}),pageGraph({origin,path:page.path,title:page.title,description:page.summary}),...contentStructuredData(page,origin)],origin,origin+page.path);
   const faq=visibleServiceFaq(page,'3dyanimda');
   expect(faq.length).toBeGreaterThanOrEqual(9);
   expect(view.container.querySelectorAll('#sorular details')).toHaveLength(faq.length);
   assertFAQParity(graph['@graph'].find(n=>n['@type']==='FAQPage')!.mainEntity,faq,origin+page.path);
   expect(schemaIntegrity(graph,{origin,visibleText:visible})).toEqual([]);
   expect(validateVocabulary(graph)).toEqual([]);
   const links=Array.from(view.container.querySelectorAll('.service-connections-grid a'));
   expect(links).toHaveLength(4);
   for(const a of links)expect(published.has(a.getAttribute('href')!)).toBe(true);
   expect(links.some(a=>a.getAttribute('href')==='/cozumler/yedek-parca-uretimi')).toBe(true);
   const webpage=graph['@graph'].find(n=>n['@type']==='WebPage')!;
   expect(webpage.mainEntity).toEqual({'@id':origin+page.path+'#service'});
   expect(webpage.hasPart).toEqual([{'@id':origin+page.path+'#faq'},{'@id':origin+page.path+'#itemlist'}]);
   expect(graph['@graph'].filter(n=>n['@type']==='Service')).toHaveLength(4);
   expect(JSON.stringify(graph)).not.toMatch(/3dyaninda\.com|aggregateRating|priceCurrency|\/bolgeler\/istanbul/);
   for(const entry of source.faq)expect(faq).toContainEqual(entry);
  });
 }
 it('preserves authored CMS answers for duplicate questions and does not mutate the record',()=>{
  const source=pages.find(p=>p.brand==='3dyanimda'&&p.path==='/3d-baski')!;
  const question=visibleServiceFaq(source,'3dyanimda')[0].q;
  const page={...source,faq:[{q:question,a:'İşletmenin güncel ve onaylı yanıtı.'}]};
  const before=JSON.stringify(page);
  const faq=visibleServiceFaq(page,'3dyanimda');
  expect(faq.filter(f=>f.q===question)).toEqual(page.faq);
  expect(JSON.stringify(page)).toBe(before);
 });
 it('leaves other brands and editorial pages unchanged',()=>{
  for(const page of pages.filter(p=>p.brand!=='3dyanimda'||p.kind==='guide')){
   expect(visibleServiceFaq(page,page.brand)).toEqual(page.faq);
   expect(serviceExperience(page,page.brand)).toBeNull();
  }
 });
 it('uses the same short breadcrumb hierarchy on the page and in JSON-LD',()=>{
  const page=pages.find(p=>p.brand==='3dyanimda'&&p.path==='/bolgeler/istanbul/uskudar/3d-baski')!;
  const crumbs=contentBreadcrumbs(page,'3dyanimda');
  expect(crumbs.map(c=>c.path)).toEqual(['/','/istanbul','/uskudar','/uskudar-3d-baski']);
  const graph=contentStructuredData(page,origin);
  expect((graph[0].itemListElement as {item:string}[]).map(c=>c.item)).toEqual(crumbs.map(c=>origin+c.path));
 });
});
