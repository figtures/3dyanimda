import { Link } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/sections/CTA";
import { breadcrumbSchema, faqSchema, orgSchema, serviceSchema } from "@/lib/seo-schema";
import { ShieldCheck, FileSignature, Boxes, BadgeCheck, Workflow, GitBranch, ScrollText, Mail, Phone, ArrowRight } from "lucide-react";
import { COMPANY } from "@/pages/legal/CompanyInfo";

const FAQ_ITEMS = [
  { q: "NDA (gizlilik sözleşmesi) imzalıyor musunuz?", a: "Evet. Standart karşılıklı NDA şablonumuz vardır; sizinkiyle de çalışırız. NDA imzası genellikle 1 iş günü içinde tamamlanır ve teklif sürecinden önce devreye girer." },
  { q: "ISO 9001 / AS9100 sertifikalarınız var mı?", a: "ISO 9001 uyumlu üretim süreç dokümantasyonumuz hazırdır; sertifikasyon süreci 2026 yol haritamızdadır. AS9100 ve IATF 16949 uyumu için müşteri-tedarikçi denetim formlarımızı sağlayabiliyor, kritik projeler için akredite üçüncü taraf laboratuvarlarla çalışıyoruz." },
  { q: "Parti izlenebilirliği (lot traceability) sağlıyor musunuz?", a: "Evet. Her üretim partisi için lot numarası, malzeme TDS/MSDS, üretim parametreleri (sıcaklık, hız, katman) ve kalite kontrol raporu sunarız." },
  { q: "Düşük adetli seri üretim yapıyor musunuz?", a: "1-5000 adet arası özellikle güçlü olduğumuz aralık. Bu aralıkta enjeksiyon kalıbı yatırımına gerek kalmadan, hibrit FDM/SLS/MJF teknolojileriyle birim maliyeti düşürürüz." },
  { q: "Tedarikçi onay sürecinize katılmamız için ne gerekiyor?", a: "Tedarikçi formunuzu doldurup vergi levhası, faaliyet belgesi, ISO uyum beyanı ve örnek QC raporlarımızı paylaşırız. Kurumsal müşterilerimiz için özel müşteri başarı yöneticisi atarız." },
  { q: "Aylık taahhüt veya çerçeve sözleşme yapıyor musunuz?", a: "Evet. Aylık minimum hacim taahhüdü karşılığında öncelikli üretim slotu, özel fiyatlama ve garantili teslim süreleri sunan çerçeve sözleşme modelimiz var." },
];

const CAPABILITIES = [
  { icon: ShieldCheck, t: "NDA & gizlilik", d: "Karşılıklı NDA, kapalı dosya yönetimi, ürün-bazlı erişim kontrolü." },
  { icon: BadgeCheck, t: "Süreç dokümantasyonu", d: "ISO 9001 uyumlu prosedürler, parti izlenebilirliği, malzeme sertifikaları." },
  { icon: Workflow, t: "Tedarikçi entegrasyonu", d: "SAP/Logo entegrasyonu, EDI tedarikçi formları, e-fatura." },
  { icon: Boxes, t: "Düşük adetli seri", d: "1-5000 adet hibrit FDM/SLS/MJF üretim. Kalıpsız birim maliyet avantajı." },
  { icon: GitBranch, t: "Reverse engineering", d: "±0.02 mm 3D tarama, CAD yeniden üretimi, mühendislik onayı." },
  { icon: ScrollText, t: "Kalite raporlaması", d: "Boyutsal denetim, malzeme uygunluk beyanı, QC fotoğraf raporu." },
];

const INDUSTRIES = [
  "Otomotiv tier-2 / tier-3 tedarikçiler",
  "Savunma & havacılık alt yüklenicileri",
  "Beyaz eşya & dayanıklı tüketim AR-GE",
  "Endüstriyel makine OEM ve servis",
  "Medikal cihaz prototip & klinik öncesi",
  "Mimarlık ofisleri ve şehir maketleri",
];

const ROADMAP = [
  { phase: "1", t: "İlk temas & NDA", d: "İlk görüşmede ihtiyacınızı dinler, gerekirse NDA paylaşır ve 1 iş günü içinde imzalarız." },
  { phase: "2", t: "Teknik fizibilite", d: "Mühendis ekibimiz CAD/STL/foto üzerinden malzeme, teknoloji ve toleransı belirler." },
  { phase: "3", t: "Pilot üretim", d: "1-5 numune ile ilk doğrulama; gerekirse boyutsal denetim raporu eşliğinde teslim." },
  { phase: "4", t: "Çerçeve sözleşme", d: "Onay sonrası aylık taahhüt veya proje bazlı çerçeve sözleşme; özel fiyat + öncelik." },
  { phase: "5", t: "Sürekli üretim", d: "SLA bazlı teslim süreleri, parti raporlaması, müşteri başarı yöneticisi." },
];

