import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useBrand } from "@/brands/config";
import { demoMode } from "@/lib/supabase";
import { CONSENT_EVENT, initializeAnalytics, trackGrowth } from "@/lib/growth-analytics";

export default function GrowthAnalytics() {
  const brand = useBrand();
  const { pathname } = useLocation();
  const id = import.meta.env.VITE_GA4_MEASUREMENT_ID || "";
  useEffect(() => {
    if (demoMode || import.meta.env.DEV || !id) return;
    const pageView = () => { if (initializeAnalytics(brand.slug, id)) trackGrowth(brand.slug, "page_view"); };
    const timer = window.setTimeout(pageView, 0);
    window.addEventListener(CONSENT_EVENT, pageView);
    const clicked = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const url = new URL(anchor.href, location.origin);
      if (url.origin === location.origin && url.pathname === "/teklif-al") trackGrowth(brand.slug,"quote_cta_click");
      else if (url.protocol === "tel:" || url.protocol === "mailto:" || url.hostname === "wa.me")
        trackGrowth(brand.slug,"contact_click",{contact_type:url.hostname === "wa.me" ? "whatsapp" : url.protocol.slice(0,-1)});
    };
    document.addEventListener("click", clicked);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT,pageView); document.removeEventListener("click",clicked); };
  }, [brand.slug, pathname, id]);
  return null;
}
