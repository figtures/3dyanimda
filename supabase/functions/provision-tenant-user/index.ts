// Super-admin only: create (or update) an auth user with a known password
// and attach them to a tenant with a given role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id, x-tenant-host",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!jwt) return json({ error: "missing_auth" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: u, error: uerr } = await admin.auth.getUser(jwt);
    if (uerr || !u.user) return json({ error: "invalid_token" }, 401);

    const { data: sa } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", u.user.id)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!sa) return json({ error: "forbidden" }, 403);

    const { tenant_id, email, password, role_slug = "owner" } = await req.json();
    if (!tenant_id || !email || !password) return json({ error: "missing_fields" }, 400);

    const lower = String(email).toLowerCase().trim();
    let userId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users.find((x) => x.email?.toLowerCase() === lower);
    if (existing) {
      userId = existing.id;
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else {
      const { data: created, error: cerr } = await admin.auth.admin.createUser({
        email: lower,
        password,
        email_confirm: true,
      });
      if (cerr || !created.user) return json({ error: cerr?.message ?? "create_failed" }, 500);
      userId = created.user.id;
    }

    const { error: tuErr } = await admin.from("tenant_users").upsert(
      { tenant_id, user_id: userId!, role_slug, invited_email: lower, status: "active" },
      { onConflict: "tenant_id,user_id" },
    );
    if (tuErr) return json({ error: tuErr.message }, 500);

    return json({ ok: true, user_id: userId });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});