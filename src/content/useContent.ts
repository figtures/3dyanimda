import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/TenantContext";
import { supabase, demoMode } from "@/lib/supabase";
import type { LandingPage } from "./types";
export function useContent(includeDrafts = false) {
  const { tenant } = useTenant();
  return useQuery({
    queryKey: ["landing-pages", tenant?.id, includeDrafts],
    enabled: !!tenant,
    queryFn: async (): Promise<LandingPage[]> => {
      if (demoMode) {
        const { default: defaults } = await import("./pages.json");
        return (defaults as LandingPage[]).filter(
          (p) =>
            p.brand === tenant!.slug &&
            (includeDrafts || p.status === "published"),
        );
      }
      let query = supabase
        .from("landing_pages")
        .select("*")
        .eq("tenant_id", tenant!.id)
        .order("path");
      if (!includeDrafts) query = query.eq("status", "published");
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as LandingPage[];
    },
    staleTime: 60000,
  });
}
