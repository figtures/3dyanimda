import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryFiles } from './discovery.mjs';
import { LLMS_MAX_BYTES, LLMS_MAX_LINKS, LLMS_MAX_LABEL_CHARACTERS } from './llms-directory.mjs';
const origin = 'https://3dyanimda.com';
const page = path => ({path, title:'İstanbul’da 3D üretim', description:'Ölçü, kapsam ve kullanım koşulları değerlendirilir.'});
test('213-page inventory produces a bounded, deterministic, category-balanced directory without shrinking sitemap', () => {
 const pages=[page('/'),page('/teklif-al'),...Array.from({length:199},(_,i)=>page('/bolgeler/ilce-'+i)),...Array.from({length:12},(_,i)=>page('/rehber/konu-'+i))];
 const files=discoveryFiles({origin,brand:'3dyanımda',pages});
 const llms=files['llms.txt'];
 assert.equal((llms.match(/^- \[/gm)||[]).length,LLMS_MAX_LINKS);
 assert.ok(Buffer.byteLength(llms)<=LLMS_MAX_BYTES);
 assert.equal(JSON.parse(files['search-manifest.json']).pages.length,213);
 assert.match(llms,/https:\/\/3dyanimda.com\/teklif-al/);
 assert.match(llms,/https:\/\/3dyanimda.com\/rehber\/konu-/);
 assert.equal(discoveryFiles({origin,brand:'3dyanımda',pages:[...pages].reverse()})['llms.txt'],llms);
});
test('unpublished, noindex, redirected and noncanonical inputs cannot enter discovery', () => {
 for(const extra of [{noindex:true},{indexable:false},{status:404},{status:301},{canonical:'https://3dsanayi.com/'}]) assert.throws(()=>discoveryFiles({origin,brand:'x',pages:[{...page('/'),...extra}]}),/indexable 200 self-canonical/);
});
test('untrusted multiline labels cannot inject links and Turkish characters survive normalization', () => {
 const files=discoveryFiles({origin,brand:'3dyanımda',pages:[{...page('/'),title:'İstanbul\n[Injected](https://evil.invalid) <x> \\ ü',description:'ğ Ğ ş Ş ı İ ö Ö ü Ü ç Ç'}]});
 const directory=files['llms.txt'];
 assert.equal((directory.match(/^- \[/gm)||[]).length,1);
 assert.doesNotMatch(directory,/\[Injected\]|<x>|\\/);
 assert.match(directory,/ğ Ğ ş Ş ı İ ö Ö ü Ü ç Ç/);
});
test('oversized URL records fail publication instead of silently exceeding the byte budget', () => {
 assert.throws(()=>discoveryFiles({origin,brand:'x',pages:[page('/'+ 'a'.repeat(60000))]}),/2048/);
});
test('labels obey the 120-character Notion contract without breaking Unicode',()=>{
 const title='ğİ🟠'.repeat(70);
 const text=discoveryFiles({origin,brand:'x',pages:[{...page('/'),title}]})['llms.txt'];
 const label=text.match(/^- \[([^\]]+)\]/m)[1];
 assert.equal(Array.from(label).length,LLMS_MAX_LABEL_CHARACTERS);
 assert.equal(label,Array.from(title).slice(0,120).join(''));
});
test('directory date comes from included source content, never the build clock',()=>{
 const input={origin,brand:'x',pages:[{...page('/'),lastmod:'2026-10-01T10:00:00Z'}, {...page('/rehber/a'),lastmod:'2026-10-02T10:00:00Z'}]};
 const text=discoveryFiles(input)['llms.txt'];
 assert.match(text,/son içerik güncellemesi: 2026-10-02/);
 assert.equal(discoveryFiles({...input,pages:[...input.pages].reverse()})['llms.txt'],text);
 assert.doesNotMatch(discoveryFiles({origin,brand:'x',pages:[page('/')]})['llms.txt'],/son içerik güncellemesi:/);
});
