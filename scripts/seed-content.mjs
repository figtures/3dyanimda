import { readFileSync, writeFileSync } from "node:fs";
const pages = JSON.parse(readFileSync("src/content/pages.json", "utf8"));
const literal = (v) => `'${String(v).replaceAll("'", "''")}'`;
let sql =
  "-- Content defaults, never overwrite administrator edits. Geographic records intentionally start as drafts.\n";
for (const { brand, ...p } of pages) {
  const keys = Object.keys(p);
  const vals = keys.map((k) =>
    p[k] === null
      ? "NULL"
      : typeof p[k] === "object"
        ? literal(JSON.stringify(p[k])) + "::jsonb"
        : literal(p[k]),
  );
  sql += `INSERT INTO public.landing_pages(tenant_id,${keys.join(",")}) SELECT id,${vals.join(",")} FROM public.tenants WHERE slug=${literal(brand)} ON CONFLICT(tenant_id,path) DO NOTHING;\n`;
}
const baseline = JSON.parse(
  readFileSync("scripts/fixtures/brand-catalog-corporate.json", "utf8"),
);
const brands = JSON.parse(readFileSync("src/brands/catalog.json", "utf8"));
const old = readFileSync(
  "supabase/migrations/20261001100000_corporate_brand_content.sql",
  "utf8",
);
for (const b of brands) {
  const oldLine = old
    .split("\n")
    .find(
      (l) =>
        l.includes(`t.slug='${b.slug}'`) && l.includes("s.key='hero_content'"),
    );
  const previous = oldLine?.match(/SET value='((?:''|[^'])*)'::jsonb/)?.[1];
  if (!previous) throw new Error("Missing baseline");
  const prev = baseline.find((p) => p.slug === b.slug);
  sql += `UPDATE public.seo_meta s SET title_tr=${literal("3D Baskı, 3D Tarama ve 3D Modelleme | " + b.name)},description_tr=${literal(b.description)} FROM public.tenants t WHERE s.tenant_id=t.id AND t.slug=${literal(b.slug)} AND s.path='/' AND s.title_tr=${literal(prev.focus + " | " + prev.name)} AND s.description_tr=${literal(prev.description)};\n`;
  const hero = {
    eyebrow_tr: b.eyebrow,
    title_tr: b.title,
    lead_tr: b.lead,
    cta_primary_tr: "Hemen teklif al",
    cta_secondary_tr: "Hizmetleri keşfet",
  };
  sql += `UPDATE public.site_settings s SET value=${literal(JSON.stringify(hero))}::jsonb FROM public.tenants t WHERE s.tenant_id=t.id AND t.slug=${literal(b.slug)} AND s.key='hero_content' AND s.value='${previous}'::jsonb;\n`;
}
writeFileSync("supabase/migrations/20261002121000_content_seed.sql", sql);
console.log(
  `${pages.length} content records seeded without publishing geographic placeholders.`,
);
