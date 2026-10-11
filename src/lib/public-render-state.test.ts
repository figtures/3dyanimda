import {expect,it} from 'vitest';
import {validPublicRenderState} from './public-render-state';
const state={version:1,host:'3dyanimda.com',path:'/3d-baski',tenant:{id:'tenant-1',slug:'3dyanimda',domain:'3dyanimda.com',status:'active'},settings:{},nav:[],flags:{},queries:{mutations:[],queries:[{queryKey:['landing-page','tenant-1','/3d-baski'],state:{status:'success'}}]}};
it('accepts only same-host same-route public state and rejects cross-tenant/private/draft query caches',()=>{
 expect(validPublicRenderState(state,'3dyanimda.com','/3d-baski')).toBe(true);
 expect(validPublicRenderState(state,'3dsanayi.com','/3d-baski')).toBe(false);
 expect(validPublicRenderState(state,'3dyanimda.com','/iletisim')).toBe(false);
 for(const key of [['admin-users','tenant-1'],['landing-page','tenant-2'],['landing-pages','tenant-1',true]])expect(validPublicRenderState({...state,queries:{mutations:[],queries:[{queryKey:key,state:{status:'success'}}]}},state.host,state.path)).toBe(false);
 expect(validPublicRenderState({...state,path:'/admin'},state.host,'/admin')).toBe(false);
});
