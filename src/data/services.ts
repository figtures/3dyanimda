/**
 * Hizmet katalogu — programatik landing'lerde kullanılır.
 * slug ilçe-hizmet route'u için aynı kelimeyle eşleşir: /istanbul/{ilce}/{slug}
 */

import { LucideIcon, Printer, Scan, Layers, Wrench } from "lucide-react";

export interface ServiceCatalog {
  slug: string;
  name: string;             // Görünür ad
  short: string;            // 1 cümle
  metaPrefix: string;       // <Title> öneki
  icon: LucideIcon;
  faq: { q: string; a: string }[];
  bullets: string[];        // Yetkinlik maddesi
  techList: { k: string; v: string }[];
}

export const SERVICES: ServiceCatalog[] = [
  {
    slug: "3d-baski",
    name: "3D Baskı",
    short: "FDM, SLA, SLS ve MJF teknolojileriyle endüstriyel kalitede 3D baskı.",
    metaPrefix: "3D Baskı",
    icon: Printer,
    bullets: [
      "FDM, SLA, SLS, MJF, ColorJet teknolojileri",
      "PLA, PETG, ABS, PA12, TPU, reçine ve karbon takviyeli filamentler",
      "0.05 mm — 0.30 mm katman kalınlığı seçenekleri",
      "Tek parçadan binlerce adete kadar düşük adetli üretim",
      "STL, OBJ, STEP, IGES dosya kabulü",
    ],
    techList: [
      { k: "Teknoloji", v: "FDM · SLA · SLS · MJF" },
      { k: "Hassasiyet", v: "± 0.1 mm" },
      { k: "Maks. boyut", v: "500 × 500 × 500 mm" },
      { k: "Teslim", v: "24-72 saat" },
    ],
    faq: [
      { q: "3D baskı fiyatı nasıl hesaplanır?", a: "Fiyat; modelin hacmine, seçilen malzemeye, doluluk oranına ve baskı kalitesine göre hesaplanır. STL dosyanızı yükleyerek anında hesap görebilirsiniz." },
      { q: "Hangi dosya formatlarını kabul ediyorsunuz?", a: "STL, OBJ, STEP, IGES, 3MF ve PLY formatları desteklenir. Sadece fotoğrafınız varsa, 3D modelleme ekibimiz çizebilir." },
      { q: "En kısa teslim süresi nedir?", a: "Acil siparişlerde aynı gün kurye, standart işlerde 24-72 saat içinde teslim ederiz." },
      { q: "Hangi malzemeleri kullanıyorsunuz?", a: "PLA, PETG, ABS, ASA, TPU, PA12 (naylon), karbon takviyeli filamentler ve mühendislik reçineleri kullanırız." },
    ],
  },
  {
    slug: "3d-tarama",
    name: "3D Tarama",
    short: "± 0.02 mm hassasiyetinde dijital ikiz çıkarma — reverse engineering ve kalite kontrol.",
    metaPrefix: "3D Tarama",
    icon: Scan,
    bullets: [
      "Mavi ışık yapısal tarayıcı (± 0.02 mm)",
      "Otomotiv parçaları, makine bileşenleri, sanat objeleri",
      "Tarama + STL/STEP dosyası teslimi",
      "Mobil tarama: lokasyonunuza geliyoruz",
      "Kalite kontrol raporları (CAD karşılaştırma)",
    ],
    techList: [
      { k: "Teknoloji", v: "Yapısal mavi ışık" },
      { k: "Hassasiyet", v: "± 0.02 mm" },
      { k: "Maks. obje", v: "2.000 × 2.000 × 2.000 mm" },
      { k: "Teslim", v: "Mesh + STEP" },
    ],
    faq: [
      { q: "3D tarama hangi parçalarda kullanılır?", a: "Yedek parça çıkarma, kalıp restorasyonu, tıbbi/ortez modelleme, mimari restorasyon ve kalite kontrol projelerinde kullanılır." },
      { q: "Mobil tarama mümkün mü?", a: "Evet — büyük objeler veya hassas parçalar için ekibimiz lokasyonunuza gelir, sahada tarama yapar." },
      { q: "Tarama dosyası hangi formatta teslim edilir?", a: "Standart olarak STL ve OBJ; reverse engineering için STEP/IGES CAD dosyaları sağlarız." },
    ],
  },
  {
    slug: "3d-modelleme",
    name: "3D Modelleme",
    short: "Fotoğraftan, eskizten veya numuneden başlayarak üretime hazır CAD model.",
    metaPrefix: "3D Modelleme",
    icon: Layers,
    bullets: [
      "Reverse engineering (mevcut parçadan CAD)",
      "Konsept tasarım ve ürün geliştirme",
      "Fotogrametri tabanlı modelleme",
      "SolidWorks, Fusion 360, Rhino, Blender",
      "Mühendislik analizi ve iyileştirme önerisi",
    ],
    techList: [
      { k: "Yazılım", v: "SolidWorks · Fusion · Rhino" },
      { k: "Teslim", v: "STEP · IGES · STL · 3MF" },
      { k: "Revizyon", v: "2 ücretsiz revizyon" },
      { k: "Süre", v: "1-7 gün" },
    ],
    faq: [
      { q: "3D modelleme için ne göndermem gerek?", a: "Ürünün fotoğrafları (farklı açılardan), kabaca ölçüler veya elinizdeki numune yeterlidir." },
      { q: "Üretime hazır CAD dosyası alıyor muyum?", a: "Evet — STEP/IGES gibi CAD formatlarında üretime hazır, kotalı dosyalar teslim ederiz." },
    ],
  },
  {
    slug: "3d-yedek-parca",
    name: "3D Yedek Parça Üretimi",
    short: "Üretimi durmuş, bulunamayan ya da nadir parçaları yeniden üretiyoruz.",
    metaPrefix: "3D Yedek Parça",
    icon: Wrench,
    bullets: [
      "Klasik araç yedek parçaları (Mercedes, BMW, Anadol, Şahin…)",
      "Endüstriyel makine bileşenleri",
      "Beyaz eşya, küçük ev aleti parçaları",
      "Tarama + modelleme + baskı tek elden",
      "Orijinal parça ile eş ölçü ve eş malzeme garantisi",
    ],
    techList: [
      { k: "Süreç", v: "Tarama → CAD → Baskı" },
      { k: "Malzeme", v: "PA-CF · PETG · Reçine" },
      { k: "Hassasiyet", v: "± 0.1 mm" },
      { k: "Teslim", v: "3-7 gün" },
    ],
    faq: [
      { q: "Bulamadığım yedek parçayı üretebilir misiniz?", a: "Elimizdeki numune veya kırık parça üzerinden tarama, modelleme ve 3D baskı ile yeniden üretiyoruz." },
      { q: "Üretilen parça orijinaliyle aynı dayanıklılıkta mı?", a: "Plastik parçalarda PA12, PA-CF gibi mühendislik plastikleriyle orijinaline yakın hatta üzerinde dayanım sağlıyoruz." },
    ],
  },
];

export function findService(slug?: string) {
  return SERVICES.find(s => s.slug === slug);
}