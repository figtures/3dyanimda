import { Link } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/sections/CTA";
import { breadcrumbSchema, faqSchema, istanbulSabSchema, serviceSchema } from "@/lib/seo-schema";
import { Truck, Factory, Clock, MapPin, ShieldCheck, Wrench, ArrowRight } from "lucide-react";
import { COMPANY } from "@/pages/legal/CompanyInfo";

const FAQ_ITEMS = [
  { q: "Beylikdüzü, Esenyurt, Hadımköy ve Avcılar'a ne kadar sürede teslim ediyorsunuz?", a: "Üretim üssümüz Beylikdüzü'nde olduğu için bu dört bölgeye standart işlerde 1-3 saat içinde motokurye ile teslim ediyoruz. Acil siparişlerde 1 saatin altında teslimat opsiyonumuz vardır." },
  { q: "Hadımköy OSB'deki fabrikalara hat duruşunda yedek parça üretiyor musunuz?", a: "Evet — Hadımköy OSB, İSTOÇ ve İkitelli OSB'deki üretim hatlarına özel 'hat duruşunda 24 saat' programımız var. Acil yedek parça için ölçü/foto/CAD gönderdiğinizde 24 saat içinde fonksiyonel parça teslim edebiliyoruz." },
  { q: "Esenyurt'taki küçük üreticiler için minimum sipariş tutarınız nedir?", a: "Setup ücretimiz 35 ₺, minimum sipariş tutarımız 90 ₺. Tek parça ya da binlerce adet, aynı kalite standardıyla üretiriz." },
  { q: "Beylikdüzü CNR Expo fuarları için son dakika maket/prototip yapıyor musunuz?", a: "Evet — fuar haftası boyunca aynı gün üretim önceliği veriyoruz. CNR, ICEC ve İFM organizasyonları için maket, ürün prototipi ve hediyelik hızlı çözümlerimiz mevcut." },
  { q: "Tedarikçi onay sürecinizden geçmem gerekiyor mu?", a: "Standart işler için gerekmez. Ancak otomotiv, savunma ve havacılık tedarik zincirine girmek için ISO 9001 uyumlu süreç dokümantasyonu, malzeme sertifikaları ve NDA imzalı tedarikçi formu sağlayabiliriz." },
];

const COVERAGE = [
  { name: "Beylikdüzü", slug: "beylikduzu", time: "1-2 saat", note: "Üretim üssümüz" },
  { name: "Esenyurt", slug: "esenyurt", time: "1-3 saat", note: "Sanayi yoğunluğu yüksek" },
  { name: "Hadımköy", slug: "hadimkoy", time: "1-2 saat", note: "Hadımköy OSB öncelikli" },
  { name: "Avcılar", slug: "avcilar", time: "1-2 saat", note: "Üniversite + sanayi" },
  { name: "Büyükçekmece", slug: "buyukcekmece", time: "2-4 saat", note: "Sahil sanayi" },
  { name: "Başakşehir", slug: "basaksehir", time: "2-4 saat", note: "İkitelli OSB komşusu" },
  { name: "Arnavutköy", slug: "arnavutkoy", time: "2-3 saat", note: "İGA havalimanı yan sanayi" },
  { name: "Küçükçekmece", slug: "kucukcekmece", time: "2-3 saat", note: "Havalimanı yan sanayi" },
];

const INDUSTRIES = [
  { icon: Factory, t: "Hadımköy OSB ağır sanayi", d: "Makine yedek parça, conta, kalıp ikamesi, lojistik ekipman bileşeni." },
  { icon: Wrench, t: "Otomotiv yan sanayi", d: "Beylikdüzü-Esenyurt eksenindeki tier-2/tier-3 tedarikçiler için fonksiyonel prototip ve düşük adet seri." },
  { icon: ShieldCheck, t: "Savunma & havacılık tedariki", d: "İGA Havalimanı çevresi yan sanayi için NDA'lı, izlenebilir üretim." },
  { icon: Factory, t: "İSTOÇ + İkitelli OSB", d: "Tekstil, ambalaj, mobilya makine parçaları için reverse engineering + 3D baskı." },
];

