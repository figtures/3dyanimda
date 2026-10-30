import publication from "../../../docs/audits/publication-content-manifest.json";
import {describe,it,expect} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import LocalCommercialContent from './LocalCommercialContent';
import PopularDistricts from './PopularDistricts';
import {popularDistricts,localServices} from './local-commercial';
import {publicLocalPath} from '@/lib/local-urls.mjs';
import defaults from '@/content/pages.json';
import editorial from '@/content/editorial-pages.json';
import search from '@/content/search-pages.json';
import type {LandingPage} from '@/content/types';
const pages=[...new Map([...defaults,...editorial,...search].filter(p=>p.brand==='3dyanimda').map(p=>[p.path,p])).values()] as LandingPage[];
// Seed records retain draft status; the release inventory records approved CMS publication.
const published=new Set([...pages.filter(p=>p.status==='published'),...publication.routes.filter(p=>p.brand==='3dyanimda')].map(p=>publicLocalPath(p.path,'3dyanimda')));
describe('local commercial navigation',()=>{
 it('links the curated footer districts directly to existing print service pages',()=>{
  render(<MemoryRouter><PopularDistricts/></MemoryRouter>);
  expect(screen.getByRole('navigation',{name:'Popüler ilçeler'})).toBeTruthy();
  for(const [slug,name] of popularDistricts){const href='/'+slug+'-3d-baski';expect(screen.getByRole('link',{name:name+' 3D baskı'})).toHaveAttribute('href',href);expect(published.has(href)).toBe(true);}
  cleanup();
 });
 for(const service of Object.keys(localServices))it(`keeps ${service} pricing, resources and the region-aware quote together`,()=>{
  const page=pages.find(p=>p.path===(service==='3d-yedek-parca'?'/cozumler/yedek-parca-uretimi':'/bolgeler/istanbul/kadikoy/'+service))!;
  expect(page).toBeTruthy();
  const quote='/teklif-al?service='+service+'&region=Kad%C4%B1k%C3%B6y';
  const view=render(<MemoryRouter><LocalCommercialContent page={page} quoteUrl={quote}/></MemoryRouter>);
  expect(screen.getByRole('heading',{name:new RegExp((service==='3d-yedek-parca'?'İstanbul':'Kadıköy')+' .* fiyatı nasıl belirlenir')})).toBeTruthy();
  expect(screen.getByRole('link',{name:localServices[service as keyof typeof localServices].quoteLabel+' →'})).toHaveAttribute('href',quote);
  const links=Array.from(view.container.querySelectorAll('a'));
  for(const a of links){const path=new URL(a.href).pathname;expect(path.startsWith('/bolgeler/')).toBe(false);expect(published.has(path)||['/teklif-al','/portfoy'].includes(path)).toBe(true);}
  for(const id of ['neden-3d-yanimda','fiyat-ve-teklif','proje-hazirligi'])expect(view.container.querySelectorAll('#'+id)).toHaveLength(1);
  expect(view.container.textContent).not.toMatch(/35 ₺|90 ₺|aynı gün teslim garantisi/i);
  cleanup();
 });
 it('does not invent a service sales block on region hubs',()=>{
  const page=pages.find(p=>p.path==='/bolgeler/istanbul')!;
  const view=render(<MemoryRouter><LocalCommercialContent page={page} quoteUrl="/teklif-al"/></MemoryRouter>);
  expect(view.container.textContent).toBe('');cleanup();
 });
});
