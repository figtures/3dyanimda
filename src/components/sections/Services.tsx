import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import scanImg from "@/assets/service-scanning.jpg";
import modelImg from "@/assets/service-modeling.jpg";
import printImg from "@/assets/service-printing.jpg";
import { useSiteSettings, pickImage, pickLocale } from "@/hooks/useSiteSettings";

export const Services = () => {
  const { t, i18n } = useTranslation();
  const settings = useSiteSettings();
  const lng = i18n.language || "tr";
  const defaults = [
    { img: scanImg,  no: "S/01", titleKey: "services.section.s1.title", descKey: "services.section.s1.desc", defTitle: "3D Tarama", defDesc: "Mevcut parçanın yüksek hassasiyetli dijital ikizini çıkarıyoruz. Karmaşık geometriler, organik formlar ve ölçü alınamayan parçalar için.", to: "/hizmetler/3d-tarama" },
    { img: modelImg, no: "S/02", titleKey: "services.section.s2.title", descKey: "services.section.s2.desc", defTitle: "3D Modelleme", defDesc: "Tarama verisi üzerinde mühendislik düzeltmesi, parametrik CAD modelleme ve üretim için optimize edilmiş STL hazırlığı.", to: "/hizmetler/3d-modelleme" },
    { img: printImg, no: "S/03", titleKey: "services.section.s3.title", descKey: "services.section.s3.desc", defTitle: "3D Baskı", defDesc: "FDM, SLA, SLS — parçanın kullanım amacına göre teknoloji ve malzeme seçimi, son işlem ve kalite kontrolü.", to: "/hizmetler/3d-baski" },
  ];
  const stored = settings["services_cards"];
  const items = Array.isArray(stored) && stored.length
    ? (stored as any[]).map((c, i) => {
        const d = defaults[i];
        return {
          key: c.id || `c${i}`,
          img: pickImage(c, "image_url", d?.img || scanImg),
          no: c.no || d?.no || "",
          title: pickLocale(c, "title", lng, d ? t(d.titleKey, d.defTitle) : ""),
          desc: pickLocale(c, "desc", lng, d ? t(d.descKey, d.defDesc) : ""),
          to: c.link || d?.to || "/hizmetler",
        };
      })
    : defaults.map((d) => ({
        key: d.titleKey,
        img: d.img,
        no: d.no,
        title: t(d.titleKey, d.defTitle),
        desc: t(d.descKey, d.defDesc),
        to: d.to,
      }));
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="space-y-4 max-w-2xl">
            <p className="eyebrow">{t("services.section.eyebrow", "Hizmetler")}</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
              {t("services.section.title.pre", "Tek atölye,")} <em className="text-accent-blue not-italic">{t("services.section.title.em", "uçtan uca")}</em> {t("services.section.title.post", "üretim.")}
            </h2>
          </div>
          <Link to="/hizmetler" className="text-sm font-medium text-primary hover:text-accent-blue inline-flex items-center gap-1">
            {t("services.section.all", "Tüm hizmetler")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden shadow-soft">
          {items.map((s) => (
            <Link
              key={s.key}
              to={s.to}
              className="group bg-card relative overflow-hidden flex flex-col"
            >
              <div className="overflow-hidden aspect-[5/4]">
                <img
                  src={s.img}
                  alt={s.title}
                  width={1400}
                  height={1000}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-blue">{s.no}</p>
                <h3 className="font-serif text-2xl mt-2 text-foreground">{s.title}</h3>
                <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed flex-1">{s.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent-blue">
                  {t("services.section.review", "İncele")} <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
