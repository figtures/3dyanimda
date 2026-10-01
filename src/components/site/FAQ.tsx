import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface FAQItem { q: string; a: string }

export const FAQ = ({ items, title }: { items: FAQItem[]; title?: string }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);
  const resolvedTitle = title ?? t("faq.title", "Sık sorulan sorular");
  return (
    <section className="py-20 lg:py-28 bg-cream-gradient">
      <div className="container-page grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <p className="eyebrow">{t("faq.eyebrow", "FAQ")}</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-4 text-balance">{resolvedTitle}</h2>
          <p className="text-muted-foreground mt-4 max-w-sm">{t("faq.lead", "Aklınıza takılan başka bir şey varsa bize yazın — 24 saat içinde dönelim.")}</p>
        </div>
        <ul className="lg:col-span-8 divide-y divide-border border-y border-border">
          {items.map((it, i) => (
            <li key={i}>
              <button
                className="w-full flex items-start justify-between gap-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-display text-lg font-medium tracking-tight text-foreground">{it.q}</span>
                {open === i ? <Minus className="h-5 w-5 mt-1 shrink-0 text-accent-blue" /> : <Plus className="h-5 w-5 mt-1 shrink-0 text-accent-blue" />}
              </button>
              {open === i && <p className="pb-6 pr-10 text-foreground/75 leading-relaxed">{it.a}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const faqJsonLd = (items: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
});