/**
 * İstanbul ilçeleri — programatik landing & yerel SEO için.
 * Her kayıt: slug, isim (TR), bölge (Avrupa/Anadolu), komşu ilçeler, kısa lokal bağlam.
 * `delivery` saat = bizim taahhüt ettiğimiz teslimat süresi (kurye/motokurye varsayımı).
 */

export type IstanbulSide = "avrupa" | "anadolu";

export interface IstanbulDistrict {
  slug: string;          // URL-safe (kebab)
  name: string;          // Görünür ad
  side: IstanbulSide;
  population: number;    // TÜİK 2023 yaklaşık
  neighbors: string[];   // slug listesi
  notes: string;         // 1-2 cümle ilçe bağlamı
  delivery: string;      // teslimat süresi
  /** Üretim üssümüze yakın "öncelikli bölge" — GBP/SEO odak */
  priority?: boolean;
  /** Kayıt aslında bir mahalle/bölge ise (ilçe değil) */
  isSubArea?: boolean;
}

export const ISTANBUL_DISTRICTS: IstanbulDistrict[] = [
  // ANADOLU
  { slug: "kadikoy", name: "Kadıköy", side: "anadolu", population: 467919, neighbors: ["uskudar","atasehir","maltepe"], notes: "Kadıköy; tasarım stüdyoları, mimari ofisler ve maker topluluğu yoğunluğu nedeniyle 3D baskı talebinin en yüksek olduğu Anadolu Yakası ilçesidir.", delivery: "Aynı gün motokurye" },
  { slug: "uskudar", name: "Üsküdar", side: "anadolu", population: 524452, neighbors: ["kadikoy","atasehir","umraniye"], notes: "Üsküdar; tarihi yapıların restorasyon parçaları ve mimari maket talebiyle öne çıkar.", delivery: "Aynı gün motokurye" },
  { slug: "atasehir", name: "Ataşehir", side: "anadolu", population: 425094, neighbors: ["kadikoy","umraniye","maltepe"], notes: "Ataşehir; finans plazaları ve mühendislik firmaları için fonksiyonel prototip ve endüstriyel parça merkezidir.", delivery: "Aynı gün motokurye" },
  { slug: "umraniye", name: "Ümraniye", side: "anadolu", population: 716490, neighbors: ["uskudar","atasehir","cekmekoy","sancaktepe"], notes: "Ümraniye; sanayi siteleri ve OSB yakınlığıyla makine yedek parça ve seri üretim öncesi prototip için tercih edilir.", delivery: "Aynı gün motokurye" },
  { slug: "maltepe", name: "Maltepe", side: "anadolu", population: 525812, neighbors: ["kadikoy","atasehir","kartal"], notes: "Maltepe; eğitim kurumları ve teknopark yakınlığıyla akademik ve Ar-Ge projelerinde aktiftir.", delivery: "Aynı gün motokurye" },
  { slug: "kartal", name: "Kartal", side: "anadolu", population: 481659, neighbors: ["maltepe","pendik","sancaktepe"], notes: "Kartal; sanayi bölgeleri ve marina çevresi tasarım atölyeleriyle 3D üretim talebi yaratır.", delivery: "Aynı gün motokurye" },
  { slug: "pendik", name: "Pendik", side: "anadolu", population: 749350, neighbors: ["kartal","tuzla","sancaktepe"], notes: "Pendik; havacılık ve otomotiv yan sanayisinin yoğunlaştığı bölgede özel kalıp ve fonksiyonel parça üretiriz.", delivery: "Ertesi gün kargo" },
  { slug: "tuzla", name: "Tuzla", side: "anadolu", population: 286360, neighbors: ["pendik"], notes: "Tuzla; tersaneler ve OSB nedeniyle dayanıklı plastik parça ve yedek bileşen siparişlerinde lider.", delivery: "Ertesi gün kargo" },
  { slug: "sancaktepe", name: "Sancaktepe", side: "anadolu", population: 491645, neighbors: ["umraniye","cekmekoy","kartal","pendik"], notes: "Sancaktepe; lojistik depoları ve makine üreticileri için bakım yedek parçası ihtiyacı yüksektir.", delivery: "Aynı gün motokurye" },
  { slug: "cekmekoy", name: "Çekmeköy", side: "anadolu", population: 296805, neighbors: ["umraniye","sancaktepe","sile"], notes: "Çekmeköy; yeni teknoloji ofisleri için prototipleme ve mimari maket çalışmaları yapıyoruz.", delivery: "Aynı gün motokurye" },
  { slug: "beykoz", name: "Beykoz", side: "anadolu", population: 244698, neighbors: ["uskudar","cekmekoy","sile"], notes: "Beykoz; özel projeler, sanat enstalasyonları ve kişiye özel hediyelik üretiminde tercih edilir.", delivery: "Ertesi gün kargo" },
  { slug: "sile", name: "Şile", side: "anadolu", population: 39728, neighbors: ["beykoz","cekmekoy"], notes: "Şile; kıyı bölgesi villaları ve butik üretim için hızlı 3D baskı hizmetimizi kargo ile sunuyoruz.", delivery: "Ertesi gün kargo" },
  { slug: "adalar", name: "Adalar", side: "anadolu", population: 16033, neighbors: [], notes: "Adalar; restorasyon, müze replikası ve dekoratif obje projelerini deniz lojistiğiyle teslim ederiz.", delivery: "1-2 iş günü kargo" },
  // AVRUPA
  { slug: "besiktas", name: "Beşiktaş", side: "avrupa", population: 178054, neighbors: ["sisli","kagithane","sariyer"], notes: "Beşiktaş; reklam ajansları, mimari ofisler ve startup yoğunluğuyla yüksek hassasiyetli prototip merkezidir.", delivery: "Aynı gün motokurye" },
  { slug: "sisli", name: "Şişli", side: "avrupa", population: 264134, neighbors: ["besiktas","kagithane","beyoglu"], notes: "Şişli; medikal ve dental sektör için anatomik model ve cerrahi rehber üretiminde aktifiz.", delivery: "Aynı gün motokurye" },
  { slug: "beyoglu", name: "Beyoğlu", side: "avrupa", population: 226396, neighbors: ["sisli","fatih","kasimpasa"], notes: "Beyoğlu; sahne aksesuarı, sanat enstalasyonu ve özel objeler için sıkça çalışıyoruz.", delivery: "Aynı gün motokurye" },
  { slug: "fatih", name: "Fatih", side: "avrupa", population: 379980, neighbors: ["beyoglu","eminonu","zeytinburnu"], notes: "Fatih; tarihi parça restorasyonu, ahşap-metal replikası ve müze projeleri için 3D tarama hizmeti sunuyoruz.", delivery: "Aynı gün motokurye" },
  { slug: "kagithane", name: "Kağıthane", side: "avrupa", population: 437025, neighbors: ["sisli","besiktas","eyupsultan"], notes: "Kağıthane; yeni nesil ofis kuleleri ve plaza arası mühendislik firmaları için endüstriyel parça üretiriz.", delivery: "Aynı gün motokurye" },
  { slug: "sariyer", name: "Sarıyer", side: "avrupa", population: 333111, neighbors: ["besiktas","eyupsultan"], notes: "Sarıyer; üniversite kampüsleri ve Ar-Ge merkezleriyle akademik destekli prototipleme talebi yüksektir.", delivery: "Aynı gün motokurye" },
  { slug: "eyupsultan", name: "Eyüpsultan", side: "avrupa", population: 432291, neighbors: ["kagithane","sariyer","gaziosmanpasa"], notes: "Eyüpsultan; mobilya, dekorasyon ve aydınlatma üreticileri için kalıp ve fonksiyonel prototip işleriz.", delivery: "Aynı gün motokurye" },
  { slug: "gaziosmanpasa", name: "Gaziosmanpaşa", side: "avrupa", population: 488714, neighbors: ["eyupsultan","esenler","sultangazi"], notes: "Gaziosmanpaşa; küçük üreticiler için yedek parça ve düşük adetli üretim yapıyoruz.", delivery: "Ertesi gün kargo" },
  { slug: "sultangazi", name: "Sultangazi", side: "avrupa", population: 528514, neighbors: ["gaziosmanpasa","esenler","arnavutkoy"], notes: "Sultangazi; küçük sanayi ve kuyumculuk için reçine baskı (SLA) ile döküm ön modelleri üretiriz.", delivery: "Ertesi gün kargo" },
  { slug: "esenler", name: "Esenler", side: "avrupa", population: 449077, neighbors: ["bayrampasa","gaziosmanpasa","bagcilar"], notes: "Esenler; tekstil ve aksesuar sektörü için kalıp prototipleri ve özel parça üretimleri yaparız.", delivery: "Ertesi gün kargo" },
  { slug: "bayrampasa", name: "Bayrampaşa", side: "avrupa", population: 274735, neighbors: ["esenler","zeytinburnu","fatih"], notes: "Bayrampaşa; lojistik ve gıda makineleri yedek parça ihtiyaçları için 3D baskı çözümleri sunuyoruz.", delivery: "Ertesi gün kargo" },
  { slug: "zeytinburnu", name: "Zeytinburnu", side: "avrupa", population: 285962, neighbors: ["fatih","bayrampasa","bakirkoy"], notes: "Zeytinburnu; tekstil tasarımı, ayakkabı kalıbı ve aksesuar prototipi için aktif olduğumuz bir bölgedir.", delivery: "Aynı gün motokurye" },
  { slug: "bakirkoy", name: "Bakırköy", side: "avrupa", population: 224456, neighbors: ["zeytinburnu","bahcelievler","kucukcekmece"], notes: "Bakırköy; tıbbi cihaz, dental laboratuvar ve hava-deniz lojistik aksesuarları için 3D baskı yapıyoruz.", delivery: "Aynı gün motokurye" },
  { slug: "bahcelievler", name: "Bahçelievler", side: "avrupa", population: 590348, neighbors: ["bakirkoy","bagcilar","gungoren"], notes: "Bahçelievler; yoğun konut ve küçük işletme bölgesi olarak kişiye özel hediyelik ve dekoratif baskıda tercih edilir.", delivery: "Aynı gün motokurye" },
  { slug: "gungoren", name: "Güngören", side: "avrupa", population: 282153, neighbors: ["bahcelievler","bagcilar"], notes: "Güngören; tekstil ve mobilya yan sanayisinin parça ihtiyacı için 3D baskı kullanılır.", delivery: "Ertesi gün kargo" },
  { slug: "bagcilar", name: "Bağcılar", side: "avrupa", population: 731354, neighbors: ["gungoren","esenler","bahcelievler"], notes: "Bağcılar; matbaa, ambalaj ve makine sanayisi için kalıp prototipleri ve yedek parça üretiriz.", delivery: "Ertesi gün kargo" },
  { slug: "kucukcekmece", name: "Küçükçekmece", side: "avrupa", population: 779604, neighbors: ["bakirkoy","avcilar","basaksehir"], notes: "Küçükçekmece; havalimanı yan sanayisi ve eğitim kurumları için fonksiyonel parçalar üretiriz.", delivery: "Aynı gün motokurye" },
  { slug: "avcilar", name: "Avcılar", side: "avrupa", population: 449125, neighbors: ["kucukcekmece","beylikduzu","esenyurt"], notes: "Avcılar; üniversite ve sanayi karması bir bölge. Üretim üssümüze 10 dakika mesafede; akademik, oto yedek parça ve endüstriyel prototip işleri için bölgenin merkez tedarikçisiyiz.", delivery: "Aynı gün — 1-2 saat içi kurye", priority: true },
  { slug: "beylikduzu", name: "Beylikdüzü", side: "avrupa", population: 401860, neighbors: ["avcilar","esenyurt","buyukcekmece"], notes: "Beylikdüzü üretim üssümüzdür. CNR Expo, OSB ve plaza yoğunluğunda kurumsal hediyelik, fuar maketi, fonksiyonel prototip ve oto yedek parçada bölgenin merkez tedarikçisiyiz.", delivery: "Aynı gün — 1-3 saat içi kurye", priority: true },
  { slug: "esenyurt", name: "Esenyurt", side: "avrupa", population: 1003065, neighbors: ["beylikduzu","avcilar","basaksehir","arnavutkoy","hadimkoy"], notes: "Esenyurt; İstanbul'un en kalabalık ilçesi ve küçük sanayi-atölye yoğunluğunun en yüksek olduğu bölge. Yedek parça, kalıp prototip ve seri üretim öncesi doğrulamada üretim üssümüzden 1-3 saat içinde teslim ederiz.", delivery: "Aynı gün — 1-3 saat içi kurye", priority: true },
  { slug: "buyukcekmece", name: "Büyükçekmece", side: "avrupa", population: 264304, neighbors: ["beylikduzu","catalca","silivri"], notes: "Büyükçekmece; sanayi bölgesi makineleri için 3D baskı yedek parça ve kalıp model üretimi yaparız.", delivery: "Ertesi gün kargo" },
  { slug: "basaksehir", name: "Başakşehir", side: "avrupa", population: 487777, neighbors: ["kucukcekmece","esenyurt","sultangazi","arnavutkoy"], notes: "Başakşehir; teknopark ve ICEC fuar alanı civarında prototipleme yoğundur.", delivery: "Aynı gün motokurye" },
  { slug: "arnavutkoy", name: "Arnavutköy", side: "avrupa", population: 332297, neighbors: ["basaksehir","sultangazi","esenyurt"], notes: "Arnavutköy; havalimanı ve OSB yakınlığıyla lojistik & havacılık parçaları için 3D üretimde tercih edilir.", delivery: "Ertesi gün kargo" },
  { slug: "hadimkoy", name: "Hadımköy", side: "avrupa", population: 65000, neighbors: ["arnavutkoy","esenyurt","basaksehir","catalca"], notes: "Hadımköy; Arnavutköy'e bağlı sanayi bölgesi olarak Hadımköy OSB, İSTOÇ ve İkitelli aksında yer alır. Ağır sanayi, makine yedek parçası, lojistik ekipman ve metal ikamesi mühendislik plastiklerinde ana hizmet bölgemizdir.", delivery: "Aynı gün — 1-2 saat içi kurye", priority: true, isSubArea: true },
  { slug: "catalca", name: "Çatalca", side: "avrupa", population: 78947, neighbors: ["buyukcekmece","silivri","arnavutkoy"], notes: "Çatalca; tarımsal ekipman ve makine yedek parça ihtiyacı için kargo ile teslim ediyoruz.", delivery: "1-2 iş günü kargo" },
  { slug: "silivri", name: "Silivri", side: "avrupa", population: 218262, neighbors: ["catalca","buyukcekmece"], notes: "Silivri; tatil bölgesi mobilyaları, tekne aksesuarları ve butik üretim için 3D baskı yapıyoruz.", delivery: "1-2 iş günü kargo" },
];

export const ANADOLU = ISTANBUL_DISTRICTS.filter(d => d.side === "anadolu");
export const AVRUPA = ISTANBUL_DISTRICTS.filter(d => d.side === "avrupa");

/** Beylikdüzü-Esenyurt-Hadımköy-Avcılar üretim üssü çekirdeği */
export const PRIORITY_AREAS = ISTANBUL_DISTRICTS.filter(d => d.priority);

export function findDistrict(slug?: string) {
  return ISTANBUL_DISTRICTS.find(d => d.slug === slug);
}