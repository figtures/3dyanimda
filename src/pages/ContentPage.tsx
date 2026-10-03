import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ArrowRight, ChevronRight } from "lucide-react";
import { useContent } from "@/content/useContent";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import RegionPlanner from "./RegionPlanner";
import { getTenantIdentity } from "@/lib/tenant";
export default function ContentPage() {
  const { pathname, search } = useLocation();
  const b = useBrand();
  const { data: pages = [], isLoading, isError } = useContent();
  const p = pages.find((p) => p.path === pathname.replace(/\/$/, ""));
  const query = import.meta.env.DEV ? search : "";
  if (isLoading)
    return (
      <div className="brand-inner" role="status">
        İçerik yükleniyor…
      </div>
    );
  if (isError)
    return (
      <div className="brand-inner" role="alert">
        İçerik şu anda yüklenemiyor. Lütfen yeniden deneyin.
      </div>
    );
  if (!p) return <RegionPlanner key={pathname} />;
  const parent =
    p.kind === "service"
      ? "/hizmetler"
      : p.kind === "sector"
        ? "/sektorler"
        : p.kind === "solution"
          ? "/cozumler"
          : p.kind === "material"
            ? "/malzemeler"
            : p.kind === "location"
              ? "/bolgeler"
              : "/rehber";
  const parentLabel =
    p.kind === "service"
      ? "Hizmetler"
      : p.kind === "sector"
        ? "Sektörler"
        : p.kind === "solution"
          ? "Çözümler"
          : p.kind === "material"
            ? "Malzemeler"
            : p.kind === "location"
              ? "Hizmet bölgeleri"
              : "Bilgi merkezi";
  const base = getTenantIdentity().origin;
  const related = pages
    .filter((v) => v.path !== p.path && v.kind === p.kind)
    .slice(0, 3);
  return (
    <>
      <Seo
        title={p.title}
        description={`${b.name}: ${p.summary}`}
        path={p.path}
        image={p.image || undefined}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Anasayfa",
                item: base,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: parentLabel,
                item: base + parent,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: p.title,
                item: base + p.path,
              },
            ],
          },
          ...(p.kind === "service"
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "Service",
                  name: p.title,
                  description: p.summary,
                  provider: { "@id": base + "/#organization" },
                  url: base + p.path,
                },
              ]
            : []),
          ...(p.faq.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: p.faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
              ]
            : []),
        ]}
      />
      <section className="content-hero wrap">
        <nav className="breadcrumbs" aria-label="Sayfa yolu">
          <Link to={"/" + query}>Anasayfa</Link>
          <ChevronRight size={12} />
          <Link to={parent + query}>{parentLabel}</Link>
          <ChevronRight size={12} />
          <span>{p.title}</span>
        </nav>
        <p className="brand-eyebrow">
          {b.name} / {parentLabel}
        </p>
        <h1>{p.title}</h1>
        <p className="section-lead">{p.summary}</p>
        <Link className="brand-button" to={"/teklif-al" + query}>
          Projeniz için teklif alın <ArrowUpRight size={18} />
        </Link>
      </section>
      <div className="article-layout wrap">
        <article className="content-article">
          {p.image && (
            <figure>
              <img
                src={p.image}
                alt={p.title + " temsili uygulama görseli"}
                width="1000"
                height="660"
              />
              <figcaption>Uygulama alanını anlatan temsili görsel.</figcaption>
            </figure>
          )}
          {p.local_context && (
            <section>
              <h2>Bölgenizde nasıl çalışıyoruz?</h2>
              <p>{p.local_context}</p>
            </section>
          )}
          {p.sections.map((s, i) => (
            <section id={"bolum-" + i} key={i}>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </section>
          ))}
          {p.logistics && (
            <section>
              <h2>Numune ve teslimat planı</h2>
              <p>{p.logistics}</p>
            </section>
          )}
          {!!p.faq.length && (
            <section>
              <h2>Sık sorulan sorular</h2>
              {p.faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </section>
          )}
        </article>
        <aside className="article-aside">
          <p className="brand-eyebrow">PROJENİZE BAŞLAYALIM</p>
          <h2>
            Dosyanız varsa yükleyin.
            <br />
            Yoksa birlikte başlayalım.
          </h2>
          <p>
            3D baskı, tarama ve modelleme taleplerinizi aynı Studio üzerinden
            paylaşabilirsiniz.
          </p>
          <Link className="brand-button" to={"/teklif-al" + query}>
            3D Studio’yu aç <ArrowUpRight size={16} />
          </Link>
          <hr />
          <h3>Bu sayfada</h3>
          {p.sections.map((s, i) => (
            <a key={i} href={"#bolum-" + i}>
              {s.title}
            </a>
          ))}
        </aside>
      </div>
      <section className="wrap related-section">
        <p className="brand-eyebrow">KEŞFETMEYE DEVAM EDİN</p>
        <div className="editorial-grid">
          {related.map((r) => (
            <Link className="editorial-card" key={r.path} to={r.path + query}>
              <h3>{r.title}</h3>
              <p>{r.summary}</p>
              <ArrowRight size={20} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
