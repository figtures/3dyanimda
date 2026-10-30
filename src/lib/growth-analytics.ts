import {isFlatLocalPath} from "./local-urls.mjs";
import { canonicalPath } from "./search";

export function analyticsHostAllowed(hostname: string, canonicalDomain?: string | null) {
  return Boolean(canonicalDomain && hostname === canonicalDomain);
}
export function analyticsPathAllowed(pathname: string) {
  try { return !/^\/(admin|studio|api|auth)(\/|$)/i.test(decodeURIComponent(pathname)); }
  catch { return false; }
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
let active = false;
export function suspendAnalytics() { active = false; }
export function initializeAnalytics(brand: string, measurementId: string) {
  active = analyticsAllowed(brand) && analyticsPathAllowed(location.pathname) && /^G-[A-Z0-9]+$/.test(measurementId);
  if (!active) return false;
  // gtag checks this flag before sending data or setting cookies. Read current
  // consent and URL on every check, including SPA transitions outside this layout.
  Object.defineProperty(window, `ga-disable-${measurementId}`, {
    configurable: true,
    get: () => !active || !analyticsAllowed(brand) || !analyticsPathAllowed(location.pathname),
  });
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
export type GrowthEvent = "page_view" | "quote_cta_click" | "quote_start" | "quote_submit_error" | "generate_lead" | "contact_click" | "quote_submit_success" | "file_upload_success" | "whatsapp_click" | "phone_click";
type GrowthFields = {service?:string;contact_type?:string;file_type?:string};
export function contentGroup(pathname: string) {
  if(isFlatLocalPath(pathname))return 'location';
  if (pathname === "/") return "home";
  const section = canonicalPath(pathname).split("/")[1];
  if (["3d-baski", "3d-tarama", "3d-modelleme", "hizmetler"].includes(section)) return "service";
  return ({rehber:"guide",blog:"guide",bolgeler:"location",malzemeler:"material",araclar:"tool",portfoy:"portfolio","teklif-al":"quote",cozumler:"solution",sektorler:"sector"} as Record<string,string>)[section] || "other";
}
// Only fixed categories may enter analytics. Never send names, contact details,
// model filenames, free-text application notes or values from an external URL.
function safeFields(fields: GrowthFields) {
  const values: GrowthFields = {};
  if (["3D Baskı", "3D Tarama", "3D Modelleme", "3d-baski", "3d-tarama", "3d-modelleme"].includes(fields.service || "")) values.service = fields.service;
  if (["tel", "mailto", "whatsapp"].includes(fields.contact_type || "")) values.contact_type = fields.contact_type;
  if (["stl", "obj", "3mf", "step", "stp", "igs", "iges"].includes(fields.file_type || "")) values.file_type = fields.file_type;
  return values;
}
export function trackGrowth(brand: string, event: GrowthEvent, fields: GrowthFields = {}) {
  if (!active || !analyticsPathAllowed(location.pathname) || !analyticsAllowed(brand) || !window.gtag || !initialized) return;
  const path = canonicalPath(location.pathname);
  window.gtag("event", event, {
    brand, ...acquisition(brand), ...safeFields(fields), page_path:path,
    ...(brand === "3dyanimda" ? {content_group:contentGroup(path)} : {}),
    page_location:location.origin + path,
    // Do not forward full referrers, URL query strings, form values or filenames.
    page_referrer:"", transport_type:"beacon",
  });
}

export function contactKind(href: string, origin: string): "tel" | "mailto" | "whatsapp" | null {
  try {
    const url = new URL(href, origin);
    if (url.protocol === "tel:") return "tel";
    if (url.protocol === "mailto:") return "mailto";
    if (url.protocol === "https:" && ["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)) return "whatsapp";
  } catch { /* Malformed links must not break the interaction. */ }
  return null;
}
export function trackContactClick(brand: string, href: string, origin: string) {
  const kind = contactKind(href, origin);
  if (!kind) return;
  trackGrowth(brand, "contact_click", {contact_type:kind});
  if (brand === "3dyanimda" && kind !== "mailto")
    trackGrowth(brand, kind === "tel" ? "phone_click" : "whatsapp_click", {contact_type:kind});
}
export function trackQuoteSaved(brand: string, service: string) {
  // Configure generate_lead as the sole saved-quote key event in GA4.
  // quote_submit_success is a diagnostic, not a second lead conversion.
  trackGrowth(brand, "generate_lead", {service});
  if (brand === "3dyanimda") trackGrowth(brand, "quote_submit_success", {service});
}
