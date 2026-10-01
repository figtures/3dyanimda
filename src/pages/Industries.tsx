import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { CTA } from "@/components/sections/CTA";
import { ServicePage } from "@/components/site/ServicePage";
import { Link } from "react-router-dom";
import { Car, Factory, Stethoscope, Building2, Shield, Sparkles, Plane, Lightbulb, ArrowUpRight } from "lucide-react";
import autoImg from "@/assets/auto-parts-collection.jpg";
import scanImg from "@/assets/service-scanning.jpg";
import printImg from "@/assets/service-printing.jpg";
import modelImg from "@/assets/service-modeling.jpg";

export const industries = [
  {
    slug: "oto-yedek-parca-3d-uretim",
    icon: Car,
    name: "Oto Yedek Parça",
    short: "Ana uzmanlık alanımız. Bulunamayan, üretimi durmuş veya nadir oto yedek parça üretimi.",
    primary: true,
    path: "/oto-yedek-parca-3d-uretim",
  },
  { slug: "endustriyel", icon: Factory, name: "Endüstriyel & Üretim", short: "Üretim hatlarınız için sensör braketleri, hava manifoldları, robot uç efektörleri.", path: "/sektorler/endustriyel" },
  { slug: "medikal", icon: Stethoscope, name: "Medikal & Diş Hekimliği", short: "Cerrahi rehberler, diş modelleri, ortez & protez çalışmaları.", path: "/sektorler/medikal" },
  { slug: "mimari-tasarim", icon: Building2, name: "Mimari & Tasarım", short: "Maket, ürün prototipi, iç mekan dekoratif elemanlar.", path: "/sektorler/mimari-tasarim" },
  { slug: "savunma-havacilik", icon: Shield, name: "Savunma & Havacılık", short: "Düşük adet özel parçalar, ASA & PA-CF mühendislik bileşenleri.", path: "/sektorler/savunma-havacilik" },
  { slug: "egitim-arge", icon: Lightbulb, name: "Eğitim & Ar-Ge", short: "Üniversite projeleri, akademik prototipler, model üretim.", path: "/sektorler/egitim-arge" },
  { slug: "sanat-mucevher", icon: Sparkles, name: "Sanat & Mücevher", short: "Heykel, sergi parçası, takı kalıbı ve dökümhane uyumlu reçine.", path: "/sektorler/sanat-mucevher" },
  { slug: "havacilik-drone", icon: Plane, name: "Drone & Hobi", short: "FPV gövdesi, koruma kafesi, gimbal aparatları, hafif PA-CF baskılar.", path: "/sektorler/drone-hobi" },
];

