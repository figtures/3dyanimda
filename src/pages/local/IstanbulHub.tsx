import { Link } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { CTA } from "@/components/sections/CTA";
import { ANADOLU, AVRUPA } from "@/data/locations";
import { SERVICES } from "@/data/services";
import { breadcrumbSchema, faqSchema, istanbulSabSchema, serviceSchema } from "@/lib/seo-schema";
import { ArrowRight, MapPin } from "lucide-react";

const FAQ = [
  { q: "İstanbul'un hangi ilçelerine 3D baskı hizmeti veriyorsunuz?", a: "İstanbul'un 39 ilçesinin tamamına hizmet veriyoruz. Anadolu ve Avrupa Yakası fark etmeksizin aynı gün motokurye veya kargo seçeneğiyle teslim ediyoruz." },
  { q: "İstanbul'da 3D baskı fiyatları ne kadar?", a: "Fiyat; modelin hacmine, malzemeye, doluluğa ve baskı kalitesine göre değişir. Setup ücretimiz 35 ₺, minimum sipariş tutarımız 90 ₺. STL dosyanızı yükleyerek anında fiyat hesaplayabilirsiniz." },
  { q: "İstanbul'da en hızlı 3D baskı ne kadar sürede teslim edilebilir?", a: "Aynı gün motokurye opsiyonumuz var. Standart işler 24-72 saat içinde tamamlanır." },
  { q: "İstanbul dışına teslimat yapıyor musunuz?", a: "Evet — tüm Türkiye'ye yurt içi kargo ile teslim ediyoruz. Yurt dışı için özel anlaşmalı kargo seçeneklerimiz mevcut." },
];

