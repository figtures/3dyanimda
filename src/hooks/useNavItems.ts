import { useEffect, useState } from "react";
import {getSupabase} from "@/lib/backend-config";
import { useTenant } from "@/contexts/TenantContext";
import {publicRenderState} from '@/lib/public-render-state';
const cache=new Map<string,NavItemRow[]>();
const initial=publicRenderState();if(initial)cache.set(initial.tenant.id,initial.nav as NavItemRow[]);
export const exportPublicNav=(id:string)=>cache.get(id)||[];
export type NavItemRow = {
  id: string;
  location: string;
  label_tr: string;
  label_en: string | null;
  url: string;
  parent: string | null;
  badge: string | null;
  sort_order: number;
};
export function useNavItems(location?: string) {
  const { tenant } = useTenant();
  const [rows, setRows] = useState<NavItemRow[]>(()=>cache.get(tenant?.id)||[]);
  useEffect(() => {
    let active = true;
    setRows(cache.get(tenant?.id)||[]);
    if (tenant && !cache.has(tenant.id))
      getSupabase().then(supabase=>supabase
        .from("nav_items")
        .select("id,location,label_tr,label_en,url,parent,badge,sort_order")
        .eq("tenant_id", tenant.id)
        .eq("active", true)
        .order("sort_order")
        .then(({ data }) => {
          if (active) {cache.set(tenant!.id,data??[]);setRows(data ?? []);}
        }));
    return () => {
      active = false;
    };
  }, [tenant?.id]);
  return location ? rows.filter((r) => r.location === location) : rows;
}
export const pickNavLabel = (row: NavItemRow, lang: string) =>
  lang.startsWith("en") && row.label_en ? row.label_en : row.label_tr;
