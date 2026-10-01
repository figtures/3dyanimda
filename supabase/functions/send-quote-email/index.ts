import { createClient } from "npm:@supabase/supabase-js@2";
// Scheduled server-only outbox worker. No user-submitted recipients, HTML or file downloads.
Deno.serve(async (req) => {
  const secret = Deno.env.get("QUOTE_WORKER_SECRET");
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`)
    return new Response("Unauthorized", { status: 401 });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  const key = Deno.env.get("RESEND_API_KEY");
  const routes = JSON.parse(Deno.env.get("BRAND_EMAIL_ROUTES") || "{}");
  if (!key)
    return new Response("Email provider is not configured", { status: 503 });
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: pending, error } = await db
    .from("quote_notifications")
    .select("*")
    .is("sent_at", null)
    .lt("attempts", 5)
    .order("created_at")
    .limit(20);
  if (error) return new Response("Queue unavailable", { status: 503 });
  let sent = 0;
  const esc = (s: unknown) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );
  for (const job of pending || []) {
    const { data: tenant } = await db
      .from("tenants")
      .select("slug,name,status")
      .eq("id", job.tenant_id)
      .single();
    const route = tenant && routes[tenant.slug];
    if (!route?.from || !route?.to || tenant?.status !== "active") continue;
    const { data: q } = await db
      .from("quote_requests")
      .select("*")
      .eq("id", job.quote_id)
      .eq("tenant_id", job.tenant_id)
      .single();
    if (!q) continue;
    await db
      .from("quote_notifications")
      .update({ attempts: job.attempts + 1 })
      .eq("quote_id", job.quote_id);
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `quote-${job.quote_id}`,
      },
      body: JSON.stringify({
        from: route.from,
        to: route.to,
        reply_to: q.email,
        subject: `${tenant.name} — Yeni proje talebi`,
        html: `<h2>${esc(tenant.name)}</h2><p>${esc(q.full_name)} · ${esc(q.email)}</p><p>${esc(q.part_description)}</p><p>Dosyaları ve ayrıntıları marka yönetim panelinden görüntüleyin.</p>`,
      }),
    });
    if (result.ok) {
      await db
        .from("quote_notifications")
        .update({ sent_at: new Date().toISOString() })
        .eq("quote_id", job.quote_id);
      sent++;
    }
  }
  return Response.json({ sent });
});
