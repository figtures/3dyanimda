import { getSupabase,demoMode } from '@/lib/backend-config';
import type { Tenant } from '@/contexts/TenantContext';
import type { CmsPage,PageBlock } from '@/lib/cms/blocks';
import { matchPattern,specificity,type TokenContext } from '@/lib/cms/tokens';
const empty={page:null,blocks:[] as PageBlock[],ctx:{} as TokenContext};
export function dynamicPageQuery(tenant:Tenant|null,pathname:string,previewMode:boolean){
 return {queryKey:['dynamic-page',tenant?.id,pathname,previewMode],enabled:!!tenant,staleTime:previewMode?0:60_000,queryFn:async()=>{
  if(!tenant||demoMode)return empty;
  const supabase=await getSupabase();
      // 1) Exact slug match
      const { data: p, error: pageError } = await supabase
        .from("pages")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("slug", pathname)
        .maybeSingle();
      if(pageError)throw pageError;
      if (p && (previewMode || p.status === "published")) {
        const { data: bs, error: blockError } = await supabase
          .from("page_blocks")
          .select("*")
          .eq("page_id", p.id)
          .order("position", { ascending: true });
          if(blockError)throw blockError;
        return {page:p as CmsPage,blocks:(bs||[]) as PageBlock[],ctx:{tenant,page:p} as TokenContext};
      }

      // 2) Try route_templates (pattern match)
      const { data: tpls, error: templateError } = await supabase
        .from("route_templates")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true);
      if(templateError)throw templateError;
      const candidates = (tpls || [])
        .map((t: any) => ({ tpl: t, params: matchPattern(t.pattern, pathname) }))
        .filter((x) => x.params != null)
        .sort((a, b) =>
          (b.tpl.priority ?? 0) - (a.tpl.priority ?? 0) ||
          specificity(b.tpl.pattern) - specificity(a.tpl.pattern)
        );
      const match = candidates[0];
      if (!match || !match.tpl.template_page_id) {
        return empty;
      }
      // load item (if collection bound + slug param available)
      let item: any = null;
      if (match.tpl.collection_id) {
        const mapping = (match.tpl.param_mapping || {}) as Record<string, string>;
        // Default: use last URL param as item slug if no mapping given
        const slugFromParam = mapping.slug
          ? match.params![mapping.slug]
          : Object.values(match.params!).slice(-1)[0];
        let query = supabase
          .from("collection_items")
          .select("*")
          .eq("collection_id", match.tpl.collection_id)
          .eq("tenant_id", tenant.id);
        if (slugFromParam) query = query.eq("slug", slugFromParam);
        // additional data filters from mapping (data.field <- param)
        for (const [paramName, dataKey] of Object.entries(mapping)) {
          if (paramName === "slug") continue;
          const pv = match.params![paramName];
          if (pv && dataKey?.startsWith("data.")) {
            const k = dataKey.slice(5);
            query = query.eq(`data->>${k}`, pv);
          }
        }
        const { data: itemRow } = await query.maybeSingle();
          if (!itemRow) {
          return empty;
        }
        item = itemRow;
      }
      // Load template page + blocks
      const { data: tplPage } = await supabase
        .from("pages")
        .select("*")
        .eq("id", match.tpl.template_page_id)
        .maybeSingle();
      if (!tplPage || (!previewMode && tplPage.status !== "published")) return empty;
      const { data: bs, error: blockError } = await supabase
        .from("page_blocks")
        .select("*")
        .eq("page_id", tplPage.id)
        .order("position", { ascending: true });
      if(blockError)throw blockError;
      // Merge per-item SEO over template page meta
      const merged: any = { ...tplPage };
      if (item) {
        merged.title = item.title || tplPage.title;
        const baseMeta = (tplPage as any).meta && typeof (tplPage as any).meta === "object" ? (tplPage as any).meta : {};
        const itemSeo = item.seo && typeof item.seo === "object" ? item.seo : {};
        merged.meta = { ...baseMeta, ...itemSeo };
      }
      return {page:merged as CmsPage, blocks:(bs||[]) as PageBlock[], ctx:{
        tenant: tenant as any,
        page: merged,
        params: match.params || {},
        item: item ? { ...item.data, slug: item.slug, title: item.title } : null,
      } as TokenContext};

 }};
}
