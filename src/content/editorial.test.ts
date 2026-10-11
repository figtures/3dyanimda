import {describe,it,expect} from 'vitest';
import {editorialSchema} from './editorial';
import pages from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';

describe('Notion GEO-04 editorial boundaries',()=>{
 it('accepts all 796 existing effective content records without changing their text',()=>{
  const records=new Map([...pages,...editorial,...search].map(p=>[p.brand+p.path,p]));
  expect(records.size).toBe(796);
  for(const [id,row] of records)expect(editorialSchema.safeParse(row.editorial).success,id).toBe(true);
 });
 it('rejects a 121-word direct answer even when the character budget is satisfied',()=>{
  expect(editorialSchema.safeParse({answer:Array(120).fill('üretim').join(' ')}).success).toBe(true);
  expect(editorialSchema.safeParse({answer:Array(121).fill('üretim').join(' ')}).success).toBe(false);
 });
 it('rejects private related routes and credential-bearing source URLs',()=>{
  for(const route of ['/auth','/auth/callback','/admin','/studio/edit','/api/data','/rehber//test'])expect(editorialSchema.safeParse({relatedPaths:[route]}).success).toBe(false);
  expect(editorialSchema.safeParse({sources:[{title:'Kaynak',url:'https://name:secret@example.com/source'}]}).success).toBe(false);
  expect(editorialSchema.safeParse({relatedPaths:['/rehber/test'],sources:[{title:'Kaynak',url:'https://example.com/reference#section'}]}).success).toBe(true);
 });
});
