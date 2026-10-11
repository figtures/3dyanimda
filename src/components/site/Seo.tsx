import { Helmet } from "react-helmet-async";
import { useLayoutEffect } from 'react';
import { useSeoOverride } from "@/hooks/useSeoOverride";
import { useTenant } from "@/contexts/TenantContext";
import { businessGraph, containsLegacyIdentity } from "@/lib/structured-data";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import catalog from "@/brands/catalog.json";
import { canonicalPath, indexRobots, pageGraph, pageNoindex } from "@/lib/search";
import { socialImage } from "@/lib/social-meta";
import { composeSchemaGraph } from "@/lib/schema-graph";
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
  const noIndex = pageNoindex({requested:noindex,override:override?.noindex,development:import.meta.env.DEV,domain,hostname:window.location.hostname});
  const share = socialImage(base, tenant?.slug, override?.og_image_url);
  const og = share.url;
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
  const structured = JSON.stringify(composeSchemaGraph([identity, pageGraph({ origin: base, path, title: fullTitle, description: desc, image: image || og, modified, type: pageType }), ...schemas],base,url)).replace(/</g,'\\u003c');
  // React 18 suspended renders can leave stale Helmet script registrations.
  // Commit one owned node in an effect, after React commits the current page.
  useLayoutEffect(()=>{
    const id='site-structured-data';
    const script=document.getElementById(id) || document.createElement('script');
    script.id=id;script.setAttribute('type','application/ld+json');script.textContent=structured;
    if(!script.isConnected)document.head.appendChild(script);
    return ()=>{if(script.textContent===structured)script.remove();};
  },[structured]);
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
      <meta property="og:image" content={og} />
      <meta property="og:image:alt" content={share.alt} />
      {share.width && <meta property="og:image:width" content={String(share.width)} />}
      {share.height && <meta property="og:image:height" content={String(share.height)} />}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={og} />
      <meta name="twitter:image:alt" content={share.alt} />
      {modified && type === "article" && <meta property="article:modified_time" content={modified} />}
      {(override?.keywords || keywords) && (
        <meta name="keywords" content={override?.keywords || keywords} />
      )}
      {geo?.region && <meta name="geo.region" content={geo.region} />}
      {geo?.placename && <meta name="geo.placename" content={geo.placename} />}
      {geo?.position && <meta name="geo.position" content={geo.position} />}
    </Helmet>
  );
};
// Kept for unmounted legacy page imports; Seo supplies the current brand's identity.
export const orgJsonLd = {};
export const localBusinessJsonLd = {};
