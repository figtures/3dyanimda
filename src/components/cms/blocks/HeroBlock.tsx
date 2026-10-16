import { safeHtml } from "@/lib/safe-html";
import { PageHero } from "@/components/site/PageHero";
import type { HeroData } from "@/lib/cms/blocks";

export function HeroBlock({ data }: { data: HeroData }) {
  return (
    <PageHero
      eyebrow={data.eyebrow || ""}
      breadcrumbs={data.breadcrumbs}
      title={<span dangerouslySetInnerHTML={{ __html: safeHtml(data.title_html || "") }} />}
      lead={data.lead}
      ctaPrimary={data.cta_primary?.label ? data.cta_primary : undefined}
      ctaSecondary={data.cta_secondary?.label ? data.cta_secondary : undefined}
    />
  );
}