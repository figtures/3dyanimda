import { useParams, Link, Navigate } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/sections/CTA";
import { findDistrict, ISTANBUL_DISTRICTS } from "@/data/locations";
import { findService, SERVICES } from "@/data/services";
import { breadcrumbSchema, faqSchema, istanbulSabSchema, serviceSchema } from "@/lib/seo-schema";
import { ArrowRight, CheckCircle2, Clock, MapPin, Phone, Truck } from "lucide-react";
import { COMPANY } from "@/pages/legal/CompanyInfo";

/**
 * /istanbul/:ilce/:hizmet — Programatik ilçe + hizmet landing.
 *
 * Her sayfa rakipten farklı olarak:
 *  - 1500+ kelime gerçek + ilçe-spesifik içerik
 *  - LocalBusiness SAB + Service + FAQ + Breadcrumb schema (4 schema)
 *  - Komşu ilçelere internal link (içerik silosu)
 *  - Teklif al CTA + telefon
 */
export const LocalLanding = () => {
  const { ilce, hizmet } = useParams<{ ilce: string; hizmet: string }>();
  const district = findDistrict(ilce);
  const service = findService(hizmet);

  if (!district || !service) return <Navigate to="/" replace />;

  const url = `/istanbul/${district.slug}/${service.slug}`;
  const titleH1 = `${district.name} ${service.name} Hizmeti`;
  const metaTitle = `${district.name} ${service.name} | Aynı Gün Teklif · 3D Yanında`;
  const metaDescription = `${district.name} bölgesinde profesyonel ${service.name.toLowerCase()} hizmeti. ${district.delivery} teslimat, anlık fiyat hesaplayıcı, mühendislik destekli üretim. Ücretsiz teklif al.`;

  const localFaq = [
    {
      q: `${district.name}'de ${service.name.toLowerCase()} hizmeti ne kadar sürede teslim edilir?`,
      a: `${district.name} bölgesinde standart işler için teslimat süremiz "${district.delivery}". Acil siparişlerde aynı gün motokurye ile teslim edebiliyoruz. Üretim süresi modelin boyutuna ve seçtiğiniz kaliteye göre değişir.`,
    },
    {
      q: `${district.name}'de ${service.name.toLowerCase()} fiyatları nasıl hesaplanıyor?`,
      a: `${service.name} fiyatı; modelin hacmine, seçilen malzemeye, baskı kalitesine ve adet sayısına göre hesaplanır. STL dosyanızı sitemize yükleyerek anlık fiyat hesaplayabilirsiniz. Setup ücretimiz 35 ₺, minimum sipariş tutarımız 90 ₺'dir.`,
    },
    ...service.faq,
    {
      q: `${district.name}'e nasıl teslimat yapıyorsunuz?`,
      a: `${district.name} bölgesine ${district.delivery} olarak motokurye veya kargo ile teslim ediyoruz. Acil işlerde ekstra ücretle aynı gün teslimat opsiyonumuz da var.`,
    },
  ];

  const sideName = district.side === "anadolu" ? "Anadolu Yakası" : "Avrupa Yakası";
  const neighbors = district.neighbors
    .map(s => ISTANBUL_DISTRICTS.find(d => d.slug === s))
    .filter(Boolean) as typeof ISTANBUL_DISTRICTS;

  return (
    <>
      <Seo
        title={metaTitle}
        description={metaDescription}
        path={url}
        keywords={`${district.name} ${service.name.toLowerCase()}, ${district.name} 3d baskı, ${district.name} 3d yazıcı, istanbul ${district.name} 3d, ${service.name.toLowerCase()} ${district.name}, ${district.name} 3d tarama`}
        geo={{ region: "TR-34", placename: `${district.name}, İstanbul`, position: "41.0082;28.9784" }}
        jsonLd={[
          istanbulSabSchema({ areaSlug: district.slug, areaName: district.name }),
          serviceSchema({
            serviceType: service.name,
            name: titleH1,
            description: metaDescription,
            url: `https://3dyaninda.com${url}`,
            areaName: district.name,
          }),
          faqSchema(localFaq),
          breadcrumbSchema([
            { label: "Anasayfa", url: "/" },
            { label: "İstanbul 3D Baskı", url: "/istanbul-3d-baski" },
            { label: district.name, url: `/istanbul/${district.slug}/3d-baski` },
            { label: service.name },
          ]),
        ]}
      />

      <PageHero
        eyebrow={`İstanbul · ${sideName}`}
        breadcrumbs={[
          { label: "Anasayfa", to: "/" },
          { label: "İstanbul", to: "/istanbul-3d-baski" },
          { label: district.name, to: `/istanbul/${district.slug}/3d-baski` },
          { label: service.name },
        ]}
        title={
          <>
            {district.name} <span className="text-gradient-blue">{service.name}</span> Hizmeti
          </>
        }
        lead={`${district.name} bölgesine özel: ${district.delivery}, anlık fiyat ve mühendislik destekli ${service.name.toLowerCase()}. Ücretsiz ön teklif 24 saat içinde.`}
        ctaPrimary={{ label: "Anlık fiyat hesapla", to: "/teklif-al" }}
        ctaSecondary={{ label: "İletişime geç", to: "/iletisim" }}
      />

      {/* Hızlı bilgi şeridi */}
      <section className="border-b border-border bg-cream-gradient">
        <div className="container-page py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck,  k: "Teslimat", v: district.delivery },
            { icon: MapPin, k: "Bölge",    v: `${district.name}, ${sideName}` },
            { icon: Clock,  k: "Üretim",   v: "24-72 saat" },
            { icon: Phone,  k: "İletişim", v: COMPANY.phone },
          ].map((it) => (
            <div key={it.k} className="flex items-center gap-3">
              <div className="rounded-full bg-accent-blue-soft p-2.5">
                <it.icon className="h-4 w-4 text-accent-blue" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{it.k}</p>
                <p className="text-sm font-medium text-foreground">{it.v}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container-page grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <Prose>
              <h2>{district.name}'de {service.name.toLowerCase()} neden 3D Yanında?</h2>
              <p>
                {district.notes} <strong>3D Yanında</strong> olarak {district.name} bölgesindeki tasarımcılar,
                mühendisler, mimarlar ve üreticilere uçtan uca dijital üretim hizmeti sunuyoruz. STL dosyanızı
                sitemize yüklediğiniz anda fiyatınız belirleniyor; siparişinizi onaylamanızın ardından parçanız
                üretim sürecine alınıyor ve <strong>{district.delivery.toLowerCase()}</strong> ile {district.name}'e teslim ediliyor.
              </p>

              <h3>{district.name} {service.name.toLowerCase()} hizmetinin kapsamı</h3>
              <p>
                {service.short} {district.name}'de hizmet verdiğimiz alanlardan bazıları:
              </p>
              <ul>
                {service.bullets.map(b => <li key={b}>{b}</li>)}
              </ul>

              <h3>Fiyatlandırma ve teklif süreci</h3>
              <p>
                {service.name} fiyatı; <strong>modelinizin hacmi</strong>, <strong>seçilen malzeme</strong> (PLA,
                PETG, ABS, PA12, TPU veya reçine), <strong>baskı kalitesi</strong> (0.08 mm — 0.28 mm katman) ve
                <strong> doluluk oranınıza</strong> göre hesaplanır. Web sitemizdeki anlık hesaplayıcımızla saniyeler
                içinde fiyat görebilir; mühendislik incelemesi gerektiren projeleriniz için 24 saat içinde resmi
                teklif alabilirsiniz.
              </p>

              <h3>{district.name}'de hangi sektörlere hizmet veriyoruz?</h3>
              <p>
                {district.name} bölgesinde otomotiv yan sanayi, mimari ofisler, medikal ve dental laboratuvarlar,
                mücevher tasarımcıları, eğitim kurumları, drone ve hobi atölyeleri başta olmak üzere geniş bir
                yelpazede çalışıyoruz. Özellikle <strong>oto yedek parça üretimi</strong> ve <strong>endüstriyel
                prototipleme</strong> ana uzmanlık alanlarımızdandır.
              </p>

              <h3>Teslimat: {district.name} ve çevre ilçeler</h3>
              <p>
                {district.name}'e <strong>{district.delivery.toLowerCase()}</strong> ile teslimat yapıyoruz.
                İhtiyaca göre yurt içi kargo veya motokurye seçeneklerini sunuyoruz. Komşu ilçelere de aynı
                hızda hizmet veriyoruz:
              </p>
              {neighbors.length > 0 && (
                <ul>
                  {neighbors.map(n => (
                    <li key={n.slug}>
                      <Link to={`/istanbul/${n.slug}/${service.slug}`}>
                        {n.name} {service.name.toLowerCase()} hizmeti
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <h3>Diğer hizmetlerimiz {district.name}'de</h3>
              <ul>
                {SERVICES.filter(s => s.slug !== service.slug).map(s => (
                  <li key={s.slug}>
                    <Link to={`/istanbul/${district.slug}/${s.slug}`}>
                      {district.name} {s.name.toLowerCase()}
                    </Link> — {s.short}
                  </li>
                ))}
              </ul>

              <h3>Sıkça sorulan sorular</h3>
              <p>{district.name}'de {service.name.toLowerCase()} hizmeti almadan önce müşterilerimizin sıkça sorduğu sorulara cevap veriyoruz.</p>
            </Prose>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            {/* Teknik özet kartı */}
            <div className="border border-border rounded-2xl p-6 bg-card shadow-soft">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue mb-3">
                Teknik Özet · {service.name}
              </p>
              <ul className="space-y-3">
                {service.techList.map((t) => (
                  <li key={t.k} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent-blue mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{t.k}</p>
                      <p className="text-foreground font-medium">{t.v}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hızlı CTA kart */}
            <div className="rounded-2xl bg-primary text-primary-foreground p-6 shadow-deep">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/80">
                {district.name} için
              </p>
              <h3 className="font-display text-2xl mt-2 leading-tight text-cream">
                Anlık fiyat hesaplayın
              </h3>
              <p className="text-cream/85 text-sm mt-2">
                STL dosyanızı yükleyin — fiyat ve teslim süresi anında.
              </p>
              <Link
                to="/teklif-al"
                className="mt-5 inline-flex items-center gap-2 bg-cream text-primary font-semibold px-5 py-3 rounded-full hover:bg-gold transition-colors"
              >
                Teklif al <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <FAQ items={localFaq} />
      <CTA />
    </>
  );
};

export default LocalLanding;