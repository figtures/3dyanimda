# Ortak arayüz — 2 Ekim 2026

Referans yönü: Terminal'in modern sunumu, Türkiye'de doğrudan hizmet anlaşılabilirliği ve üç ana hizmete açık erişim. Açık zemin, lacivert metin, mavi eylem rengi; büyük ama okunaklı başlıklar, somut parça görselleri ve doğrudan Studio girişi.

Başlıklarda yerel Rethink Sans, metinlerde yerel Inter kullanılır. Latin ve Latin Extended dosyaları Türkçe karakterleri kapsar. Font lisansları `public/fonts` içindedir. Bu seçim Morrama'nın gerçek fontunun tespit edildiği anlamına gelmez.

Dört markanın ortak menüsünde 3D Baskı, 3D Tarama, 3D Modelleme görünür. Ana sayfa üç hizmeti, markanın dört uzmanlık çözümünü, Studio'yu, üretim sürecini, rehberleri ve İstanbul kapsamını gösterir. Admin hero/uzmanlık ayarları korunur; detay içerikler yeni İçerik & Bölgeler bölümünden yönetilir.

Referans firma logosu, müşteri isimleri, sayısal başarı iddiaları ve teslimat vaatleri taşınmaz. Görseller temsili uygulama olarak etiketlenir. 3dyanimda hero'su kaynak repodan gelen `hero-engine-part.jpg` dosyasıdır; gerçek müşteri işi olarak sunulmaz.

## Konsept görseller

Üç görsel yerleşik Imagegen ile 1 Ekim 2026 tarihinde üretildi. Site üzerinde konsept görsel olarak etiketlenir; gerçek imalat, müşteri işi veya teknik çizim değildir. Çıktılar 1536×1024 PNG olarak üretildi ve içerik değiştirilmeden WebP kalite 88'e dönüştürüldü. Webde dış görsel kaynağına bağlı değildir.

Üretim briefleri:

- `public/brand/industrial/fixture.webp`: Premium industrial CGI; exploded black layered polymer assembly fixture, slotted base plate, upright supports, suspended ribbed housing, orange locating inserts and steel fasteners. Dark charcoal studio background, precise rim lighting, no logos, labels or text. Used by 3dsanayi and application detail pages.
- `public/brand/industrial/architecture.webp`: Ivory architectural campus scale model on a charcoal presentation plinth, bronze paths, miniature trees and a floating modular building element. Premium dark studio product rendering, no text or logos. Used by maketyanimda.
- `public/brand/industrial/parts.webp`: Automotive polymer air vent adapter, curved trim bezel and small orange clip. Non-safety-critical interior components, dark charcoal studio composition, detailed polymer surface, no text or logos. Used by parcayanimda.

Bunlar üretim brieflerinin kayıtlarıdır; müşteri onaylı ürün geometrileri değildir. Gerçek üretim fotoğrafları hazır olduğunda hero görseli admin panelinden değiştirilebilir.

## Doğrulama

TypeScript, üretim build'i, fiyat formülü / içerik / tenant birim testleri, yeni migrationlar dahil PostgreSQL/RLS testleri ve dört markanın tarayıcı senaryoları çalıştırılır. Tarayıcı testleri geçerli/bozuk STL, STEP geri dönüşü, adet değişimi, hizmet seçimi, taslakların kapanması, mobil menü ve taşmayı kapsar. HTML export ayrıca yerel public API örneğiyle doğrulanır.
