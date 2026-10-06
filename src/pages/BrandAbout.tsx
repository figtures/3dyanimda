import { Seo } from "@/components/site/Seo";
import { useBrand } from "@/brands/config";
export default function BrandAbout() {
  const b = useBrand();
  return (
    <>
      <Seo
        title="Yaklaşımımız"
        description={`${b.name}: ${b.focus} için ihtiyaca göre 3D tasarım ve üretim yaklaşımımız.`}
        path="/hakkimizda"
        pageType="AboutPage"
      />
      <section className="brand-inner">
        <p className="brand-eyebrow">{b.name} · YAKLAŞIMIMIZ</p>
        <h1>
          Üretimin her adımında,
          <br />
          projenizin yanındayız.
        </h1>
        <p className="section-lead">
          {b.name}, {b.focus.toLocaleLowerCase("tr-TR")} odağıyla çalışan 3D
          üretim markamız. İstanbul'un tamamından gelen projeleri; tasarım,
          malzeme ve üretim ihtiyacınıza göre ele alıyoruz.
        </p>
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
