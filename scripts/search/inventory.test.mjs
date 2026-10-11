import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {discoveryFiles} from './discovery.mjs';
import {SITEMAP_MAX_BYTES,SITEMAP_MAX_URLS} from './sitemap.mjs';

test('all four declared inventories retain 852 canonical URLs through valid XML discovery generation',async()=>{
 const inventory=JSON.parse(await readFile('docs/search-program/url-inventory.json','utf8'));
 const publication=JSON.parse(await readFile('docs/audits/publication-content-manifest.json','utf8'));
 const authored=new Map();
 for(const name of ['pages','editorial-pages','search-pages'])for(const row of JSON.parse(await readFile('src/content/'+name+'.json','utf8')))authored.set(row.brand+row.path,row);
 let total=0;
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']) {
  const origin='https://'+brand+'.com';
  const rows=inventory.rows.filter(row=>row.brand===brand);
  const urls=new Set(rows.map(row=>row.expectedCanonical));
  assert.equal(rows.length,213);assert.equal(urls.size,rows.length);
  for(const row of rows)assert.equal(row.expectedCanonical,origin+row.path);
  const published=publication.routes.filter(row=>row.brand===brand);
  assert.equal(published.length,199);
  for(const row of published){assert.ok(authored.has(brand+row.path));assert.ok(urls.has(origin+row.path));}
  // This is a declared source-inventory fixture, not a live status/HTML certification.
  const files=discoveryFiles({origin,brand,pages:rows.map(row=>({path:row.path,title:authored.get(brand+row.path)?.title||row.path,canonical:row.expectedCanonical}))});
  const actual=[];
  for(const [name,xml] of Object.entries(files).filter(([name])=>name.startsWith('sitemaps/'))) {
   assert.ok(Buffer.byteLength(xml)<=SITEMAP_MAX_BYTES,name);
   const dom=new JSDOM(xml,{contentType:'text/xml'});
   try {
    const locations=[...dom.window.document.querySelectorAll('url > loc')].map(node=>node.textContent);
    assert.ok(locations.length<=SITEMAP_MAX_URLS);actual.push(...locations);
   }finally{dom.window.close();}
  }
  assert.equal(actual.length,rows.length);assert.deepEqual(new Set(actual),urls);total+=actual.length;
 }
 assert.equal(total,852);
});
