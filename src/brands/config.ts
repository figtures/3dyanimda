import catalog from "./catalog.json";
import { useTenant } from "@/contexts/TenantContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
export type Brand = (typeof catalog)[number];
export const brands: Brand[] = catalog;
export const findBrand = (slug?: string) => brands.find((b) => b.slug === slug);
export function useBrand() {
  const { tenant } = useTenant();
  const settings = useSiteSettings();
  const base = findBrand(tenant?.slug) ?? brands[0];
  const hero = settings.hero_content ?? {};
  const focus = settings.autofocus_content ?? {};
  return {
    ...base,
    name: tenant?.name || base.name,
    eyebrow: hero.eyebrow_tr || base.eyebrow,
    title: hero.title_tr || base.title,
    lead: hero.lead_tr || base.lead,
    image: hero.image_url as string | undefined,
    featureTitle: focus.title_tr || base.featureTitle,
    featureLead: focus.lead_tr || base.featureLead,
    settings,
  };
}
