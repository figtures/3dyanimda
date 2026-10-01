import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Sends GA4 page_view on every SPA route change. Respects consent mode. */
export const AnalyticsListener = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: pathname + search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);

  return null;
};