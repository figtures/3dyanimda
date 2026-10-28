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
  it.each([
    ["chatgpt", "chatgpt"], ["perplexity", "perplexity"],
    ["copilot", "copilot"], ["claude", "claude"], ["gemini", "gemini"],
    ["google", "google"], ["bing", "bing"], ["newsletter", "referral"],
  ])("sends the fixed source_channel category for %s without forwarding the URL", (source, expected) => {
    allow();
    history.replaceState({}, "", `/3d-baski?utm_source=${source}&email=private%40example.com`);
    analytics.initializeAnalytics(brand, measurementId);
    analytics.trackGrowth(brand, "page_view");
    const event = commands().find(command => command[0] === "event")!;
    expect(event[2]).toMatchObject({source_channel: expected, landing_path: "/3d-baski", page_referrer: ""});
    expect(JSON.stringify(event)).not.toMatch(/utm_source|private@|private%40/);
  });

  it("keeps the first consented source across SPA pages and resets it when cleared", () => {
    allow(); history.replaceState({}, "", "/3d-tarama?utm_source=perplexity");
    analytics.initializeAnalytics(brand, measurementId);
    analytics.trackGrowth(brand, "page_view");
    history.pushState({}, "", "/teklif-al?utm_source=chatgpt");
    analytics.trackGrowth(brand, "quote_start");
    let events = commands().filter(command => command[0] === "event");
    expect(events[1][2]).toMatchObject({source_channel: "perplexity", landing_path: "/3d-tarama", page_path: "/teklif-al"});
    analytics.clearAttribution(brand);
    analytics.trackGrowth(brand, "quote_start");
    events = commands().filter(command => command[0] === "event");
    expect(events[2][2]).toMatchObject({source_channel: "chatgpt", landing_path: "/teklif-al"});
  });

  it("classifies referrer hosts without claiming Google AI attribution", () => {
    expect(analytics.referralChannel("https://www.google.com/search?q=private", "")).toBe("google");
    expect(analytics.referralChannel("https://chatgpt.com/c/private", "")).toBe("chatgpt");
    expect(analytics.referralChannel("https://chatgpt.com.attacker.example/", "")).toBe("referral");
    expect(analytics.referralChannel("", "")).toBe("direct");
  });
  it("keeps host collection limited to the canonical domain", () => {
    expect(analytics.analyticsHostAllowed("3dyanimda.com", "3dyanimda.com")).toBe(true);
    expect(analytics.analyticsHostAllowed("preview.example", "3dyanimda.com")).toBe(false);
    expect(analytics.analyticsHostAllowed("3dyanimda.com", null)).toBe(false);
  });
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

  it("records one lead and a separately named saved-request diagnostic", () => {
    allow(); analytics.initializeAnalytics(brand, measurementId);
    analytics.trackQuoteSaved(brand, "3D Baskı");
    const events=commands().filter(command=>command[0]==="event");
    expect(events.map(command=>command[1])).toEqual(["generate_lead", "quote_submit_success"]);
    expect(events.filter(command=>command[1]==="generate_lead")).toHaveLength(1);
  });

  it("does not introduce the 3dyanimda diagnostic to other brands", () => {
    const other="3dsanayi";
    localStorage.setItem(analytics.consentKey(other), JSON.stringify({analytics:true}));
    analytics.initializeAnalytics(other, measurementId);
    analytics.trackQuoteSaved(other, "3D Tarama");
    expect(commands().filter(command=>command[0]==="event").map(command=>command[1])).toEqual(["generate_lead"]);
  });

  it("counts phone and WhatsApp engagement without sending destinations or messages", () => {
    allow(); analytics.initializeAnalytics(brand, measurementId);
    analytics.trackContactClick(brand,"tel:+905000000000",location.origin);
    analytics.trackContactClick(brand,"https://wa.me/905000000000?text=private-project",location.origin);
    analytics.trackContactClick(brand,"https://api.whatsapp.com/send?phone=905000000000&text=private",location.origin);
    analytics.trackContactClick(brand,"https://wa.me.attacker.example/private",location.origin);
    const events=commands().filter(command=>command[0]==="event");
    expect(events.map(command=>command[1])).toEqual(["contact_click","phone_click","contact_click","whatsapp_click","contact_click","whatsapp_click"]);
    expect(JSON.stringify(events)).not.toMatch(/905000000000|private-project|attacker/);
  });

  it("filters unrecognized metadata and associates permitted events with a content group", () => {
    allow(); history.replaceState({},"","/araclar/stl-onizleyici");
    analytics.initializeAnalytics(brand,measurementId);
    analytics.trackGrowth(brand,"file_upload_success",{service:"private@customer.example",file_type:"secret-file.stl",contact_type:"905000000000"});
    const event=commands().find(command=>command[0]==="event")!;
    expect(event[2]).toMatchObject({content_group:"tool"});
    expect(event[2]).not.toHaveProperty("service");
    expect(event[2]).not.toHaveProperty("file_type");
    expect(event[2]).not.toHaveProperty("contact_type");
    expect(analytics.contentGroup("/rehber/stl-dosya-hazirlama")).toBe("guide");
    expect(analytics.contentGroup("/bolgeler/istanbul/atasehir")).toBe("location");
  });

  it("does not record new success or contact events without consent", () => {
    analytics.trackQuoteSaved(brand,"3D Baskı");
    analytics.trackGrowth(brand,"file_upload_success",{file_type:"stl"});
    analytics.trackContactClick(brand,"tel:+905000000000",location.origin);
    expect(commands().filter(command=>command[0]==="event")).toHaveLength(0);
  });
});
