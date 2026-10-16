import { useTenant } from "@/contexts/TenantContext";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/backend-config";
import { resolveMediaUrl } from "@/lib/media";
import { getTenantId } from "@/lib/tenant";

import {publicRenderState} from '@/lib/public-render-state';
export const exportPublicSettings=(id:string)=>cache.get(id)||{};
type Settings = Record<string, any>;

const cache = new Map<string, Settings>();
const initial=publicRenderState();if(initial)cache.set(initial.tenant.id,initial.settings);
const listeners = new Set<(id: string, value: Settings) => void>();
const pending = new Map<string, Promise<Settings>>();
async function load(id: string): Promise<Settings> {
  const { data, error } = await (await getSupabase())
    .from("site_settings")
    .select("key, value")
    .eq("tenant_id", id);
  if (error) throw error;
  if (!data) throw new Error("Site ayarları yüklenemedi.");
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}
export function useSiteSettings() {
  const { tenant } = useTenant();
  const id = tenant?.id;
  const [settings, setSettings] = useState<Settings>(() =>
    id ? (cache.get(id) ?? {}) : {},
  );
  useEffect(() => {
    if (!id) {
      setSettings({});
      return;
    }
    let active = true;
    setSettings(cache.get(id) ?? {});
    const listener = (key: string, value: Settings) => {
      if (active && key === id) setSettings(value);
    };
    listeners.add(listener);
    if (!cache.has(id)) {
      if (!pending.has(id))
        pending.set(
          id,
          load(id).then((value) => {
            cache.set(id, value);
            listeners.forEach((fn) => fn(id, value));
            return value;
          }).catch(() => {
            // Background loading must not erase a known-good snapshot or reject unobserved.
            return cache.get(id) ?? {};
          }).finally(() => pending.delete(id)),
        );
    }
    return () => {
      active = false;
      listeners.delete(listener);
    };
  }, [id]);
  return settings;
}
async function refreshForTenant(id: string): Promise<Settings> {
  // Publish only a successful response. A failed refresh leaves the last good cache intact.
  const value = await load(id);
  cache.set(id, value);
  listeners.forEach((fn) => fn(id, value));
  return value;
}
export async function refreshSiteSettings(expectedTenantId?: string): Promise<Settings> {
  const id = getTenantId();
  if (!id) throw new Error("Tenant not resolved");
  if (expectedTenantId && expectedTenantId !== id) throw new Error("Marka değişti. Lütfen tekrar deneyin.");
  return refreshForTenant(id);
}
export async function setSiteSetting(key: string, value: any, expectedTenantId?: string) {
  const id = getTenantId();
  if (!id) throw new Error("Tenant not resolved");
  if (expectedTenantId && expectedTenantId !== id) throw new Error("Marka değişti. Lütfen tekrar deneyin.");
  const { error } = await (await getSupabase())
    .from("site_settings")
    .upsert(
      { tenant_id: id, key, value, updated_at: new Date().toISOString() },
      { onConflict: "tenant_id,key" },
    );
  if (error) throw error;
  await refreshForTenant(id);
}

/** Pick a localized value from an object that may carry _tr/_en suffixes. Returns fallback when empty. */
export function pickLocale<T = string>(
  obj: any,
  field: string,
  lang: string,
  fallback: T,
): T {
  if (!obj) return fallback;
  const v = obj[`${field}_${lang === "en" ? "en" : "tr"}`] ?? obj[field];
  return v == null || v === "" ? fallback : (v as T);
}

export function pickImage(obj: any, field = "image_url", fallback = "") {
  if (!obj) return fallback;
  return (
    resolveMediaUrl(
      obj[field] || obj.image || obj.public_url || obj.storage_path || fallback,
    ) || fallback
  );
}
