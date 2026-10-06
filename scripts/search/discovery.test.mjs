import {test} from 'node:test';
import assert from 'node:assert/strict';
import {discoveryFiles,changedUrls} from './discovery.mjs';
import worker from '../../deploy/worker.mjs';
const origin='https://3dsanayi.com';
test('sitemap, image references and optional directory share one canonical inventory',()=>{
  const files=discoveryFiles({origin,brand:'3D & Sanayi',pages:[{path:'/',title:'Sanayi',description:'Ana sayfa',hash:'1'},{path:'/rehber/aparat',title:'Aparat',description:'Yük & sıcaklık',lastmod:'2026-10-01',images:[origin+'/image.webp','https://another.example/image.webp'],hash:'2'}]});
  assert.match(files['sitemap.xml'],/sitemapindex/);
  assert.match(files['sitemaps/rehber-1.xml'],/<lastmod>2026-10-01T00:00:00.000Z<\/lastmod>/);
  assert.doesNotMatch(files['sitemaps/sayfalar-1.xml'],/lastmod/);
  assert.doesNotMatch(files['sitemaps/rehber-1.xml'],/another.example/);
  assert.match(files['llms.txt'],/https:\/\/3dsanayi.com\/rehber\/aparat/);
  assert.doesNotMatch(files['robots.txt'],/OAI-SearchBot\nDisallow/);
});
test('private routes, duplicates and cross-brand manifests are rejected',()=>{
  assert.throws(()=>discoveryFiles({origin,brand:'Brand',pages:[{path:'/admin/requests'}]}));
  assert.throws(()=>discoveryFiles({origin,brand:'Brand',pages:[{path:'/x'},{path:'/x/'}]}));
  assert.throws(()=>changedUrls({origin,pages:[]},{origin:'https://maketyanimda.com',pages:[]}));
  assert.throws(()=>changedUrls({origin,pages:[{url:origin+'/private?token=secret'}]}));
});
test('IndexNow changes include updated/new/removed URLs, not unchanged pages',()=>{
  const previous={origin,pages:[{url:origin+'/',hash:'same'},{url:origin+'/old',hash:'old'},{url:origin+'/changed',hash:'v1'}]};
  const current={origin,pages:[{url:origin+'/',hash:'same'},{url:origin+'/new',hash:'new'},{url:origin+'/changed',hash:'v2'}]};
  assert.deepEqual(changedUrls(current,previous),[{url:origin+'/new',removed:false},{url:origin+'/changed',removed:false},{url:origin+'/old',removed:true}]);
});
test('worker consolidates host, old service paths and index variants in one redirect',async()=>{
  const env={SITE_DOMAIN:'3dsanayi.com',RELEASE_MODE:'approved',ASSETS:{fetch:()=>new Response('missing',{status:404})}};
  const r=await worker.fetch(new Request('http://www.3dsanayi.com/hizmetler/3d-baski/index.html?utm_source=bing'),env);
  assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://3dsanayi.com/3d-baski?utm_source=bing');
  const missing=await worker.fetch(new Request(origin+'/missing'),env);
  assert.equal(missing.status,404);assert.match(missing.headers.get('X-Robots-Tag'),/noindex/);
  const preview=await worker.fetch(new Request('https://preview.workers.dev/robots.txt'),env);
  assert.match(await preview.text(),/Disallow: \//);
});
