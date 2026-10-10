import { createClient } from "npm:@supabase/supabase-js@2";
import { createEmailJSDispatcher, quoteNotificationParams, readEmailJSConfig } from "./emailjs.mjs";

// Scheduled server-only outbox worker; requests cannot choose recipients or HTML.
Deno.serve(async (req) => {
  const secret = Deno.env.get("QUOTE_WORKER_SECRET");
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`)
    return new Response("Unauthorized", { status: 401 });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let send;
  try {
    send = createEmailJSDispatcher(readEmailJSConfig((name: string) => Deno.env.get(name)));
  } catch {
    return new Response("EmailJS is not configured", { status: 503 });
  }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: pending, error } = await db.from("quote_notifications").select("*")
    .is("sent_at", null).lt("attempts", 5).order("created_at").limit(5);
  if (error) return new Response("Queue unavailable", { status: 503 });
  let sent = 0, failed = 0, skipped = 0;
  for (const job of pending || []) {
    const { data: tenant, error: tenantError } = await db.from("tenants")
      .select("id,slug,name,status").eq("id", job.tenant_id).single();
    const { data: quote, error: quoteError } = await db.from("quote_requests")
      .select("*").eq("id", job.quote_id).eq("tenant_id", job.tenant_id).single();
    if (tenantError || quoteError || !tenant || !quote) { skipped++; continue; }
    let params;
    try { params = quoteNotificationParams(tenant, quote); }
    catch { skipped++; continue; }
    // Compare the pending version before attempting delivery. The scheduler must
    // still be non-overlapping: this is not a distributed lease or exactly-once API.
    const { data: attempt, error: attemptError } = await db.from("quote_notifications")
      .update({ attempts: job.attempts + 1 })
      .eq("quote_id", job.quote_id).eq("tenant_id", job.tenant_id)
      .eq("attempts", job.attempts).is("sent_at", null).select("quote_id").maybeSingle();
    if (attemptError) return Response.json({ sent, failed, skipped, error: "queue_update_failed" }, { status: 503 });
    if (!attempt) { skipped++; continue; }
    try {
      await send(params);
    } catch (error: any) {
      failed++;
      // Rate limits and account/configuration errors must not drain the whole queue.
      if ([400, 401, 403, 429].includes(error?.status)) break;
      continue;
    }
    const { error: savedError } = await db.from("quote_notifications")
      .update({ sent_at: new Date().toISOString() })
      .eq("quote_id", job.quote_id).eq("tenant_id", job.tenant_id);
    if (savedError)
      return Response.json({ sent, failed, skipped, error: "delivery_accepted_queue_update_failed" }, { status: 503 });
    sent++;
  }
  return Response.json({ sent, failed, skipped });
});

