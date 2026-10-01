// Invites a user to a tenant. Requires caller to have users.invite permission
// in that tenant (or be super_admin). Creates the auth user if needed and
// adds/updates a tenant_users row.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id, x-tenant-host",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "missing_auth" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: u, error: uerr } = await admin.auth.getUser(jwt);
    if (uerr || !u.user) return json({ error: "invalid_token" }, 401);
    const callerId = u.user.id;

    const body = await req.json().catch(() => ({}));
    const { tenant_id, email, role_slug } = body as {
      tenant_id?: string;
      email?: string;
      role_slug?: string;
    };
    if (!tenant_id || !email || !role_slug) return json({ error: "missing_fields" }, 400);

    // Authorization: super_admin OR users.invite permission in tenant
    const { data: sa } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", callerId)
      .eq("role", "super_admin")
      .maybeSingle();
    let allowed = !!sa;
    if (!allowed) {
      const { data: perm } = await admin.rpc("tenant_user_has_permission", {
        _tenant_id: tenant_id,
        _permission: "users.invite",
        _user_id: callerId,
      });
      allowed = !!perm;
    }
    if (!allowed) return json({ error: "forbidden" }, 403);

    // Validate role exists for this tenant or system
    const { data: role } = await admin
      .from("tenant_roles")
      .select("slug")
      .or(`tenant_id.eq.${tenant_id},tenant_id.is.null`)
      .eq("slug", role_slug)
      .maybeSingle();
    if (!role) return json({ error: "role_not_found" }, 400);

    // Find or invite the auth user
    const lower = email.toLowerCase().trim();
    let userId: string | null = null;

    // Try listing existing users (paginate first 1000 — enough for MVP)
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users.find((x) => x.email?.toLowerCase() === lower);
    if (existing) {
      userId = existing.id;
    } else {
      const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(lower);
      if (invErr || !invited.user) {
        // Fallback: create user without invite email (e.g., SMTP not set up)
        const { data: created, error: cerr } = await admin.auth.admin.createUser({
          email: lower,
          email_confirm: false,
        });
        if (cerr || !created.user) return json({ error: cerr?.message ?? "create_failed" }, 500);
        userId = created.user.id;
      } else {
        userId = invited.user.id;
      }
    }

    const { error: tuErr } = await admin
      .from("tenant_users")
      .upsert(
        {
          tenant_id,
          user_id: userId!,
          role_slug,
          invited_email: lower,
          status: existing ? "active" : "pending",
        },
        { onConflict: "tenant_id,user_id" },
      );
    if (tuErr) return json({ error: tuErr.message }, 500);

    return json({ ok: true, user_id: userId, status: existing ? "active" : "pending" });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});