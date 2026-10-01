import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { CTA } from "@/components/sections/CTA";
import { Target, Compass, HeartHandshake, Sparkles } from "lucide-react";

const values = [
  { icon: Target, t: "Mühendislik disiplini", d: "Her parçada mühendislik tolerans ve ömür hesabı yapıyoruz; gözden değil veriden gidiyoruz." },
  { icon: Compass, t: "Şeffaf süreç", d: "Hangi malzeme, hangi teknoloji, neden? Tüm kararları sizinle birlikte alıyoruz." },
  { icon: HeartHandshake, t: "Uzun ömürlü iş ortağı", d: "Tek seferlik bir iş değil; klasik araç sahibinden endüstriyel firmaya yıllık paylaşım." },
  { icon: Sparkles, t: "El emeği & teknoloji", d: "Otomatize edemediğimiz son işlemleri elimizle bitiriyoruz — fark oradan başlıyor." },
];

const About = () => (
  <>
    <Seo
      title="Hakkımızda — 3D Yanında'nın Hikayesi ve Mühendislik Yaklaşımı"
      description="3D Yanında, oto yedek parça ve endüstriyel parça üretiminde 3D tarama, mühendislik modelleme ve yüksek hassasiyetli baskı sunan Türkiye merkezli dijital üretim atölyesidir."
      path="/hakkimizda"
    />
    <PageHero
      eyebrow="Hakkımızda"
      breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Hakkımızda" }]}
      title={<>Mühendisin elinden, <span className="text-gradient-blue italic font-medium">üretimin ucuna</span> kadar.</>}
      lead="3D Yanında, geleneksel üretimin tıkandığı yerde devreye giren bir dijital üretim atölyesidir. Karmaşık, nadir ya da tedariki zor parçaları 3D ile yeniden üretmek için kuruldu."
    />
    <section className="py-20 lg:py-28 bg-background">
      <div className="container-page grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          <Prose>
            <h2>Vizyonumuz</h2>
            <p>Türkiye'de oto yedek parça, endüstriyel ve özel üretim ihtiyaçlarının dijital üretim ile çözüldüğü bir gelecek için çalışıyoruz. Bir parçanın bulunamadığı için araçların yıllarca garajda beklemesi, üretim hatlarının küçük bir aparat yüzünden günlerce durması bizim ortadan kaldırmak istediğimiz problemler.</p>
            <h2>Misyonumuz</h2>
            <p>Mühendislik kalitesinde, şeffaf süreçle ve insan eliyle bitirilmiş parçalar üretmek. Hızlı ama özensiz değil; yavaş ama uzaktan değil.</p>
            <h2>Neden 3D Yanında?</h2>
            <ul>
              <li>Türkiye'nin her yerine ulaşabilen bir dijital üretim ortağı.</li>
              <li>Mühendislik ekibimizin denetiminden geçmemiş hiçbir parça baskıya gönderilmez.</li>
              <li>Otomotivden sanat eserine, geniş bir uygulama tecrübesi.</li>
              <li>Şeffaf fiyatlandırma, ücretsiz ön teklif, garantili teslim.</li>
            </ul>
            <h2>Ekibimiz</h2>
            <p>Makine mühendisleri, endüstriyel tasarımcılar ve baskı operatörlerinden oluşan küçük ama disiplinli bir ekibiz. Her projeyi tek bir sorumlu mühendisin yönetmesi, iletişimde size kolaylık ve sürekliliği garantiler.</p>
          </Prose>
        </div>
        <aside className="lg:col-span-5 space-y-3 lg:sticky lg:top-28">
          {values.map((v) => (
            <div key={v.t} className="border border-border rounded-2xl p-6 bg-card shadow-soft hover:shadow-deep transition-shadow">
              <div className="rounded-lg bg-accent-blue-soft p-2 inline-flex"><v.icon className="h-5 w-5 text-accent-blue" /></div>
              <h3 className="font-display text-lg font-semibold tracking-tight mt-3">{v.t}</h3>
              <p className="text-foreground/70 mt-1.5 text-sm leading-relaxed">{v.d}</p>
            </div>
          ))}
        </aside>
      </div>
    </section>
    <CTA />
  </>
);

export default About;