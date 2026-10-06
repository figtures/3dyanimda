import { Helmet } from "react-helmet-async";
import { useSeoOverride } from "@/hooks/useSeoOverride";
import { useTenant } from "@/contexts/TenantContext";
import { businessGraph, containsLegacyIdentity } from "@/lib/structured-data";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import catalog from "@/brands/catalog.json";
import { canonicalPath, indexRobots, pageGraph } from "@/lib/search";
interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  geo?: { region?: string; placename?: string; position?: string };
  keywords?: string;
  modified?: string;
  pageType?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
}
export const Seo = ({
  title,
  description,
  path = "/",
  image,
  type = "website",
  jsonLd,
  noindex,
  geo,
  keywords,
  modified,
  pageType,
}: SeoProps) => {
  const { tenant } = useTenant();
  const override = useSeoOverride(path);
  const settings = useSiteSettings();
  const verified = settings.verified_business_identity || {};
  const name = tenant?.name || "3D üretim";
  const domain = tenant?.custom_domain || tenant?.domain;
  const base = domain ? `https://${domain}` : window.location.origin;
  const url = base + canonicalPath(path);
  const effectiveTitle = (override?.title || title).replace(
    /3D Yanında/g,
    name,
  );
  const fullTitle = effectiveTitle.includes(name)
    ? effectiveTitle
    : `${effectiveTitle} | ${name}`;
  const desc = override?.description || description;
  const noIndex = Boolean(
    noindex ||
      override?.noindex ||
      import.meta.env.DEV ||
      !domain ||
      window.location.hostname !== domain,
  );
  const og = override?.og_image_url || image;
  const brand = catalog.find((b) => b.slug === tenant?.slug);
  const identity = businessGraph({ name, origin: base, description: brand?.description,
    logo: verified.logo, email: verified.email, telephone: verified.telephone,
    sameAs: verified.sameAs, openingHoursSpecification: verified.openingHoursSpecification,
    address: verified.address,
    geo: verified.geo,
  });
  // Legacy schemas with source-company identity are excluded, not published under the new brand.
  const schemas = (
    jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  ).filter(
    (item) => !containsLegacyIdentity(item),
  );
  return (
    <Helmet>
      <html lang="tr" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={
          noIndex ? "noindex,follow" : indexRobots
        }
      />
      {import.meta.env.VITE_GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION} />}
      {import.meta.env.VITE_BING_SITE_VERIFICATION && <meta name="msvalidate.01" content={import.meta.env.VITE_BING_SITE_VERIFICATION} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="tr_TR" />
      {og && <meta property="og:image" content={new URL(og, base).href} />}
      <meta
        name="twitter:card"
        content={og ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {og && <meta name="twitter:image" content={new URL(og, base).href} />}
      {modified && type === "article" && <meta property="article:modified_time" content={modified} />}
      {(override?.keywords || keywords) && (
        <meta name="keywords" content={override?.keywords || keywords} />
      )}
      {geo?.region && <meta name="geo.region" content={geo.region} />}
      {geo?.placename && <meta name="geo.placename" content={geo.placename} />}
      {geo?.position && <meta name="geo.position" content={geo.position} />}
      {[identity, pageGraph({ origin: base, path, title: fullTitle, description: desc, image: og, modified, type: pageType }), ...schemas].map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item).replace(/</g, "\\u003c")}
        </script>
      ))}
    </Helmet>
  );
};
// Kept for unmounted legacy page imports; Seo supplies the current brand's identity.
export const orgJsonLd = {};
export const localBusinessJsonLd = {};
