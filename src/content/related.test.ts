import {it,expect} from 'vitest';
import pages from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';
import {selectRelatedContent} from './related';
import type {LandingPage} from './types';
it('scoped queries preserve existing links outside the scoped district navigation improvement',()=>{
 const all=[...new Map([...pages,...editorial,...search].map(p=>[p.brand+p.path,p])).values()] as LandingPage[];
 for(const p of all){
  if(p.brand==='3dyanimda'&&p.kind==='location'&&p.district)continue;
  const rows=all.filter(row=>row.brand===p.brand).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  const before=rows.filter(row=>row.path!==p.path&&(p.editorial?.relatedPaths?.includes(row.path)||row.kind===p.kind)).sort((a,b)=>Number(p.editorial?.relatedPaths?.includes(b.path))-Number(p.editorial?.relatedPaths?.includes(a.path))).slice(0,4);
  const scoped=[...rows.filter(row=>row.kind===p.kind),...rows.filter(row=>p.editorial?.relatedPaths?.includes(row.path))];
  expect(selectRelatedContent(scoped,p).map(row=>row.path),p.brand+p.path).toEqual(before.map(row=>row.path));
 }
});
it('3dyanimda district services link to the real district hub and siblings before unrelated districts',()=>{
 const all=[...new Map([...pages,...editorial,...search].map(p=>[p.brand+p.path,p])).values()] as LandingPage[];
 const local=all.filter(row=>row.brand==='3dyanimda');
 const page=local.find(row=>row.path==='/bolgeler/istanbul/atasehir/3d-baski')!;
 const links=selectRelatedContent(local,page).map(row=>row.path);
 expect(links.slice(0,3)).toEqual(['/bolgeler/istanbul/atasehir','/bolgeler/istanbul/atasehir/3d-modelleme','/bolgeler/istanbul/atasehir/3d-tarama']);
 expect(links.every(path=>local.some(row=>row.path===path))).toBe(true);
 expect(links).not.toContain(page.path);
});
