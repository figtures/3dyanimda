import { ReactNode, useEffect, useState } from "react";
import { Seo } from "./Seo";
import { PageHero } from "./PageHero";
import { supabase } from "@/lib/supabase";
import i18n from "@/lib/i18n";

interface Props {
  title: string;
  eyebrow: string;
  description: string;
  path: string;
  updatedAt: string;
  children: ReactNode;
}

export const LegalLayout = ({ title, eyebrow, description, path, updatedAt, children }: Props) => {
  const slug = path.replace(/^\//, "");
  const lang = i18n.language?.startsWith("en") ? "en" : "tr";
  const [override, setOverride] = useState<{ title: string; content: string; updatedAt: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("legal_documents").select("*").eq("slug", slug).maybeSingle();
      if (!mounted || !data) return;
      const t = (lang === "en" && data.title_en) ? data.title_en : data.title_tr;
      const c = (lang === "en" && data.content_en) ? data.content_en : data.content_tr;
      if (c && c.trim()) {
        setOverride({
          title: t || title,
          content: c,
          updatedAt: data.effective_date
            ? new Date(data.effective_date).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR")
            : updatedAt,
        });
      }
    })();
    return () => { mounted = false; };
  }, [slug, lang, title, updatedAt]);

  const finalTitle = override?.title || title;
  const finalUpdated = override?.updatedAt || updatedAt;

  return (
    <>
      <Seo title={finalTitle} description={description} path={path} noindex={false} />
      <PageHero
        eyebrow={eyebrow}
        title={finalTitle}
        lead={description}
        breadcrumbs={[
          { label: "Anasayfa", to: "/" },
          { label: "Yasal", to: "/yasal" },
          { label: finalTitle },
        ]}
      />
      <section className="bg-background py-16 lg:py-24">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-8">
              {lang === "en" ? "Last updated" : "Son güncelleme"}: {finalUpdated}
            </p>
            {override ? (
              <article className="legal-prose" dangerouslySetInnerHTML={{ __html: override.content }} />
            ) : (
              <article className="legal-prose">{children}</article>
            )}
          </div>
        </div>
      </section>
    </>
  );
};