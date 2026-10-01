import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Check,
  FileText,
  ScanLine,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";

export default function Index() {
  const brand = useBrand();
  const { search } = useLocation();
  const query = import.meta.env.DEV ? search : "";
  const [selected, setSelected] = useState(0);
  const [audience, setAudience] = useState(0);
  const hero = brand.settings.hero_content ?? {};
  const cta = brand.settings.cta_content ?? {};
  const services =
    Array.isArray(brand.settings.services_cards) &&
    brand.settings.services_cards.length
      ? brand.settings.services_cards.map((card, index) => ({
          title: card.title_tr,
          detail:
            card.desc_tr ||
            brand.applicationDetails[index] ||
            brand.featureLead,
        }))
      : brand.applications.map((title, index) => ({
          title,
          detail: brand.applicationDetails[index],
        }));
  const active = services[selected] || services[0];
  const quote = (application?: string) =>
    `/teklif-al${query}${application ? `${query ? "&" : "?"}application=${encodeURIComponent(application)}` : ""}`;
  const asset = brand.image || `/brand/industrial/${brand.heroAsset}.webp`;
  return (
    <>
      <Seo
        title={brand.focus}
        description={brand.description}
        path="/"
        geo={{ region: "TR-34", placename: "Örnek Mahallesi, İstanbul" }}
      />
      <section className="industrial-hero">
        <div className="hero-blueprint" aria-hidden />
        <div className="hero-copy">
          <p className="brand-eyebrow">
            <span className="status-dot" />
            {brand.eyebrow}
          </p>
          <h1>
            {brand.title.split("\n").map((line, index) => (
              <span
                key={line}
                className={
                  index === brand.title.split("\n").length - 1
                    ? "hero-title-accent"
                    : ""
                }
              >
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-lead">{brand.lead}</p>
          <div className="hero-actions">
            <Link className="brand-button accent" to={quote()}>
              {hero.cta_primary_tr || "Teknik teklif alın"}
              <ArrowUpRight size={19} />
            </Link>
            <a className="text-link light" href="#cozumler">
              {hero.cta_secondary_tr || "Çözümleri inceleyin"}
              <ArrowDown size={16} />
            </a>
          </div>
          <div className="hero-assurance">
            <span>
              <FileText size={14} /> CAD dosyası veya teknik ihtiyaç
            </span>
            <span>
              <Settings2 size={14} /> Projeye özel değerlendirme
            </span>
          </div>
        </div>
        <figure className="industrial-visual">
          <div className="visual-topline">
            <span>APPLICATION STUDY / 01</span>
            <span className="crosshair">+</span>
          </div>
          <img
            src={asset}
            alt={`${brand.heroCaption} — kavramsal üretim görseli`}
            fetchPriority="high"
            width={1536}
            height={1024}
          />
          <figcaption>
            <div>
              <span className="micro-label">UYGULAMA ODAĞI</span>
              <strong>{brand.heroCaption}</strong>
            </div>
            <span className="concept-tag">KONSEPT GÖRSEL</span>
          </figcaption>
          <div className="visual-dim" aria-hidden>
            <span />
            TASARIM → FİZİKSEL MODEL
            <span />
          </div>
        </figure>
        <div className="hero-bottom">
          <span>İSTANBUL / ÖRNEK MAHALLESİ</span>
          <div>
            <span>
              01 <b>Modelleme</b>
            </span>
            <span>
              02 <b>Prototipleme</b>
            </span>
            <span>
              03 <b>Küçük seri</b>
            </span>
          </div>
          <a href="#cozumler" aria-label="Üretim çözümlerine git">
            <ArrowDown size={17} />
          </a>
        </div>
      </section>
      <section className="audience-ribbon" aria-label="Çalışma alanları">
        <span>EKİBİNİZİN İHTİYACINA GÖRE</span>
        {brand.audiences.map((name) => (
          <span key={name}>
            {name}
            <span className="ribbon-dot" />
          </span>
        ))}
      </section>
      <section className="brand-section solutions" id="cozumler">
        <div className="section-heading">
          <p className="brand-eyebrow">01 / UYGULAMA ALANLARI</p>
          <span>Gereksinimden üretilebilir parçaya.</span>
        </div>
        <div className="focus-grid">
          <h2>{brand.featureTitle}</h2>
          <p className="section-lead">{brand.featureLead}</p>
        </div>
        <div className="solution-workbench">
          <div
            className="solution-selector"
            role="tablist"
            aria-label="Üretim uygulamaları"
            aria-orientation="vertical"
          >
            {services.map((service, index) => (
              <button
                key={service.title}
                role="tab"
                id={`solution-tab-${index}`}
                aria-controls="solution-panel"
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(e) => {
                  let next = index;
                  if (e.key === "ArrowDown")
                    next = (index + 1) % services.length;
                  else if (e.key === "ArrowUp")
                    next = (index - 1 + services.length) % services.length;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = services.length - 1;
                  else return;
                  e.preventDefault();
                  setSelected(next);
                  document.getElementById(`solution-tab-${next}`)?.focus();
                }}
              >
                <span>0{index + 1}</span>
                <strong>{service.title}</strong>
                <ArrowUpRight size={19} />
              </button>
            ))}
          </div>
          <div
            id="solution-panel"
            role="tabpanel"
            aria-labelledby={`solution-tab-${selected}`}
            className="solution-detail"
          >
            <span className="micro-label">İHTİYACA ÖZEL ÜRETİM</span>
            <h3>{active.title}</h3>
            <p>{active.detail}</p>
            <div className="solution-inputs">
              <span>
                <Check size={15} /> Teknik gereksinim değerlendirmesi
              </span>
              <span>
                <Check size={15} /> Malzeme ve geometri planlaması
              </span>
              <span>
                <Check size={15} /> Numune / üretim kapsamı
              </span>
            </div>
            <Link to={quote(active.title)} className="text-link">
              Bu uygulama için görüşelim <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <p className="section-footnote">
          Odağımız {brand.focus.toLocaleLowerCase("tr-TR")}. Diğer modelleme,
          maket, prototip ve özel parça taleplerinizi de değerlendirebiliriz.
        </p>
      </section>
      <section className="engineering-section">
        <div className="engineering-visual">
          <img
            src={`/brand/industrial/${brand.heroAsset}.webp`}
            alt={brand.heroCaption + " konsept detayı"}
            loading="lazy"
            width={1536}
            height={1024}
          />
          <span className="engineering-caption">
            DİJİTAL TASARIM / FİZİKSEL KARŞILIK
          </span>
        </div>
        <div className="engineering-copy">
          <p className="brand-eyebrow">02 / EKİBİNİZLE AYNI DİLDE</p>
          <h2>
            Doğru sorular.
            <br />
            Net bir proje kapsamı.
          </h2>
          <div className="audience-tabs" role="tablist" aria-label="Ekip odağı">
            {brand.audiences.map((item, index) => (
              <button
                role="tab"
                id={`audience-${index}`}
                aria-controls="audience-panel"
                aria-selected={audience === index}
                key={item}
                tabIndex={audience === index ? 0 : -1}
                onKeyDown={(e) => {
                  let next = index;
                  if (e.key === "ArrowRight")
                    next = (index + 1) % brand.audiences.length;
                  else if (e.key === "ArrowLeft")
                    next =
                      (index - 1 + brand.audiences.length) %
                      brand.audiences.length;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = brand.audiences.length - 1;
                  else return;
                  e.preventDefault();
                  setAudience(next);
                  document.getElementById(`audience-${next}`)?.focus();
                }}
                onClick={() => setAudience(index)}
              >
                {item}
              </button>
            ))}
          </div>
          <div
            id="audience-panel"
            role="tabpanel"
            aria-labelledby={`audience-${audience}`}
          >
            <p>{brand.audienceTexts[audience]}</p>
          </div>
          <Link
            className="text-link light"
            to={quote(brand.audiences[audience])}
          >
            Teknik ihtiyacınızı paylaşın <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="brand-section process-section" id="surec">
        <div className="section-heading">
          <p className="brand-eyebrow">03 / ÇALIŞMA MODELİ</p>
          <span>Her aşamada belirli bir sonraki adım.</span>
        </div>
        <div className="process-heading">
          <h2>
            Dosyadan teslimata,
            <br />
            tanımlı bir süreç.
          </h2>
          <p className="section-lead">
            Kullanım amacını anlamadan üretime geçmeyiz. Teknik kapsamı, numune
            ihtiyacını ve teslim beklentisini birlikte belirleriz.
          </p>
        </div>
        <ol className="process-track">
          {[
            [
              "Teknik değerlendirme",
              "CAD dosyası, örnek parça veya ölçü seti üzerinden gereksinimlerinizi ele alırız.",
              "GİRDİ / TEKNİK İHTİYAÇ",
            ],
            [
              "Üretim planı & teklif",
              "Malzeme, geometri, adet ve teslimat kapsamı proje özelinde netleştirilir.",
              "ÇIKTI / PROJE KAPSAMI",
            ],
            [
              "Numune & onay",
              "Gerekli projelerde numune ve montaj değerlendirmesi ile tasarım revizyonları ele alınır.",
              "KARAR / ÜRETİM ONAYI",
            ],
            [
              "Üretim & teslimat",
              "Mutabık kalınan kapsam üzerinden üretim ve teslimat planı yürütülür.",
              "SONUÇ / FİZİKSEL ÜRÜN",
            ],
          ].map(([title, desc, label], index) => (
            <li key={title}>
              <div className="process-number">
                0{index + 1}
                <ChevronRight size={17} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="micro-label">{label}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="brief-band">
        <div className="brief-icon">
          <ScanLine size={30} />
        </div>
        <div>
          <p className="brand-eyebrow">TEKNİK EKİPLER İÇİN</p>
          <h3>İyi bir teklif, eksiksiz bir teknik tarifle başlar.</h3>
          <p>
            Kullanım alanı, ölçüler, adet ve hedef takvim. Ekibinizle
            paylaşabileceğiniz kısa talep şablonu.
          </p>
        </div>
        <a
          href="/brand/teknik-talep-sablonu.txt"
          download
          className="brand-button"
        >
          Talep şablonunu indirin <FileText size={17} />
        </a>
      </section>
      <section className="brand-cta">
        <div>
          <p className="brand-eyebrow">
            {cta.eyebrow_tr || "PROJENİZİ KONUŞALIM"}
          </p>
          <h2>
            {cta.title_tr || "Bir sonraki parçanızı\nbirlikte geliştirelim."}
          </h2>
          <p>
            {cta.lead_tr ||
              "Teknik dosyanızı veya ihtiyacınızı paylaşın. Üretim yolunu ve proje kapsamını birlikte belirleyelim."}
          </p>
        </div>
        <Link className="brand-button accent" to={quote()}>
          Teknik teklif talebi <ArrowUpRight size={20} />
        </Link>
      </section>
    </>
  );
}
