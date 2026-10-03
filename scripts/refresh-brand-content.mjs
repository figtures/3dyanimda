import { readFileSync, writeFileSync } from "node:fs";
const brands = JSON.parse(
  readFileSync(new URL("./fixtures/brand-catalog-corporate.json", import.meta.url), "utf8"),
);
// The original seed is immutable: only untouched defaults are upgraded.
const seed = readFileSync(
  new URL(
    "../supabase/migrations/20261001091000_four_brands.sql",
    import.meta.url,
  ),
  "utf8",
);
const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
let sql =
  "-- Corporate content refresh. Preserve every administrator-edited setting.\n";
for (const b of brands) {
  const settings = {
    hero_content: {
      eyebrow_tr: b.eyebrow,
      title_tr: b.title,
      lead_tr: b.lead,
      cta_primary_tr: "Teknik teklif alın",
      cta_secondary_tr: "Çözümleri inceleyin",
    },
    autofocus_content: { title_tr: b.featureTitle, lead_tr: b.featureLead },
    services_cards: b.applications.map((title, index) => ({
      id: `s${index + 1}`,
      title_tr: title,
      desc_tr: b.applicationDetails[index],
      link: "/teklif-al",
    })),
    cta_content: {
      title_tr: "Bir sonraki parçanızı\nbirlikte geliştirelim.",
      lead_tr:
        "Teknik dosyanızı veya ihtiyacınızı paylaşın. Üretim yolunu ve proje kapsamını birlikte belirleyelim.",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    const line = seed
      .split("\n")
      .find(
        (line) =>
          line.startsWith("INSERT INTO public.site_settings") &&
          line.includes(`id,'${key}',`) &&
          line.includes(`slug='${b.slug}'`),
      );
    const previous = line?.match(/,'((?:''|[^'])*)'::jsonb/)?.[1];
    if (!previous) throw new Error(`Missing baseline for ${b.slug}/${key}`);
    sql += `UPDATE public.site_settings s SET value=${literal(JSON.stringify(value))}::jsonb FROM public.tenants t WHERE s.tenant_id=t.id AND t.slug=${literal(b.slug)} AND s.key=${literal(key)} AND s.value='${previous}'::jsonb;\n`;
  }
  const line = seed
    .split("\n")
    .find(
      (line) =>
        line.startsWith("INSERT INTO public.seo_meta") &&
        line.includes(`slug='${b.slug}'`),
    );
  const previous = line?.match(
    /SELECT id,'\/','((?:''|[^'])*)','((?:''|[^'])*)' FROM/,
  );
  if (!previous) throw new Error(`Missing SEO baseline for ${b.slug}`);
  sql += `UPDATE public.seo_meta s SET title_tr=${literal(b.focus + " | " + b.name)},description_tr=${literal(b.description)} FROM public.tenants t WHERE s.tenant_id=t.id AND t.slug=${literal(b.slug)} AND s.path='/' AND s.title_tr='${previous[1]}' AND s.description_tr='${previous[2]}';\n`;
}
writeFileSync(
  new URL(
    "../supabase/migrations/20261001100000_corporate_brand_content.sql",
    import.meta.url,
  ),
  sql,
);
