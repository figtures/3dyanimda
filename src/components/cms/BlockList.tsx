import type { PageBlock } from "@/lib/cms/blocks";
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

// Renders a list of blocks. Used by PageRenderer and by nested renderers
// (e.g. PresetSectionBlock when a cms-presets collection item supplies its own blocks).
export function BlockList({
  blocks,
  ctx,
}: {
  blocks: PageBlock[] | any[];
  ctx?: TokenContext;
}) {
  const visible = (blocks || []).filter((b: any) => b?.is_visible !== false).sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
  );
  const resolve = (data: any) => (ctx ? interpolateDeep(data, ctx) : data);

  return (
    <>
      {visible.map((b: any, idx: number) => {
        const key = b.id || `b-${idx}`;
        const d: any = resolve(b.data);
        switch (b.type) {
          case "hero":          return <HeroBlock key={key} data={d} />;
          case "service_body":  return <ServiceBodyBlock key={key} data={d} />;
          case "richtext":      return <RichTextBlock key={key} data={d} />;
          case "faq":           return <FaqBlock key={key} data={d} />;
          case "cta":           return <CtaBlock key={key} />;
          case "feature_grid":  return <FeatureGridBlock key={key} data={d} />;
          case "card_grid":     return <CardGridBlock key={key} data={d} />;
          case "stats":         return <StatsBlock key={key} data={d} />;
          case "process_steps": return <ProcessStepsBlock key={key} data={d} />;
          case "bullet_list":   return <BulletListBlock key={key} data={d} />;
          case "preset_section":return <PresetSectionBlock key={key} data={d} />;
          case "gallery":       return <GalleryBlock key={key} data={d} />;
          default: return null;
        }
      })}
    </>
  );
}