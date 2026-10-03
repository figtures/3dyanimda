// Additive content release. Existing CMS edits are never overwritten.
import { readFileSync, writeFileSync } from "node:fs";
const pages = JSON.parse(readFileSync("src/content/pages.json", "utf8"));
const brands = JSON.parse(readFileSync("src/brands/catalog.json", "utf8"));
const topics = [
  [
    "sector",
    "endustriyel",
    "Endüstriyel üretim",
    "Üretim hattındaki özel aparat, montaj yardımcısı ve düşük adetli parça ihtiyaçlarını aynı teknik briefte toplayın.",
    [
      "Hattaki görevi tarif edin",
      "Parçanın hangi operasyonda kullanıldığını, operatörün nasıl tuttuğunu ve hangi yüzeylerin referans alındığını açıklayın. Çevrim sırasında oluşan yük, sıcaklık ve kimyasal temas bilgisi üretim kararının girdisidir. Mevcut çizim varsa kritik ölçüleri ayrı işaretleyin.",
    ],
    [
      "Pilot parçadan onaylı revizyona",
      "İlk numuneyi gerçek montaj noktasında değerlendirecek kişiyi belirleyin. Uyum, erişim ve operatör kullanımı ayrı kontrol başlıkları olmalıdır. Numune üzerinde yapılan değişiklikleri çizim revizyonuna işleyin; seri talebi yalnızca onaylanan dosyaya bağlayın.",
    ],
    [
      "Satın alma dosyası",
      "Talebe parça kodu, adet, malzeme beklentisi ve kabul ölçütlerini ekleyin. Birden fazla parçanın aynı siparişte değerlendirilmesi gerekiyorsa dosya adlarını adet tablosuyla eşleştirin. Tekrarlı siparişlerde önceki revizyon ve değişen koşulları belirtin.",
    ],
  ],
  [
    "sector",
    "otomotiv",
    "Otomotiv ve yedek parça",
    "Trim, kapak, klips ve prototip parçalarında numuneden modele uzanan süreci kullanım koşullarıyla birlikte planlayın.",
    [
      "Montaj ilişkisini koruyun",
      "Tek başına kırık parçanın fotoğrafı her zaman yeterli değildir. Parçanın takıldığı bölgeyi, sağlam eşini ve bağlantı elemanlarını da gösterin. Geçme yönü ve esnemesi gereken bölgeler işaretlenirse modelleme kapsamı daha doğru belirlenir.",
    ],
    [
      "Ortam koşullarını paylaşın",
      "İç mekân, güneş gören bölge veya motor çevresi farklı koşullar taşır. Sıcaklık, titreşim, kimyasal temas ve beklenen kullanım ömrünü anlatın. Görünüş numunesi ile işlevsel kullanım parçasını aynı kabul kriteriyle değerlendirmeyin.",
    ],
    [
      "Doğrulama kapsamı",
      "Emniyet açısından kritik bir parçanın yeniden üretilmesi ayrıca mühendislik doğrulaması gerektirir. Talepte parçanın görevini açıkça belirtin. Prototipin montaja oturması, tek başına güvenli kullanım onayı anlamına gelmez.",
    ],
  ],
  [
    "sector",
    "mimari-tasarim",
    "Mimari ve tasarım",
    "Kütle, cephe ve yerleşim maketlerinde ölçeği, gösterilecek detayları ve taşıma planını üretimden önce netleştirin.",
    [
      "Ölçekte okunabilirlik",
      "Kaynak modelin birimini, hedef maket ölçeğini ve bitmiş taban ölçüsünü paylaşın. Cephedeki çok küçük detayların fiziksel makette nasıl temsil edileceğini kararlaştırın. Peyzaj, kütle ve iç mekân farklı ayrıntı seviyelerinde ele alınabilir.",
    ],
    [
      "Bölünebilir üretim",
      "Maketin sergileneceği alan ve taşınacağı kutu boyutu, parçalara ayırma kararını etkiler. Birleşim yerlerini görünür cephelerden uzaklaştırmak veya sökülebilir kütleler kullanmak tasarım aşamasında değerlendirilebilir. Aydınlatma ve kablo kanalları ayrıca belirtilmelidir.",
    ],
    [
      "Sunum onayı",
      "Renk, yüzey, etiket ve taban beklentisini referanslarla anlatın. Önce dijital yerleşim, sonra kritik bir detayın numunesi üzerinden karar verin. Son teslimden önce parça listesi ve yerleşim şemasını birlikte kontrol edin.",
    ],
  ],
  [
    "sector",
    "medikal",
    "Medikal tasarım ve eğitim",
    "Anlatım, eğitim ve tasarım değerlendirmesi için anatomik gösterim ve cihaz gövdesi prototiplerinin kapsamını belirleyin.",
    [
      "Kullanım amacını ayırın",
      "Eğitimde gösterim, cihazın form kontrolü ve klinik kullanım birbirinden farklı kapsamlar taşır. Talebinizin hangi amaçla kullanılacağını açıkça yazın. Bu sayfadaki prototipleme yaklaşımı klinik uygunluk, sterilizasyon veya hasta temasına ilişkin bir onay değildir.",
    ],
    [
      "Veri paylaşımı",
      "Gerekli dosya formatını ve görüntüleme beklentisini teknik ekiple belirleyin. Kişisel bilgi içeren görüntü veya dosyaları paylaşmadan önce yetki ve anonimleştirme süreçlerinizi tamamlayın. Teklif aşamasında mümkünse kimlik bilgisi içermeyen geometriyle başlayın.",
    ],
    [
      "Eğitim modelinin kabulü",
      "Gösterilecek yapıları, renk ayrımını, sökülebilir bölümleri ve kullanılacak ölçeği listeleyin. Modelin anlatım amacına uygunluğunu konu uzmanı değerlendirmelidir. Dijital onay ile fiziksel yüzey beklentisini ayrı adımlarda ele alın.",
    ],
  ],
  [
    "sector",
    "savunma-havacilik",
    "Havacılık ve teknik Ar-Ge",
    "Form kontrolü, ergonomi ve montaj gösterimi için kullanılan teknik prototipleri izlenebilir bir dosya akışıyla planlayın.",
    [
      "Kapsam ve veri sınırı",
      "Paylaşıma yetkili olduğunuz çizimleri ve kullanım amacı bilgisini talebe ekleyin. İlk değerlendirme için gerekli olmayan hassas proje detaylarını kapsam dışında tutun. Dosya erişimi, gizlilik ve revizyon sorumluları teklif öncesinde belirlenmelidir.",
    ],
    [
      "Gösterim ve montaj prototipi",
      "Ergonomi maketi, bağlantı yerleşimi veya dış form numunesinde hangi kararın doğrulanacağını yazın. Görsel prototipin uçuşa elverişlilik veya işlevsel parça sertifikası sağlamadığını proje içinde açıkça ayırın. Kritik işlevler ayrı doğrulama planı gerektirir.",
    ],
    [
      "İzlenebilir değerlendirme",
      "Dosya adı, parça kodu, revizyon, talep sahibi ve kabul kontrolünü ortak tabloda tutun. Fiziksel numune üzerindeki değişiklikleri dijital modele geri işleyin. Tekrar üretimde onaylı dosyanın aynı olduğundan emin olun.",
    ],
  ],
  [
    "sector",
    "egitim-arge",
    "Eğitim ve Ar-Ge",
    "Fikrinizi test edilebilir numunelere ayırın; bir sonraki tasarım kararını verecek prototipi üretin.",
    [
      "Deneyi önce tanımlayın",
      "Bu numuneyle hangi soruya yanıt aradığınızı yazın. Form, mekanizma hareketi ve montaj uyumu farklı deneylerdir. Her birini aynı prototipte çözmeye çalışmak yerine karar sırasına göre ayırın.",
    ],
    [
      "Revizyonları karşılaştırın",
      "Alternatifleri dosya adında işaretleyin; yalnızca değişen parametreleri bir tabloyla paylaşın. Deneme sonucunu not ederken kullanılan revizyonu ve test koşullarını ekleyin. Böylece yeni numunenin neden istendiği açık kalır.",
    ],
    [
      "Bütçe ve adet",
      "Görünüş değerlendirmesi için gereken adetle kullanıcı testi için gereken adet aynı olmayabilir. Önce küçük bir doğrulama grubu planlayın. Malzeme, yüzey ve teslim tarihi seçimlerini deneyin amacıyla birlikte değerlendirin.",
    ],
  ],
  [
    "sector",
    "sanat-mucevher",
    "Sanat, obje ve takı tasarımı",
    "Heykel, obje ve takı tasarımlarında dijital formu fiziksel ölçekte görerek yüzey ve detay kararlarını geliştirin.",
    [
      "Formun fiziksel etkisi",
      "Ekranda büyük görünen bir detay gerçek ölçekte kaybolabilir. Hedef ölçüyü, tutulacak yüzeyleri ve sergileme yönünü paylaşın. Organik modellerde yüzey sürekliliği ile bilinçli doku kararlarını ayırın.",
    ],
    [
      "Son işlem planı",
      "Boyama, birleştirme veya başka bir üretim sürecine girdi oluşturma amacı varsa bunu baştan belirtin. Kalıp veya döküm sürecine uygunluk ilgili üretim yöntemiyle ayrıca değerlendirilmelidir. Her baskı malzemesinin her son işlemle uyumlu olduğu varsayılmaz.",
    ],
    [
      "Tasarım hakları",
      "Üretim için ilettiğiniz modelin kullanım hakkının sizde olduğundan emin olun. Sanatçı adı, eser numarası ve revizyonu dosyada takip edin. Görsel sunum numunesi ile satışa çıkacak nihai ürünün kabul ölçütlerini ayrı belirleyin.",
    ],
  ],
  [
    "sector",
    "drone-hobi",
    "Drone, robotik ve hobi",
    "Elektronik yerleşimi, kablo yönetimi ve montaj yardımcıları için modelleme ve prototip planınızı oluşturun.",
    [
      "Bileşen yerleşimi",
      "Kart, sensör, bağlantı ve kablo ölçülerini aynı referans sisteminde paylaşın. Montaj sırasında alet erişimi ve kablo bükülme alanını da düşünün. Sadece dış ölçüleri vermek, parçanın sorunsuz monte edileceğini göstermez.",
    ],
    [
      "Deneme koşulları",
      "Titreşim, dış ortam ve hareketli mekanizma ilişkisini belirtin. Uçuş veya yüksek hız gerektiren kullanımda parça doğrulaması ayrıca ele alınmalıdır. Tasarım numunesini doğrudan güvenlik açısından kritik kullanıma uygun kabul etmeyin.",
    ],
    [
      "Onarım ve değiştirme",
      "Sık sökülecek kapakları, tüketilecek parçaları ve farklı sürümlerde değişecek bağlantıları işaretleyin. Tasarımın servis kolaylığı prototip üzerinden kontrol edilebilir. Sonraki sipariş için onaylanan dosyayı ve bağlantı ölçülerini saklayın.",
    ],
  ],
  [
    "guide",
    "stl-dosya-hazirlama",
    "STL dosyası hazırlama kontrol listesi",
    "Tekliften önce birim, dış ölçü, yüzey bütünlüğü ve revizyon bilgisini aynı kontrol listesiyle gözden geçirin.",
    [
      "Birim ve ölçek",
      "STL dosyasındaki koordinatları hangi birimde dışa aktardığınızı kaydedin. Önizleyicide dış ölçüleri tasarımınızla karşılaştırın. Milimetre ve inç karışıklığı, görünüş aynı olsa da üretilecek parçanın boyutunu değiştirir.",
    ],
    [
      "Yüzey ve ayrıntı",
      "Modelde açık yüzey, üst üste geometri veya istenmeyen iç parçalar olup olmadığını CAD yazılımınızda kontrol edin. Görüntüleyicide kesit almak iç ilişkileri anlamayı kolaylaştırır; ancak otomatik üretilebilirlik doğrulamasının yerini tutmaz.",
    ],
    [
      "Dosya paketi",
      "Parça kodu ve revizyonu dosya adına ekleyin. Adet, kritik ölçü ve kullanım koşullarını ayrı not edin. Birden fazla dosyada aynı kodu farklı revizyonlarla karıştırmayın; onaylanmış sürümü açıkça işaretleyin.",
    ],
  ],
  [
    "guide",
    "tarama-verisinden-cad",
    "Tarama verisinden CAD modeline",
    "Nokta bulutu, yüzey ağı ve düzenlenebilir CAD çıktısını ayırarak tersine mühendislik talebinizi doğru kapsamlandırın.",
    [
      "Hangi veri elinizde?",
      "Tarama sonucunuz nokta verisi veya üçgen yüzey ağı olabilir. Düzenlenebilir katı model gereksinimini ayrıca belirtin. Görüntülenebilen bir dosyanın otomatik olarak parametrik CAD dosyası olduğu varsayılmaz.",
    ],
    [
      "Fonksiyonel yüzeyler",
      "Delik, mil yatağı, oturma yüzeyi ve bağlantı eksenlerini işaretleyin. Aşınmış veya kırılmış bölgeyi olduğu gibi kopyalamak yerine korunması gereken tasarım ilişkisini açıklayın. Gerekirse sağlam karşı parça da değerlendirmeye eklenir.",
    ],
    [
      "Teslim ve kontrol",
      "İstenen formatı, revizyon kapsamını ve kontrol edilecek ölçüleri baştan belirleyin. Tarama ile CAD arasındaki farkların nasıl değerlendirileceğini kararlaştırın. Sadece görsel benzerlik, ölçüsel kabulün yerine geçmez.",
    ],
  ],
  [
    "guide",
    "kesit-nasil-incelenir",
    "3D modelde kesit nasıl incelenir?",
    "Kesit düzlemini kullanarak iç boşlukları, montaj ilişkilerini ve beklenmeyen yüzeyleri görünür hale getirin.",
    [
      "Düzlem yönünü seçin",
      "İncelemek istediğiniz detayın geçtiği ekseni bulun. X, Y ve Z yönlerini sırayla deneyin; sonra düzlemi yavaşça modelin içinden geçirin. Modeli döndürmek, birbirinin arkasında kalan yüzeyleri ayırt etmeye yardımcı olur.",
    ],
    [
      "Görsel kesitin sınırları",
      "Tarayıcıdaki araç yüzeyleri düzleme göre gizler. Açılan kesiti kapatmaz, takım yolu veya baskı katmanı üretmez. Duvar kalınlığı ya da tolerans raporu gerekiyorsa ölçüm ve üretim yazılımlarındaki uygun araçlarla doğrulama yapın.",
    ],
    [
      "Bulgunuzu tarif edin",
      "İncelediğiniz ekseni, düzlem konumunu ve sorunlu bölgeyi not edin. Talebe dosyanın aynı revizyonunu ekleyin. Bir ekran görüntüsünde görünen boşluğun tasarım amacı mı, dosya hatası mı olduğunu açıklamadan üretim kararı vermeyin.",
    ],
  ],
  [
    "guide",
    "teknik-teklif-dosyasi",
    "Teknik teklif dosyası nasıl hazırlanır?",
    "Satın alma ve teknik ekiplerin aynı dosya üzerinden ilerlemesi için parça, adet, revizyon ve kabul bilgilerini düzenleyin.",
    [
      "Tek bir parça tablosu",
      "Her satırda parça kodu, dosya adı, revizyon ve adet bulunsun. Alternatif tasarımları aynı satırda birleştirmeyin. Hangi parçaların birlikte monte edileceğini belirtin ve montaj çizimini ilişkilendirin.",
    ],
    [
      "Kabul beklentisi",
      "Kritik ölçüler, görünür yüzeyler, işlevsel kontroller ve numune onayını kimin vereceği talepte yer alsın. Belgelenmeyen bir beklentinin teklif kapsamına otomatik girdiğini varsaymayın. Teslim dosyası ve fiziksel ürün kapsamını ayrı yazın.",
    ],
    [
      "Takvim ve değişiklik",
      "Hedef tarihi, ara onay adımlarını ve revizyon için ayrılan süreyi belirtin. Talep sonrası geometri veya adet değişirse teklif yeniden değerlendirilebilir. Onaylanan sürümü teknik ekip ve satın alma arasında ortak referans yapın.",
    ],
  ],
  [
    "guide",
    "malzeme-secim-sorulari",
    "Malzeme seçmeden önce sorulacak sorular",
    "Malzeme kararını yalnızca isim veya renge göre değil, parçanın işlevi ve çalışma koşullarına göre hazırlayın.",
    [
      "Ortamı tanımlayın",
      "Parça nerede çalışacak? Sıcaklık, güneş, nem ve kimyasal temas var mı? Sürekli yük mü taşıyacak, aralıklı darbe mi alacak? Bu sorulara sayısal bilgi verebiliyorsanız talebe ekleyin; bilinmeyen koşulları da açıkça yazın.",
    ],
    [
      "Geometriyi birlikte düşünün",
      "İnce bağlantılar, esneyen tırnaklar ve büyük düz yüzeyler farklı tasarım değerlendirmeleri gerektirir. Malzeme, yönlendirme ve üretim yöntemi birlikte ele alınmalıdır. Sadece doluluk oranını artırmak her işlevsel problemi çözmez.",
    ],
    [
      "Numuneyle karar verin",
      "Kritik kullanımlarda numuneyi hedef ortama uygun bir kontrol planıyla değerlendirin. Malzeme veri sayfasını, üretim ayarlarını ve test koşullarını birbirine karıştırmayın. Nihai kabul ölçütünü üretimden önce belirleyin.",
    ],
  ],
  [
    "guide",
    "maket-olcek-planlama",
    "Maket ölçeği ve parçalara ayırma",
    "Mimari modelin fiziksel ölçüsünü, okunabilir detayını ve taşıma ihtiyacını tek üretim planında birleştirin.",
    [
      "Ölçeği hesaplayın",
      "Gerçek boyutu ölçek paydasına bölerek maket boyutunu bulun. Örneğin 10 metrelik bir uzunluk 1:100 ölçekte 100 milimetredir. Kaynak dosyanın metre veya milimetre oluşunu ayrıca kontrol edin.",
    ],
    [
      "Detay seviyesini seçin",
      "Pencere, korkuluk ve peyzaj gibi öğeleri her ölçekte aynı biçimde üretmek uygun olmayabilir. Anlatım açısından gerekli ayrıntıları listeleyin. Fiziksel sınırlar nedeniyle sadeleştirilecek bölgeler için dijital onay alın.",
    ],
    [
      "Taşıma ve montaj",
      "Taban ölçüsü, birleşim yerleri ve sökülebilir parçaları kutulama planıyla birlikte değerlendirin. Parçaları kodlayın ve yerleşim şemasını saklayın. Sergileme sırasında sık taşınacak bir maket için servis erişimini de planlayın.",
    ],
  ],
  [
    "guide",
    "numune-kabul-plani",
    "Numune kabul planı",
    "Bir prototipin hangi koşullarda onaylanacağını üretimden önce tanımlayarak revizyon görüşmelerini somutlaştırın.",
    [
      "Kontrol maddeleri",
      "Görünüş, montaj uyumu, ölçü ve işlevi ayrı maddeler halinde yazın. Her maddenin kontrol yöntemini ve karar verecek kişiyi belirleyin. Sadece fotoğraftan onaylanamayacak beklentileri fiziksel deneme aşamasına bırakın.",
    ],
    [
      "Kayıt düzeni",
      "Numunenin dosya revizyonu, malzemesi, adedi ve test tarihi bir arada tutulmalıdır. Test sırasında yapılan elle düzeltmeler varsa bunları da kaydedin. Yeni baskıda aynı düzeltmenin yeniden gerekmemesi için dijital modele geri işleyin.",
    ],
    [
      "Onaydan tekrar siparişe",
      "Hangi maddelerin geçtiğini ve hangilerinin açık kaldığını listeleyin. Koşullu onayı nihai onaydan ayırın. Tekrar sipariş verirken aynı revizyonu, değişen adetleri ve yeni kullanım koşullarını belirtin.",
    ],
  ],
  [
    "solution",
    "kurumsal-proje-yonetimi",
    "Kurumsal proje ve tedarik süreci",
    "Teknik ekip, satın alma ve üretim arasında dosya, onay ve tekrar sipariş akışını aynı proje kapsamına bağlayın.",
    [
      "Talep ve kapsam",
      "Projenin kullanım amacını, parça listesini ve hedef tarihini paylaşın. Modelleme, tarama, üretim ve son işlem kalemlerini ayrı değerlendirin. Teklifte hangi dosya ve fiziksel çıktıların teslim edileceği açıkça belirtilmelidir.",
    ],
    [
      "Numune ve revizyon",
      "İlk numunenin kabul maddelerini ve onay sorumlusunu belirleyin. Değişiklik taleplerini tek bir revizyon listesinde toplayın. Yeni geometri, adet veya teslim koşulu fiyat ve takvimin tekrar değerlendirilmesini gerektirebilir.",
    ],
    [
      "Tekrar sipariş",
      "Onaylı dosyanın parça kodunu ve revizyonunu saklayın. Tekrar siparişte yalnızca eski fotoğraf yerine bu referansı kullanın. Çalışma ortamı veya kullanım amacı değiştiyse teknik değerlendirmeyi yenileyin.",
    ],
  ],
];
const added = [];
for (const b of brands)
  for (const [kind, slug, title, summary, ...sections] of topics) {
    const path = `/${kind === "sector" ? "sektorler" : kind === "solution" ? "cozumler" : "rehber"}/${slug}`;
    if (pages.some((p) => p.brand === b.slug && p.path === path)) continue;
    const p = {
      brand: b.slug,
      path,
      title,
      summary: `${summary} ${b.name}: ${b.focus.toLocaleLowerCase("tr-TR")} odağında değerlendirme.`,
      sections: [
        {
          title: b.focus,
          body:
            b.description +
            " Projenizde 3D baskı, 3D tarama ve 3D modelleme adımlarından hangilerinin gerekli olduğunu kullanım amacınızla birlikte belirleyin.",
        },
        ...sections.map(([title, body]) => ({ title, body })),
      ],
      kind,
      image: `/brand/industrial/${b.heroAsset}.webp`,
      faq: [
        { q: "İlk değerlendirme için ne paylaşmalıyım?", a: sections[0][1] },
        {
          q: "Talebe nasıl başlayabilirim?",
          a: "3D Studio üzerinden dosyanızı, adet ve kullanım koşullarınızı paylaşabilirsiniz. Dosyanız yoksa fotoğraf, ölçü ve beklenen çıktıyla modelleme değerlendirmesi isteyin.",
        },
      ],
      status: "published",
      city: "",
      district: "",
      neighborhood: "",
      service: "",
      local_context: "",
      logistics: "",
      evidence: "",
      reviewed_at: null,
    };
    pages.push(p);
    added.push(p);
  }