export const IstanbulHub = () => {
  return (
    <>
      <Seo
        title="İstanbul 3D Baskı | 39 İlçeye Aynı Gün Teslim · 3D Yanında"
        description="İstanbul'un tüm ilçelerine 3D baskı, 3D tarama ve 3D modelleme hizmeti. Aynı gün motokurye, anlık fiyat hesaplayıcı, mühendislik destekli üretim. Ücretsiz teklif al."
        path="/istanbul-3d-baski"
        keywords="istanbul 3d baskı, istanbul 3d yazıcı, istanbul 3d tarama, istanbul 3d modelleme, istanbul 3d baskı hizmeti, istanbul 3d baskı fiyat"
        geo={{ region: "TR-34", placename: "İstanbul", position: "41.0082;28.9784" }}
        jsonLd={[
          istanbulSabSchema(),
          serviceSchema({
            serviceType: "3D Baskı",
            name: "İstanbul 3D Baskı Hizmeti",
            description: "İstanbul'un 39 ilçesine aynı gün motokurye ve kargo ile 3D baskı.",
            url: "https://3dyaninda.com/istanbul-3d-baski",
          }),
          faqSchema(FAQ),
          breadcrumbSchema([
            { label: "Anasayfa", url: "/" },
            { label: "İstanbul 3D Baskı" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="İstanbul · Tüm ilçeler"
        breadcrumbs={[
          { label: "Anasayfa", to: "/" },
          { label: "İstanbul 3D Baskı" },
        ]}
        title={<>İstanbul'da <span className="text-gradient-blue">3D Baskı</span></>}
        lead="39 ilçeye aynı gün motokurye, anlık fiyat hesaplayıcı, mühendislik destekli üretim. STL dosyanızı yükleyin — saniyeler içinde fiyatınızı görün."
        ctaPrimary={{ label: "STL ile teklif al", to: "/teklif-al" }}
        ctaSecondary={{ label: "Rehberi oku", to: "/rehber/istanbul-3d-baski-rehberi" }}
      />

      <section className="py-20 lg:py-24 bg-background">
        <div className="container-page">
          <div className="max-w-3xl mb-12">
            <p className="eyebrow">Hizmetler · İstanbul</p>
            <h2 className="font-display text-3xl md:text-4xl mt-3 text-foreground">
              İstanbul genelinde sunduğumuz 4 ana hizmet
            </h2>
            <p className="text-foreground/70 mt-4 text-lg">
              Her hizmet için ilçenize özel landing sayfası — teslimat süresi, lokal kullanım örnekleri ve iletişim bilgisi tek sayfada.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s) => (
              <Link key={s.slug} to={`/hizmetler/${s.slug === "3d-yedek-parca" ? "3d-baski" : s.slug}`} className="group rounded-2xl border border-border bg-card p-6 hover:shadow-deep hover:border-accent-blue/40 transition-all">
                <div className="rounded-xl bg-accent-blue-soft p-3 w-fit mb-4 group-hover:bg-accent-blue group-hover:text-white transition-colors">
                  <s.icon className="h-5 w-5 text-accent-blue group-hover:text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.short}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm text-accent-blue font-medium">
                  Detaylı bilgi <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* İlçe grid — Anadolu */}
      <DistrictGrid title="Anadolu Yakası ilçeleri" items={ANADOLU} />
      {/* İlçe grid — Avrupa */}
      <DistrictGrid title="Avrupa Yakası ilçeleri" items={AVRUPA} alt />

      <section className="py-20 lg:py-24 bg-background">
        <div className="container-page">
          <Prose>
            <h2>İstanbul'da 3D baskı: neden 3D Yanında?</h2>
            <p>
              İstanbul, Türkiye'nin tasarım ve üretim kalbi. <strong>3D Yanında</strong> olarak şehrin 39 ilçesinin tamamına
              hizmet veriyoruz. Tasarımcılar, mühendisler, mimarlar, dental laboratuvarlar, otomotiv yan sanayisi ve maker
              topluluğu için uçtan uca dijital üretim hizmeti sunuyoruz: <strong>3D tarama</strong>,{" "}
              <strong>mühendislik modelleme</strong>, <strong>3D baskı</strong> ve <strong>yedek parça yeniden üretimi</strong>.
            </p>
            <h3>Neden bizi tercih ediyorlar?</h3>
            <ul>
              <li><strong>Anlık fiyat hesaplayıcı:</strong> STL dosyanızı yükleyin, fiyatı saniyeler içinde görün.</li>
              <li><strong>İstanbul içi aynı gün motokurye:</strong> Acil işlerde kapınıza teslim.</li>
              <li><strong>Mühendislik destekli üretim:</strong> Sadece basmıyoruz; parçanın çalışmaması ihtimaline karşı tasarım önerileri sunuyoruz.</li>
              <li><strong>Geniş malzeme yelpazesi:</strong> PLA'dan PA-CF'ye, reçineye kadar 6+ malzeme seçeneği.</li>
              <li><strong>FDM, SLA, SLS, MJF:</strong> İhtiyacınıza göre doğru teknoloji.</li>
            </ul>
            <h3>İstanbul 3D baskı fiyatları</h3>
            <p>
              3D baskı fiyatlarımız <strong>35 ₺ setup + hacim×malzeme×kalite</strong> formülüyle hesaplanır. Minimum sipariş
              90 ₺. 5 adet üzeri %8, 10 adet üzeri %15 indirim. Kesin rakam için STL dosyanızı{" "}
              <Link to="/teklif-al">teklif al sayfamızdan</Link> yükleyebilirsiniz.
            </p>
          </Prose>
        </div>
      </section>

      <CTA />
    </>
  );
};

const DistrictGrid = ({ title, items, alt }: { title: string; items: typeof ANADOLU; alt?: boolean }) => (
  <section className={`py-16 lg:py-20 ${alt ? "bg-cream-gradient" : "bg-secondary/40"}`}>
    <div className="container-page">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="eyebrow">{alt ? "Avrupa" : "Anadolu"}</p>
          <h2 className="font-display text-2xl md:text-3xl mt-2 text-foreground">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{items.length} ilçe · aynı gün motokurye</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((d) => (
          <Link
            key={d.slug}
            to={`/istanbul/${d.slug}/3d-baski`}
            className="group flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 hover:border-accent-blue hover:shadow-soft transition-all"
          >
            <MapPin className="h-4 w-4 text-accent-blue shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-accent-blue">{d.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{d.delivery}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default IstanbulHub;