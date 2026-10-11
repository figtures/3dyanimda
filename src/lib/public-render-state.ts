import {getRequestHost} from './tenant';
import type {Tenant} from '@/contexts/TenantContext';
import type {DehydratedState} from '@tanstack/react-query';
export type PublicRenderState = {
 version:1; host:string; path:string; search?:string; tenant:Tenant;
 settings:Record<string,unknown>; nav:unknown[]; flags:Record<string,boolean>;
 queries:DehydratedState;
};
/** Route-scoped snapshots never accumulate other pages during a multi-page export. */
export function publicQueryForPath(key:readonly unknown[],tenantId:string,path:string){
 if(!Array.isArray(key)||key[1]!==tenantId)return false;
 if(key[0]==='landing-page')return key[2]===path;
 if(key[0]!=='landing-pages')return false;
 if(key[2]==='related')return key[3]===path;
 const kinds:Record<string,string[]>={'/':['solution','guide'],'/hizmetler':['service'],'/sektorler':['sector'],'/cozumler':['solution'],'/malzemeler':['material'],'/rehber':['guide'],'/bolgeler':['location']};
 return key[2]===false&&key[3]===false&&key[4]===false&&!!kinds[path]&&JSON.stringify(key[5])===JSON.stringify(kinds[path]);
}
/** Only explicit public query families may cross the HTML boundary. */
export function validPublicRenderState(value:unknown,host:string,path:string):value is PublicRenderState {
 const s=value as PublicRenderState;
 return !!s&&s.version===1&&s.host===host&&s.path===path&&!/^\/(admin|studio)(\/|$)/.test(path)
  &&s.tenant?.status==='active'&&typeof s.tenant.id==='string'&&['3dyanimda','3dsanayi','maketyanimda','parcayanimda'].includes(s.tenant.slug)
  &&(s.tenant.custom_domain||s.tenant.domain)===host
  &&Array.isArray(s.nav)&&!!s.settings&&!!s.flags&&Array.isArray(s.queries?.queries)&&s.queries.mutations?.length===0
  &&s.queries.queries.every(q=>!!q&&publicQueryForPath(q.queryKey,s.tenant.id,path)&&q.state?.status==='success');
}
let state:PublicRenderState|null=null;
const node=document.getElementById('public-render-state');
if(node){try{const value=JSON.parse(node.textContent||'null');if(validPublicRenderState(value,getRequestHost(),window.location.pathname)&&(value.search||'')===window.location.search)state=value;}catch{/* legacy SPA fallback */}node.remove();}
export const publicRenderState=()=>state;
export function setPublicRenderState(value:PublicRenderState){state=value;}
