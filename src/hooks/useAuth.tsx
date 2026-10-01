import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useTenant } from "@/contexts/TenantContext";

export type TenantMembership = {
  tenant_id: string;
  role_slug: string;
  extra_permissions: string[];
  status: string;
};

export function useAuth() {
  const { tenant, loading: tenantLoading } = useTenant();
  const [session, setSession] = useState<Session | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [membership, setMembership] = useState<TenantMembership | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async (userId: string | undefined, tenantId: string | undefined) => {
    if (!userId) {
      setIsSuperAdmin(false);
      setMembership(null);
      setPermissions([]);
      setLoading(false);
      return;
    }
    // super_admin?
    const { data: sa } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin" as any)
      .maybeSingle();
    const isSA = !!sa;
    setIsSuperAdmin(isSA);

    if (tenantId) {
      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id, role_slug, extra_permissions, status")
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      setMembership((tu as TenantMembership) ?? null);

      // Permissions from role + extra
      let perms: string[] = [];
      if (tu) {
        if (tu.role_slug === "owner" || isSA) {
          perms = ["*"];
        } else {
          const { data: roleRow } = await supabase
            .from("tenant_roles")
            .select("permissions")
            .eq("slug", tu.role_slug)
            .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
            .maybeSingle();
          perms = [...(roleRow?.permissions ?? []), ...(tu.extra_permissions ?? [])];
        }
      } else if (isSA) {
        perms = ["*"];
      }
      setPermissions(perms);
    } else {
      setMembership(null);
      setPermissions(isSA ? ["*"] : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => refresh(s?.user.id, tenant?.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      refresh(data.session?.user.id, tenant?.id);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const hasPermission = (perm: string): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.includes("*")) return true;
    if (permissions.includes(perm)) return true;
    const [scope] = perm.split(".");
    if (permissions.includes(`${scope}.*`)) return true;
    return false;
  };

  const canAccessAdmin = isSuperAdmin || !!membership;

  return {
    session,
    tenant,
    isSuperAdmin,
    membership,
    permissions,
    hasPermission,
    canAccessAdmin,
    loading: loading || tenantLoading,
  };
}