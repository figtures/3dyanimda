const copy: Record<string, Record<string, [string,string]>> = {
  '3dyanimda': {
    service:['Prototip için 3D baskı, tarama ve modelleme','Dijital dosya, fiziksel numune veya ilk fikirle başlayın. Görünüş, montaj ve işlev denemesi için gereken üretim adımlarını birlikte seçin.'],
    guide:['Prototip ve ürün geliştirme bilgi merkezi','Üretim yöntemi, teklif kapsamı ve tasarım revizyonları hakkında karar rehberleri. Bir sonraki numunenizi hangi soruyu yanıtlamak için yaptıracağınıza karar verin.'],
    solution:['Ürün geliştirme ve küçük seri çözümleri','Prototipten onaylı revizyona ilerlerken model hazırlığı, üretim ve kabul adımlarını projenizin ihtiyacına göre planlayın.'],
    material:['Prototip için 3D baskı malzemeleri','Görünüş modeli ile çalışan parçanın ihtiyaçlarını ayırın. Malzemeyi geometri, kullanım koşulu ve üretim yönüyle birlikte değerlendirin.'],
  },
  '3dsanayi': {
    service:['Sanayi için 3D parça ve aparat hizmetleri','Montaj yardımcısı, bakım aparatı ve özel parçalar için dijital üretim. Teknik resim, çalışma istasyonu ve kabul kriterini aynı talepte birleştirin.'],
    guide:['Aparat, fikstür ve endüstriyel üretim rehberleri','Malzeme kararından numune kabulüne: üretim ve satın alma ekiplerinin aynı teknik kapsam üzerinde ilerlemesi için pratik kontrol listeleri.'],
    solution:['Üretim hattına özel aparat çözümleri','Konumlandırma, kontrol ve bakım operasyonlarına göre şekillenen parçalar. Görevi tarif edin; tasarım ve numune kapsamını bu görevden türetelim.'],
    material:['Endüstriyel aparatlarda malzeme seçimi','Yük, sıcaklık, aşınma ve kimyasal temas bilgisini malzeme kararına taşıyın. Genel özellikleri, üretici verisi ve uygulama denemesiyle birlikte okuyun.'],
  },
  'maketyanimda': {
    service:['Mimari maket için 3D üretim hizmetleri','Proje dosyanızı ölçeği, kütlesi ve detayları okunabilen fiziksel sunuma dönüştürün. Baskı, referans tarama ve makete özel model hazırlığını birlikte planlayın.'],
    guide:['Mimari maket, ölçek ve sunum rehberleri','Taban ölçüsünden cephe detayına, model hazırlığından taşımaya: maket siparişi vermeden önce sunum kapsamını netleştirin.'],
    solution:['Mimari proje ve gayrimenkul sunum maketleri','Kütle, arazi, tesis veya proje tanıtımı için doğru maket kurgusu. Anlatılacak hikâyeyi ölçek, modülerlik ve yüzey bitişiyle eşleştirin.'],
    material:['Maket üretiminde malzeme ve yüzey kararları','Sunum mesafesi, renk, ince detaylar ve birleşim yerlerini birlikte düşünün. Görsel beklentiyi taşıma ve montaj koşullarıyla dengeleyin.'],
  },
  'parcayanimda': {
    service:['Özel plastik parça için 3D baskı ve modelleme','Kapak, tutucu, adaptör veya mevcut numuneden yeni tasarım. Parçanın montaj yerini ve kullanım koşulunu paylaşarak uygun üretim yaklaşımını belirleyin.'],
    guide:['Özel parça üretimi ve montaj uyumu rehberleri','Kırık numuneden dijital modele, malzeme kararından ilk uyum denemesine: doğru referanslarla parça talebi hazırlayın.'],
    solution:['Kapak, adaptör ve bağlantı parçası çözümleri','Piyasada standart karşılığı olmayan ihtiyaçlar için proje bazlı değerlendirme. Şekli, eşleşen yüzeyleri ve işlevi aynı dosyada buluşturun.'],
    material:['Plastik parçalarda malzeme ve kullanım koşulları','Kabin, dış ortam veya montaj detayı için sıcaklık, UV, esneme ve yüzey beklentisini tanımlayın. Son kararı numune üzerinden doğrulayın.'],
  },
};
export const hubCopy = (brand:string, kind:string, fallback:[string,string]) => copy[brand]?.[kind] || fallback;
