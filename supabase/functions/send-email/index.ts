import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id, x-tenant-host",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://api.resend.com";

type Body = {
  to: string | string[];
  templateKey?: string;
  subject?: string;
  html?: string;
  text?: string;
  from?: string;
  locale?: "tr" | "en";
  variables?: Record<string, string | number | null | undefined>;
  tenantId?: string;
};

function render(tpl: string, vars: Record<string, any> = {}): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function wrapHtml(bodyText: string, subject: string, brandName: string) {
  // If body already contains a tag, assume it is HTML; otherwise convert linebreaks.
  const looksHtml = /<\/?[a-z][^>]*>/i.test(bodyText);
  const inner = looksHtml ? bodyText : escapeHtml(bodyText).replace(/\n/g, "<br/>");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f6f5f2;font-family:Inter,Arial,sans-serif;color:#1a1f2c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e2d8;">
        <tr><td style="padding:28px 32px 8px 32px;border-bottom:1px solid #f0ece2;">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;color:#0F1E48;">${escapeHtml(brandName)}</div>
        </td></tr>
        <tr><td style="padding:24px 32px 32px 32px;font-size:15px;line-height:1.6;">${inner}</td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #f0ece2;font-size:12px;color:#8a8676;">
          © ${new Date().getFullYear()} ${escapeHtml(brandName)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    // Require authenticated caller to prevent abuse as an open email relay
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!jwt) {
      return new Response(JSON.stringify({ error: "missing_auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let callerId: string;
    {
      const url = Deno.env.get("SUPABASE_URL")!;
      const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
      const authClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
      const { data: claims, error: authErr } = await authClient.auth.getUser(jwt);
      if (authErr || !claims?.user?.id) {
        return new Response(JSON.stringify({ error: "invalid_token" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerId = claims.user.id;
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Resend bağlantısı yapılandırılmamış." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body.tenantId) return new Response("Tenant required", { status: 400, headers: corsHeaders });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: allowed } = await admin.rpc("tenant_user_has_permission", { _tenant_id: body.tenantId, _permission: "email_templates.edit", _user_id: callerId });
    if (!allowed) return new Response("Forbidden", { status: 403, headers: corsHeaders });
    const { data: tenant } = await admin.from("tenants").select("name,slug,status").eq("id", body.tenantId).single();
    if (!tenant || tenant.status !== "active") return new Response("Tenant unavailable", { status: 404, headers: corsHeaders });
    const routes = JSON.parse(Deno.env.get("BRAND_EMAIL_ROUTES") || "{}");
    const configuredFrom = routes[tenant.slug]?.from;
    if (!configuredFrom) return new Response("Brand email not configured", { status: 503, headers: corsHeaders });
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const validRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleaned = recipients.map((r) => String(r || "").trim().toLowerCase()).filter((r) => validRe.test(r));
    if (!cleaned.length) {
      return new Response(JSON.stringify({ error: "Geçerli alıcı yok." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject = body.subject ?? "";
    let html = body.html ?? "";
    let text = body.text ?? "";
    const vars = body.variables ?? {};
    const locale = body.locale === "en" ? "en" : "tr";

    // Resolve from template if provided
    if (body.templateKey) {
      const url = Deno.env.get("SUPABASE_URL")!;
      const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const admin = createClient(url, key);
      let q = admin.from("email_templates").select("*").eq("key", body.templateKey).eq("active", true).limit(1);
      if (body.tenantId) q = q.eq("tenant_id", body.tenantId);
      const { data: tpl, error } = await q.maybeSingle();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!tpl) {
        return new Response(JSON.stringify({ error: `Şablon bulunamadı: ${body.templateKey}` }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      subject = render(locale === "en" ? tpl.subject_en || tpl.subject_tr : tpl.subject_tr || tpl.subject_en, vars);
      const rawBody = locale === "en" ? tpl.body_en || tpl.body_tr : tpl.body_tr || tpl.body_en;
      const rendered = render(rawBody || "", vars);
      html = wrapHtml(rendered, subject, tenant.name);
      text = rendered.replace(/<[^>]+>/g, "");
    } else if (html || text) {
      subject = render(subject, vars);
      if (html) html = render(html, vars);
      if (text) text = render(text, vars);
      if (!html && text) html = wrapHtml(text, subject, tenant.name);
    } else {
      return new Response(JSON.stringify({ error: "templateKey veya html/text gerekli." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const from = configuredFrom;

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from, to: cleaned, subject, html, text: text || undefined }),
    });
    const respBody = await resp.text();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Resend ${resp.status}: ${respBody}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(respBody, {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});