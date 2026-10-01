import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { FAQ, FAQItem, faqJsonLd } from "@/components/site/FAQ";
import { CTA } from "@/components/sections/CTA";
import { CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

export interface ServicePageProps {
  path: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: ReactNode;
  lead: string;
  image: string;
  imageAlt: string;
  highlights: { k: string; v: string }[];
  body: ReactNode;
  faq: FAQItem[];
  serviceType: string;
}

export const ServicePage = (p: ServicePageProps) => (
  <>
    <Seo
      title={p.metaTitle}
      description={p.metaDescription}
      path={p.path}
      jsonLd={[
        faqJsonLd(p.faq),
        {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: p.serviceType,
          provider: { "@type": "Organization", name: "3D Yanında", url: "https://3dyaninda.com" },
          areaServed: "TR",
          description: p.metaDescription,
        },
      ]}
    />
    <PageHero
      eyebrow={p.eyebrow}
      breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Hizmetler", to: "/hizmetler" }, { label: p.eyebrow }]}
      title={p.title}
      lead={p.lead}
      ctaPrimary={{ label: "Ücretsiz teklif al", to: "/teklif-al" }}
      ctaSecondary={{ label: "İletişime geç", to: "/iletisim" }}
    />

    <section className="py-20 lg:py-28 bg-background">
      <div className="container-page grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7"><Prose>{p.body}</Prose></div>
        <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
          <img src={p.image} alt={p.imageAlt} className="w-full h-auto rounded-2xl shadow-deep aspect-[4/3] object-cover ring-1 ring-border" />
          <div className="border border-border rounded-2xl p-6 bg-card shadow-soft">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue mb-3">Özet</p>
            <ul className="space-y-3">
              {p.highlights.map((h) => (
                <li key={h.k} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent-blue mt-0.5 shrink-0" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{h.k}</p>
                    <p className="text-foreground font-medium">{h.v}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>

    <FAQ items={p.faq} />
    <CTA />
  </>
);