import type { Tenant } from "@/contexts/TenantContext";
import { getSupabase, demoMode } from "@/lib/backend-config";
import type { LandingPage } from "./types";
import { localDraftPreviewAllowed } from "./local-preview";
import {selectRelatedContent} from './related';
const summaryColumns:string='id,tenant_id,path,title,summary,kind,image,status,city,district,neighborhood,service,updated_at,editorial->answer';
export function contentQuery(tenant: Tenant | null, includeDrafts = false, full = false, options:{kinds?:string[];enabled?:boolean}={}) {
  const localDraftPreview = localDraftPreviewAllowed({ development: import.meta.env.DEV, demoMode, hostname: window.location.hostname, search: window.location.search });
  return {
    queryKey: ["landing-pages", tenant?.id, includeDrafts, localDraftPreview, full,options.kinds||[]],
    enabled: !!tenant && options.enabled!==false,
    queryFn: async (): Promise<LandingPage[]> => {
      if (demoMode) {
        const { default: defaults } = await import("./pages.json");
        const { default: enhancements } = await import("./search-pages.json");
        const { default: editorial } = await import("./editorial-pages.json");
        const merged = new Map((defaults as LandingPage[]).map(p => [p.brand+p.path,p]));
        for (const page of editorial as LandingPage[]) merged.set(page.brand+page.path,page);
        for (const page of enhancements as LandingPage[]) merged.set(page.brand+page.path,page);
        return Array.from(merged.values()).filter(
          (p) =>
            p.brand === tenant!.slug &&
            (includeDrafts || localDraftPreview || p.status === "published") && (!options.kinds?.length||options.kinds.includes(p.kind)),
        );
      }
      const supabase=await getSupabase();
      let query = supabase
        .from("landing_pages")
        .select(includeDrafts || full ? "*" : summaryColumns)
        .eq("tenant_id", tenant!.id)
        .order("path");
      if (!includeDrafts) query = query.eq("status", "published");
      if(options.kinds?.length)query=query.in('kind',options.kinds);
      const { data, error } = await query;
      if (error) throw error;
      const {readEditorial}=await import("./editorial");
      return (data as unknown as (LandingPage & {answer?:string})[]).map(p => ({...p, editorial:readEditorial(p.editorial || (p.answer ? {answer:p.answer} : undefined))}));
    },
    staleTime: 60000,
  };
}
export function contentPageQuery(tenant: Tenant | null, path: string) {
  return {
    queryKey:['landing-page',tenant?.id,path],enabled:!!tenant,
    queryFn:async():Promise<LandingPage|null>=>{
      if(demoMode){const pages=await contentQuery(tenant).queryFn();return pages.find(p=>p.path===path)||null;}
      const {data,error}=await (await getSupabase()).from('landing_pages').select('*').eq('tenant_id',tenant!.id).eq('path',path).eq('status','published').maybeSingle();
      if(error)throw error;
      const {readEditorial}=await import("./editorial");
      return data?{...data,editorial:readEditorial(data.editorial)} as unknown as LandingPage:null;
    },staleTime:60000,
  };
}
export function relatedContentQuery(tenant: Tenant | null, page:LandingPage|null|undefined) {
 return {
  queryKey:['landing-pages',tenant?.id,'related',page?.path,page?.kind,page?.editorial?.relatedPaths||[]],enabled:!!tenant&&!!page,
  queryFn:async():Promise<LandingPage[]>=>{
   if(!page||!tenant)return [];
   if(demoMode){const pages=await contentQuery(tenant).queryFn();return selectRelatedContent(pages,page);}
   const supabase=await getSupabase();
   const base=()=>supabase.from('landing_pages').select(summaryColumns).eq('tenant_id',tenant.id).eq('status','published').order('path');
   const paths=page.editorial?.relatedPaths||[];
   const load=async(column:'kind'|'path',values:string[]):Promise<LandingPage[]>=>{
    if(!values.length)return [];
    const {data,error}=await base().in(column,values);
    if(error)throw error;
    return (data||[]) as unknown as LandingPage[];
   };
   const results=await Promise.all([load('kind',[page.kind]),load('path',paths)]);
   return selectRelatedContent(results.flat(),page);
  },staleTime:60000,
 };
}
