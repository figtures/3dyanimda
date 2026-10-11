import {backendUrl} from "./backend-config";

export const resolveMediaUrl = (source?: string | null, bucket = "site-images") => {
  const raw = typeof source === "string" ? source.trim() : "";
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw) || raw.startsWith("/")) return raw;

  const path = raw
    .replace(/^public\//, "")
    .replace(new RegExp(`^${bucket}/`), "")
    .replace(/^storage\/v1\/object\/public\//, "")
    .replace(new RegExp(`^${bucket}/`), "");

  if(!backendUrl)return "";
  return `${backendUrl.replace(/\/$/,"")}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`;
};

export const resolveMediaItemUrl = (item: { public_url?: string | null; storage_path?: string | null }, bucket = "site-images") =>
  resolveMediaUrl(item.public_url || item.storage_path, bucket);