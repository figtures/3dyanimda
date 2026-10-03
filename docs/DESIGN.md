# Üç ortak arayüz — 3 Ekim 2026

Dört marka için üç ayrı, çalışan public tema aynı repoda bulunur. Seçim ve kurulum: [THEMES.md](THEMES.md).

- **Industrial:** tam genişlikte parça görseli, petrol tonları, açık yeşil eylemler ve koyu hizmet başlıkları.
- **Editorial:** büyük tipografi, sıcak açık zemin, turuncu eylemler, CAD/nokta bulutu/katı model gösterimi ve yatay hizmet satırları.
- **Studio:** gri/mavi teknik arayüz, hizmet seçimi, ana sayfadan gerçek dosya seçme ve teklif sayfasına aktarım.

Başlıklar yerel Rethink Sans, metinler yerel Inter kullanır. Latin Extended Türkçe karakterleri kapsar. Lisanslar `public/fonts` içindedir. Morrama'nın fontunun tespit edildiği iddia edilmez.

Tüm temalar aynı tenant içeriklerini, üç ana hizmeti, çözümleri, rehberleri, bölge sayfalarını ve çalışan teklif motorunu kullanır. Admin ve süper admin ekranları korunur. ATAVIER kapsam dışındadır.

Bu sürüm önceki açık zeminli, yan yana metin/görsel hero tasarımının yerine geçer. Yeni gerçek tarayıcı görüntüleri `docs/previews/themes/` altındadır; üst dizindeki eski önizlemeler önceki sürümü gösterir.

Editorial ve Studio'daki mavi fikstür `src/themes/PartScene.tsx` içinde yerel geometriyle üretilir. Çizgi/nokta bulutu/katı yüzey aynı temsili geometrinin gösterimleridir; ölçüm veya gerçek müşteri üretimi değildir. WebGL yoksa yerel görsel kullanılır. Sürekli animasyon veya uzak model bağımlılığı yoktur.

## Konsept görseller

Üç görsel yerleşik Imagegen ile 1 Ekim 2026 tarihinde üretildi. Site üzerinde konsept görsel olarak etiketlenir; gerçek imalat, müşteri işi veya teknik çizim değildir. Çıktılar 1536×1024 PNG olarak üretildi ve içerik değiştirilmeden WebP kalite 88'e dönüştürüldü. Webde dış görsel kaynağına bağlı değildir.

Üretim briefleri:

- `public/brand/industrial/fixture.webp`: Premium industrial CGI; exploded black layered polymer assembly fixture, slotted base plate, upright supports, suspended ribbed housing, orange locating inserts and steel fasteners. Dark charcoal studio background, precise rim lighting, no logos, labels or text. Used by industrial-theme 3dyanimda/3dsanayi and application detail pages.
- `public/brand/industrial/architecture.webp`: Ivory architectural campus scale model on a charcoal presentation plinth, bronze paths, miniature trees and a floating modular building element. Premium dark studio product rendering, no text or logos. Used by maketyanimda.
- `public/brand/industrial/parts.webp`: Automotive polymer air vent adapter, curved trim bezel and small orange clip. Non-safety-critical interior components, dark charcoal studio composition, detailed polymer surface, no text or logos. Used by parcayanimda.

Bunlar üretim brieflerinin kayıtlarıdır; müşteri onaylı ürün geometrileri değildir. Gerçek üretim fotoğrafları hazır olduğunda hero görseli admin panelinden değiştirilebilir.

## Doğrulama

TypeScript, üretim build'i, fiyat formülü / içerik / tenant birim testleri, yeni migrationlar dahil PostgreSQL/RLS testleri ve dört markanın tarayıcı senaryoları çalıştırılır. Tarayıcı testleri geçerli/bozuk STL, STEP geri dönüşü, adet değişimi, hizmet seçimi, taslakların kapanması, mobil menü ve taşmayı kapsar. HTML export ayrıca yerel public API örneğiyle doğrulanır.
