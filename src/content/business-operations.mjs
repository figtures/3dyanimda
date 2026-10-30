// Owner-confirmed operating facts, 30 October 2026. Research questions are not customer analytics.
export const operationsUpdatedAt = '2026-10-30';
export const workshopMaterials = ['ASA', 'PETG', 'ABS', 'ABS FR', 'HT PETG', 'PLA', 'Silk PLA', 'Hyper PETG'];
export const printerBrands = ['Creality', 'Bambu Lab', 'Flashforge'];
export const engineeringSoftware = ['Autodesk Fusion 360', 'SOLIDWORKS', 'Siemens NX', 'Mastercam', 'VisiCAM', 'AutoCAD', 'OrcaSlicer', 'Bambu Studio', 'Creality Print', 'Blender', 'FreeCAD'];
export const engineeringTeam = 'Rehberlerimiz mühendislik ekibimiz tarafından hazırlanır ve teknik açıdan doğrulanır. Ekip üyelerimizin alanlarında 10 yıla kadar deneyimi; savunma sanayisinden üretim atölyelerine uzanan çalışma geçmişi bulunur.';
export const materialSelection = '50’den fazla filament çeşidiyle çalışıyoruz. Malzemeyi kullanım alanı, mekanik yükler, ısınma olasılığı, geometri ve baskı koşullarını birlikte değerlendirerek seçiyoruz. Mühendislik hesaplamalarını projenin gerektirdiği kapsamda yapıyoruz.';
export const rapidPrototype = '48 saatlik hızlı prototipleme hizmeti sunuyoruz. Dosyanızı, adedi ve kullanım amacını paylaşarak projenizin bu hizmete uygunluğunu ve başlangıç zamanını teklif aşamasında netleştirin. Kargo ve kurye süresi üretim süresinden ayrı planlanır.';
export const scanInputs = 'Parçanın fotoğraflarını, yaklaşık ölçülerini ve parça adedini, taramanın kullanım amacını ve tarama yapılacak adresi paylaşın.';
export const contactOperations = {
  visit_note: 'Parçanızı Ataşehir’deki atölyemize elden bırakabilir ve işlem sonrasında geri alabilirsiniz. Ziyaret ve teslim saatini sizinle görüşerek planlıyoruz.',
  delivery_note: 'Tarama yapılacak parçaları kargoyla kabul ediyor ve işlem sonrasında geri gönderiyoruz. Gidiş ve dönüş kargo ücretleri projeye göre belirlenir. İstanbul’un tüm ilçelerine kurye hizmetimiz vardır; kurye ücreti projeye göre belirlenir. İstanbul dışına ürün gönderimi kargoyla yapılır.',
  onsite_note: 'Türkiye’nin tüm illerinde müşterinin adresinde 3D tarama yapıyoruz. Şehir dışı işlerde ulaşım ve gerektiğinde konaklama giderleri teklifte ayrı kalem olarak belirtilir. Yerinde tarama randevusu teklif onayından sonra kesinleşir.',
  service_areas: 'Türkiye',
  delivery_areas: 'Türkiye',
};
export const researchedSources = [
  {title: 'Prusa Research — Filament malzeme rehberi', url: 'https://help.prusa3d.com/filament-material-guide'},
  {title: 'Formlabs — Tersine mühendislik iş akışı', url: 'https://formlabs.com/blog/reverse-engineering/'},
];
export const operationsFaq = {
  common: [
    {q: 'İstanbul’un hangi ilçelerine kurye hizmeti veriyorsunuz?', a: 'İstanbul’un tüm ilçelerine kurye hizmeti veriyoruz. Ücret, proje koşullarına göre belirlenir; teslim alma ve teslim etme zamanı müşteriyle birlikte planlanır.'},
    {q: 'Parçamı atölyeye elden bırakıp geri alabilir miyim?', a: contactOperations.visit_note},
  ],
  '3d-tarama': [
    {q: 'Türkiye genelinde yerinde 3D tarama yapıyor musunuz?', a: contactOperations.onsite_note},
    {q: 'Yerinde 3D tarama teklifi için hangi bilgiler gerekiyor?', a: scanInputs},
    {q: 'Tarama için parçayı kargoyla gönderebilir miyim?', a: 'Evet. Tarama yapılacak parçaları kargoyla kabul ediyor, işlem sonrasında müşteriye geri gönderiyoruz. Gidiş ve dönüş kargo ücretleri projeye göre belirlenir. Gönderimden önce numune ve teslim planını birlikte netleştirelim.'},
  ],
  '3d-baski': [
    {q: '48 saatte hızlı prototipleme hizmetiniz var mı?', a: rapidPrototype},
    {q: 'Hangi filament çeşitleriyle çalışıyorsunuz?', a: materialSelection + ' Kullandığımız seçenekler arasında ' + workshopMaterials.join(', ') + ' bulunur. Belirli bir malzeme ve renk için proje aşamasında uygunluğu teyit ediyoruz.'},
  ],
};
export const researchedFaq = [
  {q: 'Malzemenin adı parçanın sıcaklık dayanımını belirlemek için yeterli mi?', a: 'Hayır. Kullanılan ürünün teknik verisi, parçaya etkiyen yük, baskı yönü ve kullanım sıcaklığı birlikte değerlendirilmelidir. Aynı malzeme ailesindeki farklı ürünler aynı sonucu vermeyebilir. Üretim sıcaklığı da parçanın güvenle kullanılabileceği sıcaklıkla aynı değildir.'},
  {q: '3D tarama dosyası doğrudan düzenlenebilir CAD modeli midir?', a: 'Genellikle taramanın ilk çıktısı bir yüzey ağıdır. Düzenlenebilir CAD için ağın temizlenmesi ve geometrinin yeniden modellenmesi gerekebilir. Kritik ölçüler ve montaj ilişkileri ayrıca kontrol edilir; istenen teslim biçimi teklif kapsamına yazılır.'},
];
export const illustrativePrice = {
  title: 'Temsili 3D baskı maliyet hesabı',
  description: 'Bir adet 100 gramlık parçanın iki saatlik FDM baskısı için hesaplama örneğidir. Aşağıdaki birim tutarlar varsayımsaldır; gerçek müşteri teklifi veya güncel fiyat tarifesi değildir.',
  rows: [
    {name:'Malzeme', calculation:'100 g × 2,50 TL/g', amount:250},
    {name:'Makine süresi', calculation:'2 saat × 150 TL/saat', amount:300},
    {name:'Dosya ve üretim hazırlığı', calculation:'1 işlem × 150 TL', amount:150},
    {name:'Destek temizliği', calculation:'1 işlem × 50 TL', amount:50},
  ],
  scope: 'Örnek ara toplam KDV ve kargo hariçtir. Modelleme, tarama, boyama ve ek revizyonlar bu senaryoya dahil değildir. Gerçek fiyat, dosya ve üretim kapsamı incelendikten sonra verilir.',
};
export function hasOperationsContent(page, brand) {
  return brand === '3dyanimda' && (page.kind === 'guide' || page.kind === 'material' || ['/3d-baski','/3d-tarama'].includes(page.path));
}
