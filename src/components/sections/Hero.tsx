import { Link } from "react-router-dom";
import { ArrowRight, Layers, Scan, Printer } from "lucide-react";
import heroImg from "@/assets/hero-engine-part.jpg";
import { useTranslation, Trans } from "react-i18next";
import { useSiteSettings, pickImage, pickLocale } from "@/hooks/useSiteSettings";

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const settings = useSiteSettings();
  const hero = (settings["hero_content"] || {}) as any;
  const lng = i18n.language || "tr";
  const eyebrow = pickLocale(hero, "eyebrow", lng, t("home.hero.eyebrow", "Dijital üretim atölyesi · Türkiye"));
  const overrideTitle = pickLocale(hero, "title", lng, "");
  const lead = pickLocale(hero, "lead", lng, t("home.hero.lead", "Oto yedek parça başta olmak üzere endüstriyel, medikal ve savunma için 3D tarama, mühendislik modelleme ve yüksek hassasiyetli baskı."));
  const ctaPrimary = pickLocale(hero, "cta_primary", lng, t("home.hero.cta.primary", "Teklif al"));
  const ctaSecondary = pickLocale(hero, "cta_secondary", lng, t("home.hero.cta.secondary", "Oto yedek parça hizmeti"));
  const imgSrc = pickImage(hero, "image_url", heroImg);
  return (
    <section className="relative bg-hero overflow-hidden isolate" data-section style={{ color: "hsl(38 42% 96%)" }}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, hsl(217 80% 35% / 0.35), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(38 42% 96% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(38 42% 96% / 1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "linear-gradient(180deg, black, transparent 90%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden />

      <div data-hero-shell className="container-page relative grid lg:grid-cols-12 gap-12 lg:gap-16 pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="lg:col-span-7 space-y-9 reveal-up">
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.28em] text-white/55">
            <span className="h-px w-8 bg-white/30" />
            {eyebrow}
          </div>

          <h1 className="font-display text-white text-[clamp(2.7rem,6.4vw,5.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            {overrideTitle ? overrideTitle : (
              <Trans i18nKey="home.hero.title" defaults="Bulunamayan parçayı <muted>yeniden</muted> üretiyoruz." components={{ muted: <span className="text-white/55" /> }} />
            )}
          </h1>

          <p className="text-white/70 text-lg md:text-[19px] leading-relaxed max-w-xl font-normal">{lead}</p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link
              to="/teklif-al"
              className="group inline-flex items-center gap-2 bg-white text-[hsl(222_75%_10%)] font-medium px-6 py-3.5 rounded-md hover:bg-cream transition-colors"
            >
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/oto-yedek-parca-3d-uretim"
              className="inline-flex items-center gap-2 px-1 py-3.5 text-white/85 font-medium hover:text-white transition-colors border-b border-white/20 hover:border-white/60 rounded-none"
            >
              {ctaSecondary}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <dl className="grid grid-cols-3 gap-x-8 gap-y-2 pt-10 max-w-2xl border-t border-white/10">
            <Stat n={t("home.hero.stat1.n", "±0.02 mm")} label={t("home.hero.stat1.label", "Tarama hassasiyeti")} />
            <Stat n={t("home.hero.stat2.n", "48 saat")} label={t("home.hero.stat2.label", "Hızlı prototipleme")} />
            <Stat n={t("home.hero.stat3.n", "1480+")} label={t("home.hero.stat3.label", "Tamamlanan proje")} />
          </dl>
        </div>

        <div data-hero-media className="lg:col-span-5 relative">
          <div className="relative reveal-fade">
            <div className="absolute -inset-8 rounded-[2rem] bg-accent-blue/15 blur-3xl" aria-hidden />

            <div className="relative rounded-xl overflow-hidden ring-1 ring-white/10 shadow-deep">
              <img
                src={imgSrc}
                alt={t("home.hero.image.alt", "3D baskı ile üretilmiş otomotiv emme manifold prototipi")}
                width={1600}
                height={1200}
                loading="eager"
                decoding="async"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{t("home.hero.case.eyebrow", "Vaka 014")}</p>
                  <p className="font-display text-base text-white font-medium tracking-tight mt-1">{t("home.hero.case.title", "Emme manifold · PA12-CF")}</p>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45 whitespace-nowrap">
                  {t("home.hero.case.pipeline", "Scan → CAD → Print")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { icon: Scan, t: t("home.hero.strip.scan.t", "3D Tarama"), d: t("home.hero.strip.scan.d", "Yüksek çözünürlüklü dijital ikiz") },
            { icon: Layers, t: t("home.hero.strip.model.t", "3D Modelleme"), d: t("home.hero.strip.model.d", "Mühendislik kalitesinde CAD") },
            { icon: Printer, t: t("home.hero.strip.print.t", "3D Baskı"), d: t("home.hero.strip.print.d", "FDM · SLA · SLS uygulamaya göre") },
          ].map((s) => (
            <div key={s.t} className="py-7 px-2 md:px-8 flex items-center gap-4 group">
              <s.icon className="h-5 w-5 text-white/50 group-hover:text-gold transition-colors" />
              <div className="flex-1">
                <h3 className="font-display text-[15px] text-white font-medium tracking-tight">{s.t}</h3>
                <p className="text-white/55 text-sm mt-0.5 leading-snug">{s.d}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/25 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stat = ({ n, label }: { n: string; label: string }) => (
  <div className="pt-5">
    <dt className="font-display text-2xl md:text-[26px] text-white font-medium tracking-tight">{n}</dt>
    <dd className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/50 mt-1.5">{label}</dd>
  </div>
);