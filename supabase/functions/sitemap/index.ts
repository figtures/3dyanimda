// Tenant-aware sitemap generator.
// Usage: GET /functions/v1/sitemap?tenant=<slug>  OR  ?host=<domain>
// Returns application/xml sitemap built from:
//  - published pages
//  - active route_templates expanded over their bound collection_items

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-tenant-host, x-tenant-id",
};

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function expandPattern(
  pattern: string,
  params: Record<string, string>,
): string | null {
  let out = pattern;
  const tokens = pattern.match(/:([a-zA-Z0-9_]+)/g) || [];
  for (const tok of tokens) {
    const key = tok.slice(1);
    const v = params[key];
    if (v == null || v === "") return null;
    out = out.replace(tok, encodeURIComponent(String(v)));
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const tenantSlug = url.searchParams.get("tenant");
  const hostParam =
    url.searchParams.get("host") || req.headers.get("x-forwarded-host") || "";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resolve tenant
  if (!tenantSlug && !hostParam)
    return new Response("Host required", { status: 400 });
  if (hostParam && !/^[a-z0-9.-]+$/i.test(hostParam))
    return new Response("Invalid host", { status: 400 });
  let tenantQuery = supabase
    .from("tenants")
    .select("id, slug, domain, custom_domain")
    .eq("status", "active")
    .limit(1);
  if (tenantSlug) tenantQuery = tenantQuery.eq("slug", tenantSlug);
  else if (hostParam) {
    const { data: mapping } = await supabase
      .from("tenant_domains")
      .select("tenant_id")
      .eq("hostname", hostParam.toLowerCase())
      .maybeSingle();
    if (!mapping) return new Response("Unknown host", { status: 404 });
    tenantQuery = tenantQuery.eq("id", mapping.tenant_id);
  }
  const { data: tenants, error: tErr } = await tenantQuery;
  if (tErr || !tenants?.length) {
    return new Response(`<!-- tenant not found -->`, {
      status: 404,
      headers: { ...corsHeaders, "content-type": "application/xml" },
    });
  }
  const tenant = tenants[0];
  if (!tenant.domain && !tenant.custom_domain)
    return new Response("Canonical domain required", { status: 404 });
  const base = `https://${tenant.custom_domain || tenant.domain || ""}`.replace(
    /\/$/,
    "",
  );

  // Static pages
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("tenant_id", tenant.id)
    .eq("status", "published");

  const urls: { loc: string; lastmod?: string; priority?: string }[] = [];
  const seen = new Set<string>();
  const push = (path: string, lastmod?: string, priority?: string) => {
    const p = path.startsWith("/") ? path : `/${path}`;
    const key = p.replace(/\/+$/, "") || "/";
    if (seen.has(key)) return;
    seen.add(key);
    urls.push({ loc: base + p, lastmod, priority });
  };

  push("/", undefined, "1.0");
  for (const path of ["/hizmetler", "/hakkimizda", "/iletisim", "/teklif-al"])
    push(path);
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug,updated_at,published_at")
    .eq("tenant_id", tenant.id)
    .eq("published", true)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`);
  for (const post of posts || []) push(`/blog/${post.slug}`, post.updated_at);
  for (const p of pages || [])
    push(`/${p.slug}`.replace("//", "/"), p.updated_at ?? undefined, "0.8");

  // Dynamic routes
  const { data: routes } = await supabase
    .from("route_templates")
    .select("pattern, collection_id, param_mapping, priority, is_active")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true);

  for (const r of routes || []) {
    if (!r.collection_id) {
      const path = expandPattern(r.pattern, {});
      if (path) push(path);
      continue;
    }
    const { data: items } = await supabase
      .from("collection_items")
      .select("slug, data, updated_at, status")
      .eq("tenant_id", tenant.id)
      .eq("collection_id", r.collection_id)
      .eq("status", "published");

    const mapping = (r.param_mapping || {}) as Record<string, string>;
    for (const item of items || []) {
      const params: Record<string, string> = {};
      for (const [paramKey, source] of Object.entries(mapping)) {
        if (source === "slug") params[paramKey] = item.slug;
        else if (typeof source === "string" && source.startsWith("data.")) {
          const v = (item.data as any)?.[source.slice(5)];
          if (v != null) params[paramKey] = String(v);
        }
      }
      const path = expandPattern(r.pattern, params);
      if (path) push(path, item.updated_at ?? undefined);
    }
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${xmlEscape(u.loc)}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "") +
          (u.priority ? `<priority>${u.priority}</priority>` : "") +
          `</url>`,
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      ...corsHeaders,
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=600",
    },
  });
});
