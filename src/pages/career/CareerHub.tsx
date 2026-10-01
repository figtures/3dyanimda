import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import * as Icons from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import {
  ArrowUpRight,
  Briefcase,
  Cpu,
  Shield,
  Zap,
  Users,
  Award,
  MapPin,
  Clock,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Building2,
  Wrench,
  ScanLine,
  PenTool,
} from "lucide-react";

export default function CareerHub() {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [dbRoles, setDbRoles] = useState<Role[]>([]);

  useEffect(() => {
    supabase.from("job_postings")
      .select("title_tr, title_en, location, employment_type, level, icon, summary_tr, summary_en")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!data) return;
        setDbRoles(data.map((r: any) => {
          const IconComp = (Icons as any)[r.icon] ?? Briefcase;
          return {
            title: isEn && r.title_en ? r.title_en : r.title_tr,
            type: r.employment_type ?? "Tam Zamanlı",
            location: r.location ?? "Beylikdüzü / İstanbul",
            level: r.level ?? "",
            icon: IconComp,
            summary: isEn && r.summary_en ? r.summary_en : (r.summary_tr ?? ""),
          };
        }));
      });
  }, [isEn]);

  const roles = dbRoles.length > 0 ? dbRoles : OPEN_ROLES;

  return (
    <>
      <Seo
        title="Kariyer & İş Ortaklığı"
        description="3D Yanında ekibine katılın veya makinenizi bizimle işletin. İstanbul Beylikdüzü merkezli, savunma ve havacılık sektöründe deneyimli mühendislik ekibi."
        path="/kariyer"
        keywords="3d baskı iş ilanı, 3d tarama mühendisi, additive manufacturing kariyer, makine işletim ortaklığı"
      />
      <PageHero
        eyebrow="Kariyer · İş Ortaklığı"
        title={<>Üretimin <em className="text-accent-blue not-italic">geleceğini</em> birlikte kuralım.</>}
        lead="3D Yanında, savunma ve havacılık standartlarında üretim yapan butik bir mühendislik stüdyosudur. Yetenekli mühendisler ve atıl kapasitesini değerlendirmek isteyen makine sahipleri için iki ayrı yol açıyoruz."
        breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Kariyer" }]}
      />

      <section className="bg-background py-20 lg:py-28">
        <div className="container-page">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 lg:gap-8">
            <PathCard
              to="/kariyer/is-basvurusu"
              icon={Briefcase}
              tag="Kadromuza Katıl"
              title="İş Başvurusu"
              desc="Mühendislik, üretim ve operasyon pozisyonlarımız için başvurun. Kıdem ve uzmanlık seviyesine göre değerlendirme yapıyoruz."
              perks={["Hibrit / esnek çalışma", "Pazara üstü ekipman", "Eğitim & sertifikasyon bütçesi", "Sürpriz yıllık bonus"]}
              cta="Başvuru formuna git"
            />
            <PathCard
              to="/kariyer/makine-isletim"
              icon={Cpu}
              tag="Makineni Değerlendir"
              title="Makinemi Siz İşletin"
              desc="Kullanılmayan ya da düşük kapasiteyle çalışan 3D yazıcınızı/tarayıcınızı stüdyomuza alıyor, sizin adınıza işletip aylık gelir paylaşımı yapıyoruz."
              perks={["Şeffaf gelir paylaşımı", "7/24 izlenebilirlik", "Profesyonel bakım & kalibrasyon", "Sigorta & sorumluluk garantisi"]}
              cta="Talep formuna git"
            />
          </div>

          <div className="max-w-5xl mx-auto mt-20 lg:mt-28">
            <div className="text-center mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-blue mb-3">Neden 3D Yanında?</p>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary tracking-[-0.02em]">
                Türkiye'nin önde gelen <em className="text-accent-blue not-italic">savunma & otomotiv</em> markalarıyla çalışıyoruz.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat icon={Shield} value="ISO 9001" label="Kalite Sistemi" />
              <Stat icon={Award} value="±0.02 mm" label="Tarama Hassasiyeti" />
              <Stat icon={Zap} value="24 saat" label="Ön Teklif Süresi" />
              <Stat icon={Users} value="1480+" label="Tamamlanan Proje" />
            </div>
          </div>

          {/* Açık Pozisyonlar */}
          <div className="max-w-5xl mx-auto mt-24 lg:mt-32">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-blue mb-3">Açık Pozisyonlar</p>
                <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary tracking-[-0.02em]">
                  Şu an <em className="text-accent-blue not-italic">aradığımız</em> roller.
                </h2>
              </div>
              <Link to="/kariyer/is-basvurusu" className="text-[13px] font-medium text-accent-blue inline-flex items-center gap-1 hover:gap-2 transition-all">
                Tümüne başvur <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {roles.map((r) => (
                <RoleCard key={r.title} {...r} />
              ))}
            </div>
          </div>

          {/* Süreç */}
          <div className="max-w-5xl mx-auto mt-24 lg:mt-32">
            <div className="text-center mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-blue mb-3">Başvuru Süreci</p>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary tracking-[-0.02em]">
                4 adımda netlik. <em className="text-accent-blue not-italic">Ortalama 10 gün.</em>
              </h2>
            </div>
            <ol className="grid md:grid-cols-4 gap-4">
              {PROCESS.map((p, i) => (
                <li key={p.title} className="relative rounded-2xl border border-border bg-card p-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-blue">0{i + 1}</span>
                  <h3 className="font-display text-lg font-semibold text-primary mt-2 mb-2 tracking-[-0.01em]">{p.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{p.desc}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Kültür */}
          <div className="max-w-5xl mx-auto mt-24 lg:mt-32">
            <div className="text-center mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-blue mb-3">Kültür & Yan Haklar</p>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary tracking-[-0.02em]">
                Mühendisin merkezde olduğu <em className="text-accent-blue not-italic">butik bir stüdyo.</em>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CULTURE.map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
                  <c.icon className="h-5 w-5 text-accent-blue mb-3" />
                  <h3 className="font-display text-base font-semibold text-primary mb-1.5">{c.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SSS */}
          <div className="max-w-3xl mx-auto mt-24 lg:mt-32">
            <div className="text-center mb-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-blue mb-3">Sıkça Sorulanlar</p>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary tracking-[-0.02em]">
                Başvurmadan önce.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                    <span className="font-display text-[16px] font-medium text-primary">{f.q}</span>
                    <span className="font-mono text-accent-blue text-lg leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-[14px] text-muted-foreground leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="max-w-5xl mx-auto mt-24 lg:mt-32">
            <div className="rounded-3xl bg-primary text-cream p-10 lg:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(60% 50% at 50% 0%, hsl(217 80% 45% / 0.5), transparent 70%)" }} aria-hidden />
              <div className="relative">
                <Sparkles className="h-6 w-6 text-gold mx-auto mb-4" />
                <h2 className="font-display text-3xl lg:text-4xl font-semibold tracking-[-0.02em]">
                  Aradığın rol listede yok mu?
                </h2>
                <p className="text-cream/75 mt-3 max-w-xl mx-auto">
                  Yetenekli mühendisleri her zaman değerlendiriyoruz. Açık başvuru bırak, üretim ekibimiz inceleyip dönüş yapsın.
                </p>
                <Link
                  to="/kariyer/is-basvurusu"
                  className="inline-flex items-center gap-2 mt-6 bg-cream text-primary font-semibold px-6 py-3 rounded-md hover:bg-gold transition-colors"
                >
                  Açık başvuru gönder <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const PathCard = ({
  to, icon: Icon, tag, title, desc, perks, cta,
}: {
  to: string; icon: React.ComponentType<{ className?: string }>;
  tag: string; title: string; desc: string; perks: string[]; cta: string;
}) => (
  <Link
    to={to}
    className="group relative rounded-3xl bg-card border border-border p-8 lg:p-10 hover:border-accent-blue hover:shadow-[0_30px_80px_-30px_hsl(217_78%_48%/0.35)] transition-all overflow-hidden"
  >
    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-blue-soft/40 blur-3xl group-hover:bg-accent-blue/15 transition-colors" aria-hidden />
    <div className="relative">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-blue-soft mb-6 group-hover:bg-accent-blue group-hover:text-white transition-colors">
        <Icon className="h-6 w-6 text-accent-blue group-hover:text-white transition-colors" />
      </span>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue mb-2">{tag}</p>
      <h3 className="font-display text-2xl lg:text-[28px] font-semibold text-primary mb-3 tracking-[-0.02em]">{title}</h3>
      <p className="text-muted-foreground leading-relaxed mb-6">{desc}</p>
      <ul className="space-y-2 mb-8">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[14px] text-foreground/85">
            <span className="mt-2 h-1 w-1 rounded-full bg-accent-blue shrink-0" />
            {p}
          </li>
        ))}
      </ul>
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary group-hover:text-accent-blue transition-colors">
        {cta} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </div>
  </Link>
);

