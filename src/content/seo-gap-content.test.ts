// @vitest-environment node
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,it,expect} from 'vitest';
import additions from '../../content/authoring/seo-gap-3dyanimda-2026-10-23.json';
import media from './3dy-guide-media.json';
import base from './pages.json';
import editorial from './editorial-pages.json';
import search from './search-pages.json';
import {editorialSchema} from './editorial';
import {publicationIssues} from './quality';
import type {LandingPage} from './types';

const knownPages=new Set([...base,...editorial,...search,...additions.newPages].filter(page=>page.brand==='3dyanimda').map(page=>page.path));
const tools=new Set(['/araclar/stl-onizle','/araclar/kesit-analizi','/araclar/tarama-goruntuleyici']);
const authoring=[...additions.patches,...additions.newPages];
describe('reviewable 3dyanimda SEO content package',()=>{
 it('contains only the requested tenant and keeps new content in draft until review',()=>{
  expect(additions.brand).toBe('3dyanimda');
  expect(additions.patches).toHaveLength(14);
  expect(additions.patches.filter(page=>page.path.startsWith('/rehber/'))).toHaveLength(13);
  expect(additions.newPages).toHaveLength(5);
  for(const page of additions.newPages){
   expect(page.brand).toBe('3dyanimda');expect(page.status).toBe('draft');
   expect(page).not.toHaveProperty('updated_at');
   expect(page.editorial).not.toHaveProperty('publishedAt');
   expect(publicationIssues(page as unknown as LandingPage),page.path).toEqual([]);
  }
 });
 it('has valid editor fields, real destinations and purpose-built table rows',()=>{
  for(const page of authoring){
   expect(editorialSchema.safeParse(page.editorial).success,page.path).toBe(true);
   expect(page.editorial.comparison.rows.length,page.path).toBeGreaterThanOrEqual(3);
   for(const path of page.editorial.relatedPaths)expect(knownPages.has(path),page.path+' → '+path).toBe(true);
   for(const resource of page.editorial.resources){
    expect(tools.has(resource.path)||resource.path.startsWith('/downloads/3dyanimda/'),resource.path).toBe(true);
    if(resource.path.startsWith('/downloads/'))expect(existsSync(resolve('public',resource.path.slice(1))),resource.path).toBe(true);
   }
  }
 });
 it('covers all enhanced guides and new pages with metadata for an actual explanatory image',()=>{
  const images=media as Record<string,{url:string;alt:string;width:number;height:number;caption:string}>;
  for(const page of authoring.filter(page=>page.path.startsWith('/rehber/')||page.path.startsWith('/cozumler/'))){
   const entry=images[page.path];
   expect(entry,page.path).toBeDefined();
   expect([entry.width,entry.height]).toEqual([1200,630]);
   expect(entry.alt.length).toBeGreaterThan(15);
   expect(existsSync(resolve('public',entry.url.slice(1))),entry.url).toBe(true);
  }
 });
 it('ships a closed 20-unit STL cube with outward triangles and consistent signed volume',()=>{
  const file=readFileSync(resolve('public/downloads/3dyanimda/referans-kup-20mm.stl'),'utf8');
  const vertices=[...file.matchAll(/vertex\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/g)].map(match=>match.slice(1).map(Number));
  expect(vertices).toHaveLength(36);
  for(let axis=0;axis<3;axis++){expect(Math.min(...vertices.map(v=>v[axis]))).toBe(0);expect(Math.max(...vertices.map(v=>v[axis]))).toBe(20);}
  const edges=new Map<string,number>();let volume=0;
  for(let i=0;i<vertices.length;i+=3){
   const [a,b,c]=vertices.slice(i,i+3);
   volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
   for(const [first,last] of [[a,b],[b,c],[c,a]]){const key=[first.join(','),last.join(',')].sort().join('|');edges.set(key,(edges.get(key)||0)+1);}
  }
  expect([...edges.values()].every(count=>count===2)).toBe(true);
  expect(volume).toBeCloseTo(8000,6);
 });
});
