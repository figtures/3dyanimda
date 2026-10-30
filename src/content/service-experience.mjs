import places from './places.json' with {type: 'json'};
import {publicLocalPath} from '../lib/local-urls.mjs';

// Shared by the visible page, JSON-LD and export audits. CMS records remain intact.
export const serviceExperienceUpdatedAt = '2026-10-25';
export const serviceCatalog = [
  {key: '3d-baski', name: '3D baskı', path: '/3d-baski', description: 'Hazır modelden prototip, montaj numunesi veya düşük adetli parça üretimi.'},
  {key: '3d-tarama', name: '3D tarama', path: '/3d-tarama', description: 'Fiziksel parçanın yüzey verisini dijitale aktarma; mesh ve CAD ihtiyacını ayrı kapsamlandırma.'},
  {key: '3d-modelleme', name: '3D modelleme', path: '/3d-modelleme', description: 'Eskiz, ölçü veya tarama referansından düzenlenebilir tasarım ve üretim dosyası hazırlama.'},
  {key: '3d-yedek-parca', name: 'Yedek parça üretimi', path: '/cozumler/yedek-parca-uretimi', description: 'Bulunamayan veya kırılmış parçayı numune, ölçü ve kullanım koşullarıyla değerlendirme.'},
];

export function serviceKey(page) {
  if (page.kind === 'location') return serviceCatalog.find(s => s.key === page.service)?.key;
  return serviceCatalog.find(s => s.path === page.path)?.key;
}

export function servicePlace(page) {
  const district = places.find(p => p.slug === page.district)?.name;
  return [page.neighborhood === 'ornek' ? 'Örnek Mahallesi' : '', district].filter(Boolean).join(', ') || 'İstanbul';
}

export function serviceExperience(page, brand = page.brand) {
  const key = serviceKey(page);
  if (brand !== '3dyanimda' || !key) return null;
  const place = page.kind === 'location' ? servicePlace(page) : 'İstanbul';
  const links = serviceCatalog.map(service => {
    // Replacement manufacturing has one published solution page; no invented district URLs.
    const scoped = page.kind === 'location' && service.key !== '3d-yedek-parca';
    const segments = ['bolgeler', 'istanbul', page.district, page.neighborhood, service.key].filter(Boolean);
    const path = scoped ? publicLocalPath('/' + segments.join('/'), brand) : service.path;
    return {...service, path};
  });
  return {key, place, links, heading: `${place} genelinde dört hizmet, tek proje akışı`};
}

