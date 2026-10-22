import {describe,it,expect} from 'vitest';
import {editorialSchema} from './editorial';
import pages from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';
import additions from '../../content/authoring/seo-gap-3dyanimda-2026-10-23.json';

describe('Notion GEO-04 editorial boundaries',()=>{
 it('accepts the full effective inventory including explicitly authored 3dyanimda additions',()=>{
  const records=new Map([...pages,...editorial,...search].map(p=>[p.brand+p.path,p]));
  expect(records.size).toBe(796+additions.newPages.length);
  for(const [id,row] of records)expect(editorialSchema.safeParse(row.editorial).success,id).toBe(true);
 });
 it('preserves factual media metadata, public tools and downloadable examples',()=>{
  const data={publishedAt:'2026-10-01T12:00:00Z',media:{alt:'STL dosyasında üç ölçü ekseni',width:1200,height:630,caption:'Birim kontrolü için açıklayıcı şema.'},resources:[{title:'Örnek STL',path:'/downloads/3dyanimda/referans-kup-20mm.stl',description:'Özgün 20 mm küp.'},{title:'Önizleyici',path:'/araclar/stl-onizle'}]};
  expect(editorialSchema.parse(data)).toMatchObject(data);
  for(const path of ['//external.example/file.csv','/../private.csv','/admin/report.csv','/studio/model.stl','https://example.com/file.csv'])expect(editorialSchema.safeParse({resources:[{title:'Dosya',path}]}).success,path).toBe(false);
  expect(editorialSchema.safeParse({media:{alt:'Şema',width:0,height:630}}).success).toBe(false);
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
