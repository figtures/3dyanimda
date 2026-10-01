import { useTranslation } from "react-i18next";

export const Capabilities = () => {
  const { t } = useTranslation();
  const rows = [
    { kKey: "cap.r1.k", vKey: "cap.r1.v", defK: "Sektörler",   defV: "Otomotiv · Endüstriyel · Ev aletleri · Tarım makineleri · Mobilya aksesuarı · Mimari" },
    { kKey: "cap.r2.k", vKey: "cap.r2.v", defK: "Teknolojiler", defV: "FDM · SLA · MSLA · SLS · Çoklu malzeme baskı" },
    { kKey: "cap.r3.k", vKey: "cap.r3.v", defK: "Malzemeler",   defV: "PLA · PETG · ABS · ASA · PA12 (Naylon) · TPU · PC · Reçine (sert / esnek / mühendislik)" },
    { kKey: "cap.r4.k", vKey: "cap.r4.v", defK: "Tarama",       defV: "El tipi yapılandırılmış ışık · Mavi LED · ±0.02 mm hassasiyet" },
    { kKey: "cap.r5.k", vKey: "cap.r5.v", defK: "Modelleme",    defV: "Reverse engineering · Parametrik CAD · Topology iyileştirme · STL onarım" },
    { kKey: "cap.r6.k", vKey: "cap.r6.v", defK: "Son işlem",    defV: "Zımpara · Astar / boya · Yapıştırma · Diş açma · Montaj" },
    { kKey: "cap.r7.k", vKey: "cap.r7.v", defK: "Teslim süresi", defV: "Standart 2–7 gün · Acil prototip 24–48 saat" },
  ];
  return (
    <section className="bg-primary text-cream py-24 lg:py-32 grain">
      <div className="container-page grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-5">
          <p className="eyebrow text-cream/85">{t("cap.eyebrow", "Yetkinlikler")}</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] text-cream text-balance">
            {t("cap.title.pre", "Bir parçaya değil —")} <em className="text-gold not-italic">{t("cap.title.em", "probleme")}</em> {t("cap.title.post", "bakıyoruz.")}
          </h2>
          <p className="text-cream/90 max-w-sm">
            {t("cap.lead", "Mühendislik perspektifimiz sayesinde sadece üretim değil, parçanın yıpranma sebebini de değerlendiriyor; gerekli güçlendirmeyi öneriyoruz.")}
          </p>
        </div>
        <dl className="lg:col-span-8 divide-y divide-cream/10 border-y border-cream/10">
          {rows.map((r) => (
            <div key={r.kKey} className="grid md:grid-cols-12 gap-4 py-5">
              <dt className="md:col-span-3 font-mono text-[10px] uppercase tracking-[0.28em] text-cream/85 pt-1">
                {t(r.kKey, r.defK)}
              </dt>
              <dd className="md:col-span-9 text-cream/90 leading-relaxed">{t(r.vKey, r.defV)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
