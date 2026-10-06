import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useContent } from "@/content/useContent";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import places from "@/content/places.json";
import { hubCopy } from "@/content/hub-copy";
import { getTenantIdentity } from "@/lib/tenant";
const config: Record<string, [string, string, string]> = {
  "/sektorler": [
    "sector",
    "Sektörünüzün dilini konuşan üretim.",
    "Sanayi, mimari, otomotiv ve Ar-Ge için 3D baskı, tarama ve modelleme uygulamaları.",
  ],
  "/hizmetler": [
    "service",
    "3D üretimin üç temel adımı.",
    "3D baskı, 3D tarama ve 3D modelleme. Tek hizmetle başlayın veya tüm süreci birlikte planlayın.",
  ],
  "/cozumler": [
    "solution",
    "İşinize göre düşünülmüş çözümler.",
    "Kullanım amacından üretime uzanan uygulamalar.",
  ],
  "/malzemeler": [
    "material",
    "Doğru parça, doğru malzemeyle.",
    "Malzemeyi kullanım sıcaklığı, yük, yüzey ve montaj ihtiyacıyla birlikte değerlendirin.",
  ],
  "/rehber": [
    "guide",
    "Üretime başlamadan önce.",
    "Dosya hazırlığı, fiyatlandırma, numune ve revizyon için pratik bilgiler.",
  ],
  "/bolgeler": [
    "location",
    "İstanbul’dan projenize.",
    "İstanbul için 3D baskı, 3D tarama ve 3D modelleme proje talepleri. Numune ve teslimat planını ihtiyacınızla birlikte değerlendirelim.",
  ],
};
export default function ContentHub() {
  const { pathname, search } = useLocation();
  const b = useBrand();
  const [kind, defaultTitle, defaultLead] = config[pathname] || config["/hizmetler"];
  const [title,lead] = hubCopy(b.slug, kind, [defaultTitle,defaultLead]);
  const { data = [], isLoading, isError } = useContent();
  const query = import.meta.env.DEV ? search : "";
  const pages = data.filter((p) => p.kind === kind);
  return (
    <>
      <Seo title={title} description={lead} path={pathname} pageType="CollectionPage" noindex={isError || (!isLoading && !pages.length && kind !== "location")} jsonLd={{"@context":"https://schema.org","@type":"ItemList",name:title,itemListElement:pages.map((p,i)=>({"@type":"ListItem",position:i+1,name:p.title,url:getTenantIdentity().origin+p.path}))}} />
      <section className="content-hero wrap">
        <p className="brand-eyebrow">
          {b.name} /{" "}
          {kind === "location" ? "HİZMET BÖLGELERİ" : "BİLGİ & ÜRETİM"}
        </p>
        <h1>{title}</h1>
        <p className="section-lead">{lead}</p>
      </section>
      <section className="wrap hub-content">
        {isLoading && <p role="status">İçerikler yükleniyor…</p>}
        {isError && (
          <p role="alert">İçerikler yüklenemedi. Lütfen tekrar deneyin.</p>
        )}
        <div className="editorial-grid">
          {pages.map((p) => (
            <Link className="editorial-card" key={p.path} to={p.path + query}>
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title + " temsili görseli"}
                  loading="lazy"
                />
              )}
              <span className="brand-eyebrow">
                {kind === "service" ? "HİZMETLERİMİZ" : b.focus}
              </span>
              <h2>{p.title}</h2>
              <p>{p.summary}</p>
              <span className="text-link">
                İncele <ArrowUpRight size={17} />
              </span>
            </Link>
          ))}
        </div>
        {kind === "location" && (
          <>
            <div className="region-intro">
              <h2>İlçenizi ve ihtiyacınızı paylaşın.</h2>
              <p>
                İlçe seçimi proje ve teslimat planını hazırlamak içindir. Dosyanızı uzaktan inceleyebilir;
                fiziksel numune gereken projelerde teslim şeklini birlikte
                planlayabiliriz.
              </p>
            </div>
            <div className="district-directory">
              {places.map((p) => (
                <Link key={p.slug} to={pages.some(page=>page.path === "/bolgeler/istanbul/"+p.slug) ? "/bolgeler/istanbul/" + p.slug + query : "/teklif-al?" + new URLSearchParams({...Object.fromEntries(new URLSearchParams(query)),region:p.name})}>
                  {p.name}
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
            <p className="section-footnote">
              İlçenizi seçerek ilgili bilgiye veya bölgeniz doldurulmuş teklif formuna ulaşabilirsiniz. Üretim ve teslimat süresi projeye göre belirlenir.
            </p>
          </>
        )}
      </section>
    </>
  );
}
