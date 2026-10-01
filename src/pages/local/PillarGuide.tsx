import { Link } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { CTA } from "@/components/sections/CTA";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo-schema";

const FAQ = [
  { q: "İstanbul'da 3D baskı yaptırmak ne kadar sürer?", a: "Aynı gün motokurye opsiyonumuzla acil işler birkaç saat içinde, standart işler 24-72 saatte teslim edilir." },
  { q: "İstanbul'da 3D baskı kaç para?", a: "Setup 35 ₺ + hacim × malzeme fiyatı + kalite çarpanı. Tipik bir 50 cm³ PLA parça ~150-250 ₺ aralığındadır. STL ile anlık fiyat görebilirsiniz." },
  { q: "Hangi 3D baskı teknolojisi en iyisi?", a: "İhtiyaca göre: prototip için FDM (PLA/PETG), yüksek detay için SLA (reçine), dayanım için SLS (PA12), ısı dayanımı için MJF veya ABS." },
  { q: "STL dosyam yok — nasıl baskı alabilirim?", a: "Fotoğraf, eskiz veya elinizdeki numuneyi gönderin; mühendislik ekibimiz CAD modelini oluşturur, sonra basarız." },
];

const TOC = [
  ["1", "3D Baskı Nedir?", "#nedir"],
  ["2", "İstanbul'daki Kullanım Alanları", "#kullanim"],
  ["3", "Teknolojiler: FDM, SLA, SLS, MJF", "#teknolojiler"],
  ["4", "Malzeme Seçimi", "#malzeme"],
  ["5", "Fiyat Hesaplama", "#fiyat"],
  ["6", "Doğru Hizmet Sağlayıcı Seçimi", "#secim"],
  ["7", "Sıkça Sorulan Sorular", "#sss"],
] as const;

