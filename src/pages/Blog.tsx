import {usePublicPage} from "@/content/public-page-query";
import "@/lib/i18n";
import { getTenantIdentity } from "@/lib/tenant";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import { breadcrumbSchema } from "@/lib/seo-schema";
import { useBrand } from "@/brands/config";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "@/lib/media";

type DbPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  title_en: string | null;
  excerpt_en: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

const Blog = () => {
  const brand = useBrand();
  const {data}=usePublicPage("/blog");
  const dbPosts=(data||[]) as DbPost[];
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");



  return (
    <>
      <Seo
        title="Blog — 3D Üretim, Oto Yedek Parça ve Mühendislik Yazıları"
        description="3D tarama, mühendislik modelleme, malzeme seçimi ve oto yedek parça 3D üretimi üzerine teknik ve uygulamalı yazılar."
        path="/blog"
        keywords="3d baskı blog, 3d yazıcı rehber, istanbul 3d baskı, oto yedek parça blog, malzeme seçimi"
        jsonLd={[
          breadcrumbSchema([
            { label: "Anasayfa", url: "/" },
            { label: "Blog", url: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${brand.name} Blog`,
            url: `${getTenantIdentity().origin}/blog`,
            blogPost: dbPosts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `${getTenantIdentity().origin}/blog/${p.slug}`,
              datePublished: p.published_at ?? "",
              description: p.excerpt ?? "",
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Blog"
        breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Blog" }]}
        title={
          <>
            Atölyeden{" "}
            <span className="text-gradient-blue italic font-medium">
              notlar
            </span>
            .
          </>
        }
        lead="3D üretim, oto yedek parça ve mühendislik üzerine yazdıklarımız. Pazarlama metni değil; gerçek atölye deneyimi."
      />
      <section className="py-20 lg:py-28 bg-background">
        <div className="container-page grid md:grid-cols-2 gap-6">
          {dbPosts.map((p) => {
            const title = isEn && p.title_en ? p.title_en : p.title;
            const excerpt = isEn && p.excerpt_en ? p.excerpt_en : p.excerpt;
            return (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group border border-border rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-deep hover:-translate-y-0.5 transition-all"
              >
                {p.cover_image_url && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={resolveMediaUrl(p.cover_image_url)}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString(
                          isEn ? "en-US" : "tr-TR",
                        )
                      : ""}
                  </p>
                  <h2 className="font-display text-2xl font-semibold tracking-tight mt-3 text-foreground group-hover:text-accent-blue transition-colors">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="text-foreground/70 mt-3 leading-relaxed">
                      {excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-5">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent-blue">
                      {isEn ? "Read" : "Yazıyı oku"}{" "}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Blog;
