import { previewSearch } from "@/lib/tenant";
import "@/engineering/engineering.css";
import "@/themes/home-flow.css";
import HomeDiscovery from "@/components/brand/HomeDiscovery";
import ModelShowcase from "@/themes/ModelShowcase";
import HomeHero, { services as heroServices } from "@/themes/HomeHero";
import { useState } from "react";
import ServiceVisual from "@/themes/ServiceVisual";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Box,
  ScanLine,
  PenTool,
  Upload,
  Plus,
  CheckCheck,
  Send,
  PackageCheck,
  Settings2,
} from "lucide-react";
import { useBrand } from "@/brands/config";
import { useContent } from "@/content/useContent";
import { Seo } from "@/components/site/Seo";
const serviceIntroductions: Record<string, string[]> = {
  "3dyanimda": ["Ürün ekibinizin sıradaki kararını fiziksel numuneyle netleştirin.", "Elinizdeki objenin formunu yeni ürün geliştirmede referans alın.", "Kullanım senaryonuzu ölçü ve geometriyle somutlaştırın."],
  "3dsanayi": ["Montaj istasyonunuz için işe özel yardımcı ekipman geliştirin.", "Çizimi bulunmayan geometrileri mühendislik değerlendirmesine taşıyın.", "Sabit referansları ve ayarlanabilir bölgeleri birlikte planlayın."],
  "maketyanimda": ["Mimari kararlarınızı dokunulabilir ölçekte sunun.", "Özgün yüzey detaylarını maket çalışmasına aktarın.", "Kütle, cephe ve kurulum ilişkisini ölçeğe uyarlayın."],
  "parcayanimda": ["Eksik bileşeniniz için yeni üretim seçeneğini değerlendirin.", "Sağlam yüzeylerden yola çıkarak parça referansı oluşturun.", "Bağlantı noktanıza uyan yeni bir geometri tasarlayın."],
};
const searchTitles: Record<string,string> = {
  '3dyanimda':'3D Baskı ve Ürün Prototipi | Tarama ve Modelleme',
  '3dsanayi':'Endüstriyel 3D Baskı, Aparat ve Fikstür Üretimi',
  'maketyanimda':'Mimari Maket ve Proje Sunumu için 3D Üretim',
  'parcayanimda':'Özel Plastik Parça, Adaptör ve 3D Baskı',
};
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
  const [activeService, setActiveService] = useState(0);
  const { search } = useLocation();
  const q = previewSearch(search);
  const link = (s: string) => s + q;
  const { data: pages = [] } = useContent(false,false,{kinds:['solution','guide','sector']});
  const img =
    b.image ||
    `/brand/industrial/${b.heroAsset}.webp`;
  return (
    <>
      <Seo
        title={b.slug === '3dyanimda' ? `${b.name} | ${b.business.address?.addressLocality ? b.business.address.addressLocality + '’de ' : ''}3D Baskı, Tarama ve Modelleme` : searchTitles[b.slug] || b.focus}
        description={b.description}
        image={img}
      />
      <div className="home-flow">
      <HomeHero />
      <section className="wrap home-services" id="hizmetler" aria-labelledby="services-title">
        <div className="section-heading">
          <p className="brand-eyebrow">NEYE İHTİYACINIZ VAR?</p>
          <span>Üç hizmet. Birbirini tamamlayan bir süreç.</span>
        </div>
        <div className="split-heading">
          <h2 id="services-title">
            Elinizde bir fikir de olabilir,
            <br />
            yenilenmesi gereken bir parça da.
          </h2>
          <p>
            Dosyanız hazırsa üretimi değerlendirelim. Elinizde numune varsa
            tarama ve modellemeyle başlayalım.
          </p>
        </div>
        <div className="service-explorer">
          <figure className="service-scene">
            {services.map(([slug, name], i) => (
              <picture key={slug} hidden={activeService !== i}>
                <source type="image/avif" srcSet={`/brand/optimized/service-${b.slug}-${["print", "scan", "model"][i]}-640.avif 640w, /brand/optimized/service-${b.slug}-${["print", "scan", "model"][i]}-1024.avif 1024w`} sizes="(max-width: 760px) 100vw, 55vw" />
                <img src={`/brand/services/${b.slug}-${["print", "scan", "model"][i]}.webp`} width="1024" height="683" loading="lazy" decoding="async" alt={`${name} — temsili uygulama`} />
              </picture>
            ))}
            <figcaption><span>{heroServices[activeService].label} · 0{activeService + 1} / 03</span><span>Temsili uygulama görseli</span></figcaption>
          </figure>
          <div className="service-decisions">
            {services.map(([slug, name, tagline, desc, Icon], i) => (
              <article className="service-decision" key={slug} data-active={activeService === i}>
                <h3>
                  <button type="button" id={`service-choice-${i}`} aria-expanded={activeService === i} aria-controls={`service-copy-${i}`} onClick={() => setActiveService(i)}>
                    <Icon size={25} strokeWidth={1.4} aria-hidden="true" /><span>{name}</span><Plus size={20} aria-hidden="true" />
                  </button>
                </h3>
                <div className="service-decision-copy" id={`service-copy-${i}`} role="region" aria-labelledby={`service-choice-${i}`} hidden={activeService !== i}>
                  <p className="service-tagline">{tagline}</p>
                  <p>{serviceIntroductions[b.slug]?.[i] || desc}</p>
                  <p>{heroServices[i].description}</p>
                  <details className="service-method"><summary>Hizmet akışı <Plus size={16} aria-hidden="true" /></summary><ServiceVisual service={i} /></details>
                  <Link className="text-link" to={link("/" + slug)}>{name} hizmetini incele <ArrowUpRight size={18} /></Link>
                </div>
              </article>
            ))}
            <p className="service-route-note">İhtiyacınıza göre tek bir hizmetle başlayabilir veya tasarımdan üretime tüm süreci birlikte planlayabilirsiniz.</p>
          </div>
        </div>
      </section>
      <ModelShowcase />
      <HomeDiscovery sectors={pages.filter(p=>p.kind==="sector")} />
      <section className="wrap applications-section" id="uygulamalar" aria-labelledby="applications-title">
        <div className="section-heading">
          <p className="brand-eyebrow">{b.focus}</p>
          <Link className="text-link" to={link("/cozumler")}>
            Tüm çözümler <ArrowRight size={17} />
          </Link>
        </div>
        <div className="split-heading">
          <h2 id="applications-title">{b.featureTitle}</h2>
          <p>{b.featureLead}</p>
        </div>
        <div className="applications-stage">
          <div className="applications-art" aria-hidden="true"><ServiceVisual service={2} /></div>
          <div className="application-list">
            {pages.filter((p) => p.kind === "solution").map((p, i) => (
              <details key={p.path} name="home-solutions" open={i === 0}>
                <summary><span>0{i + 1}</span><h3>{p.title}</h3><Plus size={20} aria-hidden="true" /></summary>
                <div className="application-copy"><p>{p.summary}</p><Link className="text-link" to={link(p.path)}>Çözümü incele <ArrowUpRight size={17} /></Link></div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="process-light" id="surec" aria-labelledby="process-title">
        <div className="wrap">
          <p className="brand-eyebrow">NASIL ÇALIŞIYORUZ?</p>
          <h2 id="process-title">
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
              <details key={t} name="home-process" open={i === 0}>
                <summary>
                  <span className="process-icon" aria-hidden="true">{[<Send size={28} />, <Settings2 size={28} />, <CheckCheck size={28} />, <PackageCheck size={28} />][i]}</span>
                  <span className="process-number">0{i + 1}</span>
                  <h3>{t}</h3><Plus size={18} aria-hidden="true" />
                </summary>
                <p>{d}</p>
              </details>
            ))}
          </div>
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
        <div className="wrap">      <aside className="engineering-teaser">
        <div>
          <p className="brand-eyebrow">ÜCRETSİZ MÜHENDİSLİK ARAÇLARI</p>
          <h2>Modelin içine bakın.</h2>
          <p>
            STL önizleme, hareketli kesit ve PLY tarama görüntüleme.
            Tarayıcınızda, dosyanız size özel.
          </p>
        </div>
        <Link className="brand-button" to={link("/araclar")}>
          3D Lab’ı aç <ArrowUpRight size={18} />
        </Link>
      </aside>
        </div>
      </section>
      <section className="wrap knowledge-section" id="bilgi-merkezi" aria-labelledby="knowledge-title">
        <div className="section-heading">
          <h2 id="knowledge-title" className="brand-eyebrow">BİLGİ MERKEZİ</h2>
          <Link className="text-link" to={link("/rehber")}>
            Tüm rehberler <ArrowRight size={16} />
          </Link>
        </div>
        <div className="editorial-grid">
          {pages
            .filter((p) => p.kind === "guide")
            .sort((a,c) => Number(!!c.editorial?.answer)-Number(!!a.editorial?.answer))
            .slice(0, 3)
            .map((p, i) => (
              <article className="editorial-card" key={p.path}>
                <span className="guide-number" aria-hidden="true">0{i + 1}</span>
                <span className="brand-eyebrow">ÜRETİM REHBERİ</span>
                <h3><Link to={link(p.path)}>{p.title} <ArrowUpRight size={20} /></Link></h3>
                <details><summary>Rehberin özeti <Plus size={16} aria-hidden="true" /></summary><p>{p.summary}</p></details>
              </article>
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
      </div>
    </>
  );
}
