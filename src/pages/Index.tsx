import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Box,
  ScanLine,
  PenTool,
  Upload,
  Plus,
} from "lucide-react";
import { useBrand } from "@/brands/config";
import { useContent } from "@/content/useContent";
import { Seo } from "@/components/site/Seo";
import heroEngine from "@/assets/hero-engine-part.jpg";
const services = [
  [
    "3d-baski",
    "3D Baskı",
    "Dijitalden fiziksele.",
    "Modelinizden prototip, aparat ve ihtiyaca özel parça üretimi.",
    Box,
  ],
  [
    "3d-tarama",
    "3D Tarama",
    "Parçadan dijital modele.",
    "Mevcut parçanın geometrisini dijital ortama aktarmak için.",
    ScanLine,
  ],
  [
    "3d-modelleme",
    "3D Modelleme",
    "Fikirden üretilebilir tasarıma.",
    "Eskiz, ölçü veya numuneden başlayarak 3D model geliştirme.",
    PenTool,
  ],
] as const;
export default function Index() {
  const b = useBrand();
  const { search } = useLocation();
  const q = import.meta.env.DEV ? search : "";
  const link = (s: string) => s + q;
  const { data: pages = [] } = useContent();
  const img =
    b.image ||
    (b.slug === "3dyanimda"
      ? heroEngine
      : `/brand/industrial/${b.heroAsset}.webp`);
  return (
    <>
      <Seo
        title="3D Baskı, 3D Tarama ve 3D Modelleme"
        description={b.description}
        image={img}
      />
      <section className="new-hero wrap">
        <div className="hero-topline">
          <span>
            <i /> İSTANBUL’DA 3D ÜRETİM
          </span>
          <span>TASARIMDAN ÜRETİME / {b.focus}</span>
        </div>
        <div className="hero-layout">
          <div className="hero-content">
            <h1>{b.title}</h1>
            <p>{b.lead}</p>
            <div className="hero-actions">
              <Link className="brand-button" to={link("/teklif-al")}>
                Hemen teklif al <ArrowUpRight size={19} />
              </Link>
              <Link className="text-link" to={link("/hizmetler")}>
                Hizmetleri keşfet <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="small-symbol">↗</span>
              <span>
                3D dosyanız hazır mı?
                <br />
                <strong>Studio’da açın, seçenekleri inceleyin.</strong>
              </span>
            </div>
          </div>
          <figure className="hero-product">
            <img
              src={img}
              alt={b.heroCaption + " temsili üretim görseli"}
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <div className="product-index">01 / {b.focus}</div>
            <figcaption>
              <div>
                <span>FİKİRDEN FİZİKSEL PARÇAYA</span>
                <strong>{b.heroCaption}</strong>
              </div>
              <span className="product-plus">
                <Plus />
              </span>
            </figcaption>
            <span className="concept-label">Temsili uygulama</span>
          </figure>
        </div>
        <div className="service-strip">
          {services.map(([s, n, tag, , Icon], i) => (
            <Link key={s} to={link("/" + s)}>
              <span className="strip-num">0{i + 1}</span>
              <Icon size={23} strokeWidth={1.5} />
              <div>
                <strong>{n}</strong>
                <span>{tag}</span>
              </div>
              <ArrowUpRight size={19} />
            </Link>
          ))}
        </div>
      </section>
      <section className="wrap home-services">
        <div className="section-heading">
          <p className="brand-eyebrow">NEYE İHTİYACINIZ VAR?</p>
          <span>Üç hizmet. Birbirini tamamlayan bir süreç.</span>
        </div>
        <div className="split-heading">
          <h2>
            Elinizde bir fikir de olabilir,
            <br />
            yenilenmesi gereken bir parça da.
          </h2>
          <p>
            Dosyanız hazırsa üretimi değerlendirelim. Elinizde numune varsa
            tarama ve modellemeyle başlayalım.
          </p>
        </div>
        <div className="editorial-grid">
          {services.map(([s, n, , desc], i) => (
            <Link className="service-card" to={link("/" + s)} key={s}>
              <div className="service-card-image">
                <img
                  src={
                    [
                      "/cms/service-printing.jpg",
                      "/cms/service-scanning.jpg",
                      "/cms/service-modeling.jpg",
                    ][i]
                  }
                  alt={n + " temsili uygulaması"}
                  loading="lazy"
                />
                <span>0{i + 1}</span>
              </div>
              <div className="service-card-copy">
                <h3>
                  {n}
                  <ArrowUpRight size={22} />
                </h3>
                <p>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="studio-band">
        <div className="wrap studio-band-grid">
          <div>
            <p className="brand-eyebrow">3D STUDIO / ONLINE TEKLİF</p>
            <h2>
              Dosyanızı yükleyin.
              <br />
              Parçanızı birlikte planlayalım.
            </h2>
            <p>
              STL modelinizi döndürün, boyutlarını görün; malzeme, renk, kalite
              ve adet seçeneklerini belirleyin. Tarama veya modelleme
              ihtiyacınızı da aynı yerden iletin.
            </p>
            <Link className="brand-button white" to={link("/teklif-al")}>
              3D Studio’yu aç <ArrowUpRight size={19} />
            </Link>
          </div>
          <Link className="studio-preview" to={link("/teklif-al")}>
            <div>
              <span>STUDIO</span>
              <span>STL / OBJ / STEP / 3MF</span>
            </div>
            <Box size={110} strokeWidth={0.6} />
            <strong>Bir sonraki parçanız burada başlıyor.</strong>
            <span className="upload-action">
              <Upload size={18} /> Modelinizi yükleyin
            </span>
          </Link>
        </div>
      </section>
      <section className="wrap applications-section">
        <div className="section-heading">
          <p className="brand-eyebrow">{b.focus}</p>
          <Link className="text-link" to={link("/cozumler")}>
            Tüm çözümler <ArrowRight size={17} />
          </Link>
        </div>
        <div className="split-heading">
          <h2>{b.featureTitle}</h2>
          <p>{b.featureLead}</p>
        </div>
        <div className="application-list">
          {pages
            .filter((p) => p.kind === "solution")
            .map((p, i) => (
              <Link key={p.path} to={link(p.path)}>
                <span>0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                <ArrowUpRight size={23} />
              </Link>
            ))}
        </div>
      </section>
      <section className="process-light">
        <div className="wrap">
          <p className="brand-eyebrow">NASIL ÇALIŞIYORUZ?</p>
          <h2>
            İlk fikirden teslimata,
            <br />
            her adım belli.
          </h2>
          <div className="process-four">
            {[
              [
                "İhtiyacınızı paylaşın",
                "Dosya, numune veya fotoğrafla başlayın. Kullanım alanını ve adedi belirtin.",
              ],
              [
                "Teklifi netleştirelim",
                "Modelleme, malzeme, üretim ve teslimat kapsamını birlikte belirleyelim.",
              ],
              [
                "Numuneyi değerlendirin",
                "Gereken projelerde ilk parçayı görün; formu ve montajı kontrol edin.",
              ],
              [
                "Üretime geçelim",
                "Onaylanan revizyon üzerinden üretim ve teslimat planını yürütelim.",
              ],
            ].map(([t, d], i) => (
              <article key={t}>
                <span>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap knowledge-section">
        <div className="section-heading">
          <p className="brand-eyebrow">BİLGİ MERKEZİ</p>
          <Link className="text-link" to={link("/rehber")}>
            Tüm rehberler <ArrowRight size={16} />
          </Link>
        </div>
        <div className="editorial-grid">
          {pages
            .filter((p) => p.kind === "guide")
            .slice(0, 3)
            .map((p) => (
              <Link className="editorial-card" to={link(p.path)} key={p.path}>
                <span className="brand-eyebrow">ÜRETİM REHBERİ</span>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                <ArrowUpRight size={20} />
              </Link>
            ))}
        </div>
      </section>
      <section className="local-band wrap">
        <div>
          <p className="brand-eyebrow">ÖRNEK MAHALLESİ / ATAŞEHİR</p>
          <h2>İstanbul’da, işinizin yanında.</h2>
          <p>
            3D baskı, tarama ve modelleme ihtiyacınızı paylaşın. Projenize uygun
            başlangıç adımını birlikte belirleyelim.
          </p>
        </div>
        <Link className="brand-button" to={link("/bolgeler")}>
          Hizmet bölgelerimiz <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}
