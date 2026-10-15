import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {exportedDocumentData} from './export-document.mjs';

test('manifest matches independently parsed serialized quote HTML rather than a live catalog', () => {
  const html = '<!doctype html><html><head><title>Teklif &amp; Üretim</title><meta name="description" content="3D teklif"><script type="application/ld+json">{"@type":"WebPage"}</script></head><body><main><h1>Teklif al</h1><select><option>Malzeme önerin</option></select><img src="/brand/logo.svg"><time data-content-modified datetime="2026-10-01">1 Ekim</time></main></body></html>';
  const url = 'https://3dyanimda.com/teklif-al';
  const {documentData, semanticDate} = exportedDocumentData(html, url);
  const dom = new JSDOM(html, {url});
  try {
    const document = dom.window.document;
    const audited = {title:document.title,description:document.querySelector('meta[name="description"]').content,text:document.querySelector('main').textContent,images:[...document.querySelectorAll('main img')].map(img=>img.src),structuredData:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent)};
    const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
    assert.equal(hash(documentData), hash(audited));
    assert.notEqual(hash(documentData), hash({...audited,text:audited.text+'PLAPETG'}));
    assert.deepEqual(documentData.images, ['https://3dyanimda.com/brand/logo.svg']);
    assert.equal(semanticDate, '2026-10-01');
  } finally { dom.window.close(); }
});

test('optional discovery fields are stable when absent', () => {
  assert.deepEqual(exportedDocumentData('<title>Page</title><main>Hello</main>', 'https://3dyanimda.com/'), {
    documentData: {title:'Page',description:'',text:'Hello',images:[],structuredData:[]}, semanticDate:null,
  });
});