export const PillarGuide = () => (
  <>
    <Seo
      title="İstanbul 3D Baskı Rehberi 2026 | Teknolojiler, Fiyatlar ve Kullanım"
      description="İstanbul'da 3D baskı: teknolojiler (FDM, SLA, SLS, MJF), malzemeler, fiyatlandırma, hizmet sağlayıcı seçimi ve sektörel kullanım alanları. Kapsamlı uzman rehberi."
      path="/rehber/istanbul-3d-baski-rehberi"
      type="article"
      keywords="istanbul 3d baskı rehberi, 3d baskı nedir, 3d baskı fiyatları, 3d baskı teknolojileri, fdm sla sls mjf, 3d baskı malzemeleri"
      jsonLd={[
        articleSchema({
          title: "İstanbul 3D Baskı Rehberi 2026",
          description: "İstanbul'da 3D baskı için kapsamlı uzman rehberi.",
          url: "https://3dyaninda.com/rehber/istanbul-3d-baski-rehberi",
        }),
        faqSchema(FAQ),
        breadcrumbSchema([
          { label: "Anasayfa", url: "/" },
          { label: "Rehber" },
          { label: "İstanbul 3D Baskı Rehberi" },
        ]),
      ]}
    />

    <PageHero
      eyebrow="Pillar · Rehber"
      breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Rehber", to: "/blog" }, { label: "İstanbul 3D Baskı Rehberi" }]}
      title={<>İstanbul <span className="text-gradient-blue">3D Baskı</span> Rehberi</>}
      lead="Teknolojiler, malzemeler, fiyatlar ve doğru hizmet sağlayıcısı nasıl seçilir — uzman ekibimizden 2026 güncel rehber."
      ctaPrimary={{ label: "STL ile teklif al", to: "/teklif-al" }}
      ctaSecondary={{ label: "İlçenize göre fiyat", to: "/istanbul-3d-baski" }}
    />

    <section className="py-16 lg:py-24 bg-background">
      <div className="container-page grid lg:grid-cols-12 gap-12">
        {/* TOC sticky */}
        <aside className="lg:col-span-3 lg:sticky lg:top-28 self-start">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">İçindekiler</p>
          <ol className="space-y-2 text-sm">
            {TOC.map(([n, t, h]) => (
              <li key={h}><a className="text-foreground/75 hover:text-accent-blue transition-colors" href={h}>{n}. {t}</a></li>
            ))}
          </ol>
        </aside>

        <div className="lg:col-span-9">
          <Prose>
            <h2 id="nedir">1. 3D Baskı Nedir?</h2>
            <p>
              <strong>3D baskı</strong> (additive manufacturing / katmanlı imalat), bilgisayarda tasarlanmış 3 boyutlu
              modellerin fiziksel parçalara dönüştürüldüğü üretim teknolojisidir. Geleneksel imalattan farklı olarak
              malzemeyi <em>çıkararak</em> değil, <em>katman katman ekleyerek</em> üretir. Bu sayede karmaşık iç geometriler,
              kalıpsız üretim ve hızlı prototipleme mümkün olur.
            </p>
            <p>
              İstanbul, Türkiye'nin 3D baskı ekosisteminin merkezi konumundadır. Tasarım stüdyolarından otomotiv yan sanayisine,
              dental laboratuvarlardan eğitim kurumlarına kadar binlerce farklı kullanıcı her gün 3D baskı hizmeti almaktadır.
            </p>

            <h2 id="kullanim">2. İstanbul'daki Kullanım Alanları</h2>
            <p>
              İstanbul'da 3D baskı talebi genel olarak şu sektörlerden gelir:
            </p>
            <ul>
              <li><strong>Otomotiv yedek parça:</strong> Klasik araç restorasyonu, üretimi durmuş parçalar (özellikle Pendik, Tuzla, Maslak ve sanayi siteleri).</li>
              <li><strong>Mimari maket ve konsept:</strong> Taksim, Beşiktaş, Şişli, Levent çevresi tasarım ofisleri.</li>
              <li><strong>Medikal ve dental:</strong> Şişli, Bakırköy, Ataşehir bölgesindeki klinikler için cerrahi rehber, anatomik model.</li>
              <li><strong>Mücevher ve döküm modeli:</strong> Grand Bazaar civarı (Fatih, Beyazıt) için yüksek hassasiyet SLA reçine.</li>
              <li><strong>Endüstriyel prototip:</strong> Ümraniye, İkitelli, Ataşehir mühendislik firmaları.</li>
              <li><strong>Kişisel ürün ve hediyelik:</strong> Tüm ilçelerden gelen tekil sipariş.</li>
            </ul>

            <h2 id="teknolojiler">3. Teknolojiler: FDM, SLA, SLS, MJF</h2>
            <h3>FDM (Fused Deposition Modeling)</h3>
            <p>
              En yaygın 3D baskı teknolojisi. Erimiş plastik filament (PLA, PETG, ABS, TPU) katman katman ekstrüde edilir.
              <strong> Avantajları:</strong> ekonomik, geniş malzeme yelpazesi, büyük baskı hacmi.
              <strong> Dezavantajı:</strong> katman izi görünür.
            </p>
            <h3>SLA (Stereolithography) / DLP</h3>
            <p>
              UV ışıkla sertleşen reçine kullanılır. <strong>Detay seviyesi en yüksek</strong> teknolojidir. Mücevher, dental, minyatür,
              cerrahi rehber için ideal. Dezavantajı: kırılgan ve sınırlı boyut.
            </p>
            <h3>SLS (Selective Laser Sintering)</h3>
            <p>
              Naylon (PA12) tozunu lazerle sinterlenmesiyle üretim. <strong>Destek malzemesi gerekmez</strong>, mühendislik dayanımı yüksektir.
              Fonksiyonel parça, mafsal mekanizmaları, drone gövdesi için en uygun seçim.
            </p>
            <h3>MJF (Multi Jet Fusion / HP)</h3>
            <p>
              SLS'e benzer ama daha hızlı ve daha pürüzsüz yüzey. Endüstriyel seri üretim için ideal.
            </p>

            <h2 id="malzeme">4. Malzeme Seçimi</h2>
            <ul>
              <li><strong>PLA</strong> — Prototip, dekoratif, eğitim. Ucuz, kolay basılır. Isı dayanımı düşük (~60°C).</li>
              <li><strong>PETG</strong> — Genel amaçlı dayanıklı. Şişe, kap, fonksiyonel parça.</li>
              <li><strong>ABS / ASA</strong> — Otomotiv aksesuar, dış mekan. Yüksek ısı dayanımı.</li>
              <li><strong>TPU</strong> — Esnek (kauçuk benzeri). Conta, kılıf, darbe emici.</li>
              <li><strong>PA12 / PA-CF</strong> — Endüstriyel. Mafsal, kanca, yedek parça.</li>
              <li><strong>Reçine</strong> — Yüksek detay. Mücevher, dental, minyatür.</li>
            </ul>

            <h2 id="fiyat">5. Fiyat Hesaplama</h2>
            <p>
              3D baskı fiyatı dört temel etkene bağlıdır:
            </p>
            <ol>
              <li><strong>Hacim (cm³):</strong> Modelin doluluk dahil malzeme miktarı.</li>
              <li><strong>Malzeme fiyatı (₺/g):</strong> PLA ~6 ₺/g, PETG ~8, ABS ~9, TPU ~14, PA12 ~28, reçine ~18.</li>
              <li><strong>Kalite (katman kalınlığı):</strong> 0.28 mm taslak ucuz, 0.08 mm ultra +%70.</li>
              <li><strong>Adet:</strong> 5+ %8, 10+ %15 indirim.</li>
            </ol>
            <p>
              Sitemizdeki <Link to="/teklif-al">anlık fiyat hesaplayıcımıza</Link> STL dosyanızı yükleyerek saniyeler içinde
              tahmini fiyat görebilirsiniz.
            </p>

            <h2 id="secim">6. Doğru Hizmet Sağlayıcı Seçimi</h2>
            <p>İstanbul'da 3D baskı yaptıracaksanız değerlendirmeniz gerekenler:</p>
            <ul>
              <li><strong>Mühendislik desteği:</strong> Sadece basan değil, parçanın çalışmasını da düşünen ekip.</li>
              <li><strong>Teknoloji çeşitliliği:</strong> FDM/SLA/SLS hepsini sağlayabilen.</li>
              <li><strong>Anlık fiyat:</strong> Beklemeden fiyat görebileceğiniz online sistem.</li>
              <li><strong>Lokal teslimat:</strong> İstanbul içi motokurye opsiyonu.</li>
              <li><strong>Referanslar:</strong> Sektörel deneyim — özellikle otomotiv/medikal gibi hassas alanlarda.</li>
            </ul>

            <h2 id="sss">7. Sıkça Sorulan Sorular</h2>
            <p>İstanbul 3D baskı hakkında kullanıcılarımızın en sık sorduğu sorular:</p>
          </Prose>

          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            {FAQ.map((q) => (
              <details key={q.q} className="rounded-xl border border-border bg-card p-5 group">
                <summary className="cursor-pointer font-medium text-foreground list-none flex items-start justify-between gap-3">
                  <span>{q.q}</span>
                  <span className="text-accent-blue group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{q.a}</p>
              </details>
            ))}
          </div>

          {/* Cluster blog link silosu */}
          <div className="mt-14 border-t border-border pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue mb-4">Daha derinleş</p>
            <h3 className="font-display text-2xl font-semibold tracking-tight mb-5">İlgili teknik yazılar</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["istanbulda-3d-baski-fiyatlari-2026", "İstanbul'da 3D Baskı Fiyatları 2026"],
                ["fdm-vs-sla-vs-sls-hangi-teknoloji", "FDM vs SLA vs SLS — Hangi teknoloji?"],
                ["asa-vs-pa-cf-otomotiv", "Otomotiv: ASA mı, PA-CF mi?"],
                ["stl-dosya-baskiya-hazirlama", "STL Dosyanızı Baskıya Hazırlama"],
                ["klasik-arac-yedek-parca-3d-baski", "Klasik Araç Yedek Parça Rehberi"],
                ["reverse-engineering-rehber", "Reverse Engineering Rehberi"],
              ].map(([slug, title]) => (
                <Link key={slug} to={`/blog/${slug}`} className="group rounded-xl border border-border bg-card p-4 hover:shadow-deep hover:border-accent-blue/40 transition-all">
                  <span className="font-medium text-foreground group-hover:text-accent-blue transition-colors">{title} →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    <CTA />
  </>
);

export default PillarGuide;