const serviceQuestions = {
  '3d-baski': [
    ['{place} 3D baskı fiyatı nasıl hesaplanır?', 'Fiyat; modelin boyutu ve geometrisi, malzeme, adet, baskı ayarları ve son işlemlere göre değerlendirilir. Fiyatlandırılmış FDM malzemelerinde Studio bir ön tahmin gösterir. Kesin teklif dosya incelemesiyle netleşir; taşıma ve ek işlemler ayrıca değerlendirilir.'],
    ['3D baskı için hangi dosyaları gönderebilirim?', 'STL, OBJ, 3MF, STEP/STP ve IGES/IGS dosyalarını teklif ekranında açabilirsiniz. Dosya başına sınır 20 MB’tır. Ölçü birimini, dış boyutları, adedi ve parçanın kullanım amacını talebe ekleyin.'],
    ['Hazır 3D modelim yoksa baskı yaptırabilir miyim?', 'Fotoğraf, eskiz, teknik çizim veya fiziksel numuneyle başlayabilirsiniz. Önce eksik ölçüler ve modelleme kapsamı belirlenir; ardından onaylanan model için baskı teklifi hazırlanır. Tarama ya da modelleme bedeli baskı bedelinden ayrı değerlendirilir.'],
    ['Malzeme ve baskı yöntemini nasıl seçmeliyim?', 'Parçanın görünüm numunesi mi, montaj prototipi mi yoksa kullanım parçası mı olacağını belirtin. Sıcaklık, yük, esneklik, dış ortam ve yüzey beklentisi seçimi etkiler. FDM, reçine veya toz tabanlı üretim seçeneklerinin uygunluğu dosya ve kullanım koşullarına göre değerlendirilir.'],
    ['Tek adet veya küçük seri 3D baskı talep edebilir miyim?', 'Tek adet numune ve düşük adetli üretim için talep gönderebilirsiniz. Tekrarlı üretimde onaylanan dosya revizyonunu, adetleri ve kontrol edilecek ölçüleri birlikte paylaşın; hazırlık ve son işlem kapsamı teklife dahil edilsin.'],
    ['Büyük bir parça tek seferde basılabilir mi?', 'Önce modelin dış ölçüleri, seçilen teknoloji ve malzeme değerlendirilir. Tek parça üretime uygun değilse bölme, birleştirme ve bağlantı seçenekleri görüşülür. Her model için aynı azami boyut veya aynı dayanım sonucu varsayılmaz.'],
  ],
  '3d-tarama': [
    ['{place} 3D tarama fiyatı hangi bilgilere göre belirlenir?', 'Parçanın yaklaşık boyutu, yüzeyi, erişilemeyen bölgeleri, konumu ve istediğiniz çıktı değerlendirilir. Mesh temizliği, CAD yeniden modelleme ve ölçüm raporu ayrı çalışma kalemleridir. Fotoğraf ve hedef dosya formatıyla kapsamı netleştirebilirsiniz.'],
    ['3D tarama sonunda mesh mi, CAD dosyası mı teslim edilir?', 'Yüzey ağı ile düzenlenebilir CAD modeli farklı çıktılardır. Arşiv veya görselleştirme için mesh yeterli olabilir; parametrik düzenleme veya yeniden üretim için ek modelleme gerekebilir. İstenen format ve düzenlenebilirlik teklif aşamasında belirtilmelidir.'],
    ['Parçayı taşımadan yerinde 3D tarama yapılabilir mi?', 'Yerinde tarama talebi için parçanın fotoğraflarını, yaklaşık ölçülerini, adresini ve erişim koşullarını paylaşın. Çalışma alanı ve taranacak yüzeyler incelendikten sonra yerinde çalışma kapsamı ve takvimi belirlenir.'],
    ['Şeffaf, parlak veya koyu yüzeyler nasıl değerlendirilir?', 'Yüzey özelliği tarama yöntemini ve hazırlık ihtiyacını etkiler. Parçaya uygulanabilecek geçici hazırlık işlemleri, hassas yüzeyler ve müdahale kısıtları işe başlamadan konuşulmalıdır. Uygun yöntem fotoğraf ve numune incelemesinden sonra belirlenir.'],
    ['Tarama hassasiyeti ile parçanın ölçü toleransı aynı mı?', 'Cihazın belirtilen hassasiyeti, her parçada aynı ölçüm sonucunu garanti etmez. Geometri, yüzey ve ölçüm koşulları sonucu etkiler. Kontrol edilecek ölçüleri, kabul toleranslarını ve rapor ihtiyacını talepte ayrıca belirtin.'],
  ],
  '3d-modelleme': [
    ['{place} 3D modelleme fiyatını neler belirler?', 'Referansların yeterliliği, geometrinin karmaşıklığı, parça sayısı, revizyonlar ve teslim edilecek dosyalar birlikte değerlendirilir. Görsel model, düzenlenebilir CAD ve üretim dosyası aynı çalışma kapsamı değildir.'],
    ['Yalnızca fotoğraf veya eskizle modelleme başlayabilir mi?', 'Birden fazla açıdan fotoğraf veya eskiz ilk değerlendirme için kullanılabilir. Kritik ölçüler, karşı parçalar ve kullanım amacı ayrıca gerekir. Fotoğraf tek başına hassas montaj ölçülerini doğrulamaz; eksik referanslar belirlenerek ilerlenir.'],
    ['Modelleme sonunda hangi dosya formatını istemeliyim?', 'Baskı, görselleştirme ve sonraki CAD düzenlemesi için ihtiyaçlar farklıdır. STL/3MF gibi üretim çıktıları ile STEP/IGES gibi CAD aktarım biçimlerini kullanım amacınıza göre görüşün. Yerel proje dosyası ve düzenleme kapsamı teklif içinde açıkça tanımlansın.'],
    ['Revizyon ve dosya kullanım hakları nasıl netleştirilir?', 'İstenen değişiklikleri, revizyon sayısını, teslim dosyalarını ve kullanım haklarını teklif aşamasında yazılı olarak belirtin. Kapsam dışı değişikliklerin ücret ve takvime etkisi ayrıca değerlendirilir; sınırsız revizyon veya kaynak dosya teslimi kendiliğinden varsayılmaz.'],
    ['Hazırlanan model doğrudan baskıya uygun olur mu?', 'Baskı amaçlanıyorsa hedef üretim yöntemi, et kalınlıkları, geçmeler ve kritik yüzeyler modelleme kapsamına dahil edilir. Görsel sunum için hazırlanmış bir model ek düzenleme gerektirebilir. Üretime esas dosya revizyonu onaylandıktan sonra baskı planlanır.'],
  ],
  '3d-yedek-parca': [
    ['Hangi yedek parçalar için 3D üretim değerlendirmesi yapılabilir?', 'Kapak, düğme, muhafaza, tutucu ve benzeri parçalar için fotoğraf, numune ve kullanım koşullarıyla talep başlatabilirsiniz. Geometri, malzeme ve bağlantı ihtiyacı incelenmeden üretim uygunluğu veya orijinal parçayla eşdeğer performans sözü verilmez.'],
    ['Numune kırık veya eksikse yeniden üretim mümkün mü?', 'Kalan parça, karşı parça, teknik çizim veya ölçülerden yararlanılarak eksik geometri değerlendirilebilir. Tamamen kayıp alanlar için ek ölçü ya da tasarım kararı gerekir. Numunenin mevcut hasarını ve montaj yerini fotoğraflarla gösterin.'],
    ['Yedek parça teklifinde tarama, modelleme ve baskı ayrı mı?', 'Her proje bu üç işlemin tamamını gerektirmez. Hazır ve uygun bir dosya varsa baskıyla başlanabilir; fiziksel numune için tarama veya yeniden modelleme gerekebilir. Teklifte gerekli işlemler ve teslim çıktıları ayrı belirtilir.'],
    ['Yeniden üretilen parça orijinaliyle aynı dayanımda olur mu?', 'Malzeme adı veya dış görünüş tek başına eşdeğer dayanımı göstermez. Yük, sıcaklık, kimyasal temas, baskı yönü ve bağlantılar değerlendirilmelidir. Güvenlik açısından kritik parçalar için yetkin mühendislik değerlendirmesi ve gerekli doğrulamalar tamamlanmadan kullanım uygunluğu iddia edilmez.'],
    ['Tek adet yedek parçadan tekrar üretime nasıl geçilir?', 'İlk numunenin montaj ve kullanım değerlendirmesini kayıt altına alın. Kabul edilen ölçüler, malzeme ve dosya revizyonu netleştikten sonra tekrar üretim adedi planlanır. Numune onayı tüm kullanım koşullarına uygunluk belgesi yerine geçmez.'],
  ],
};

