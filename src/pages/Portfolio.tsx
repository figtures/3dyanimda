import { useEffect, useState } from "react";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import autoImg from "@/assets/auto-parts-collection.jpg";
import scanImg from "@/assets/service-scanning.jpg";
import printImg from "@/assets/service-printing.jpg";
import modelImg from "@/assets/service-modeling.jpg";
import { resolveMediaUrl } from "@/lib/media";

const cases = [
  { img: autoImg, t: "1972 Mercedes W114 — Kapı Kol Kapağı", c: "Klasik araç restorasyonu", d: "Sağlam bir örnekten tarama, ASA malzeme + renk eşleştirme. 4 günde teslim." },
  { img: scanImg, t: "Endüstriyel Sensör Braketi", c: "Endüstri 4.0", d: "Üretim hattındaki kırılan PA braketin PA-CF eşdeğer olarak yeniden üretimi. 36 saatte teslim." },
  { img: printImg, t: "Yatırımcı Sunum Maketi", c: "Hızlı prototip", d: "Konsept ürünün SLA reçine + krom boya ile sunum kalitesinde prototipi. 48 saatte teslim." },
  { img: modelImg, t: "Tofaş Şahin Gösterge Çerçevesi", c: "Klasik araç restorasyonu", d: "Eksik parçanın fotoğraf + ölçü referansı ile modellenmesi ve siyah ABS baskısı." },
];

type DbProject = {
  id: string; slug: string;
  title_tr: string; title_en: string | null;
  excerpt_tr: string | null; excerpt_en: string | null;
  cover_image_url: string | null; industry: string | null;
};

const Portfolio = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [dbItems, setDbItems] = useState<DbProject[]>([]);

  useEffect(() => {
    const nowIso = new Date().toISOString();
    supabase.from("portfolio_projects" as any)
      .select("id, slug, title_tr, title_en, excerpt_tr, excerpt_en, cover_image_url, industry")
      .eq("published", true)
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setDbItems((data as any) ?? []));
  }, []);

  return (
  <>
    <Seo
      title="Portföy & Vaka Çalışmaları — 3D Üretim Projelerimiz"
      description="Klasik araç restorasyonundan endüstriyel parça üretimine, hızlı prototipten kişiye özel projelere — 3D Yanında'nın tamamladığı işlerden seçkiler."
      path="/portfoy"
    />
    <PageHero
      eyebrow="Portföy"
      breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Portföy" }]}
      title={<>Atölyemizden <span className="text-gradient-blue italic font-medium">çıkmış</span> işler.</>}
      lead="Müşterilerimizin izniyle paylaştığımız vaka çalışmaları. Her parçanın arkasında bir mühendislik kararı var."
    />
    <section className="py-20 lg:py-28 bg-background">
      <div className="container-page grid md:grid-cols-2 gap-6">
        {dbItems.map((p) => {
          const title = isEn && p.title_en ? p.title_en : p.title_tr;
          const excerpt = isEn && p.excerpt_en ? p.excerpt_en : p.excerpt_tr;
          return (
            <article key={p.id} className="group border border-border rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-deep transition-all">
              {p.cover_image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={resolveMediaUrl(p.cover_image_url)} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
              <div className="p-7">
                {p.industry && <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue">{p.industry}</p>}
                <h2 className="font-display text-2xl font-semibold tracking-tight mt-2">{title}</h2>
                {excerpt && <p className="text-foreground/70 mt-3 leading-relaxed">{excerpt}</p>}
              </div>
            </article>
          );
        })}
        {cases.map((c) => (
          <article key={c.t} className="group border border-border rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-deep transition-all">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={c.img} alt={c.t} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue">{c.c}</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight mt-2">{c.t}</h2>
              <p className="text-foreground/70 mt-3 leading-relaxed">{c.d}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  </>
  );
};

export default Portfolio;