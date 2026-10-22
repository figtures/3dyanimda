import {beforeEach,expect,it,vi} from 'vitest';
import {contentQuery} from './queries';
import type {Tenant} from '@/contexts/TenantContext';
const state=vi.hoisted(()=>({rows:[] as Record<string,unknown>[],selected:''}));
vi.mock('@/lib/backend-config',()=>({demoMode:false,getSupabase:async()=>({from:()=>{
 const query={select:(value:string)=>{state.selected=value;return query;},eq:()=>query,order:()=>query,in:()=>query,then:(resolve:(value:unknown)=>unknown)=>Promise.resolve({data:state.rows,error:null}).then(resolve)};
 return query;
}})}));
const tenant={id:'tenant-3dy',slug:'3dyanimda'} as Tenant;
beforeEach(()=>{state.selected='';state.rows=[];});
it('projects only answer and media from editorial JSON and rebuilds the same media metadata',async()=>{
 const media={alt:'Gerçek içerik açıklaması',width:1200,height:630,caption:'Açıklayıcı şema.'};
 state.rows=[{path:'/rehber/ornek',kind:'guide',answer:'Kısa yanıt.',media}];
 const [page]=await contentQuery(tenant,false,false,{kinds:['guide']}).queryFn();
 expect(state.selected).toContain('editorial->answer,editorial->media');
 expect(state.selected.split(',')).not.toContain('editorial');expect(state.selected).not.toContain('*');
 expect(page.editorial?.media).toEqual(media);expect(page.editorial?.answer).toBe('Kısa yanıt.');
});
it('keeps media-only summaries and does not invent absent dimensions',async()=>{
 state.rows=[{path:'/rehber/one',media:{alt:'Şema',width:960,height:640},answer:null},{path:'/rehber/two',media:null,answer:'Yanıt'}];
 const pages=await contentQuery(tenant).queryFn();
 expect(pages[0].editorial?.media?.width).toBe(960);expect(pages[1].editorial?.media).toBeUndefined();
});
it('full CMS records remain authoritative over any projected fields',async()=>{
 const media={alt:'Tam kayıt',width:800,height:500};
 state.rows=[{path:'/rehber/ornek',editorial:{answer:'Asıl yanıt',media},answer:'Yansıtılmış yanıt',media:{alt:'Yansıtılmış',width:1,height:1}}];
 const [page]=await contentQuery(tenant,false,true).queryFn();
 expect(state.selected).toBe('*');expect(page.editorial?.media).toEqual(media);expect(page.editorial?.answer).toBe('Asıl yanıt');
});
