import { getTenantIdentity } from "./tenant";
export interface FaqEntry {
  q: string;
  a: string;
}
export interface CrumbEntry {
  label: string;
  url?: string;
}
export const orgSchema = () => {
  const { name, origin } = getTenantIdentity();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name,
    url: origin,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Örnek Mahallesi",
      addressRegion: "İstanbul",
      addressCountry: "TR",
    },
  };
};
export const istanbulSabSchema = (extras?: {
  areaSlug?: string;
  areaName?: string;
}) => {
  const { name, origin } = getTenantIdentity();
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${origin}/#localbusiness`,
    name,
    url: origin,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Örnek Mahallesi",
      addressRegion: "İstanbul",
      addressCountry: "TR",
    },
    areaServed: { "@type": "Place", name: extras?.areaName || "İstanbul" },
  };
};
export const serviceSchema = (opts: {
  serviceType: string;
  name: string;
  description: string;
  url: string;
  areaName?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: opts.serviceType,
  name: opts.name,
  description: opts.description,
  url: opts.url,
  provider: { "@id": `${getTenantIdentity().origin}/#organization` },
  areaServed: { "@type": "Place", name: opts.areaName || "İstanbul" },
});
export const faqSchema = (items: FaqEntry[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});
export const breadcrumbSchema = (crumbs: CrumbEntry[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.label,
    item: c.url ? new URL(c.url, getTenantIdentity().origin).href : undefined,
  })),
});
export const articleSchema = (opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: opts.title,
  description: opts.description,
  image: opts.image,
  datePublished: opts.datePublished,
  author: { "@id": `${getTenantIdentity().origin}/#organization` },
  publisher: { "@id": `${getTenantIdentity().origin}/#organization` },
  mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
});
