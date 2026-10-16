import { Seo } from "@/components/site/Seo";
import { useBrand } from "@/brands/config";
export default function BrandAbout() {
  const b = useBrand();
  const business = b.business;
  const title = business.aboutTitle || "Üretimin her adımında,\nprojenizin yanındayız.";
  return (
    <>
      <Seo
        title={business.aboutTitle || "Yaklaşımımız"}
        description={business.description || `${b.name}: ${b.focus} için ihtiyaca göre 3D tasarım ve üretim yaklaşımımız.`}
        path="/hakkimizda"
        pageType="AboutPage"
      />
      <section className="brand-inner">
        <p className="brand-eyebrow">{b.name} · YAKLAŞIMIMIZ</p>
        <h1 className="business-about-title">{title}</h1>
        {business.description ? <p className="section-lead">{business.description}</p> : !Object.prototype.hasOwnProperty.call(b.settings.contact_info ?? {}, "business_description") && <p className="section-lead">
          {b.name}, {b.focus.toLocaleLowerCase("tr-TR")} odağıyla çalışan 3D
          üretim markamız. İstanbul'un tamamından gelen projeleri; tasarım,
          malzeme ve üretim ihtiyacınıza göre ele alıyoruz.
        </p>}
        {(business.aboutText || business.aboutImageUrl) && <div className={`about-profile${business.aboutImageUrl && business.aboutText ? " has-image" : ""}`}>
          {business.aboutText && <div className="about-profile-copy">{business.aboutText.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}
          {business.aboutImageUrl && <img className="about-profile-image" src={business.aboutImageUrl} alt={business.aboutImageAlt || `${b.name} atölyesi`} width="1000" height="750" loading="lazy" decoding="async" />}
        </div>}
        <div className="service-list">
          <article>
            <h2>Önce ihtiyacı anlarız.</h2>
            <p>
              Bir parçanın nasıl göründüğü kadar nerede ve nasıl kullanılacağı
              da önemlidir. Ölçüleri, koşulları ve beklentiyi birlikte
              netleştiririz.
            </p>
          </article>
          <article>
            <h2>Birlikte karar veririz.</h2>
            <p>
              Üretim yöntemi, malzeme, adet ve teslim planı proje özelinde
              belirlenir. Onayınızla birlikte üretime geçilir.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
