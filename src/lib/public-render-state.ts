import {getRequestHost} from './tenant';
import type {Tenant} from '@/contexts/TenantContext';
import type {DehydratedState} from '@tanstack/react-query';
export type PublicRenderState = {
 version:1; host:string; path:string; search?:string; tenant:Tenant;
 settings:Record<string,unknown>; nav:unknown[]; flags:Record<string,boolean>;
 queries:DehydratedState;
};
/** Only explicit public query families may cross the HTML boundary. */
export function validPublicRenderState(value:unknown,host:string,path:string):value is PublicRenderState {
 const s=value as PublicRenderState;
 return !!s&&s.version===1&&s.host===host&&s.path===path&&!/^\/(admin|studio)(\/|$)/.test(path)
  &&s.tenant?.status==='active'&&typeof s.tenant.id==='string'&&['3dyanimda','3dsanayi','maketyanimda','parcayanimda'].includes(s.tenant.slug)
  &&(s.tenant.custom_domain||s.tenant.domain)===host
  &&Array.isArray(s.nav)&&!!s.settings&&!!s.flags&&Array.isArray(s.queries?.queries)&&s.queries.mutations?.length===0
  &&s.queries.queries.every(q=>['landing-page','landing-pages'].includes(String(q.queryKey?.[0]))&&q.queryKey[1]===s.tenant.id&&q.state.status==='success'&&q.queryKey[2]!==true);
}
let state:PublicRenderState|null=null;
const node=document.getElementById('public-render-state');
if(node){try{const value=JSON.parse(node.textContent||'null');if(validPublicRenderState(value,getRequestHost(),window.location.pathname)&&(value.search||'')===window.location.search)state=value;}catch{/* legacy SPA fallback */}node.remove();}
export const publicRenderState=()=>state;
export function setPublicRenderState(value:PublicRenderState){state=value;}
