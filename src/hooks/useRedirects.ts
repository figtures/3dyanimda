import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
const cache = new Map<string, { at: number; routes: Record<string, string> }>();
export function useRedirects() {
  const { tenant } = useTenant();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!tenant) return;
    let cancelled = false;
    (async () => {
      let entry = cache.get(tenant.id);
      if (!entry || Date.now() - entry.at > 60000) {
        const { data } = await supabase
          .from("url_redirects")
          .select("from_path,to_path")
          .eq("tenant_id", tenant.id)
          .eq("active", true);
        entry = {
          at: Date.now(),
          routes: Object.fromEntries(
            (data || []).map((row) => [row.from_path, row.to_path]),
          ),
        };
        cache.set(tenant.id, entry);
      }
      const target = entry.routes[pathname];
      if (
        !cancelled &&
        target &&
        target !== pathname &&
        target.startsWith("/") &&
        !target.startsWith("//")
      )
        navigate(target + search, { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [tenant?.id, pathname, search, navigate]);
}
