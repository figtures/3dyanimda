import {useBrand} from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { FAQ, faqJsonLd } from "@/components/site/FAQ";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import i18n from "@/lib/i18n";

const fallbackItems = [
 { q: "3D dosyam olmadan başlayabilir miyim?", a: "Evet. Ölçülerini, örnek parçanı veya fikrini paylaş; modelleme ihtiyacını birlikte değerlendirelim." },
 { q: "Fiyat ve teslim süresi nasıl belirleniyor?", a: "Tasarım, malzeme, adet ve detay seviyesi incelendikten sonra proje özelinde teklif hazırlanır." },
 { q: "Hangi bölgelere hizmet veriyorsunuz?", a: "Örnek Mahallesi merkezimizden İstanbul'un tamamındaki projeleri değerlendiriyoruz. Teslimat planı birlikte netleştirilir." },
];

const FaqPage = () => {
  const brand=useBrand();
  const [items, setItems] = useState(fallbackItems);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("faq_items")
        .select("question_tr, question_en, answer_tr, answer_en, sort_order, active")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (!mounted || !data || data.length === 0) return;
      const lang = i18n.language?.startsWith("en") ? "en" : "tr";
      const mapped = data
        .map((r: any) => ({
          q: (lang === "en" ? r.question_en : r.question_tr) || r.question_tr || r.question_en || "",
          a: (lang === "en" ? r.answer_en : r.answer_tr) || r.answer_tr || r.answer_en || "",
        }))
        .filter((x) => x.q && x.a);
      if (mapped.length > 0) setItems(mapped);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Seo
        title="Sık Sorulan Sorular — 3D Üretim, Tarama ve Baskı"
        description={`${brand.name}: 3D tarama, modelleme ve baskı hizmetleri hakkında sorular ve cevaplar.`}
        path="/sss"
        jsonLd={[faqJsonLd(items)]}
      />
      <PageHero
        eyebrow="Sık Sorulan Sorular"
        breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "SSS" }]}
        title={<>Aklınıza gelen <span className="text-gradient-blue italic font-medium">her şey</span>, tek sayfada.</>}
        lead="3D üretim hakkında sıkça sorulan soruları derledik. Aradığınızı bulamazsanız iletişim sayfasından bize ulaşın."
      />
      <FAQ items={items} title="Hizmetlerimiz hakkında merak edilenler" />

    </>
  );
};

export default FaqPage;
