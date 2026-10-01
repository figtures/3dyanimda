import { getTenantId, onTenantChange } from "./tenant";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { supabase } from "@/lib/supabase";

const cacheKey = () => `i18n:${getTenantId() ?? "unresolved"}`;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

type Resources = { tr: Record<string, string>; en: Record<string, string> };

function loadCache(): Resources | null {
  try {
    const raw = localStorage.getItem(cacheKey());
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function saveCache(data: Resources) {
  try { localStorage.setItem(cacheKey(), JSON.stringify({ ts: Date.now(), data })); } catch {}
}

export async function fetchTranslations(): Promise<Resources> {
  const id = getTenantId();
  if (!id) return { tr: {}, en: {} };
  const { data, error } = await supabase.from("translations").select("key, tr, en").eq("tenant_id", id);
  if (error || !data) return { tr: {}, en: {} };
  const tr: Record<string, string> = {};
  const en: Record<string, string> = {};
  for (const row of data) {
    if (row.tr) tr[row.key] = row.tr;
    if (row.en) en[row.key] = row.en;
  }
  return { tr, en };
}

export async function reloadTranslations() {
  const data = await fetchTranslations();
  saveCache(data);
  i18n.addResourceBundle("tr", "translation", data.tr, true, true);
  i18n.addResourceBundle("en", "translation", data.en, true, true);
}

const initial = loadCache() ?? { tr: {}, en: {} };

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: initial.tr },
      en: { translation: initial.en },
    },
    lng: localStorage.getItem("i18nextLng") || "tr",
    fallbackLng: "tr",
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    keySeparator: false, // we use flat dotted keys
    nsSeparator: false,
  });

// Refresh only after domain resolution. Never retain another tenant's resource bundle.
onTenantChange(async (id) => {
  i18n.removeResourceBundle("tr", "translation");
  i18n.removeResourceBundle("en", "translation");
  if (!id) return;
  const data = await fetchTranslations();
  if (getTenantId() !== id) return;
  saveCache(data);
  i18n.addResourceBundle("tr", "translation", data.tr, true, true);
  i18n.addResourceBundle("en", "translation", data.en, true, true);
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  try { localStorage.setItem("i18nextLng", lng); } catch {}
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language || "tr";
}

export default i18n;