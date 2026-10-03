export type ShowcaseModel = {
  id: string;
  title: string;
  category: string;
  description: string;
  material: string;
};
const models: Record<string, ShowcaseModel> = {
  enclosure: {
    id: "enclosure",
    title: "Ürününüz, ilk kez elinizde.",
    category: "ÜRÜN GELİŞTİRME",
    description:
      "Elektronik muhafaza, kapak ve iç yerleşimi tek modelde inceleyin. Prototip aşamasında form, montaj ve erişim detaylarını birlikte değerlendirelim.",
    material: "Muhafaza prototipi",
  },
  fixture: {
    id: "fixture",
    title: "Üretim hattınıza özel.",
    category: "APARAT & FİKSTÜR",
    description:
      "Konumlandırma, montaj ve kontrol işlerine özel yardımcı parçalar. Kullanım koşullarınıza göre geometriyi ve malzemeyi birlikte planlayalım.",
    material: "Montaj fikstürü",
  },
  impeller: {
    id: "impeller",
    title: "Karmaşık form. Somut sonuç.",
    category: "FONKSİYONEL PROTOTİP",
    description:
      "Kanatlı ve tekrarlayan geometrileri üretim öncesinde görün. Form ve montaj denemeleri için fiziksel prototip yaklaşımını değerlendirelim.",
    material: "Çark geometrisi",
  },
  duct: {
    id: "duct",
    title: "İki parça arasında doğru bağlantı.",
    category: "ÖZEL ADAPTÖR",
    description:
      "Bağlantı yüzeyleri, geçiş açıları ve mevcut parçaya uyum. Numune veya ölçülerden ihtiyaca özel adaptör tasarımıyla başlayalım.",
    material: "Kanal adaptörü",
  },
  clip: {
    id: "clip",
    title: "Küçük detay, büyük fark.",
    category: "KLİPS & BAĞLANTI",
    description:
      "Bulunamayan bağlantı detayları için modele dayalı çözüm. Esneme, montaj ve kullanım beklentilerini numune üzerinden netleştirelim.",
    material: "Bağlantı klipsi",
  },
  knob: {
    id: "knob",
    title: "Kullanıma göre şekillenir.",
    category: "YEDEK PARÇA",
    description:
      "Kavrama yüzeyi ve bağlantı geometrisiyle ihtiyaca özel parçalar. Mevcut ürünün ölçü ve kullanım koşullarından başlayalım.",
    material: "Kontrol düğmesi",
  },
  campus: {
    id: "campus",
    title: "Projenizin bütününü görün.",
    category: "MİMARİ MAKET",
    description:
      "Kütle, cephe ritmi ve çevre ilişkisini aynı sunumda ele alın. Mimari modelinizi sunum ölçeğine ve detay beklentinize göre hazırlayalım.",
    material: "Kampüs maketi",
  },
  villa: {
    id: "villa",
    title: "Mekânı hissettiren detaylar.",
    category: "KONUT & VİLLA",
    description:
      "Katlar, teraslar ve peyzajla tasarım kararlarını görünür kılın. Satış ve proje sunumları için maket kapsamını birlikte belirleyelim.",
    material: "Villa maketi",
  },
  district: {
    id: "district",
    title: "Bir yapıdan daha fazlası.",
    category: "VAZİYET & KENT",
    description:
      "Yapı grupları, dolaşım ve çevre düzenini birlikte anlatan ölçekli sunumlar. Büyük resmi okunaklı bir makete dönüştürelim.",
    material: "Yerleşim maketi",
  },
};
export function modelsForBrand(brand: string): ShowcaseModel[] {
  const ids =
    brand === "maketyanimda"
      ? ["campus", "villa", "district"]
      : brand === "parcayanimda"
        ? ["duct", "clip", "knob"]
        : brand === "3dsanayi"
          ? ["fixture", "impeller", "enclosure"]
          : ["enclosure", "impeller", "fixture"];
  return ids.map((id) => models[id]);
}
