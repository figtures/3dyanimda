// Exports all data belonging to a tenant as JSON, for code/data handover ("eject").
// Caller must be a super_admin.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id, x-tenant-host",
};

const TENANT_TABLES = [
  "tenants",
  "tenant_domains",
  "tenant_theme_config",
  "pages",
  "collections",
  "collection_items",
  "route_templates",
  "quote_replies",
  "tenant_users",
  "tenant_roles",
  "tenant_themes",
  "tenant_features",
  "blog_posts",
  "portfolio_projects",
  "faq_items",
  "testimonials",
  "job_postings",
  "job_applications",
  "machine_operation_requests",
  "quote_requests",
  "contact_messages",
  "nav_items",
  "announcements",
  "newsletter_subscribers",
  "legal_documents",
  "seo_meta",
  "url_redirects",
  "email_templates",
  "discount_campaigns",
  "materials",
  "pricing_settings",
  "site_settings",
  "translations",
  "media_library",
  "audit_log",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!jwt) return new Response(JSON.stringify({ error: "missing_auth" }), { status: 401, headers: corsHeaders });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await admin.auth.getUser(jwt);
    if (!u.user) return new Response(JSON.stringify({ error: "invalid_token" }), { status: 401, headers: corsHeaders });

    const { data: sa } = await admin.from("user_roles").select("id").eq("user_id", u.user.id).eq("role", "super_admin").maybeSingle();
    if (!sa) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });

    const url = new URL(req.url);
    const tenant_id = url.searchParams.get("tenant_id");
    if (!tenant_id) return new Response(JSON.stringify({ error: "missing tenant_id" }), { status: 400, headers: corsHeaders });

    const dump: Record<string, unknown[]> = {};
    for (const tbl of TENANT_TABLES) {
      const col = tbl === "tenants" ? "id" : "tenant_id";
      const { data, error } = await admin.from(tbl).select("*").eq(col, tenant_id);
      if (!error) dump[tbl] = data ?? [];
    }

    return new Response(JSON.stringify({ exported_at: new Date().toISOString(), tenant_id, data: dump }, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="tenant-${tenant_id}.json"`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});