import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "./TenantContext";

type Ctx = {
  flags: Record<string, boolean>;
  loading: boolean;
  isEnabled: (key: string) => boolean;
  refresh: () => Promise<void>;
};

const FeatureCtx = createContext<Ctx>({
  flags: {},
  loading: true,
  isEnabled: () => false,
  refresh: async () => {},
});

export function useFeatures() {
  return useContext(FeatureCtx);
}

export function useFeature(key: string): boolean {
  const { isEnabled, loading } = useContext(FeatureCtx);
  if (loading) return true; // optimistic: don't flash hidden during boot
  return isEnabled(key);
}

export function Feature({
  flag,
  fallback = null,
  children,
}: {
  flag: string;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const on = useFeature(flag);
  return <>{on ? children : fallback}</>;
}

export function FeatureProvider({ children }: { children: ReactNode }) {
  const { tenant } = useTenant();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!tenant?.id) {
      setFlags({});
      setLoading(false);
      return;
    }
    setLoading(true);
    // Defaults: every known feature ON unless explicitly toggled off in tenant_features.
    const [{ data: master }, { data: tf }] = await Promise.all([
      supabase.from("features").select("key"),
      supabase.from("tenant_features").select("feature_key, enabled").eq("tenant_id", tenant.id),
    ]);
    const map: Record<string, boolean> = {};
    (master ?? []).forEach((f: any) => { map[f.key] = true; });
    (tf ?? []).forEach((row: any) => { map[row.feature_key] = !!row.enabled; });
    setFlags(map);
    setLoading(false);
  }, [tenant?.id]);

  useEffect(() => { load(); }, [load]);

  const isEnabled = useCallback(
    (key: string) => {
      if (flags[key] === false) return false;
      // Check parent: e.g. blog.comments depends on blog
      const parent = key.includes(".") ? key.split(".")[0] : null;
      if (parent && flags[parent] === false) return false;
      return flags[key] !== undefined ? flags[key] : true;
    },
    [flags]
  );

  return (
    <FeatureCtx.Provider value={{ flags, loading, isEnabled, refresh: load }}>
      {children}
    </FeatureCtx.Provider>
  );
}