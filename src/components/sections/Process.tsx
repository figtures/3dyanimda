import { ScanLine, Cog, Boxes, PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Process = () => {
  const { t } = useTranslation();
  const steps = [
    { n: "01", icon: ScanLine, tKey: "process.s1.t", dKey: "process.s1.d", defT: "Tarama & Analiz", defD: "Mevcut parça yüksek hassasiyetli el tipi tarayıcı ile dijitale alınır. Yıpranma, kırık ve toleranslar mühendis ekibimizce analiz edilir." },
    { n: "02", icon: Cog,      tKey: "process.s2.t", dKey: "process.s2.d", defT: "Mühendislik Modelleme", defD: "Tarama nokta bulutu, parametrik CAD modeline dönüştürülür. Gerekirse iyileştirme, güçlendirme ve revizyon önerilir." },
    { n: "03", icon: Boxes,    tKey: "process.s3.t", dKey: "process.s3.d", defT: "Baskı & Üretim", defD: "FDM, SLA veya SLS teknolojilerinden parçanın görevine en uygun olanı seçilir; doğru malzeme ile üretim yapılır." },
    { n: "04", icon: PackageCheck, tKey: "process.s4.t", dKey: "process.s4.d", defT: "Kalite & Teslim", defD: "Boyutsal kontrol, son işlem ve gerektiğinde montaj. Türkiye geneli kargo ile kapınıza." },
  ];
  return (
    <section className="relative py-24 lg:py-32 bg-background">
      <div className="container-page">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 lg:sticky lg:top-32 self-start space-y-5">
            <p className="eyebrow">{t("process.eyebrow", "Süreç")}</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
              {t("process.title.pre", "Dört adımda")} <em className="text-accent-blue not-italic">{t("process.title.em", "dijitalden gerçeğe")}</em>.
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {t("process.lead", "Her parça için ayrı ayrı ele alınmış, mühendislik disiplinini el emeği ile birleştiren bir üretim hattı kuruyoruz.")}
            </p>
          </div>

          <ol className="lg:col-span-8 space-y-px bg-border/70 border border-border rounded-sm overflow-hidden">
            {steps.map((s) => (
              <li key={s.n} className="grid md:grid-cols-12 gap-6 bg-card p-8 group">
                <div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-blue">{s.n}</span>
                  <s.icon className="h-6 w-6 text-primary opacity-80 group-hover:text-accent-blue transition-colors" />
                </div>
                <div className="md:col-span-10">
                  <h3 className="font-serif text-2xl text-foreground">{t(s.tKey, s.defT)}</h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed text-[15px] max-w-2xl">{t(s.dKey, s.defD)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
