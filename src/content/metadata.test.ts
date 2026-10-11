import {it,expect} from 'vitest';
import pages from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';
import {contentMetaTitle} from './metadata';
import {contentModified,sourceNote} from './source-notes';
it('keeps all 796 authored route search titles unique per brand',()=>{
  const records=new Map([...pages,...editorial,...search].map(p=>[p.brand+p.path,p]));
  expect(records.size).toBe(796);
  const titles=new Set<string>();
  for(const p of records.values()) {const key=p.brand+' '+contentMetaTitle(p);expect(titles.has(key),key).toBe(false);titles.add(key);expect(contentMetaTitle(p).length).toBeGreaterThan(3);}
});
it('changes date only for a meaningful dated note or newer authored content',()=>{
  const old='2026-10-08T12:00:00.000Z';
  expect(contentModified(old,'/bolgeler/istanbul')).toBe(old);
  expect(contentModified(old,'/malzemeler/abs')).toBe(sourceNote('/malzemeler/abs')?.revisedAt);
  expect(contentModified('2026-11-01T00:00:00.000Z','/malzemeler/abs')).toBe('2026-11-01T00:00:00.000Z');
});