export const WestIstanbulOsb = () => {
  const url = "/istanbul/bati-osb-3d-uretim";
  const title = "Batı İstanbul OSB 3D Üretim | Beylikdüzü · Esenyurt · Hadımköy · Avcılar";
  const description = "Beylikdüzü merkezli üretim üssümüzden Hadımköy OSB, İkitelli OSB, Esenyurt sanayi sitelerine ve Avcılar'a 1-3 saat içi motokurye ile 3D baskı, tarama ve mühendislik modelleme. Hat duruşunda 24 saat yedek parça programı.";

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={url}
        keywords="hadımköy osb 3d baskı, beylikdüzü 3d baskı, esenyurt 3d baskı, avcılar 3d baskı, ikitelli osb 3d, hadımköy 3d yazıcı, batı istanbul 3d üretim, hadımköy yedek parça"
        geo={{ region: "TR-34", placename: "Beylikdüzü, İstanbul", position: "41.0017;28.6417" }}
        jsonLd={[
          istanbulSabSchema({ areaSlug: "bati-osb", areaName: "Batı İstanbul OSB" }),
          serviceSchema({
            serviceType: "3D Üretim",
            name: "Batı İstanbul OSB 3D Üretim Hizmeti",
            description,
            url: `https://3dyaninda.com${url}`,
            areaName: "Batı İstanbul",
          }),
          faqSchema(FAQ_ITEMS),
          breadcrumbSchema([
            { label: "Anasayfa", url: "/" },
            { label: "İstanbul 3D Baskı", url: "/istanbul-3d-baski" },
            { label: "Batı İstanbul OSB" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Batı İstanbul · Üretim üssü"
        breadcrumbs={[
          { label: "Anasayfa", to: "/" },
          { label: "İstanbul", to: "/istanbul-3d-baski" },
          { label: "Batı İstanbul OSB" },
        ]}
        title={<>Batı İstanbul OSB için <span className="text-gradient-blue">1-3 saat</span> içinde 3D üretim</>}
        lead="Beylikdüzü'ndeki üretim üssümüzden Hadımköy OSB, İkitelli OSB, Esenyurt ve Avcılar'a aynı gün motokurye. Hat duruşunda 24 saatte fonksiyonel yedek parça."
        ctaPrimary={{ label: "Anlık fiyat hesapla", to: "/teklif-al" }}
        ctaSecondary={{ label: "Kurumsal çözümler", to: "/kurumsal-cozumler" }}
      />

      <section className="border-b border-border bg-cream-gradient">
        <div className="container-page py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck, k: "Teslimat", v: "1-3 saat içi kurye" },
            { icon: MapPin, k: "Üs", v: "Beylikdüzü, İstanbul" },
            { icon: Clock, k: "Hat duruşu", v: "24 saat fonksiyonel parça" },
            { icon: Factory, k: "OSB", v: "Hadımköy · İkitelli · İSTOÇ" },
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
              <h2>Batı İstanbul'un dijital üretim merkezi</h2>
              <p>
                İstanbul'un üretim ekonomisinin omurgası Avrupa Yakası'nın batısında atar:
                <strong> Beylikdüzü, Esenyurt, Hadımköy OSB, İkitelli OSB, Avcılar </strong>ve İGA Havalimanı yan
                sanayisi tek bir endüstriyel koridor oluşturur. Bu koridor; otomotiv tier-2/3 tedarikçilerinden,
                makine üreticilerine, lojistik ekipman ithalatçılarından savunma ve havacılık alt yüklenicilerine
                kadar geniş bir yelpazede üretim yapar.
              </p>
              <p>
                <strong>3D Yanında</strong> Beylikdüzü merkezli üretim üssüyle bu koridorun tam ortasında konumlanır.
                Hadımköy OSB'deki bir fabrikadan gelen acil yedek parça talebine 1-2 saat içinde motokurye ile yanıt
                veriyor; CNR Expo'daki bir fuar standına son dakika maket teslim ediyor; Esenyurt'taki bir atölye için
                tek parçalık özel kalıp prototipini aynı gün içinde üretiyoruz.
              </p>

              <h3>Hat duruşunda 24 saat fonksiyonel yedek parça</h3>
              <p>
                OSB'deki üretim hatlarında bir parçanın bozulması saatlik on binlerce TL kayıp demektir. Bizim
                farkımız, ithalatı haftalar süren ya da artık üretilmeyen parçayı 24 saat içinde fonksiyonel olarak
                yeniden üretmek. Süreç: bozuk parçayı bize getirin ya da ölçü/foto/CAD gönderin →
                <strong> 3D tarama (±0.02 mm)</strong> ile dijital ikiz çıkaralım → mühendis CAD onayı →
                <strong> PA12, PA-CF, PETG-CF veya mühendislik reçinesi</strong> ile baskı → kalite kontrol →
                aynı gün motokurye.
              </p>

              <h3>Hangi sektörlere hizmet veriyoruz?</h3>
              <ul>
                {INDUSTRIES.map(i => (
                  <li key={i.t}><strong>{i.t}.</strong> {i.d}</li>
                ))}
              </ul>

              <h3>Tedarikçi olarak süreç şeffaflığı</h3>
              <p>
                Otomotiv, savunma ve havacılık alt yüklenicilik süreçlerinizde bizi tedarikçi olarak ekleyebilmeniz
                için: NDA imzası, ISO 9001 uyumlu süreç dokümantasyonu, malzeme TDS/MSDS dosyaları, parti bazlı
                izlenebilirlik (lot/batch numarası) ve gerektiğinde boyutsal denetim raporu sunarız. Detaylar için
                <Link to="/kurumsal-cozumler"> kurumsal çözümler </Link>sayfamızı inceleyin.
              </p>
            </Prose>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            <div className="border border-border rounded-2xl p-6 bg-card shadow-soft">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue mb-3">
                Bölge teslim süreleri
              </p>
              <ul className="divide-y divide-border">
                {COVERAGE.map((c) => (
                  <li key={c.slug} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <Link to={`/istanbul/${c.slug}/3d-baski`} className="text-sm font-medium text-foreground hover:text-accent-blue">
                        {c.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{c.note}</p>
                    </div>
                    <span className="font-mono text-[11px] text-accent-blue whitespace-nowrap">{c.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-primary text-primary-foreground p-6 shadow-deep">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/80">
                Hat duruşu acil hattı
              </p>
              <h3 className="font-display text-2xl mt-2 leading-tight text-cream">
                {COMPANY.phone}
              </h3>
              <p className="text-cream/85 text-sm mt-2">
                Acil yedek parça için doğrudan arayın — 24 saat içinde teslim taahhüdü.
              </p>
              <a
                href={`tel:${COMPANY.phoneE164}`}
                className="mt-5 inline-flex items-center gap-2 bg-cream text-primary font-semibold px-5 py-3 rounded-full hover:bg-gold transition-colors"
              >
                Şimdi ara <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      <FAQ items={FAQ_ITEMS} />
      <CTA />
    </>
  );
};

export default WestIstanbulOsb;
