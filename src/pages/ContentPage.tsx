import {contentStructuredData,contentParent} from "@/content/structured-content";
import { previewSearch } from "@/lib/tenant";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ArrowRight, ChevronRight } from "lucide-react";
import { useContentPage, useRelatedContent } from "@/content/useContent";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import RegionPlanner from "./RegionPlanner";
import NotFound from "./NotFound";
import { getTenantIdentity } from "@/lib/tenant";
import places from "@/content/places.json";
import {contentMetaTitle,contentMetaDescription} from '@/content/metadata';
import {sourceNote,contentModified} from '@/content/source-notes';
import {serviceImageSources} from '@/content/responsive-image';
import {contentPublished} from '@/content/publication-date';
import { LocalServiceAccess } from '@/components/brand/LocalServiceAccess';
export default function ContentPage() {
  const { pathname, search } = useLocation();
  const b = useBrand();
  const {data:p,isLoading,isError}=useContentPage(pathname.replace(/\/$/,''));
  const {data:related=[]}=useRelatedContent(p);
  const query = previewSearch(search);
  if (isLoading)
    return (
      <div className="brand-inner" role="status" data-content-loading>
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
  const [parent,parentLabel] = contentParent(p.kind);
  const base = getTenantIdentity().origin;
  const technicalNote=sourceNote(p.path);
  const modified=contentModified(p.updated_at,p.path);
  const published=contentPublished(p.editorial?.publishedAt);
  const media=p.editorial?.media;
  const displayDate=(value:string)=>new Date(value).toLocaleDateString("tr-TR", {year:"numeric",month:"long",day:"numeric",timeZone:"Europe/Istanbul"});
  const quoteParams = new URLSearchParams(query);
  quoteParams.set("application", p.title);
  if (p.kind === "service") quoteParams.set("service", p.path.slice(1));
  if (p.kind === "location") {
    if (p.service) quoteParams.set("service", p.service);
    const district = places.find((place) => place.slug === p.district)?.name;
    quoteParams.set("region", [p.neighborhood === "ornek" ? "Örnek Mahallesi" : "", district, "İstanbul"].filter(Boolean).join(", "));
  }
  const quoteUrl = "/teklif-al?" + quoteParams;
  return (
    <>
      <Seo
        title={contentMetaTitle(p)}
        description={contentMetaDescription(p.summary,b.name)}
        path={p.path}
        image={p.image || undefined}
        imageAlt={media?.alt}
        imageWidth={media?.width}
        imageHeight={media?.height}
        type={p.kind === "guide" ? "article" : "website"}
        published={p.kind === "guide" ? published : undefined}
        modified={modified}
        keywords={[p.title, b.focus, p.city, p.district, p.neighborhood].filter(Boolean).join(", ")}
        geo={p.city ? {region:"TR-34",placename:[p.neighborhood,p.district,p.city].filter(Boolean).join(", ")} : undefined}
        jsonLd={contentStructuredData(p,base)}
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
          {p.kind === "location" && <LocalServiceAccess profile={b.business} context={p.local_context} logistics={p.logistics} query={query} />}
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
              <picture>
              {serviceImageSources(p.image)&&<source type="image/avif" srcSet={serviceImageSources(p.image)} sizes="(max-width: 760px) calc(100vw - 40px), 680px"/>}
              <img
                src={p.image}
                alt={media?.alt || p.title + " temsili uygulama görseli"}
                width={media?.width || 1536}
                height={media?.height || 1024}
                loading="lazy"
                decoding="async"
              />
              </picture>
              <figcaption>{media?.caption || "Uygulama alanını anlatan temsili görsel."}</figcaption>
            </figure>
          )}
          {p.kind !== "location" && p.local_context && (
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
          {p.kind !== "location" && p.logistics && (
            <section>
              <h2>Numune ve teslimat planı</h2>
              <p>{p.logistics}</p>
            </section>
          )}
          {!!p.editorial?.resources?.length && <section id="araclar-ve-dosyalar">
            <h2>Bu konu için araçlar ve örnek dosyalar</h2>
            <ul>{p.editorial.resources.map(resource => <li key={resource.path}>
              <a href={resource.path} {...(/\.(csv|stl|obj|3mf|pdf|txt)$/.test(resource.path)?{download:true}:{})}>{resource.title}</a>
              {resource.description && <p>{resource.description}</p>}
            </li>)}</ul>
          </section>}
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
          {technicalNote && <section className="article-sources" data-source-note><h2>Teknik kaynak notu</h2><p>{technicalNote.text}</p><p>{technicalNote.scope}</p><ul>{technicalNote.sources.map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul></section>}
          {!!p.editorial?.sources?.length && <section className="article-sources"><h2>{p.kind === "location" ? "Bölge ve hizmet kaynakları" : "Teknik başvuru kaynakları"}</h2><p>Bağlantılar ilgili konu için genel başvuru kaynaklarıdır. İşletmeye özgü kapasite, teslimat süresi veya parça performansını belgelemez.</p><ul>{p.editorial.sources.filter(s=>!technicalNote || !s.url.includes('/category/material-guide_')).map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul></section>}
          {(published || modified) && <p className="content-byline">{b.name} bilgi merkezi{published && <> · İlk yayın: <time data-content-published dateTime={published}>{displayDate(published)}</time></>}{modified && <> · Güncelleme: <time data-content-modified dateTime={modified}>{displayDate(modified)}</time></>}</p>}
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
          {p.kind === "location" && <a href="#hizmet-ve-teslimat">Hizmete erişim ve teslimat</a>}
          {p.sections.map((s, i) => (
            <a key={i} href={"#bolum-" + i}>
              {s.title}
            </a>
          ))}
          {p.editorial?.comparison && <a href="#karsilastirma">Karşılaştırma</a>}
          {!!p.editorial?.resources?.length && <a href="#araclar-ve-dosyalar">Araçlar ve örnek dosyalar</a>}
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