export function visibleServiceFaq(page, brand = page.brand) {
  const experience = serviceExperience(page, brand);
  if (!experience) return page.faq || [];
  const {key, place} = experience;
  const digital = key === '3d-modelleme';
  const additions = [
    ...serviceQuestions[key].map(([q, a]) => ({q: q.replaceAll('{place}', place), a})),
    {q: `${place} için hizmet ve teslimat nasıl planlanır?`, a: digital
      ? 'Modelleme talebinizi dosya ve referanslarla çevrim içi başlatabilirsiniz. Fiziksel örnek gerekiyorsa kargo, kurye veya randevuyla elden teslim planlanır. Dijital teslim formatı ve revizyon takvimi teklif içinde belirlenir.'
      : 'İstanbul genelindeki talepler için kargo, kurye ve randevuyla elden teslim seçenekleri değerlendirilir. Atölye Örnek Mahallesi, Ataşehir’dedir; ziyaret öncesinde randevu alınmalıdır. Hedef adres, paket boyutu ve ihtiyaç tarihi teslim planını belirler.'},
    {q: 'Acil taleplerde üretim ve teslim süresi nasıl belirlenir?', a: 'Dosya veya numune incelemesi, hazırlık, üretim ya da modelleme ve taşıma süreleri ayrı değerlendirilir. İhtiyaç tarihinizi talebe ekleyin; iş kapsamı ve kapasite kontrolünden sonra takvim teyit edilir. Kurye seçeneği üretimin aynı gün tamamlanacağı anlamına gelmez.'},
  ];
  if (key === '3d-baski') additions.push({q: 'İstanbul dışında da 3D baskı teslimatı yapılır mı?', a: 'İstanbul dışındaki adreslere kargo gönderimi yapılabilir. Adresi, paketleme ihtiyacını ve varsa hassas yüzeyleri talebe ekleyin. Taşıma süresi ve bedeli üretim süresinden ayrı değerlendirilir.'});
  // Authored CMS answers win exact duplicates; original local questions stay visible.
  const authored = page.faq || [];
  const normalize = q => q.normalize('NFC').toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
  const seen = new Set();
  return [...additions.map(f => authored.find(a => normalize(a.q) === normalize(f.q)) || f), ...authored]
    .filter(f => f.q?.trim() && f.a?.trim())
    .filter(f => {const q = normalize(f.q); if (seen.has(q)) return false; seen.add(q); return true;});
}

export function serviceContentModified(page, brand, existing) {
  if (!serviceExperience(page, brand)) return existing;
  return existing && Date.parse(existing) > Date.parse(serviceExperienceUpdatedAt) ? existing : serviceExperienceUpdatedAt;
}
