import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import autoImg from "@/assets/auto-parts-collection.jpg";
import { useSiteSettings, pickImage, pickLocale } from "@/hooks/useSiteSettings";

export const AutoFocus = () => {
  const { t, i18n } = useTranslation();
  const settings = useSiteSettings();
  const af = (settings["autofocus_content"] || {}) as any;
  const lng = i18n.language || "tr";
  const eyebrow = pickLocale(af, "eyebrow", lng, t("autofocus.eyebrow", "Uzmanlık · Otomotiv"));
  const overrideTitle = pickLocale(af, "title", lng, "");
  const overrideLead = pickLocale(af, "lead", lng, "");
  const cta = pickLocale(af, "cta", lng, t("autofocus.cta", "Detaylı bilgi & örnek vakalar"));
  const imgSrc = pickImage(af, "image_url", autoImg);
  const points = [
    { k: "autofocus.p1", d: "Üretimi durmuş klasik araç parçaları" },
    { k: "autofocus.p2", d: "Bulunamayan iç-dış trim parçaları" },
    { k: "autofocus.p3", d: "Kırık tutucu, klips, braket ve aparatlar" },
    { k: "autofocus.p4", d: "Motor odası — emme, kapak, mahfaza parçaları" },
    { k: "autofocus.p5", d: "Saç, plastik, kompozit eşdeğer üretim" },
  ];
  return (
    <section className="bg-cream-gradient py-24 lg:py-32">
      <div className="container-page grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1 space-y-6">
          <p className="eyebrow text-accent-blue/80">{eyebrow}</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
            {overrideTitle ? overrideTitle : (
              <>
                {t("autofocus.title.pre", "Oto yedek parçada")} <em className="text-accent-blue not-italic">{t("autofocus.title.em", "artık")}</em> {t("autofocus.title.post", "bekleme yok.")}
              </>
            )}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            {overrideLead ? overrideLead : (
              <Trans i18nKey="autofocus.lead" defaults="Türkiye'de bulunamayan, üretimi durmuş ya da yurt dışından beklenen oto yedek parçaları <s>3 boyutlu olarak yeniden üretiyoruz.</s> Mevcut bir parçayı tarıyor, mühendislik düzeltmesini yapıyor ve kullanıma uygun malzeme ile basıyoruz." components={{ s: <strong className="text-primary" /> }} />
            )}
          </p>

          <ul className="space-y-2 pt-2">
            {points.map((p) => (
              <li key={p.k} className="flex items-start gap-3 text-foreground/85">
                <CheckCircle2 className="h-5 w-5 text-accent-blue mt-0.5 shrink-0" />
                <span>{t(p.k, p.d)}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Link
              to="/oto-yedek-parca-3d-uretim"
              className="group inline-flex items-center gap-2 text-primary font-medium border-b-2 border-primary pb-1 hover:gap-3 transition-all"
            >
              {cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2 relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-accent-blue/30 to-transparent blur-2xl opacity-60" aria-hidden />
          <img
            src={imgSrc}
            alt={t("autofocus.image.alt", "3D baskı ile yeniden üretilmiş klasik araç yedek parçaları")}
            width={1600}
            height={1100}
            loading="lazy"
            className="relative w-full h-auto rounded-2xl shadow-deep object-cover aspect-[4/3] ring-1 ring-border"
          />
          <div className="hidden md:block absolute -right-4 -bottom-4 bg-primary text-cream p-5 rounded-xl shadow-deep w-[220px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">{t("autofocus.case.eyebrow", "Vaka")}</p>
            <p className="font-serif text-lg leading-tight mt-2">{t("autofocus.case.title", "1972 model kapı kolu — 3 günde teslim")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