export const EnterpriseSolutions = () => {
  const url = "/kurumsal-cozumler";
  const title = "Kurumsal 3D Üretim Çözümleri | NDA · ISO Uyum · Çerçeve Sözleşme";
  const description = "Otomotiv, savunma, havacılık ve endüstriyel OEM'ler için kurumsal 3D üretim. NDA, ISO 9001 uyumlu süreç, parti izlenebilirliği, düşük adetli seri üretim ve çerçeve sözleşme modeli.";

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={url}
        keywords="kurumsal 3d baskı, b2b 3d üretim, tedarikçi 3d baskı, otomotiv yan sanayi 3d, savunma havacılık 3d üretim, çerçeve sözleşme 3d baskı, nda 3d üretim, iso 9001 3d baskı"
        jsonLd={[
          orgSchema(),
          serviceSchema({
            serviceType: "Kurumsal 3D Üretim",
            name: "Kurumsal 3D Üretim Çözümleri",
            description,
            url: `https://3dyaninda.com${url}`,
          }),
          faqSchema(FAQ_ITEMS),
          breadcrumbSchema([
            { label: "Anasayfa", url: "/" },
            { label: "Kurumsal Çözümler" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Kurumsal · B2B"
        breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Kurumsal Çözümler" }]}
        title={<>OEM ve tedarik zincirleri için <span className="text-gradient-blue">kurumsal 3D üretim</span></>}
        lead="NDA, ISO 9001 uyumlu süreç dokümantasyonu, parti izlenebilirliği ve çerçeve sözleşme. Otomotiv, savunma, havacılık ve endüstriyel OEM tedarikçilerine güvenli, izlenebilir, hızlı 3D üretim."
        ctaPrimary={{ label: "Tedarikçi formuna başla", to: "/iletisim" }}
        ctaSecondary={{ label: "NDA talep et", to: `mailto:${COMPANY.email}?subject=NDA%20Talebi` }}
      />

      {/* Yetkinlikler */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container-page">
          <div className="max-w-3xl mb-12">
            <p className="eyebrow">Kurumsal yetkinlikler</p>
            <h2 className="font-display text-3xl md:text-4xl mt-3 text-foreground">
              Tedarik zincirinize uyumlu, denetlenebilir bir 3D üretim ortağı
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((c) => (
              <div key={c.t} className="border border-border rounded-2xl p-6 bg-card shadow-soft hover:shadow-deep transition-shadow">
                <div className="rounded-xl bg-accent-blue-soft p-3 w-fit"><c.icon className="h-5 w-5 text-accent-blue" /></div>
                <h3 className="font-display text-lg font-semibold mt-4">{c.t}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sektörler */}
      <section className="py-16 bg-cream-gradient border-y border-border">
        <div className="container-page">
          <p className="eyebrow">Hizmet verdiğimiz sektörler</p>
          <h2 className="font-display text-2xl md:text-3xl mt-3 text-foreground max-w-2xl">
            Tedarik zincirinin kritik halkalarında çalışıyoruz
          </h2>
          <ul className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {INDUSTRIES.map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <BadgeCheck className="h-4 w-4 text-accent-blue mt-0.5 shrink-0" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Süreç */}
      <section className="py-20 bg-background">
        <div className="container-page">
          <p className="eyebrow">Tedarikçi onay süreci</p>
          <h2 className="font-display text-3xl mt-3 text-foreground max-w-2xl">
            5 adımda tedarikçinize ekleyin
          </h2>
          <ol className="mt-10 grid md:grid-cols-5 gap-4">
            {ROADMAP.map(s => (
              <li key={s.phase} className="border border-border rounded-2xl p-5 bg-card">
                <span className="font-mono text-[11px] text-accent-blue">0{s.phase}</span>
                <h3 className="font-display text-base font-semibold mt-2">{s.t}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Vaka çalışmaları (placeholder hazır) */}
      <section className="py-20 bg-cream-gradient border-y border-border">
        <div className="container-page">
          <p className="eyebrow">Seçili vaka çalışmaları</p>
          <h2 className="font-display text-3xl mt-3 text-foreground max-w-2xl">
            Sayılarla teslim ettiğimiz değer
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {[
              { metric: "%72", label: "Yedek parça temin süresinde kısalma", note: "Otomotiv tier-2 müşterimiz için 6 hafta → 36 saat." },
              { metric: "1480+", label: "Tamamlanan kurumsal proje", note: "Otomotiv, savunma, beyaz eşya AR-GE projeleri dahil." },
              { metric: "24 sa", label: "Hat duruşunda fonksiyonel parça", note: "Hadımköy OSB hat duruşu yedek parça SLA'mız." },
            ].map(c => (
              <div key={c.label} className="border border-border rounded-2xl p-6 bg-card shadow-soft">
                <p className="font-display text-4xl font-semibold text-accent-blue">{c.metric}</p>
                <p className="font-display text-base font-medium mt-2 text-foreground">{c.label}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Detaylı vaka çalışmaları NDA gerektirir. <Link to="/iletisim" className="text-accent-blue underline">İletişime geçin</Link>, sektör/uygulamanıza uygun referansları paylaşalım.
          </p>
        </div>
      </section>

      {/* İçerik */}
      <section className="py-20 bg-background">
        <div className="container-page grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <Prose>
              <h2>Neden enterprise alıcılar bizi tercih ediyor?</h2>
              <p>
                Endüstriyel 3D üretim tedarikçisi seçerken üç şey kritiktir: <strong>tutarlı kalite</strong>,
                <strong> izlenebilir süreç</strong> ve <strong>tedarik zincirine uyum</strong>. 3D Yanında olarak
                bu üçünü kurumsal müşterilerimiz için tek paket halinde sunarız.
              </p>
              <h3>FarPlas, Baykar tipi tedarik zincirine uyum</h3>
              <p>
                Türkiye'nin önde gelen otomotiv ve savunma OEM'leri, tedarikçilerinden NDA, ISO 9001 uyumlu süreç,
                parti izlenebilirliği, malzeme sertifikası ve denetim hakkı talep eder. Bizim altyapımız bu
                gereklilikleri ilk günden karşılar; tedarikçi onay süreciniz bizimle 1-2 hafta sürer.
              </p>
              <h3>Düşük adetli seriye gerçek bir alternatif</h3>
              <p>
                100-5000 adet aralığında plastik parça için enjeksiyon kalıbı maliyeti (50-500 bin ₺) ve süresi
                (6-12 hafta) çoğu zaman gereksizdir. Bizim hibrit FDM/SLS/MJF altyapımızla aynı parçayı kalıp
                yatırımı olmadan, 1-3 hafta içinde, parça başı 5-200 ₺ aralığında üretiyoruz.
              </p>
              <h3>Hat duruşu acil hattı</h3>
              <p>
                Üretim hatlarındaki bozulan ya da artık üretilmeyen parçayı 3D tarama + reverse engineering +
                fonksiyonel baskı ile <strong>24 saatte</strong> yeniden üretiyoruz. Hadımköy OSB, İkitelli OSB,
                Beylikdüzü OSB ve Esenyurt sanayi sitelerine 1-3 saat içi kurye ile teslim.
              </p>
            </Prose>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            <div className="rounded-2xl bg-primary text-primary-foreground p-6 shadow-deep">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/80">
                Kurumsal satış hattı
              </p>
              <h3 className="font-display text-2xl mt-2 leading-tight text-cream">
                Tedarikçi olarak başlayın
              </h3>
              <p className="text-cream/85 text-sm mt-2">
                NDA imzası, tedarikçi formu ve ilk pilot teslimat 5 iş günü içinde.
              </p>
              <div className="mt-5 space-y-2">
                <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-3 text-cream hover:text-gold transition-colors">
                  <Mail className="h-4 w-4" /> <span className="text-sm">{COMPANY.email}</span>
                </a>
                <a href={`tel:${COMPANY.phoneE164}`} className="flex items-center gap-3 text-cream hover:text-gold transition-colors">
                  <Phone className="h-4 w-4" /> <span className="text-sm">{COMPANY.phone}</span>
                </a>
              </div>
              <Link
                to="/iletisim"
                className="mt-5 inline-flex items-center gap-2 bg-cream text-primary font-semibold px-5 py-3 rounded-full hover:bg-gold transition-colors"
              >
                Tedarikçi formu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="border border-border rounded-2xl p-6 bg-card">
              <FileSignature className="h-5 w-5 text-accent-blue" />
              <h3 className="font-display text-base font-semibold mt-3">Hazır kurumsal dokümanlar</h3>
              <ul className="mt-4 space-y-2 text-sm text-foreground">
                <li>· Karşılıklı NDA şablonu</li>
                <li>· Tedarikçi öz-değerlendirme formu</li>
                <li>· Malzeme TDS/MSDS arşivi</li>
                <li>· Örnek parti kalite raporu</li>
                <li>· KVKK aydınlatma & gizlilik metinleri</li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Talep ettiğinizde 1 iş günü içinde paylaşırız.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <FAQ items={FAQ_ITEMS} />
      <CTA />
    </>
  );
};

export default EnterpriseSolutions;
