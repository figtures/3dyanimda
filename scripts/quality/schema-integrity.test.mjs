import {test} from 'node:test';
import assert from 'node:assert/strict';
import {schemaIntegrity} from './schema-integrity.mjs';
const origin='https://3dyanimda.com';
const graph=nodes=>({'@context':'https://schema.org','@graph':nodes});
test('detects dangling internal references, duplicate IDs and invented FAQ visibility',()=>{
 const bad=graph([{'@type':'WebPage','@id':origin+'/#webpage',publisher:{'@id':origin+'/#missing'}},{'@type':'FAQPage','@id':origin+'/#faq',mainEntity:[{name:'Question',acceptedAnswer:{text:'Invisible'}}]}]);
 assert.match(schemaIntegrity(bad,{origin,visibleText:'Question'}).join(' '),/Dangling internal reference/);
 assert.match(schemaIntegrity(bad,{origin,visibleText:'Question'}).join(' '),/FAQ differs/);
 assert.match(schemaIntegrity(graph([bad['@graph'][0],bad['@graph'][0]]),{origin}).join(' '),/duplicate/);
});
test('accepts resolved identity and whitespace-normalized visible answers without sorting semantic arrays',()=>{
 const doc=graph([{'@type':'Organization','@id':origin+'/#organization'},{'@type':'FAQPage','@id':origin+'/#faq',publisher:{'@id':origin+'/#organization'},mainEntity:[{name:'Question',acceptedAnswer:{text:'Visible answer'}}]}]);
 assert.deepEqual(schemaIntegrity(doc,{origin,visibleText:'Question\n Visible   answer'}),[]);
});
