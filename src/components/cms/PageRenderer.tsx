import { Seo } from "@/components/site/Seo";
import { faqJsonLd } from "@/components/site/FAQ";
import type { CmsPage, PageBlock } from "@/lib/cms/blocks";
import { interpolateDeep, type TokenContext } from "@/lib/cms/tokens";
import { HeroBlock } from "./blocks/HeroBlock";
import { ServiceBodyBlock } from "./blocks/ServiceBodyBlock";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { FaqBlock } from "./blocks/FaqBlock";
import { CtaBlock } from "./blocks/CtaBlock";
import { FeatureGridBlock } from "./blocks/FeatureGridBlock";
import { CardGridBlock } from "./blocks/CardGridBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { ProcessStepsBlock } from "./blocks/ProcessStepsBlock";
import { BulletListBlock } from "./blocks/BulletListBlock";
import { PresetSectionBlock } from "./blocks/PresetSectionBlock";

interface Props {
  page: CmsPage;
  blocks: PageBlock[];
  path: string;
  ctx?: TokenContext;
}

export function PageRenderer({ page, blocks, path, ctx }: Props) {
  const visible = blocks.filter((b) => b.is_visible).sort((a, b) => a.position - b.position);
  const ictx: TokenContext = ctx || {};
  const resolve = (data: any) => (ctx ? interpolateDeep(data, ictx) : data);

  const jsonLd: any[] = [];
  for (const b of visible) {
    if (b.type === "faq") {
      const items = (b.data as any).items || [];
      if (items.length) jsonLd.push(faqJsonLd(items));
      const st = (b.data as any).service_type;
      if (st) {
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: st,
          provider: { "@type": "Organization", name: "3D Yanında" },
          areaServed: "TR",
          description: page.meta?.description || "",
        });
      }
    }
  }
  if (page.meta?.json_ld) jsonLd.push(page.meta.json_ld);

  return (
    <>
      <Seo
        title={page.meta?.title || page.title || ""}
        description={page.meta?.description || ""}
        path={path}
        image={page.meta?.og_image}
        noindex={page.meta?.no_index}
        jsonLd={jsonLd.length ? jsonLd : undefined}
      />
      {visible.map((b) => {
        const d: any = resolve(b.data);
        switch (b.type) {
          case "hero":
            return <HeroBlock key={b.id} data={d} />;
          case "service_body":
            return <ServiceBodyBlock key={b.id} data={d} />;
          case "richtext":
            return <RichTextBlock key={b.id} data={d} />;
          case "faq":
            return <FaqBlock key={b.id} data={d} />;
          case "cta":
            return <CtaBlock key={b.id} />;
          case "feature_grid":
            return <FeatureGridBlock key={b.id} data={d} />;
          case "card_grid":
            return <CardGridBlock key={b.id} data={d} />;
          case "stats":
            return <StatsBlock key={b.id} data={d} />;
          case "process_steps":
            return <ProcessStepsBlock key={b.id} data={d} />;
          case "bullet_list":
            return <BulletListBlock key={b.id} data={d} />;
          case "preset_section":
            return <PresetSectionBlock key={b.id} data={d} />;
          case "gallery":
            return <GalleryBlock key={b.id} data={d} />;
          default:
            return null;
        }
      })}
    </>
  );
}