writeFileSync("src/content/pages.json", JSON.stringify(pages, null, 2) + "\n");
const lit = (v) => `'${String(v).replaceAll("'", "''")}'`;
let sql =
  "-- Expand sector and engineering knowledge content without overwriting CMS edits.\nALTER TABLE public.landing_pages DROP CONSTRAINT landing_pages_kind_check;\nALTER TABLE public.landing_pages ADD CONSTRAINT landing_pages_kind_check CHECK(kind IN ('service','solution','material','guide','location','sector'));\n";
// Stable output also when rerun: only this release's known paths.
for (const p of pages.filter((p) =>
  topics.some(
    ([k, s]) =>
      p.path ===
      `/${k === "sector" ? "sektorler" : k === "solution" ? "cozumler" : "rehber"}/${s}`,
  ),
)) {
  const { brand, ...row } = p;
  const keys = Object.keys(row);
  sql += `INSERT INTO public.landing_pages(tenant_id,${keys.join(",")}) SELECT id,${keys.map((k) => (row[k] === null ? "NULL" : typeof row[k] === "object" ? lit(JSON.stringify(row[k])) + "::jsonb" : lit(row[k]))).join(",")} FROM public.tenants WHERE slug=${lit(brand)} ON CONFLICT(tenant_id,path) DO NOTHING;\n`;
}
writeFileSync(
  "supabase/migrations/20261003110000_engineering_content.sql",
  sql,
);
console.log(
  `${added.length} new content pages; geography publication guard unchanged.`,
);
