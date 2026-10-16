import {expect,it} from 'vitest';
import {validPublicRenderState,publicQueryForPath} from './public-render-state';
const state={version:1,host:'3dyanimda.com',path:'/3d-baski',tenant:{id:'tenant-1',slug:'3dyanimda',domain:'3dyanimda.com',status:'active'},settings:{},nav:[],flags:{},queries:{mutations:[],queries:[{queryKey:['landing-page','tenant-1','/3d-baski'],state:{status:'success'}}]}};
it('accepts only same-host same-route public state and rejects cross-tenant/private/draft query caches',()=>{
 expect(validPublicRenderState(state,'3dyanimda.com','/3d-baski')).toBe(true);
 expect(validPublicRenderState(state,'3dsanayi.com','/3d-baski')).toBe(false);
 expect(validPublicRenderState(state,'3dyanimda.com','/iletisim')).toBe(false);
 for(const key of [['admin-users','tenant-1'],['landing-page','tenant-2'],['landing-pages','tenant-1',true]])expect(validPublicRenderState({...state,queries:{mutations:[],queries:[{queryKey:key,state:{status:'success'}}]}},state.host,state.path)).toBe(false);
 expect(validPublicRenderState({...state,path:'/admin'},state.host,'/admin')).toBe(false);
});

it('excludes unrelated page/query data during consecutive exports',()=>{
 expect(publicQueryForPath(['landing-page','tenant-1','/3d-tarama'],'tenant-1','/3d-baski')).toBe(false);
 expect(publicQueryForPath(['landing-pages','tenant-1','related','/3d-tarama'],'tenant-1','/3d-baski')).toBe(false);
 expect(publicQueryForPath(['landing-pages','tenant-1',false,false,false,['location']],'tenant-1','/bolgeler')).toBe(true);
 expect(publicQueryForPath(['landing-pages','tenant-1',false,false,false,['location']],'tenant-1','/')).toBe(false);
});

it('hydrates only the destination public CMS records and its required career options',()=>{
 for(const path of ['/sss','/portfoy','/portfoy/example','/kariyer'])expect(publicQueryForPath(['public-page','tenant-1',path],'tenant-1',path)).toBe(true);
 expect(publicQueryForPath(['public-page','tenant-1','/kariyer'],'tenant-1','/kariyer/is-basvurusu')).toBe(true);
 expect(publicQueryForPath(['public-page','tenant-1','/admin/users'],'tenant-1','/admin/users')).toBe(false);
 expect(publicQueryForPath(['public-page','tenant-2','/sss'],'tenant-1','/sss')).toBe(false);
 expect(publicQueryForPath(['public-page','tenant-1','/portfoy/other'],'tenant-1','/portfoy/example')).toBe(false);
 expect(publicQueryForPath(['landing-pages','tenant-1',false,false,false,['solution','guide','sector']],'tenant-1','/')).toBe(true);
});
