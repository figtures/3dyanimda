import { supabase } from "@/lib/supabase";

export const resolveMediaUrl = (source?: string | null, bucket = "site-images") => {
  const raw = typeof source === "string" ? source.trim() : "";
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw) || raw.startsWith("/")) return raw;

  const path = raw
    .replace(/^public\//, "")
    .replace(new RegExp(`^${bucket}/`), "")
    .replace(/^storage\/v1\/object\/public\//, "")
    .replace(new RegExp(`^${bucket}/`), "");

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

export const resolveMediaItemUrl = (item: { public_url?: string | null; storage_path?: string | null }, bucket = "site-images") =>
  resolveMediaUrl(item.public_url || item.storage_path, bucket);