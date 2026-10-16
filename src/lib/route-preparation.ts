import {publicPageQuery,hasPublicPageQuery} from "@/content/public-page-query";
import type { QueryClient } from "@tanstack/react-query";
import type { Tenant } from "@/contexts/TenantContext";
import { contentQuery, contentPageQuery, relatedContentQuery } from "@/content/queries";
const hubs:Record<string,string[]>={"/":["solution","guide","sector"],"/hizmetler":["service"],"/sektorler":["sector"],"/cozumler":["solution"],"/malzemeler":["material"],"/rehber":["guide"],"/bolgeler":["location"]};
export async function prepareContentDestination(client:QueryClient, tenant:Tenant|null, path:string) {
  if(!tenant)return;
  path=path.replace(/\/$/,"")||"/";
  if(path.startsWith("/kariyer/"))path="/kariyer";
  if(hasPublicPageQuery(path)){await client.ensureQueryData({...publicPageQuery(tenant,path),revalidateIfStale:true});return;}
  if(hubs[path]) {await client.ensureQueryData({...contentQuery(tenant,false,false,{kinds:hubs[path]}),revalidateIfStale:true});return;}
  if(/^\/(3d-baski|3d-tarama|3d-modelleme)$/.test(path)||/^\/(cozumler|sektorler|malzemeler|rehber|bolgeler)\//.test(path)) {
    const page=await client.ensureQueryData({...contentPageQuery(tenant,path),revalidateIfStale:true});
    if(page)await client.ensureQueryData({...relatedContentQuery(tenant,page),revalidateIfStale:true});
  }
}
let prepare:((url:URL)=>Promise<unknown>)|undefined;
export function registerRoutePreparation(callback:(url:URL)=>Promise<unknown>){prepare=callback;}
export function prefetchDestination(href:string) {
  const url=new URL(href,window.location.href);
  if(url.origin!==location.origin||/^\/(admin|studio)(\/|$)/.test(url.pathname))return;
  void prepare?.(url).catch(()=>{/* Navigation renders a retry state if the request still fails. */});
}
