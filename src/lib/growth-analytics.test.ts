import { beforeEach, describe, expect, it, vi } from "vitest";

const brand = "3dyanimda";
const measurementId = "G-HBTDHJ45M7";
let analytics: typeof import("./growth-analytics");
const commands = () => (window.dataLayer || []).map(value => Array.from(value as ArrayLike<unknown>));
const disabled = () => Reflect.get(window, `ga-disable-${measurementId}`);
const allow = () => localStorage.setItem(analytics.consentKey(brand), JSON.stringify({ analytics: true }));

beforeEach(async () => {
  vi.resetModules();
  analytics = await import("./growth-analytics");
  localStorage.clear();
  sessionStorage.clear();
  document.head.querySelectorAll("script[data-brand-analytics]").forEach(script => script.remove());
  delete window.gtag;
  delete window.dataLayer;
  Reflect.deleteProperty(window, `ga-disable-${measurementId}`);
  history.replaceState({}, "", "/");
});

describe("consented GA4 collection boundaries", () => {
  it("does not load the Google tag before analytics consent", () => {
    expect(analytics.initializeAnalytics(brand, measurementId)).toBe(false);
    expect(document.querySelectorAll("script[data-brand-analytics]")).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
  });

  it("initializes the existing tag once and keeps automatic config pageviews off", () => {
    allow();
    expect(analytics.initializeAnalytics(brand, measurementId)).toBe(true);
    expect(analytics.initializeAnalytics(brand, measurementId)).toBe(true);
    expect(document.querySelectorAll("script[data-brand-analytics]")).toHaveLength(1);
    expect(commands().filter(command => command[0] === "config")).toEqual([
      ["config", measurementId, expect.objectContaining({ send_page_view: false })],
    ]);
  });

  it("omits query strings, fragments and form values from custom events", () => {
    allow();
    history.replaceState({}, "", "/teklif-al?email=private%40example.com#filename.stl");
    analytics.initializeAnalytics(brand, measurementId);
    analytics.trackGrowth(brand, "quote_start", { service: "3d-baski" });
    const event = commands().find(command => command[0] === "event");
    expect(event).toEqual(["event", "quote_start", expect.objectContaining({
      page_path: "/teklif-al", page_location: location.origin + "/teklif-al", page_referrer: "",
    })]);
    expect(JSON.stringify(event)).not.toContain("private");
    expect(JSON.stringify(event)).not.toContain("filename");
  });

  it.each(["/admin", "/admin/requests", "/studio/tenants", "/auth/reset", "/api/private", "/%61dmin/requests"])(
    "blocks initial collection and tag loading on %s", path => {
      allow();
      history.replaceState({}, "", path);
      expect(analytics.initializeAnalytics(brand, measurementId)).toBe(false);
      expect(document.querySelectorAll("script[data-brand-analytics]")).toHaveLength(0);
    },
  );

  it("disables a loaded tag immediately when SPA history enters an admin route", () => {
    allow();
    analytics.initializeAnalytics(brand, measurementId);
    expect(disabled()).toBe(false);
    history.pushState({}, "", "/admin/requests?customer=private");
    expect(disabled()).toBe(true);
    analytics.trackGrowth(brand, "page_view");
    expect(commands().filter(command => command[0] === "event")).toHaveLength(0);
  });

  it("disables a loaded tag immediately when consent is revoked", () => {
    allow();
    analytics.initializeAnalytics(brand, measurementId);
    localStorage.setItem(analytics.consentKey(brand), JSON.stringify({ analytics: false }));
    expect(disabled()).toBe(true);
    analytics.trackGrowth(brand, "generate_lead");
    expect(commands().filter(command => command[0] === "event")).toHaveLength(0);
  });

  it("suspends collection after the public layout unmounts and reuses its tag after return", () => {
    allow();
    analytics.initializeAnalytics(brand, measurementId);
    analytics.suspendAnalytics();
    expect(disabled()).toBe(true);
    analytics.trackGrowth(brand, "page_view");
    expect(commands().filter(command => command[0] === "event")).toHaveLength(0);
    analytics.initializeAnalytics(brand, measurementId);
    expect(disabled()).toBe(false);
    expect(document.querySelectorAll("script[data-brand-analytics]")).toHaveLength(1);
  });
});
