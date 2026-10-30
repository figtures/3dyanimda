/** Editorial shortcuts, not a measured traffic ranking. */
export const popularDistricts = [
  ['atasehir','Ataşehir'],['kadikoy','Kadıköy'],['umraniye','Ümraniye'],['uskudar','Üsküdar'],
  ['maltepe','Maltepe'],['kartal','Kartal'],['pendik','Pendik'],['besiktas','Beşiktaş'],
] as const;
export const localServices = {
  '3d-yedek-parca': {
    name:'yedek parça üretimi',
    introduction:'Bulunamayan kapak, tutucu veya muhafaza için parçanın fotoğrafı, numunesi ve çalışma koşullarıyla başlayın. Hazır dosya varsa üretim uygunluğunu; yalnızca fiziksel örnek varsa tarama ve modelleme ihtiyacını aynı proje içinde değerlendirelim.',
    benefits:[
      ['İhtiyaca göre başlangıç','Hazır CAD, kırık numune ve tamamen eksik parça için gereken çalışmalar farklıdır. Kullanılabilir veriyi belirleyerek gereksiz işlem adımlarını ayırın.'],
      ['Uyum ve kullanım koşulları','Montaj yüzeylerini, bağlantıları, sıcaklığı ve yükü talebe ekleyin. Dış görünüş benzerliğini kullanım uygunluğuyla karıştırmadan kapsam oluşturalım.'],
      ['Numuneden tekrar üretime','İlk numunenin kontrol bulgularını dosya revizyonuna bağlayın. Onaylanan ölçü, malzeme ve adet planıyla sonraki üretimi tanımlayın.'],
    ],
    price:'Yedek parça teklifinde mevcut verinin yeterliliği, eksik geometrinin yeniden kurulması, tarama veya modelleme, seçilen üretim yöntemi ve kontrol ihtiyacı belirleyicidir. Gerekli işlemler ayrı değerlendirilir; üretim uygunluğu incelendikten sonra numune ve adetli üretim kapsamı netleşir.',
    inputs:'Parçanın ve montaj yerinin fotoğraflarını, yaklaşık ölçülerini, adedi ve kullanım koşullarını paylaşın. Kırık ya da eksik bölgeleri, varsa karşı parçayı ve mevcut model dosyasını belirtin.',
    priceGuide:'/rehber/prototip-maliyetini-ne-belirler',
    guides:[['/rehber/tarama-ve-tersine-muhendislik','Tarama ve tersine mühendislik'],['/rehber/malzeme-secim-sorulari','Kullanıma göre malzeme seçimi'],['/rehber/numune-ve-revizyon','Numune ve revizyon planı']],
    quoteLabel:'Parçamı değerlendirmeye gönder',
  },
  '3d-baski': {
    name:'3D baskı',
    introduction:'Ürün prototipi, montaj denemesi veya özel parça: üretim kararını parçanın kullanım amacıyla birlikte verin. 3D Yanımda’da model dosyasından başlayabilir; tasarım veya fiziksel numune ihtiyacınızı aynı teklif içinde paylaşabilirsiniz.',
    benefits:[
      ['Dosya üzerinden ön değerlendirme','Modeli 3D Studio’da inceleyin; ölçü, adet ve malzeme seçimini aynı talepte bir araya getirin.'],
      ['Kullanıma göre malzeme seçimi','Görünüm numunesi, esnek parça ve işlevsel prototip için sıcaklık, yük ve yüzey beklentisini ayrı değerlendirin.'],
      ['Revizyona açık üretim planı','Tek numune ile adetli üretimi ayırın. Montajda kontrol edilecek bölgeleri ve sonraki üretime aktarılacak revizyonu baştan tarif edin.'],
    ],
    price:'3D baskı fiyatını parçanın boyutu ve geometrisi, malzeme, adet, doluluk, yüzey beklentisi ve son işlem ihtiyacı birlikte belirler. Fiyatlandırılmış FDM malzemelerinde 3D Studio, model ve üretim seçimlerinden bir ön tahmin oluşturur. Kesin tutar teknik incelemeyle netleşir; teslimat ayrıca değerlendirilir.',
    inputs:'STL, OBJ, 3MF veya CAD dosyanızla birlikte adet, ölçü birimi ve parçanın nerede kullanılacağını paylaşın. Bir parçaya oturacaksa eşleşen ölçüleri ve kritik yüzeyleri belirtin.',
    priceGuide:'/rehber/3d-baski-fiyatlandirma',
    guides:[['/rehber/fdm-sla-sls-karsilastirma','FDM, SLA ve SLS seçim rehberi'],['/rehber/malzeme-secim-sorulari','Malzeme seçiminde sorulacak sorular'],['/rehber/stl-dosya-hazirlama','Baskıya uygun dosya hazırlama']],
    quoteLabel:'Dosyamı yükle, ön fiyatı incele',
  },
  '3d-tarama': {
    name:'3D tarama',
    introduction:'Elinizde fiziksel bir parça var, ancak dijital modeli yoksa tarama kapsamını ihtiyaç duyduğunuz çıktıyla birlikte belirleyin. Yüzey modeli, düzenlenebilir CAD ve yeniden üretim farklı çalışma adımları gerektirir.',
    benefits:[
      ['Çıktıyı baştan tanımlayın','Görselleştirme, modelleme referansı veya yeniden üretim hedefini belirtin; mesh ve CAD beklentisini aynı teslimat olarak değerlendirmeyin.'],
      ['Numuneyi doğru hazırlayın','Ölçü, yüzey, erişilemeyen bölgeler ve mevcut hasarı fotoğraflarla birlikte aktarın. İnceleme ve numune teslim planı buna göre oluşturulsun.'],
      ['Modellemeye bağlı iş akışı','Tarama sonrasında düzenlenebilir geometri veya baskı gerekiyorsa bu adımları aynı proje talebinde belirtin.'],
    ],
    price:'3D tarama teklifinde obje boyutu, yüzey özellikleri, taranacak alanlar, erişim koşulları ve istenen çıktı belirleyicidir. Mesh temizliği, CAD modelleme ve ölçüm raporu gibi ek talepleri ayrı yazın; kapsam ve teslim koşulları teknik incelemeyle netleşir.',
    inputs:'Parçanın genel ve detay fotoğraflarını, yaklaşık ölçülerini, kullanım amacını ve istediğiniz dosya formatını paylaşın. Numunenin taşınabilir olup olmadığını belirtin.',
    priceGuide:'/rehber/tarama-ve-tersine-muhendislik',
    guides:[['/rehber/tarama-verisinden-cad','Tarama verisinden CAD modeline'],['/rehber/3d-tarama-kullanim-alanlari','Taramanın kullanım alanları'],['/rehber/numune-kabul-plani','Numune kabul ve kontrol planı']],
    quoteLabel:'Numunem için teknik teklif al',
  },
  '3d-modelleme': {
    name:'3D modelleme',
    introduction:'Eskiz, ölçü veya fiziksel numuneyi üretilebilir bir modele dönüştürmek için tasarım amacını netleştirin. Görsel sunum, montaj denemesi ve üretim dosyası için farklı detay ve kontrol adımları gerekir.',
    benefits:[
      ['Referanslardan tanımlı kapsama','Çizim, fotoğraf ve kritik ölçüleri aynı talepte toplayın; modelin neyi doğrulayacağını baştan belirtin.'],
      ['Üretim yöntemine göre geometri','Bağlantılar, et kalınlıkları ve montaj ilişkilerini hedeflenen üretim yöntemiyle birlikte değerlendirin.'],
      ['Revizyon ve dosya teslimi','Düzenlenebilir CAD, baskı dosyası ve görsel çıktı ihtiyacını ayırın; revizyon kapsamını teklif aşamasında netleştirin.'],
    ],
    price:'3D modelleme fiyatını geometri karmaşıklığı, mevcut referansların yeterliliği, parça sayısı, revizyon kapsamı ve istenen dosya çıktıları belirler. Tasarım ile baskı maliyetini ayrı değerlendirmek, teklifleri karşılaştırmayı kolaylaştırır.',
    inputs:'Eskiz, teknik çizim veya fotoğrafları; kritik ölçüler, parça adedi, montaj ilişkileri ve hedef dosya formatıyla paylaşın. Mevcut modelde değişiklik isteniyorsa düzenlenecek bölgeleri işaretleyin.',
    priceGuide:'/rehber/prototip-maliyetini-ne-belirler',
    guides:[['/rehber/teknik-teklif-dosyasi','Teknik teklif dosyası hazırlama'],['/rehber/numune-ve-revizyon','Numune ve revizyon süreci'],['/rehber/tarama-verisinden-cad','Fiziksel parçadan CAD modeline']],
    quoteLabel:'Tasarımımı değerlendirmeye gönder',
  },
} as const;
