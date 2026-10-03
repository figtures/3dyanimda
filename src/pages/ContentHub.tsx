import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useContent } from "@/content/useContent";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import places from "@/content/places.json";
const config: Record<string, [string, string, string]> = {
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
    "Örnek Mahallesi, Ataşehir merkezli 3D baskı, 3D tarama ve 3D modelleme. Numune ve teslimat planını talebinizle birlikte değerlendirelim.",
  ],
};
export default function ContentHub() {
  const { pathname, search } = useLocation();
  const b = useBrand();
  const [kind, title, lead] = config[pathname] || config["/hizmetler"];
  const { data = [], isLoading, isError } = useContent();
  const query = import.meta.env.DEV ? search : "";
  const pages = data.filter((p) => p.kind === kind);
  return (
    <>
      <Seo title={title} description={`${b.name}: ${lead}`} path={pathname} />
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
                Atölyemiz Örnek Mahallesi’ndedir. Listelenen ilçelerde ayrı bir
                şube bulunduğu anlamına gelmez. Dosyanızı uzaktan inceleyebilir;
                fiziksel numune gereken projelerde teslim şeklini birlikte
                planlayabiliriz.
              </p>
            </div>
            <div className="district-directory">
              {places.map((p) => (
                <Link
                  key={p.slug}
                  to={
                    "/teklif-al" +
                    (query ? query + "&" : "?") +
                    "region=" +
                    encodeURIComponent(p.name)
                  }
                >
                  {p.name}
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
            <p className="section-footnote">
              İlçe seçimi teklif talebine bölge bilgisi ekler. Üretim ve
              teslimat süresi projeye göre belirlenir.
            </p>
          </>
        )}
      </section>
    </>
  );
}
