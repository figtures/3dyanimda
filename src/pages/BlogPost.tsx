import { getTenantIdentity } from "@/lib/tenant";
import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { articleSchema, breadcrumbSchema, orgSchema } from "@/lib/seo-schema";
import { ArrowUpRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "@/lib/media";

type DbPost = {
  slug: string; title: string; excerpt: string | null;
  content: string; cover_image_url: string | null;
  tags: string[] | null; published_at: string | null;
  title_en?: string | null; excerpt_en?: string | null; content_en?: string | null;
};

const DbBlogPostView = ({ post }: { post: DbPost }) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const title = isEn && post.title_en ? post.title_en : post.title;
  const excerpt = isEn && post.excerpt_en ? post.excerpt_en : (post.excerpt ?? "");
  const content = isEn && post.content_en ? post.content_en : post.content;
  const path = `/blog/${post.slug}`;
  const url = `${getTenantIdentity().origin}${path}`;
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString(isEn ? "en-US" : "tr-TR") : "";
  return (
    <>
      <Seo
        title={title}
        description={excerpt || title}
        path={path}
        type="article"
        keywords={(post.tags ?? []).join(", ")}
        jsonLd={[
          orgSchema(),
          articleSchema({
            title,
            description: excerpt || title,
            url,
            datePublished: post.published_at ?? new Date().toISOString(),
          }),
          breadcrumbSchema([
            { label: "Anasayfa", url: "/" },
            { label: "Blog", url: "/blog" },
            { label: title, url: path },
          ]),
        ]}
      />
      <PageHero
        eyebrow={post.tags?.[0] ?? "Blog"}
        breadcrumbs={[
          { label: "Anasayfa", to: "/" },
          { label: "Blog", to: "/blog" },
          { label: title.length > 38 ? title.slice(0, 36) + "…" : title },
        ]}
        title={<>{title}</>}
        lead={excerpt}
      />
      <article className="py-16 lg:py-24 bg-background">
        <div className="container-page">
          <div className="flex items-center gap-4 mb-10 text-xs font-mono uppercase tracking-[0.2em] text-foreground/60">
            <span>{date}</span>
            {post.tags && post.tags.length > 0 && (
              <><span>·</span><span className="inline-flex items-center gap-1.5"><Tag className="h-3 w-3" /> {post.tags.join(" · ")}</span></>
            )}
          </div>
          {post.cover_image_url && (
            <img src={resolveMediaUrl(post.cover_image_url)} alt={title} className="w-full max-h-[480px] object-cover rounded-xl mb-10" />
          )}
          <Prose>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Prose>
          <div className="mt-16 max-w-3xl border border-border rounded-2xl p-8 bg-card shadow-soft">
            <h3 className="font-display text-2xl font-semibold tracking-tight">İstanbul'da 3D üretim mi gerekli?</h3>
            <p className="text-foreground/70 mt-2">Dosyanızı veya proje ihtiyacınızı paylaşın; fiyat ve teslim planını birlikte değerlendirelim.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link to="/teklif-al" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-accent-blue transition-colors">
                Teklif Al <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dbPost, setDbPost] = useState<DbPost | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    supabase.from("blog_posts")
      .select("slug, title, excerpt, content, title_en, excerpt_en, content_en, cover_image_url, tags, published_at")
      .eq("slug", slug).eq("published", true).maybeSingle()
      .then(({ data }) => setDbPost(data as DbPost | null));
  }, [slug]);

  if (dbPost === undefined) return <div className="min-h-screen" aria-hidden />;
  if (dbPost === null) return <Navigate to="/blog" replace />;
  return <DbBlogPostView post={dbPost} />;
};

export default BlogPost;
