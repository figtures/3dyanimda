import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ArrowRight, ChevronRight } from "lucide-react";
import { useContent } from "@/content/useContent";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import RegionPlanner from "./RegionPlanner";
import NotFound from "./NotFound";
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
  if (!p) return import.meta.env.DEV ? <RegionPlanner key={pathname} /> : <NotFound />;
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
    .filter((v) => v.path !== p.path && (p.editorial?.relatedPaths?.includes(v.path) || v.kind === p.kind))
    .sort((a, c) => Number(p.editorial?.relatedPaths?.includes(c.path)) - Number(p.editorial?.relatedPaths?.includes(a.path)))
    .slice(0, 4);
  const quoteParams = new URLSearchParams(query);
  quoteParams.set("application", p.title);
  if (p.kind === "service") quoteParams.set("service", p.path.slice(1));
  const quoteUrl = "/teklif-al?" + quoteParams;
  return (
    <>
      <Seo
        title={p.title}
        description={`${b.name}: ${p.summary}`}
        path={p.path}
        image={p.image || undefined}
        type={p.kind === "guide" ? "article" : "website"}
        modified={p.updated_at}
        keywords={[p.title, b.focus, p.city, p.district, p.neighborhood].filter(Boolean).join(", ")}
        geo={p.city ? {region:"TR-34",placename:[p.neighborhood,p.district,p.city].filter(Boolean).join(", ")} : undefined}
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
          ...(p.kind === "guide" ? [{"@context":"https://schema.org","@type":"Article",headline:p.title,description:p.summary,mainEntityOfPage:base+p.path,author:{"@id":base+"/#organization"},publisher:{"@id":base+"/#organization"},...(p.updated_at?{dateModified:p.updated_at}:{}),...(p.image?{image:new URL(p.image,base).href}:{})}] : []),
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
        <Link className="brand-button" to={quoteUrl}>
          Projeniz için teklif alın <ArrowUpRight size={18} />
        </Link>
      </section>
      <div className="article-layout wrap">
        <article className="content-article">
          {p.editorial?.answer && (
            <section className="answer-card" aria-labelledby="quick-answer">
              <p className="brand-eyebrow">KISA YANIT</p>
              <h2 id="quick-answer">{p.title}</h2>
              <p>{p.editorial.answer}</p>
              {!!p.editorial.takeaways?.length && <ul>{p.editorial.takeaways.map(item => <li key={item}>{item}</li>)}</ul>}
            </section>
          )}
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
          {p.editorial?.comparison && (
            <section id="karsilastirma">
              <h2>{p.editorial.comparison.title}</h2>
              <div className="comparison-scroll" tabIndex={0} role="region" aria-label={p.editorial.comparison.title}>
                <table className="decision-table">
                  <caption className="sr-only">{p.editorial.comparison.title}</caption>
                  <thead><tr>{p.editorial.comparison.columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
                  <tbody>{p.editorial.comparison.rows.map((row,i) => <tr key={i}>{row.map((cell,j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </section>
          )}
          {p.logistics && (
            <section>
              <h2>Numune ve teslimat planı</h2>
              <p>{p.logistics}</p>
            </section>
          )}
          {!!p.faq.length && (
            <section id="sorular">
              <h2>Sık sorulan sorular</h2>
              {p.faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </section>
          )}
          {!!p.editorial?.sources?.length && <section className="article-sources"><h2>Teknik başvuru kaynakları</h2><ul>{p.editorial.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul></section>}
          {p.updated_at && <p className="content-byline">{b.name} bilgi merkezi · Güncelleme: <time dateTime={p.updated_at}>{new Date(p.updated_at).toLocaleDateString("tr-TR", {year:"numeric",month:"long",day:"numeric",timeZone:"Europe/Istanbul"})}</time></p>}
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
          <Link className="brand-button" to={quoteUrl}>
            3D Studio’yu aç <ArrowUpRight size={16} />
          </Link>
          <hr />
          <h3>Bu sayfada</h3>
          {p.sections.map((s, i) => (
            <a key={i} href={"#bolum-" + i}>
              {s.title}
            </a>
          ))}
          {p.editorial?.comparison && <a href="#karsilastirma">Karşılaştırma</a>}
          {!!p.faq.length && <a href="#sorular">Sorular ve yanıtlar</a>}
        </aside>
      </div>
      <section className="wrap content-next-step">
        <div><p className="brand-eyebrow">PROJENİZE UYGULAYALIM</p><h2>{p.kind === "guide" ? "Doğru üretim kararını birlikte verelim." : "Dosyanızı ve ihtiyacınızı paylaşın."}</h2><p>Bu sayfadaki konu teklif formuna aktarılır. Dosya, adet ve kullanım amacınızla değerlendirmeyi başlatın.</p></div>
        <Link className="brand-button dark" to={quoteUrl}>Projemi değerlendirin</Link>
      </section>
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
