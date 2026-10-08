import { canonicalPath } from "./search";

export function analyticsHostAllowed(hostname: string, canonicalDomain?: string | null) {
  return Boolean(canonicalDomain && hostname === canonicalDomain);
}

export const CONSENT_EVENT = "brand:consent";
export const consentKey = (brand: string) => `brand:${brand}:consent:v1`;
export function analyticsAllowed(brand: string) {
  try { return JSON.parse(localStorage.getItem(consentKey(brand)) || "null")?.analytics === true; }
  catch { return false; }
}
export function referralChannel(referrer: string, search: string) {
  const source = new URLSearchParams(search).get("utm_source")?.toLowerCase() || "";
  let host = "";
  try { host = new URL(referrer).hostname; } catch { /* Direct visit. */ }
  const value = source || host;
  if (/^(?:www\.)?chatgpt\.com$|^chatgpt$/.test(value)) return "chatgpt";
  if (/^(?:www\.)?perplexity\.ai$|^perplexity$/.test(value)) return "perplexity";
  if (/^copilot(?:\.microsoft\.com)?$/.test(value)) return "copilot";
  if (/^claude(?:\.ai)?$/.test(value)) return "claude";
  if (/^gemini(?:\.google\.com)?$/.test(value)) return "gemini";
  if (/(^|\.)google\.[a-z.]+$/.test(value) || value === "google") return "google";
  if (/(^|\.)bing\.com$/.test(value) || value === "bing") return "bing";
  return value ? "referral" : "direct";
}
const sessionKey = (brand: string) => `brand:${brand}:acquisition:v1`;
export function clearAttribution(brand: string) {
  try { sessionStorage.removeItem(sessionKey(brand)); } catch { /* Storage may be disabled. */ }
}
function acquisition(brand: string) {
  try {
    const key = sessionKey(brand);
    const previous = sessionStorage.getItem(key);
    if (previous) return JSON.parse(previous) as {source_channel:string;landing_path:string};
    const data = {source_channel:referralChannel(document.referrer, location.search),landing_path:canonicalPath(location.pathname)};
    sessionStorage.setItem(key, JSON.stringify(data));
    return data;
  } catch { return {source_channel:"unknown",landing_path:canonicalPath(location.pathname)}; }
}
let initialized = "";
export function initializeAnalytics(brand: string, measurementId: string) {
  if (!analyticsAllowed(brand) || !/^G-[A-Z0-9]+$/.test(measurementId)) return false;
  if (initialized === measurementId) return true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", { analytics_storage:"granted", ad_storage:"denied", ad_user_data:"denied", ad_personalization:"denied" });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+canonicalPath(location.pathname),page_referrer:""});
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.dataset.brandAnalytics = brand;
  document.head.appendChild(script);
  initialized = measurementId;
  return true;
}
export function trackGrowth(brand: string, event: "page_view" | "quote_cta_click" | "quote_start" | "quote_submit_error" | "generate_lead" | "contact_click", fields: {service?:string;contact_type?:string} = {}) {
  if (!analyticsAllowed(brand) || !window.gtag || !initialized) return;
  const path = canonicalPath(location.pathname);
  window.gtag("event", event, {
    brand, ...acquisition(brand), ...fields, page_path:path,
    page_location:location.origin + path,
    // Do not forward full referrers, URL query strings, form values or filenames.
    page_referrer:"", transport_type:"beacon",
  });
}
