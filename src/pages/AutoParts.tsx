import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { FAQ, faqJsonLd } from "@/components/site/FAQ";
import { CTA } from "@/components/sections/CTA";
import { CheckCircle2, Car, Wrench, Cog, ShieldCheck, Timer, Layers } from "lucide-react";
import autoImg from "@/assets/auto-parts-collection.jpg";

const faq = [
  { q: "Hangi oto yedek parçaları 3D ile yeniden üretilebilir?", a: "Plastik trim, klips, braket, kapı kolu, kontrol düğmeleri, anahtar muhafazaları, ızgaralar, hava kanalı parçaları, far halkaları ve birçok metal-eşdeğer aparat 3D tarama ve baskı ile yeniden üretilebilir. Yapısal şasi parçaları gibi yüksek mukavemet gerektiren parçalar için mühendis ekibimiz uygunluk değerlendirmesi yapar." },
  { q: "Mevcut parça kırık veya eksik. Yine de üretilebilir mi?", a: "Evet. Aynı modelin sağlam bir örneğine ulaşılabiliyorsa onu tarıyoruz. Ulaşılamıyorsa orijinal teknik resimler, fotoğraflar veya benzer model parçalarından yola çıkarak mühendislik modeli oluşturuyoruz. Kırık parçalar, dijital onarım sonrası baskıya hazır hale getirilir." },
  { q: "Üretim ne kadar sürüyor?", a: "Standart prototip üretim 48 saat, mühendislik modelleme gerektiren karmaşık parçalar 5–10 iş günü, klasik araç restorasyon parçaları ise parça kompleksitesine göre 7–14 iş günü içinde teslim edilir." },
  { q: "Hangi malzemeler kullanılıyor?", a: "ABS, ASA, PETG, PLA Pro, PA-CF (karbon fiber takviyeli naylon), TPU (esnek), reçine (SLA) ve SLS naylon. Otomotiv iç-dış trim için UV-dayanımlı ASA ve sıcaklık dayanımı yüksek PA-CF en sık tercih edilen seçenekler." },
  { q: "Türkiye'nin her yerine kargo gönderiyor musunuz?", a: "Evet. Anlaşmalı kargo firmaları ile Türkiye geneli aynı/ertesi gün gönderim yapıyoruz. İstanbul içi kurye seçeneği de mevcut." },
  { q: "Teklifim ücretli mi?", a: "Hayır. STL dosya yüklemesi, fotoğraf ya da yazılı açıklama ile ön teklifimiz tamamen ücretsizdir; 24 saat içinde size dönüyoruz." },
];

const useCases = [
  { icon: Car, t: "Klasik araç restorasyonu", d: "1960–1990 arası modeller için artık üretilmeyen iç-dış trim, kapı kolları, far halkaları ve özel aparatlar." },
  { icon: Wrench, t: "Modern araç eksik parçaları", d: "Türkiye'de stokta olmayan, yurt dışından beklenen plastik tutucular, klips, kapaklar ve braketler." },
  { icon: Cog, t: "Performans & modifiye", d: "Hava kanalı adaptörleri, intake kapağı, gösterge konsolu ve kişiye özel iç döşeme parçaları." },
  { icon: Layers, t: "Ticari & iş makinesi", d: "Üretim hattınız durmasın diye iş makinesi, ticari araç ve forklift parçalarında 3 günlük teslim." },
];

