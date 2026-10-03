// CMS block type definitions

export type BlockType =
  | "hero"
  | "service_body"
  | "richtext"
  | "faq"
  | "cta"
  | "feature_grid"
  | "card_grid"
  | "stats"
  | "process_steps"
  | "bullet_list"
  | "preset_section"
  | "gallery";

export type CtaLink = { label: string; to: string };
export type Breadcrumb = { label: string; to?: string };

export interface HeroData {
  eyebrow?: string;
  title_html?: string; // can include <span class="text-gradient-blue ..."> etc.
  lead?: string;
  breadcrumbs?: Breadcrumb[];
  cta_primary?: CtaLink;
  cta_secondary?: CtaLink;
}

export interface ServiceBodyData {
  body_html?: string;
  image_url?: string;
  image_alt?: string;
  highlights?: { k: string; v: string }[];
  aside_label?: string; // default "Özet"
}

export interface RichTextData {
  html?: string;
  container?: "narrow" | "wide";
}

export interface FaqBlockData {
  items?: { q: string; a: string }[];
  service_type?: string; // for Service JSON-LD
}

export interface CtaBlockData {
  // currently uses global <CTA /> component; future: title, lead, ctas
}

export interface FeatureGridData {
  items?: { title: string; description?: string; icon?: string }[];
  columns?: 2 | 3 | 4;
}

export interface CardGridData {
  eyebrow?: string;
  title_html?: string;
  lead?: string;
  columns?: 2 | 3 | 4;
  items?: {
    title: string;
    description?: string;
    icon?: string; // lucide icon name (e.g. "Car", "Factory")
    to?: string;
    primary?: boolean;
    badge?: string;
  }[];
}

export interface StatsData {
  eyebrow?: string;
  title_html?: string;
  footnote?: string;
  items?: { metric: string; label: string; note?: string }[];
  variant?: "default" | "cream";
}

export interface ProcessStepsData {
  eyebrow?: string;
  title_html?: string;
  items?: { phase: string; title: string; description?: string }[];
}

export interface BulletListData {
  eyebrow?: string;
  title_html?: string;
  columns?: 1 | 2 | 3;
  items?: string[];
  variant?: "check" | "dot";
}

export interface PresetSectionData {
  // Reference a `cms-presets` collection item by slug — fully panel-editable.
  preset_slug?: string;
  // Shared CMS-driven sections that read their own data from other admin
  // modules (e.g. Services cards, Homepage). Tenant-agnostic.
  preset?: "services_grid" | "process" | "capabilities";
}

export interface GalleryData {
  images?: { url: string; alt?: string; caption?: string }[];
}

export type BlockDataMap = {
  hero: HeroData;
  service_body: ServiceBodyData;
  richtext: RichTextData;
  faq: FaqBlockData;
  cta: CtaBlockData;
  feature_grid: FeatureGridData;
  card_grid: CardGridData;
  stats: StatsData;
  process_steps: ProcessStepsData;
  bullet_list: BulletListData;
  preset_section: PresetSectionData;
  gallery: GalleryData;
};

export interface PageBlock<T extends BlockType = BlockType> {
  id: string;
  page_id: string;
  position: number;
  type: T;
  data: BlockDataMap[T];
  is_visible: boolean;
}

export interface CmsPage {
  id: string;
  tenant_id: string;
  slug: string;
  template: string;
  status: "draft" | "published" | "archived";
  locale_default: string;
  title: string | null;
  meta: {
    title?: string;
    description?: string;
    og_image?: string;
    canonical?: string;
    no_index?: boolean;
    json_ld?: any;
    keywords?: string;
    geo?: { region?: string; placename?: string; position?: string };
  };
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero (başlık bölümü)",
  service_body: "Hizmet gövdesi (metin + görsel + özellikler)",
  richtext: "Zengin metin",
  faq: "Sıkça sorulan sorular",
  cta: "CTA (teklif çağrısı)",
  feature_grid: "Özellik grid'i",
  card_grid: "Kart grid'i (ikonlu link kartlar)",
  stats: "İstatistikler (metrik + etiket)",
  process_steps: "Süreç adımları (numaralı)",
  bullet_list: "Madde listesi",
  preset_section: "Hazır bölüm (Hizmetler / Süreç / Yetkinlikler)",
  gallery: "Galeri",
};

export function defaultBlockData(type: BlockType): any {
  switch (type) {
    case "hero":
      return { eyebrow: "", title_html: "Başlık", lead: "", breadcrumbs: [{ label: "Anasayfa", to: "/" }], cta_primary: { label: "Teklif al", to: "/teklif-al" } };
    case "service_body":
      return { body_html: "<p>İçerik...</p>", image_url: "", image_alt: "", highlights: [], aside_label: "Özet" };
    case "richtext":
      return { html: "<p>Metin...</p>", container: "narrow" };
    case "faq":
      return { items: [], service_type: "" };
    case "cta":
      return {};
    case "feature_grid":
      return { items: [], columns: 3 };
    case "card_grid":
      return { eyebrow: "", title_html: "", lead: "", columns: 3, items: [] };
    case "stats":
      return { eyebrow: "", title_html: "", items: [], variant: "cream" };
    case "process_steps":
      return { eyebrow: "", title_html: "", items: [] };
    case "bullet_list":
      return { eyebrow: "", title_html: "", columns: 2, items: [], variant: "check" };
    case "preset_section":
      return { preset: "services_grid" };
    case "gallery":
      return { images: [] };
  }
}