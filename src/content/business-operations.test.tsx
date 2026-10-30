import {describe,it,expect,afterEach} from 'vitest';
import {render,cleanup} from '@testing-library/react';
import {contentStructuredData} from './structured-content';
import {IllustrativePriceExample} from '@/components/brand/WorkshopCapabilities';
import type {LandingPage} from './types';
const page={path:'/3d-tarama',brand:'3dyanimda',kind:'service',title:'3D tarama',summary:'Tarama hizmeti',sections:[],faq:[],city:'',district:'',neighborhood:'',service:'',editorial:{},updated_at:'2026-10-01'} as unknown as LandingPage;
afterEach(cleanup);
describe('owner-confirmed operating facts',()=>{
 it('uses national onsite coverage only for the main scanning service and retains local scope',()=>{
  const service=(p:LandingPage,brand='3dyanimda')=>contentStructuredData(p,'https://'+brand+'.com',brand).find(n=>n['@type']==='Service');
  expect(service(page)?.areaServed).toEqual({'@type':'Country',name:'Türkiye'});
  expect(service({...page,path:'/3d-baski'})?.areaServed).toEqual({'@type':'City',name:'İstanbul'});
  expect(service({...page,path:'/atasehir-3d-tarama',kind:'location',city:'istanbul',district:'atasehir',service:'3d-tarama'})?.areaServed).toEqual({'@type':'AdministrativeArea',name:'Ataşehir, İstanbul'});
  expect(service({...page,brand:'3dsanayi'},'3dsanayi')?.areaServed).toBeUndefined();
 });
 it('keeps unavailable first publication dates absent while showing an actual update',()=>{
  const article=contentStructuredData({...page,path:'/rehber/test',kind:'guide'},'https://3dyanimda.com').find(n=>n['@type']==='Article');
  expect(article).not.toHaveProperty('datePublished');expect(article?.dateModified).toBe('2026-10-30');
 });
 it('labels a cost scenario as illustrative and reconciles its subtotal without creating an offer',()=>{
  const view=render(<IllustrativePriceExample/>);
  expect(view.container.querySelector('tfoot')?.textContent).toContain('750 TL');
  expect(view.container.textContent).toContain('gerçek müşteri teklifi veya güncel fiyat tarifesi değildir');
  expect(view.container.textContent).toContain('KDV ve kargo hariç');
  expect(view.container.querySelector('script[type="application/ld+json"]')).toBeNull();
 });
});
