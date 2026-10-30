import { getTenantIdentity } from "./tenant";
export interface FaqEntry {
  q: string;
  a: string;
}
export interface CrumbEntry {
  label: string;
  url?: string;
}
/** Use a real source date or omit it; rendering never invents publication history. */
export const contentDate = (value?: string | null): string | undefined => {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= Date.now() + 300_000 ? new Date(time).toISOString() : undefined;
};
export const orgSchema = () => {
  const { name, origin } = getTenantIdentity();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name,
    url: origin,
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
  language?: "tr-TR" | "en-US";
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: opts.title,
  description: opts.description,
  ...(opts.image ? {image: new URL(opts.image, getTenantIdentity().origin).href} : {}),
  ...(contentDate(opts.datePublished) ? {datePublished: contentDate(opts.datePublished)} : {}),
  ...(contentDate(opts.dateModified) ? {dateModified: contentDate(opts.dateModified)} : {}),
  inLanguage: opts.language || 'tr-TR',
  isAccessibleForFree: true,
  author: { "@id": `${getTenantIdentity().origin}/#organization` },
  publisher: { "@id": `${getTenantIdentity().origin}/#organization` },
  mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
});
