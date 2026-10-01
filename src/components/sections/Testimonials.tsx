import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resolveMediaUrl } from "@/lib/media";

interface Item {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

export const Testimonials = () => {
  const { t, i18n } = useTranslation();
  const fallback: Item[] = useMemo(
    () => [
      { quote: t("testi.t1.q", "1968 model aracımın iç döşeme klipsi yıllardır bulunamıyordu. 4 günde hem orijinaline tıpatıp hem daha dayanıklı olarak teslim aldım."), name: t("testi.t1.n", "Erkan T."), role: t("testi.t1.r", "Klasik araç koleksiyoneri") },
      { quote: t("testi.t2.q", "Endüstriyel makinemizin Almanya'dan beklediğimiz parçası 6 hafta sonra gelecekti. 3D Yanında 48 saatte üretti, üretim hattımız durmadı."), name: t("testi.t2.n", "Mert D."), role: t("testi.t2.r", "Üretim Müdürü, Bursa") },
      { quote: t("testi.t3.q", "Prototip aşamasında üç farklı revizyonu hızlıca aldık. Mühendislik geri dönüşleri çok değerliydi."), name: t("testi.t3.n", "Ayşe K."), role: t("testi.t3.r", "Ürün Tasarımcısı") },
    ],
    [t]
  );

  const [items, setItems] = useState<Item[]>(fallback);
  const [[index, dir], setIndex] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("author_name, author_title, company, quote_tr, quote_en, avatar_url, sort_order, active")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (!mounted || !data || data.length === 0) return;
      const lang = i18n.language?.startsWith("en") ? "en" : "tr";
      const mapped = data
        .map((r: any) => ({
          quote: (lang === "en" ? r.quote_en : r.quote_tr) || r.quote_tr || r.quote_en || "",
          name: r.author_name || "",
          role: [r.author_title, r.company].filter(Boolean).join(", "),
          avatar: resolveMediaUrl(r.avatar_url || ""),
        }))
        .filter((x) => x.quote);
      if (mapped.length > 0) setItems(mapped);
    })();
    return () => { mounted = false; };
  }, [i18n.language]);

  const count = items.length;
  const safeIndex = ((index % count) + count) % count;
  const current = items[safeIndex];

  const go = (delta: number) => setIndex(([i]) => [i + delta, delta]);
  const goTo = (target: number) => setIndex(([i]) => [target, target > i ? 1 : -1]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => setIndex(([i]) => [i + 1, 1]), 6500);
    return () => clearInterval(id);
  }, [paused, count]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="relative bg-background py-24 lg:py-32 overflow-hidden">
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent-blue blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="container-page relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-4">
            <p className="eyebrow">{t("testi.eyebrow", "Referanslar")}</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.05]">
              {t("testi.title", "Sözümüzü tutuyoruz.")}
            </h2>
          </div>
          {count > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => go(-1)}
                aria-label="Önceki referans"
                className="h-11 w-11 rounded-full border border-border bg-card hover:bg-accent/10 hover:border-accent-blue transition-colors flex items-center justify-center text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Sonraki referans"
                className="h-11 w-11 rounded-full border border-border bg-card hover:bg-accent/10 hover:border-accent-blue transition-colors flex items-center justify-center text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative bg-card border border-border rounded-sm shadow-soft overflow-hidden">
            {/* Accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-blue via-primary to-accent-blue" />

            <div className="relative min-h-[280px] md:min-h-[260px] p-8 md:p-14">
              <Quote
                aria-hidden
                className="absolute top-6 right-6 md:top-10 md:right-10 h-16 w-16 md:h-24 md:w-24 text-accent-blue/10"
              />

              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.figure
                  key={safeIndex}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex flex-col gap-8 max-w-3xl"
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                >
                  <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl leading-[1.4] text-foreground/90">
                    "{current?.quote}"
                  </blockquote>
                  <figcaption className="flex items-center gap-4 pt-6 border-t border-border">
                    {current?.avatar ? (
                      <img
                        src={current.avatar}
                        alt={current.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-accent-blue/20"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center font-serif text-lg">
                        {current?.name?.charAt(0) || "·"}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-primary">{current?.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{current?.role}</div>
                    </div>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          {count > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Referans ${i + 1}`}
                  className="group h-2 rounded-full overflow-hidden bg-border transition-all"
                  style={{ width: i === safeIndex ? 32 : 8 }}
                >
                  <span
                    className={`block h-full transition-colors ${
                      i === safeIndex ? "bg-accent-blue" : "bg-transparent group-hover:bg-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
