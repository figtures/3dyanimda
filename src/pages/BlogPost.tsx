import {usePublicPage} from "@/content/public-page-query";
import { safeHtml } from "@/lib/safe-html";
import "@/lib/i18n";
import { getTenantIdentity } from "@/lib/tenant";
import { useParams, Link } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { articleSchema, breadcrumbSchema, contentDate } from "@/lib/seo-schema";
import { ArrowUpRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "@/lib/media";
import NotFound from './NotFound';

type DbPost = {
  slug: string; title: string; excerpt: string | null;
  content: string; cover_image_url: string | null;
  tags: string[] | null; published_at: string | null;
  updated_at?: string | null;
  title_en?: string | null; excerpt_en?: string | null; content_en?: string | null;
};

const DbBlogPostView = ({ post }: { post: DbPost }) => {
  const { i18n } = useTranslation();
  // Keep title, description, body and schema in one language when a translation is incomplete.
  const isEn = !!(i18n.language?.startsWith("en") && post.title_en?.trim() && post.content_en?.trim() && (!post.excerpt?.trim() || post.excerpt_en?.trim()));
  const title = isEn && post.title_en ? post.title_en : post.title;
  const excerpt = isEn && post.excerpt_en ? post.excerpt_en : (post.excerpt ?? "");
  const content = isEn && post.content_en ? post.content_en : post.content;
  const path = `/blog/${post.slug}`;
  const url = `${getTenantIdentity().origin}${path}`;
  const published = contentDate(post.published_at);
  const modified = contentDate(post.updated_at);
  const image = post.cover_image_url ? resolveMediaUrl(post.cover_image_url) : undefined;
  const date = published ? new Date(published).toLocaleDateString(isEn ? "en-US" : "tr-TR", {timeZone:'Europe/Istanbul'}) : "";
  return (
    <>
      <Seo
        language={isEn ? 'en' : 'tr'}
        title={title}
        description={excerpt || title}
        path={path}
        type="article"
        image={image}
        imageAlt={title}
        published={published}
        modified={modified}
        keywords={(post.tags ?? []).join(", ")}
        jsonLd={[
          articleSchema({
            language: isEn ? 'en-US' : 'tr-TR',
            title,
            description: excerpt || title,
            url,
            image,
            datePublished: published,
            dateModified: modified,
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
            {published && <time dateTime={published}>{date}</time>}
            {modified && modified !== published && <span>Güncelleme: <time data-content-modified dateTime={modified}>{new Date(modified).toLocaleDateString(isEn ? 'en-US' : 'tr-TR', {timeZone:'Europe/Istanbul'})}</time></span>}
            {post.tags && post.tags.length > 0 && (
              <><span>·</span><span className="inline-flex items-center gap-1.5"><Tag className="h-3 w-3" /> {post.tags.join(" · ")}</span></>
            )}
          </div>
          {post.cover_image_url && (
            <img src={resolveMediaUrl(post.cover_image_url)} alt={title} className="w-full max-h-[480px] object-cover rounded-xl mb-10" />
          )}
          <Prose>
            <div dangerouslySetInnerHTML={{ __html: safeHtml(content) }} />
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
  const {data,isError}=usePublicPage(`/blog/${slug}`);
  const dbPost=data as DbPost|null|undefined;

  if (isError) return <><Seo title="İçerik yüklenemedi" description="İçerik geçici olarak yüklenemedi. Lütfen yeniden deneyin." path={`/blog/${slug}`} noindex /><div className="container-page py-24" role="alert">İçerik şu anda yüklenemiyor. Lütfen yeniden deneyin.</div></>;
  if (dbPost === undefined) return <div className="min-h-screen" aria-hidden />;
  if (dbPost === null) return <NotFound />;
  return <DbBlogPostView post={dbPost} />;
};

export default BlogPost;
