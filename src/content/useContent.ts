import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/TenantContext";
import { supabase, demoMode } from "@/lib/supabase";
import type { LandingPage } from "./types";
import { readEditorial } from "./editorial";
import { localDraftPreviewAllowed } from "./local-preview";
export function useContent(includeDrafts = false, full = false) {
  const { tenant } = useTenant();
  const localDraftPreview = localDraftPreviewAllowed({
    development: import.meta.env.DEV,
    demoMode,
    hostname: window.location.hostname,
    search: window.location.search,
  });
  return useQuery({
    queryKey: ["landing-pages", tenant?.id, includeDrafts, localDraftPreview, full],
    enabled: !!tenant,
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
            (includeDrafts || localDraftPreview || p.status === "published"),
        );
      }
      let query = supabase
        .from("landing_pages")
        .select(includeDrafts || full ? "*" : "id,tenant_id,path,title,summary,kind,image,status,city,district,neighborhood,service,updated_at,editorial->answer")
        .eq("tenant_id", tenant!.id)
        .order("path");
      if (!includeDrafts) query = query.eq("status", "published");
      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as (LandingPage & {answer?:string})[]).map(p => ({...p, editorial:readEditorial(p.editorial || (p.answer ? {answer:p.answer} : undefined))}));
    },
    staleTime: 60000,
  });
}

/** Public detail queries fetch only the requested article, not every article body. */
export function useContentPage(path: string) {
  const {tenant}=useTenant();
  const defaults=useContent(false);
  return useQuery({
    queryKey:['landing-page',tenant?.id,path],enabled:!!tenant,
    queryFn:async():Promise<LandingPage|null>=>{
      if(demoMode){const result=await defaults.refetch();return result.data?.find(p=>p.path===path)||null;}
      const {data,error}=await supabase.from('landing_pages').select('*').eq('tenant_id',tenant!.id).eq('path',path).eq('status','published').maybeSingle();
      if(error)throw error;
      return data?{...data,editorial:readEditorial(data.editorial)} as unknown as LandingPage:null;
    },staleTime:60000,
  });
}