export const IndustriesIndex = () => (
  <>
    <Seo
      title="Sektörler — Hangi Alanlarda 3D Üretim Yapıyoruz?"
      description="Oto yedek parça başta olmak üzere endüstriyel, medikal, mimari, savunma, eğitim, sanat ve drone sektörlerinde 3D tarama, modelleme ve baskı çözümleri."
      path="/sektorler"
    />
    <PageHero
      eyebrow="Sektörler"
      breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Sektörler" }]}
      title={<>Ana uzmanlığımız <span className="text-gradient-blue italic font-medium">oto yedek parça</span> — kabiliyetimiz çok daha geniş.</>}
      lead="3D Yanında'nın asıl odak alanı oto yedek parça üretimidir. Aynı mühendislik disiplini ve baskı altyapısıyla birçok farklı sektöre de hizmet veriyoruz."
      ctaPrimary={{ label: "Oto yedek parça hizmeti", to: "/oto-yedek-parca-3d-uretim" }}
      ctaSecondary={{ label: "Teklif al", to: "/teklif-al" }}
    />
    <section className="py-20 lg:py-28 bg-background">
      <div className="container-page">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((s) => (
            <Link
              key={s.slug}
              to={s.path}
              className={`group relative border rounded-2xl p-7 bg-card shadow-soft hover:shadow-deep hover:-translate-y-0.5 transition-all overflow-hidden ${
                s.primary ? "border-accent-blue ring-2 ring-accent-blue/20" : "border-border"
              }`}
            >
              {s.primary && (
                <span className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-[0.22em] bg-accent-blue text-white px-2 py-1 rounded-full">
                  Ana uzmanlık
                </span>
              )}
              <div className="rounded-lg bg-accent-blue-soft p-2.5 inline-flex">
                <s.icon className="h-5 w-5 text-accent-blue" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight mt-4 text-foreground">{s.name}</h2>
              <p className="text-foreground/70 mt-2 text-[15px] leading-relaxed">{s.short}</p>
              <span className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-primary group-hover:text-accent-blue">
                Detaylar <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
    <CTA />
  </>
);

/* ---------- Sektör sayfaları ---------- */

export const IndustryEndustriyel = () => (
  <ServicePage
    path="/sektorler/endustriyel"
    metaTitle="Endüstri & Üretim için 3D Tarama ve Baskı"
    metaDescription="Sensör braketi, robot uç efektörü, hava manifoldu, kalıp aparatı, üretim hattı yedek parçası — 3D Yanında ile hattınız durmasın."
    eyebrow="Endüstriyel & Üretim"
    serviceType="Endüstriyel 3D Üretim"
    title={<>Üretiminizin <span className="text-gradient-blue italic font-medium">akışını</span> kesmeyin.</>}
    lead="Tek bir küçük parçanın yokluğu, koca bir üretim hattını günlerce durdurabilir. 3D üretim ile bu süreyi saatlere indiriyoruz."
    image={printImg}
    imageAlt="Endüstriyel 3D baskı parça örneği"
    highlights={[
      { k: "Hız", v: "48 saat içinde teslim" },
      { k: "Malzeme", v: "PA-CF · SLS naylon · MJF" },
      { k: "Sıcaklık", v: "120 °C'ye kadar" },
      { k: "Seri", v: "100 – 500 adet" },
    ]}
    faq={[
      { q: "Hangi parçalar 3D ile değiştirilebilir?", a: "Plastik kapaklar, sensör braketleri, kablo tutucuları, hava manifoldları, gripper jaw'lar, makine plastik aparatları." },
      { q: "Sürekli partner modeliniz nasıl çalışıyor?", a: "Sık tüketilen parçalarınızı dijital arşivimize alıyor; talep geldiğinde aynı gün gönderim sağlıyoruz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85">Üretim hattı yedek parça stoğunu fiziksel değil, dijital olarak tutmanın yolu burada.</p>
      <h2>Tipik vakalar</h2>
      <ul>
        <li>Konveyör tutucu, kablo kanal kapağı, sensör braketi</li>
        <li>Robot uç efektörleri (gripper jaws), vakum nozulu</li>
        <li>Pnömatik gövde, hava manifoldu, ölçü mastarları</li>
        <li>Forklift / iş makinesi plastik kapakları</li>
      </ul>
    </>}
  />
);

export const IndustryMedikal = () => (
  <ServicePage
    path="/sektorler/medikal"
    metaTitle="Medikal ve Diş Hekimliği için 3D Üretim"
    metaDescription="Cerrahi rehberler, dental modeller, ortez & protez prototipleri için biyo-uyumlu reçine ve yüksek hassasiyetli SLA baskı."
    eyebrow="Medikal & Diş Hekimliği"
    serviceType="Medikal 3D Üretim"
    title={<>Hastaya özel <span className="text-gradient-blue italic font-medium">hassasiyet</span>.</>}
    lead="Diş hekimliği, ortopedi ve cerrahi planlama için hassas 3D modeller ve baskılar. Yalnızca prototip ve eğitim amaçlı çıktılar."
    image={scanImg}
    imageAlt="Medikal 3D baskı modeli"
    highlights={[
      { k: "Teknoloji", v: "SLA · DLP · MJF" },
      { k: "Hassasiyet", v: "0.025 mm katman" },
      { k: "Malzeme", v: "Biyo-uyumlu reçine (sınıf I)" },
      { k: "Süre", v: "24 – 72 saat" },
    ]}
    faq={[
      { q: "Hasta üzerinde kullanılacak son ürün üretiyor musunuz?", a: "Hayır, yalnızca prototip, eğitim ve cerrahi planlama amaçlı modeller üretiyoruz. Hastada kullanılacak ürünler için yetkili medikal cihaz üreticileri ile çalışmanızı öneririz." },
      { q: "Diş laboratuvarları ile çalışıyor musunuz?", a: "Evet. Çalışma modeli, geçici köprü ve aligner modelleri için diş laboratuvarlarına haftalık paket hizmeti sunuyoruz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85">3D baskı, medikal alanda bireyselleştirmenin en güçlü aracıdır.</p>
      <h2>Hangi uygulamalar için çalışıyoruz?</h2>
      <ul>
        <li>Cerrahi planlama anatomik modelleri</li>
        <li>Dental çalışma modelleri ve aligner kalıpları</li>
        <li>Ortez & protez prototipleri</li>
        <li>Eğitim amaçlı anatomik replikalar</li>
      </ul>
    </>}
  />
);

export const IndustryMimari = () => (
  <ServicePage
    path="/sektorler/mimari-tasarim"
    metaTitle="Mimari Maket ve Tasarım için 3D Baskı"
    metaDescription="Mimari maket, ürün prototipi, iç mekan dekoratif eleman üretimi için yüksek detaylı 3D baskı."
    eyebrow="Mimari & Tasarım"
    serviceType="Mimari & Endüstriyel Tasarım 3D Üretim"
    title={<>Tasarımı <span className="text-gradient-blue italic font-medium">üç boyutlu</span> savunun.</>}
    lead="Mimari maket, ürün konsepti ve dekoratif obje üretiminde mühendislik kalitesinde 3D baskı."
    image={modelImg}
    imageAlt="Mimari maket 3D baskı"
    highlights={[
      { k: "Detay", v: "0.05 mm katman" },
      { k: "Boyut", v: "1:50 – 1:500 ölçek" },
      { k: "Boyama", v: "Akrilik · efekt finish" },
      { k: "Süre", v: "3 – 7 iş günü" },
    ]}
    faq={[
      { q: "Maket için hangi malzeme öneriyorsunuz?", a: "Beyaz PLA, opak SLA reçine veya SLS naylon en sık tercihler. Şeffaf cephe için şeffaf reçine." },
      { q: "Render dosyamı modelleyebilir misiniz?", a: "Render kullanılabilir değil; ancak DWG, DXF, OBJ, FBX veya STL gönderirseniz baskıya hazırlarız." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85">Tasarımlarınızı yatırımcıya, jüriye ya da kullanıcıya 3 boyutlu olarak sunun.</p>
      <h2>Tipik üretimler</h2>
      <ul>
        <li>Konut & site maketleri (1:100 – 1:500)</li>
        <li>Ürün konsept prototipleri</li>
        <li>Mağaza & sergi standı maketleri</li>
        <li>Dekoratif iç mekan elemanları</li>
      </ul>
    </>}
  />
);

export const IndustrySavunma = () => (
  <ServicePage
    path="/sektorler/savunma-havacilik"
    metaTitle="Savunma & Havacılık için Düşük Adet 3D Üretim"
    metaDescription="Savunma sanayi ve havacılık projeleriniz için düşük adetli özel parça üretimi. PA-CF, ASA, SLS naylon ve MJF teknolojisi."
    eyebrow="Savunma & Havacılık"
    serviceType="Savunma & Havacılık 3D Üretim"
    title={<>Düşük adet, <span className="text-gradient-blue italic font-medium">yüksek</span> mühendislik.</>}
    lead="Az sayıda ama kritik özel parça üretiminde, doğru malzeme ve doğru ekiple çalışmanın farkı."
    image={printImg}
    imageAlt="Savunma sanayi için 3D baskı parça"
    highlights={[
      { k: "Malzeme", v: "PA-CF · ASA · SLS PA12" },
      { k: "Hacim", v: "500 × 500 × 600 mm" },
      { k: "Gizlilik", v: "NDA + dosya imhası" },
      { k: "Süre", v: "5 – 14 iş günü" },
    ]}
    faq={[
      { q: "Gizlilik nasıl sağlanıyor?", a: "Tüm projelerde NDA imzalıyor, tasarım dosyasını teslim sonrası imha ediyoruz; ekibimizde sınırlı erişim ile çalışıyoruz." },
      { q: "Sertifikalı malzemeniz var mı?", a: "Belirli üretici ham madde sertifikalarına sahibiz; özel istekleriniz için tedarik kanallarımızı projeye göre genişletiyoruz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85">Düşük adet üretimde geleneksel yöntemler maliyet ve sürede başarısızdır.</p>
      <h2>Hangi uygulamalar?</h2>
      <ul>
        <li>Drone & İHA gövde aparatları</li>
        <li>Test & ölçüm jig & fixture'ları</li>
        <li>Kablo / konektör mahfazaları</li>
        <li>Eğitim simülatör parçaları</li>
      </ul>
    </>}
  />
);

export const IndustryEgitim = () => (
  <ServicePage
    path="/sektorler/egitim-arge"
    metaTitle="Eğitim ve Ar-Ge için 3D Üretim"
    metaDescription="Üniversite projeleri, akademik prototipler, atölye eğitimi ve Ar-Ge ekipleri için uygun fiyatlı, hızlı 3D üretim."
    eyebrow="Eğitim & Ar-Ge"
    serviceType="Eğitim & Ar-Ge 3D Üretim"
    title={<>Bir <span className="text-gradient-blue italic font-medium">fikrin</span> ne kadar hızlı dokunulabilir hale geleceğini hayal edin.</>}
    lead="Üniversite ve Ar-Ge ekipleri için özel fiyatlandırma, hızlı teslim ve teknik danışmanlık dahil."
    image={modelImg}
    imageAlt="Eğitim & Ar-Ge için 3D baskı"
    highlights={[
      { k: "İndirim", v: "Akademik %15" },
      { k: "Süre", v: "48 saat içinde" },
      { k: "Danışmanlık", v: "Malzeme & teknoloji önerisi" },
      { k: "Toplu sipariş", v: "TÜBİTAK uyumlu fatura" },
    ]}
    faq={[
      { q: "Tübitak projem için fatura kesilebilir mi?", a: "Evet, kurumsal faturalandırma yapıyoruz; tüm vergi & belge sürecinizi destekliyoruz." },
      { q: "Bitirme tezi için tek seferlik baskı yapıyor musunuz?", a: "Tabii. STL ya da fotoğraf gönderin, hızlıca teklif yapalım." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85">Atölyeler, üniversiteler, lise robotik kulüpleri ve Ar-Ge ekiplerine özel destek programımız mevcut.</p>
    </>}
  />
);

export const IndustrySanat = () => (
  <ServicePage
    path="/sektorler/sanat-mucevher"
    metaTitle="Sanat & Mücevher için Hassas 3D Baskı"
    metaDescription="Heykel, sergi parçası, takı kalıbı ve dökümhane uyumlu reçine ile hassas 3D baskı çözümleri."
    eyebrow="Sanat & Mücevher"
    serviceType="Sanat & Mücevher 3D Üretim"
    title={<>Detayın <span className="text-gradient-blue italic font-medium">en ince</span> hâli.</>}
    lead="Heykel, takı, sergi & koleksiyon parçaları için 0.025 mm katman SLA reçine baskı."
    image={scanImg}
    imageAlt="Sanat & mücevher için 3D baskı"
    highlights={[
      { k: "Katman", v: "0.025 mm SLA" },
      { k: "Reçine", v: "Sert · Dökümhane · Esnek" },
      { k: "Boyama", v: "Akrilik · krom · patina" },
      { k: "Tarama", v: "Heykel & dijital arşiv" },
    ]}
    faq={[
      { q: "Mücevher kalıbı dökülebilir mi?", a: "Evet. Dökümhane uyumlu reçineyle bastığımız modeller, alçı kalıpta sorunsuz yanar; külsüz döküm sağlar." },
      { q: "Heykelin dijital ikizini çıkartabilir misiniz?", a: "3D tarama ile ±0.02 mm hassasiyetinde dijital arşiv oluşturuyoruz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85">Sanatçı, küratör ve takı tasarımcıları için detay odaklı 3D üretim.</p>
    </>}
  />
);

export const IndustryDrone = () => (
  <ServicePage
    path="/sektorler/drone-hobi"
    metaTitle="Drone, FPV ve Hobi için Hafif 3D Baskı"
    metaDescription="FPV gövde, koruma kafesi, gimbal aparatı ve drone yedek parçaları için PA-CF ve TPU baskı."
    eyebrow="Drone & Hobi"
    serviceType="Drone & Hobi 3D Baskı"
    title={<>Hafif, dayanıklı, <span className="text-gradient-blue italic font-medium">uçmaya</span> hazır.</>}
    lead="FPV pilotları, drone üreticileri ve hobi geliştiricileri için PA-CF ve TPU özel baskı."
    image={printImg}
    imageAlt="Drone yedek parça 3D baskı"
    highlights={[
      { k: "Malzeme", v: "PA-CF · TPU · ASA" },
      { k: "Ağırlık", v: "Optimize gramaj" },
      { k: "Yedek", v: "Dijital arşiv" },
      { k: "Süre", v: "48 saat" },
    ]}
    faq={[
      { q: "Kendi tasarımımı bastırabilir miyim?", a: "Tabii. STL gönderin, malzeme önerisini biz yapalım." },
      { q: "Hangi malzeme çarpışmaya en dayanıklı?", a: "PA-CF (karbon fiber takviyeli naylon). Esnek kollar için TPU karışık baskı yapılabilir." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85">FPV ve hobi dronelarınız için hafiflik & dayanım dengesini doğru kuruyoruz.</p>
    </>}
  />
);