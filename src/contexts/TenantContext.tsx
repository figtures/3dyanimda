import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { supabase, demoMode, backendConfigured } from "@/lib/supabase";
import { getRequestHost, setTenantId, setTenantIdentity } from "@/lib/tenant";
import catalog from "@/brands/catalog.json";
export type Tenant = {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  custom_domain: string | null;
  status: string;
  plan: string;
  active_theme_slug: string | null;
  logo_url: string | null;
  settings: Record<string, any>;
};
type Ctx = {
  tenant: Tenant | null;
  loading: boolean;
  refresh: () => Promise<void>;
};
const TenantCtx = createContext<Ctx>({
  tenant: null,
  loading: true,
  refresh: async () => {},
});
export const useTenant = () => useContext(TenantCtx);
export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setTenantId(null);
    try {
      let resolved: Tenant | null = null;
      if (demoMode) {
        const brand = catalog.find(
          (b) => `${b.slug}.localhost` === getRequestHost(),
        );
        if (brand)
          resolved = {
            id: `10000000-0000-4000-8000-00000000000${catalog.indexOf(brand) + 1}`,
            slug: brand.slug,
            name: brand.name,
            domain: null,
            custom_domain: null,
            status: "active",
            plan: "starter",
            active_theme_slug: null,
            logo_url: null,
            settings: {},
          };
      } else if (backendConfigured) {
        const { data: id, error: idError } =
          await supabase.rpc("current_tenant_id");
        if (idError) throw idError;
        if (id) {
          const result = await supabase
            .from("tenants")
            .select("*")
            .eq("id", id)
            .eq("status", "active")
            .maybeSingle();
          if (result.error) throw result.error;
          resolved = result.data as Tenant | null;
        }
      } else
        throw new Error(
          "Yeni Supabase projesinin bağlantısı yapılandırılmalı.",
        );
      if (!resolved)
        throw new Error("Bu alan adına bağlı aktif bir marka bulunamadı.");
      setTenantIdentity({
        name: resolved.name,
        domain: resolved.custom_domain || resolved.domain,
      });
      setTenantId(resolved.id);
      setTenant(resolved);
    } catch (reason) {
      setTenant(null);
      setError(
        reason instanceof Error
          ? reason.message
          : "Marka bilgileri yüklenemedi.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading)
    return (
      <div className="min-h-screen grid place-items-center" role="status">
        Marka yükleniyor…
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div>
          <h1 className="text-2xl">Site henüz hazır değil.</h1>
          <p className="my-4">{error}</p>
          <button onClick={load} className="underline">
            Tekrar dene
          </button>
        </div>
      </div>
    );
  return (
    <TenantCtx.Provider value={{ tenant, loading, refresh: load }}>
      <div key={tenant?.id}>{children}</div>
    </TenantCtx.Provider>
  );
}
