import { useTenant } from "@/contexts/TenantContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import i18n from "@/lib/i18n";

type SeoOverride = {
  title?: string;
  description?: string;
  keywords?: string;
  og_image_url?: string;
  noindex?: boolean;
};

const TTL_MS = 60_000; // 1 minute — admin edits become visible quickly without re-loading on every nav
const cache = new Map<string, { at: number; data: SeoOverride | null }>();

export function clearSeoOverrideCache() {
  cache.clear();
}

/** Fetches admin-managed SEO meta for the given path. Returns null until loaded. */
export function useSeoOverride(path: string): SeoOverride | null {
  const lang = i18n.language?.startsWith("en") ? "en" : "tr";
  const { tenant } = useTenant();
  const cacheKey = `${tenant?.id}::${path}::${lang}`;
  const cached = cache.get(cacheKey);
  const fresh = cached && Date.now() - cached.at < TTL_MS;
  const [data, setData] = useState<SeoOverride | null>(
    fresh ? cached!.data : null,
  );

  useEffect(() => {
    let mounted = true;
    setData(null);
    if (!tenant) return;
    const c = cache.get(cacheKey);
    if (c && Date.now() - c.at < TTL_MS) {
      setData(c.data);
      return;
    }
    (async () => {
      const { data: row } = await (supabase as any)
        .from("seo_meta")
        .select("*")
        .eq("tenant_id", tenant!.id)
        .eq("path", path)
        .maybeSingle();
      if (!row) {
        cache.set(cacheKey, { at: Date.now(), data: null });
        if (mounted) setData(null);
        return;
      }
      const pick = (f: string) => row[`${f}_${lang}`] || row[`${f}_tr`] || "";
      const result: SeoOverride = {
        title: pick("title") || undefined,
        description: pick("description") || undefined,
        keywords: pick("keywords") || undefined,
        og_image_url: row.og_image_url || undefined,
        noindex: !!row.noindex,
      };
      cache.set(cacheKey, { at: Date.now(), data: result });
      if (mounted) setData(result);
    })();
    return () => {
      mounted = false;
    };
  }, [cacheKey, path, tenant?.id, lang]);

  return data;
}
