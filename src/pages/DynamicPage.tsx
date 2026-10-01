import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { PageRenderer } from "@/components/cms/PageRenderer";
import NotFound from "@/pages/NotFound";
import type { CmsPage, PageBlock } from "@/lib/cms/blocks";
import { matchPattern, specificity, type TokenContext } from "@/lib/cms/tokens";
import { Loader2 } from "lucide-react";

const DynamicPage = () => {
  const { pathname, search } = useLocation();
  const { tenant, loading: tenantLoading } = useTenant();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [ctx, setCtx] = useState<TokenContext>({});
  const [loading, setLoading] = useState(true);
  const previewMode = new URLSearchParams(search).get("preview") === "1";

  useEffect(() => {
    if (tenantLoading) return;
    if (!tenant) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      // 1) Exact slug match
      const { data: p } = await supabase
        .from("pages")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("slug", pathname)
        .maybeSingle();
      if (cancelled) return;
      if (p && (previewMode || p.status === "published")) {
        const { data: bs } = await supabase
          .from("page_blocks")
          .select("*")
          .eq("page_id", p.id)
          .order("position", { ascending: true });
        if (cancelled) return;
        setPage(p as any);
        setBlocks((bs || []) as any);
        setCtx({ tenant: tenant as any, page: p as any });
        setLoading(false);
        return;
      }

      // 2) Try route_templates (pattern match)
      const { data: tpls } = await supabase
        .from("route_templates")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true);
      if (cancelled) return;
      const candidates = (tpls || [])
        .map((t: any) => ({ tpl: t, params: matchPattern(t.pattern, pathname) }))
        .filter((x) => x.params != null)
        .sort((a, b) =>
          (b.tpl.priority ?? 0) - (a.tpl.priority ?? 0) ||
          specificity(b.tpl.pattern) - specificity(a.tpl.pattern)
        );
      const match = candidates[0];
      if (!match || !match.tpl.template_page_id) {
        setPage(null); setBlocks([]); setLoading(false); return;
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
        if (cancelled) return;
        if (!itemRow) {
          setPage(null); setBlocks([]); setLoading(false); return;
        }
        item = itemRow;
      }
      // Load template page + blocks
      const { data: tplPage } = await supabase
        .from("pages")
        .select("*")
        .eq("id", match.tpl.template_page_id)
        .maybeSingle();
      if (cancelled) return;
      if (!tplPage) { setPage(null); setBlocks([]); setLoading(false); return; }
      const { data: bs } = await supabase
        .from("page_blocks")
        .select("*")
        .eq("page_id", tplPage.id)
        .order("position", { ascending: true });
      if (cancelled) return;
      // Merge per-item SEO over template page meta
      const merged: any = { ...tplPage };
      if (item) {
        merged.title = item.title || tplPage.title;
        const baseMeta = (tplPage as any).meta && typeof (tplPage as any).meta === "object" ? (tplPage as any).meta : {};
        const itemSeo = item.seo && typeof item.seo === "object" ? item.seo : {};
        merged.meta = { ...baseMeta, ...itemSeo };
      }
      setPage(merged);
      setBlocks((bs || []) as any);
      setCtx({
        tenant: tenant as any,
        page: merged,
        params: match.params || {},
        item: item ? { ...item.data, slug: item.slug, title: item.title } : null,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [pathname, tenant?.id, tenantLoading, previewMode]);

  if (loading || tenantLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!page) return <NotFound />;
  return <PageRenderer page={page} blocks={blocks} path={pathname} ctx={ctx} />;
};

export default DynamicPage;