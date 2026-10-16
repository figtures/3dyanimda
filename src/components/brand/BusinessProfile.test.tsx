import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import catalog from "@/brands/catalog.json";

const state = vi.hoisted(() => ({
  tenant: { id: "a", slug: "3dyanimda", name: "3D Yanımda", domain: "3dyanimda.com", custom_domain: null },
  settings: {} as Record<string, unknown>,
}));
vi.mock("@/contexts/TenantContext", () => ({ useTenant: () => ({ tenant: state.tenant }) }));
vi.mock("@/hooks/useSiteSettings", () => ({ useSiteSettings: () => state.settings }));
vi.mock("@/hooks/useSeoOverride", () => ({ useSeoOverride: () => null }));
vi.mock("@/hooks/useRedirects", () => ({ useRedirects: () => {} }));
vi.mock("@/contexts/FeatureContext", () => ({ useFeature: () => false }));
vi.mock("./BrandNavigation", () => ({ default: () => null }));
vi.mock("./GrowthAnalytics", () => ({ default: () => null }));
vi.mock("@/components/site/CookieConsent", () => ({ CookieConsent: () => null }));
import { BrandLayout } from "./BrandLayout";
import Contact from "@/pages/Contact";
import BrandAbout from "@/pages/BrandAbout";

const setup = (path: string, theme = "industrial") => render(
  <HelmetProvider><RouterProvider router={createMemoryRouter([{ element: <BrandLayout />, children: [
    { path: "/iletisim", element: <Contact /> }, { path: "/hakkimizda", element: <BrandAbout /> },
  ] }], { initialEntries: [`${path}?theme=${theme}`] })} /></HelmetProvider>,
);
const graph = () => JSON.parse(document.getElementById("site-structured-data")!.textContent!)["@graph"] as Record<string, any>[];

beforeEach(() => { state.settings = {}; vi.spyOn(window, "scrollTo").mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("public business identity", () => {
  for (const brand of catalog) for (const theme of ["industrial", "industrialtwo", "editorial", "studio"]) {
    it(`${brand.slug}/${theme}: shares this tenant's contact and profile links between page, footer and schema`, () => {
      state.tenant = { id: brand.slug, slug: brand.slug, name: brand.name, domain: `${brand.slug}.com`, custom_domain: null };
      const name = `${brand.name} Atölye`;
      const google = `https://www.google.com/maps?cid=${catalog.indexOf(brand) + 100}`;
      state.settings = { contact_info: {
        business_name: name, business_description: `${name} üretim yaklaşımı.`,
        email: `info@${brand.slug}.com`, phone: "+905364488230", phone_display: "+90 536 448 82 30",
        address_street: "Atölye Sokak 17", address_district: "Ataşehir", address_city: "İstanbul", address_country: "TR",
        google_business_url: google, instagram: `https://www.instagram.com/${brand.slug}`,
        visit_note: `${name} için randevu alın.`, delivery_note: "", onsite_note: "",
      } };
      const { container } = setup("/iletisim", theme);
      expect(container.querySelector(`[data-theme="${theme}"]`)).toBeInTheDocument();
      const main = within(screen.getByRole("main"));
      const footer = within(screen.getByRole("contentinfo"));
      for (const scope of [main, footer]) {
        expect(scope.getByRole("link", { name: "Google Haritalar" })).toHaveAttribute("href", google);
        expect(scope.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", `https://www.instagram.com/${brand.slug}`);
        expect(scope.getByRole("link", { name: `info@${brand.slug}.com` })).toHaveAttribute("href", `mailto:info@${brand.slug}.com`);
        expect(scope.getByRole("link", { name: "+90 536 448 82 30" })).toHaveAttribute("href", "tel:+905364488230");
        expect(scope.getByText("Atölye Sokak 17, Ataşehir, İstanbul, TR")).toBeInTheDocument();
      }
      const organization = graph().find(node => node["@type"] === "Organization")!;
      const local = graph().find(node => node["@type"] === "ProfessionalService")!;
      expect(organization.name).toBe(name);
      expect(organization.email).toBe(`info@${brand.slug}.com`);
      expect(organization.sameAs).toEqual([google, `https://www.instagram.com/${brand.slug}`]);
      expect(local.hasMap).toBe(google);
      expect(local.address.streetAddress).toBe("Atölye Sokak 17");
      expect(main.queryByText("Teslimat seçenekleri")).not.toBeInTheDocument();
    });
  }

  it("renders editable About text as text and uses the selected brand's image and heading", () => {
    state.settings = { contact_info: {
      about_title: "Atölyemiz ve ekibimiz", business_description: "Gerçek üretim süreçlerimiz.",
      about_text: "İlk paragraf.\n\n<script>window.invalid=true</script>",
      about_image_url: "/images/workshop.webp", about_image_alt: "Atölyede üretim ekibi",
    } };
    setup("/hakkimizda");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Atölyemiz ve ekibimiz");
    expect(screen.getByText("<script>window.invalid=true</script>")).toBeInTheDocument();
    expect(document.querySelector("main script")).toBeNull();
    expect(screen.getByAltText("Atölyede üretim ekibi")).toHaveAttribute("src", `https://${state.tenant.domain}/images/workshop.webp`);
  });

  it("hides explicitly cleared legacy identity on both public surfaces and omits unsafe map embeds", () => {
    state.settings = {
      verified_business_identity: { email: "old@example.com", telephone: "+905111111111", sameAs: ["https://instagram.com/old_brand"], address: { streetAddress: "Old address" } },
      contact_info: { email: "", phone: "", instagram: "", address_tr: "", map_url: "https://evil.example/embed", visit_note: "", delivery_note: "", onsite_note: "" },
    };
    const { container } = setup("/iletisim");
    expect(screen.queryByText("old@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Old address")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Instagram" })).not.toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    const organization = graph().find(node => node["@type"] === "Organization")!;
    expect(organization.email).toBeUndefined();
    expect(organization.telephone).toBeUndefined();
    expect(organization.sameAs).toBeUndefined();
  });
});
