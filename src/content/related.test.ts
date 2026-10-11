import {it,expect} from 'vitest';
import pages from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';
import {selectRelatedContent} from './related';
import type {LandingPage} from './types';
it('scoped queries preserve the same four related links for all 796 authored pages',()=>{
 const all=[...new Map([...pages,...editorial,...search].map(p=>[p.brand+p.path,p])).values()] as LandingPage[];
 for(const p of all){
  const rows=all.filter(row=>row.brand===p.brand).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  const before=rows.filter(row=>row.path!==p.path&&(p.editorial?.relatedPaths?.includes(row.path)||row.kind===p.kind)).sort((a,b)=>Number(p.editorial?.relatedPaths?.includes(b.path))-Number(p.editorial?.relatedPaths?.includes(a.path))).slice(0,4);
  const scoped=[...rows.filter(row=>row.kind===p.kind),...rows.filter(row=>p.editorial?.relatedPaths?.includes(row.path))];
  expect(selectRelatedContent(scoped,p).map(row=>row.path),p.brand+p.path).toEqual(before.map(row=>row.path));
 }
});
