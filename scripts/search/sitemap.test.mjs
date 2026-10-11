import test from 'node:test';
import assert from 'node:assert/strict';
import {chunkSitemapEntries,validateSitemapIndex,SITEMAP_MAX_BYTES,SITEMAP_MAX_URLS} from './sitemap.mjs';
import {discoveryFiles} from './discovery.mjs';

test('sitemaps split at URL count with every entry included exactly once',()=>{
 const entries=Array.from({length:5},(_,i)=>`<url><loc>https://example.com/${i}</loc></url>`);
 const chunks=chunkSitemapEntries(entries,{maxUrls:2});
 assert.equal(chunks.length,3);
 for(const entry of entries)assert.equal(chunks.join('').split(entry).length-1,1);
 assert.deepEqual(chunks.map(xml=>(xml.match(/<url>/g)||[]).length),[2,2,1]);
});
test('UTF-8 byte limit includes XML wrapper and separates multibyte rows at exact boundary',()=>{
 const row='<url><loc>https://example.com/üğış</loc></url>';
 const size=Buffer.byteLength(chunkSitemapEntries([row])[0]);
 assert.equal(chunkSitemapEntries([row],{maxBytes:size}).length,1);
 assert.throws(()=>chunkSitemapEntries([row],{maxBytes:size-1}),/entry exceeds/);
 const chunks=chunkSitemapEntries([row,row],{maxBytes:size});
 assert.equal(chunks.length,2);
 assert.ok(chunks.every(xml=>Buffer.byteLength(xml)<=size));
});
test('oversized limits and empty or excessive sitemap indices fail closed',()=>{
 assert.throws(()=>chunkSitemapEntries([],{maxUrls:SITEMAP_MAX_URLS+1}),/limits/);
 assert.throws(()=>chunkSitemapEntries([],{maxBytes:SITEMAP_MAX_BYTES+1}),/limits/);
 for(const count of [0,SITEMAP_MAX_URLS+1])assert.throws(()=>validateSitemapIndex('<sitemapindex/>',count),/limits/);
 assert.throws(()=>discoveryFiles({origin:'https://example.com',brand:'Example',pages:[]}),/empty/);
});
test('URL length boundaries and image URLs are validated before public manifest serialization',()=>{
 const origin='https://example.com';
 const safe=origin+'/photo.webp';
 const files=discoveryFiles({origin,brand:'Example',pages:[{path:'/',images:[safe,safe,'https://user:secret@example.com/a.png',origin+'/a.png?token=secret',origin+'/auth/photo',origin+'/a.png#secret','https://elsewhere.test/a.png']} ]});
 assert.deepEqual(JSON.parse(files['search-manifest.json']).pages[0].images,[safe]);
 assert.doesNotMatch(Object.values(files).join(''),/secret/);
 const long='/'+ 'a'.repeat(2048-origin.length-1);
 assert.throws(()=>discoveryFiles({origin,brand:'Example',pages:[{path:long}]}),/2048/);
 assert.ok(discoveryFiles({origin,brand:'Example',pages:[{path:long.slice(0,-1)}]})['sitemap.xml']);
});
