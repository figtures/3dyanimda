import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
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
  const [rows, setRows] = useState<NavItemRow[]>([]);
  useEffect(() => {
    let active = true;
    setRows([]);
    if (tenant)
      supabase
        .from("nav_items")
        .select("id,location,label_tr,label_en,url,parent,badge,sort_order")
        .eq("tenant_id", tenant.id)
        .eq("active", true)
        .order("sort_order")
        .then(({ data }) => {
          if (active) setRows(data ?? []);
        });
    return () => {
      active = false;
    };
  }, [tenant?.id]);
  return location ? rows.filter((r) => r.location === location) : rows;
}
export const pickNavLabel = (row: NavItemRow, lang: string) =>
  lang.startsWith("en") && row.label_en ? row.label_en : row.label_tr;