const Stat = ({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5 text-center">
    <Icon className="h-5 w-5 text-accent-blue mx-auto mb-2.5" />
    <p className="font-display text-xl font-semibold text-primary">{value}</p>
    <p className="text-[12px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">{label}</p>
  </div>
);

type Role = {
  title: string;
  type: string;
  location: string;
  level: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
};

const OPEN_ROLES: Role[] = [
  {
    title: "3D Tarama & Reverse Engineering Mühendisi",
    type: "Tam Zamanlı",
    location: "Beylikdüzü / İstanbul",
    level: "Mid – Senior",
    icon: ScanLine,
    summary: "Mavi ışık / lazer tarayıcılarla saha ve atölye taraması, mesh işleme, GD&T ölçüm raporlama.",
  },
  {
    title: "Additive Manufacturing CAD Tasarımcısı",
    type: "Tam Zamanlı",
    location: "Beylikdüzü / İstanbul",
    level: "Mid",
    icon: PenTool,
    summary: "SolidWorks / Fusion 360 ile reverse-engineering, parametrik modelleme, üretilebilirlik optimizasyonu.",
  },
  {
    title: "3D Baskı Üretim Operatörü (FDM/SLA/SLS)",
    type: "Tam Zamanlı · Vardiya",
    location: "Beylikdüzü / İstanbul",
    level: "Junior – Mid",
    icon: Wrench,
    summary: "Slicer hazırlık, makine kalibrasyonu, post-process, kalite kontrol ve raporlama.",
  },
  {
    title: "Satış & Teknik Proje Sorumlusu",
    type: "Tam Zamanlı",
    location: "Hibrit · İstanbul",
    level: "Mid",
    icon: Building2,
    summary: "Kurumsal müşteri görüşmeleri, teklifleme, mühendislikle koordinasyon, teslim takibi.",
  },
];

const RoleCard = ({ title, type, location, level, icon: Icon, summary }: Role) => (
  <Link
    to="/kariyer/is-basvurusu"
    className="group rounded-2xl border border-border bg-card p-6 hover:border-accent-blue hover:shadow-[0_20px_60px_-30px_hsl(217_78%_48%/0.35)] transition-all"
  >
    <div className="flex items-start justify-between gap-4 mb-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue-soft">
        <Icon className="h-5 w-5 text-accent-blue" />
      </span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-blue group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
    </div>
    <h3 className="font-display text-lg font-semibold text-primary mb-2 tracking-[-0.01em]">{title}</h3>
    <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{summary}</p>
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" />{location}</span>
      <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{type}</span>
      <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3 w-3" />{level}</span>
    </div>
  </Link>
);

const PROCESS = [
  { title: "Başvuru", desc: "Online formdan CV ve kısa not. Tüm başvurular 3 iş günü içinde değerlendirilir." },
  { title: "Ön Görüşme", desc: "30 dk teknik & motivasyon görüşmesi. Online veya stüdyoda." },
  { title: "Vaka Çalışması", desc: "Pozisyona özel kısa pratik. Çoğu rol için 1–2 saatlik mini-proje." },
  { title: "Teklif", desc: "Şeffaf ücret bandı, yan haklar ve başlangıç tarihi netleşir." },
];

const CULTURE = [
  { icon: HeartHandshake, title: "Mühendislik kararı mühendiste", desc: "Mikro-yönetim yok. Süreç, ekipman ve malzeme seçiminde söz hakkın var." },
  { icon: GraduationCap, title: "Eğitim & sertifikasyon", desc: "Yıllık kişisel eğitim bütçesi; ISO, GD&T, Geomagic, SolidWorks sertifikasyonları." },
  { icon: Wrench, title: "Pazar üstü ekipman", desc: "Endüstriyel FDM, SLA, SLS ve mavi ışık tarayıcılarla doğrudan üretim." },
  { icon: Clock, title: "Esnek mesai", desc: "Çekirdek saatler dışında esnek başlangıç-bitiş; uygun rollerde hibrit." },
  { icon: Award, title: "Şeffaf prim", desc: "Proje teslim & kalite KPI'larına bağlı net hesaplama. Sürpriz yıllık bonus." },
  { icon: Shield, title: "Güvenli üretim", desc: "ISO 9001 uyumlu süreç, KKD ve havalandırma; iş sağlığı standartlarımız tavizsiz." },
];

const FAQS = [
  { q: "Yeni mezun olarak başvurabilir miyim?", a: "Evet. Junior pozisyonlarımızda staj/proje deneyimi olan yeni mezun adayları değerlendiriyoruz. Öğrenme isteği ve teknik temeli güçlü adaylar için mentorluk programımız var." },
  { q: "Tam zamanlı zorunluluk var mı?", a: "Çoğu mühendislik rolü tam zamanlı, ancak kıdemli rollerde proje bazlı / part-time iş birliklerine açığız. Başvuru notunda belirtmen yeterli." },
  { q: "Yurt dışından / şehir dışından başvuru kabul ediyor musunuz?", a: "Üretim rolleri Beylikdüzü stüdyomuzda fiziksel mevcudiyet gerektirir. Tasarım & satış rollerinde hibrit modele uygunuz." },
  { q: "Ücret bandı ne durumda?", a: "Pozisyon ve kıdeme göre piyasa medyanının üzerinde net teklif sunuyoruz. Teklif aşamasında yan haklarla beraber net rakam paylaşılır." },
  { q: "Başvurum ne kadar sürede değerlendirilir?", a: "Tüm başvurulara en geç 3 iş günü içinde geri dönüş yapıyoruz. Süreç ortalama 10 gün içinde tamamlanır." },
];