const AutoParts = () => (
  <>
    <Seo
      title="Oto Yedek Parça 3D Üretim — Bulunamayan Parçayı Yeniden Üretiyoruz"
      description="Türkiye'de bulunamayan, üretimi durmuş ya da yurt dışından beklenen oto yedek parçaları 3D tarama, mühendislik modelleme ve yüksek hassasiyetli 3D baskı ile yeniden üretiyoruz. STL dosyanızla 24 saatte teklif."
      path="/oto-yedek-parca-3d-uretim"
      jsonLd={[
        faqJsonLd(faq),
        {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Oto yedek parça 3D üretim",
          provider: { "@type": "Organization", name: "3D Yanında", url: "https://3dyaninda.com" },
          areaServed: "TR",
          description: "Bulunamayan oto yedek parçaların 3D tarama ve baskı ile yeniden üretimi.",
        },
      ]}
    />

    <PageHero
      eyebrow="Çözüm · Otomotiv"
      breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Çözümler", to: "/hizmetler" }, { label: "Oto Yedek Parça" }]}
      title={<>Bulunamayan oto yedek parçayı <span className="text-gradient-blue italic font-medium">yeniden</span> üretiyoruz.</>}
      lead="Türkiye'nin herhangi bir noktasından kırık bir klips, üretimi durmuş bir trim parçası ya da klasik aracınızın özel bir aparatı için bize ulaşın. 3D tarama, mühendislik düzeltmesi ve doğru malzeme ile parçanızı orijinaline en yakın şekilde 3 boyutlu olarak basıyoruz."
      ctaPrimary={{ label: "Ücretsiz teklif al", to: "/teklif-al" }}
      ctaSecondary={{ label: "Bize ulaşın", to: "/iletisim" }}
    />

    {/* Intro & image */}
    <section className="py-20 lg:py-28 bg-background">
      <div className="container-page grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          <Prose>
            <p className="lead text-xl text-foreground/85">
              <strong>Oto yedek parçada beklemek artık zorunluluk değil.</strong> Yurt dışından gelmesini beklediğiniz, sanayide bulunamayan ya da hiç üretilmeyen
              parçaları, mevcut bir örnekten yola çıkarak 3 boyutlu olarak yeniden üretiyoruz. Türkiye geneli hizmet veriyor, mühendislik kalitesinde
              CAD modelleme ve OEM eşdeğer malzemelerle uzun ömürlü çözümler sunuyoruz.
            </p>

            <h2>Hangi parçaları 3D üretebiliriz?</h2>
            <p>
              Otomotivde 3D baskı en çok <strong>plastik iç-dış trim, tutucu klips, braket, kapak ve mahfaza, kapı kolu, far halkası, ızgara,
              hava kanalı ve gösterge konsolu</strong> gibi parçalar için kullanılır. Doğru malzeme seçildiğinde — ASA, PA-CF, ABS — üretilen parça
              orijinal OEM parçaya eşdeğer mukavemet ve UV dayanımı sergiler. Yapısal şasi parçaları, frenleme veya emniyet sistemleriyle ilgili
              kritik bileşenler için ise mühendis ekibimiz öncesinde uygunluk değerlendirmesi yapar; uygun olmayan vakalarda alternatif çözümler önerir.
            </p>

            <h2>Süreç nasıl işliyor?</h2>
            <ol>
              <li><strong>Parçayı tanıyalım.</strong> Mevcut parçanın fotoğrafını, ölçülerini veya STL/STEP dosyasını bize iletin. Parça elimize ulaşırsa el tipi yapılandırılmış ışık tarayıcı ile ±0.02 mm hassasiyetinde dijital ikizini çıkartırız.</li>
              <li><strong>Mühendislik düzeltmesi.</strong> Kırık, deforme veya eksik bölgeler dijital ortamda yeniden modellenir. Gerekirse parçanın zayıf bölgelerine ek mukavemet (kaburga, et kalınlığı, dolgu yoğunluğu) önerilir.</li>
              <li><strong>Malzeme & teknoloji seçimi.</strong> Parça motor odasında mı, iç döşemede mi, dış cephede mi kullanılacak? Bu üç soruya göre FDM (PA-CF / ASA), SLA (yüksek detay reçine) veya SLS (naylon) tercih edilir.</li>
              <li><strong>Üretim & son işlem.</strong> Baskı sonrası gerekirse zımpara, polisaj, primer + boya, montaj delikleri için işleme ve kalite kontrol uygulanır.</li>
              <li><strong>Teslimat.</strong> Türkiye geneli kargo, İstanbul içi kurye. Garantili teslim, bozuk parçada ücretsiz yenileme.</li>
            </ol>

            <h2>Klasik araç restorasyonunda 3D baskı</h2>
            <p>
              1960–1990 arası modellerin yedek parça stokları büyük ölçüde tükenmiş durumda. <strong>Mercedes W123, BMW E30, Renault 12, Tofaş Şahin, Ford Taunus, Anadol, Murat 124</strong> gibi ikonik araçların
              kırılan plastik trim parçaları, gösterge çerçeveleri, kapı kol kapakları, hava kanal ızgaraları ve tutucularını mevcut bir örnekten ya da
              orijinal teknik resimlerden tarayıp basıyoruz. Üretilen parçaların görsel olarak orijinaline sadık kalması için yüzey dokusu ve renk eşleştirmesi
              gerektiğinde uyguluyoruz.
            </p>

            <h2>Hangi malzemeyi seçmeliyim?</h2>
            <p>
              Otomotiv uygulamalarında en sık tercih edilen malzemeler:
            </p>
            <ul>
              <li><strong>ASA</strong> — UV ve hava şartlarına dayanıklı, dış cephe trim parçaları için ideal.</li>
              <li><strong>PA-CF (karbon fiber takviyeli naylon)</strong> — Yüksek mukavemet ve sıcaklık dayanımı; motor odası ve yapısal aparatlar için.</li>
              <li><strong>ABS</strong> — Dayanıklı, işlenebilir, boyanabilir; iç trim ve gösterge parçaları için.</li>
              <li><strong>SLA reçine</strong> — Yüksek detay; far halkaları, küçük dekoratif aparatlar.</li>
              <li><strong>SLS naylon</strong> — Karmaşık geometriler ve kanca/klips gibi esneklik isteyen parçalar.</li>
            </ul>

            <h2>Türkiye geneli hizmet ve ulaşım</h2>
            <p>
              Atölyemiz İstanbul'da olmakla birlikte <strong>İstanbul, Ankara, İzmir, Bursa, Antalya, Adana, Konya, Gaziantep, Kayseri, Trabzon, Eskişehir, Samsun, Mersin, Diyarbakır</strong> ve
              tüm Türkiye geneline anlaşmalı kargo firmaları ile 1–2 iş gününde teslimat sağlıyoruz. Parça gönderimi gerekiyorsa karşılıklı kargo
              prosedürünü biz organize ediyoruz; siz parçayı poşete koyup kargoya teslim ediyorsunuz, gerisini biz hallediyoruz.
            </p>
          </Prose>
        </div>
        <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
          <img src={autoImg} alt="3D baskı oto yedek parça örnekleri" className="w-full h-auto rounded-2xl shadow-deep aspect-[4/3] object-cover ring-1 ring-border" />
          <div className="border border-border rounded-2xl p-6 bg-card shadow-soft space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue">Hızlı bilgiler</p>
            <Info icon={Timer} k="Teslim" v="48 saat – 14 gün" />
            <Info icon={ShieldCheck} k="Garanti" v="Bozuk parçada ücretsiz yenileme" />
            <Info icon={Layers} k="Malzeme" v="ASA · PA-CF · ABS · Reçine · SLS" />
            <Info icon={CheckCircle2} k="Hizmet alanı" v="Türkiye geneli" />
          </div>
        </aside>
      </div>
    </section>

    {/* use cases */}
    <section className="py-20 lg:py-28 bg-cream-gradient">
      <div className="container-page">
        <p className="eyebrow">Kullanım alanları</p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mt-4 max-w-3xl text-balance">
          Otomotivde 3D üretim <span className="text-accent-blue italic font-medium">tam olarak</span> nerede işe yarar?
        </h2>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {useCases.map((u) => (
            <div key={u.t} className="bg-card border border-border rounded-2xl p-7 shadow-soft hover:shadow-deep transition-shadow">
              <div className="rounded-lg bg-accent-blue-soft p-2.5 inline-flex">
                <u.icon className="h-5 w-5 text-accent-blue" />
              </div>
              <h3 className="font-display text-xl font-semibold tracking-tight mt-4">{u.t}</h3>
              <p className="text-foreground/70 mt-2 leading-relaxed">{u.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <FAQ items={faq} title="Oto yedek parça 3D üretim hakkında merak edilenler" />
    <CTA />
  </>
);

const Info = ({ icon: I, k, v }: { icon: React.ComponentType<{ className?: string }>; k: string; v: string }) => (
  <div className="flex items-start gap-3 text-sm">
    <I className="h-4 w-4 mt-0.5 text-accent-blue shrink-0" />
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{k}</p>
      <p className="text-foreground font-medium">{v}</p>
    </div>
  </div>
);

export default AutoParts;