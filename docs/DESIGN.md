# Kurumsal arayüz — Ekim 2026

Ortak arayüz, dört ayrı müşteri kitlesinin teknik ihtiyaçlarıyla konuşur. Başlık, uygulamalar, ekip odağı, renk ve ürün görseli marka kataloğundan; yönetilebilir hero, hizmet kartı ve CTA içerikleri tenant ayarlarından gelir.

| Marka | Öncelikli müşteri ve ihtiyaç |
|---|---|
| 3dyanimda | Ar-Ge, ürün geliştirme ve kurumsal özel üretim |
| 3dsanayi | Üretim/bakım ekipleri; fikstür, aparat ve muhafaza |
| maketyanimda | Mimarlık ve gayrimenkul ekipleri; ölçekli sunum modelleri |
| parcayanimda | Servis ve teknik ekipler; özel plastik parçalar |

Antrasit zemin, geniş tipografi, teknik işaretlemeler ve kontrollü marka rengi kullanılır. Uygulama sekmeleri, departman odaklı açıklamalar, dört aşamalı proje süreci ve indirilebilir teknik talep şablonu, değerlendirme ve teklif yolunu görünür kılar. Kurumsal referans, sertifika veya doğrulanmamış kapasite iddiası eklenmez.

Teklif formunda departman, referans/revizyon, hedef tarih, malzeme, kullanım koşulları ve gizlilik sözleşmesi görüşme talebi bulunur. Ek bilgiler mevcut `part_description` alanına etiketlenerek eklenir; `material_pref` kendi alanına kaydedilir. Metin sınırları veritabanındaki 5000 karakter sınırının altında tutulur. Hedef tarih teslim taahhüdü değildir. Supabase bağlı olmayan geliştirme önizlemesinde gönderim kapalıdır.

`20261001100000_corporate_brand_content.sql` yalnızca özgün başlangıç değerleriyle aynı kalan ayarları günceller; yöneticinin değiştirdiği içerikleri korur. Bu migration `node scripts/refresh-brand-content.mjs` ile yeniden üretilebilir. İlk seed generator donmuş v1 kataloğu kullanır; geçmiş migration dosyalarını yeniden yazmak için güncel katalog kullanılmaz.

## Konsept görseller

Üç görsel yerleşik Imagegen ile 1 Ekim 2026 tarihinde üretildi. Site üzerinde konsept görsel olarak etiketlenir; gerçek imalat, müşteri işi veya teknik çizim değildir. Çıktılar 1536×1024 PNG olarak üretildi ve içerik değiştirilmeden WebP kalite 88'e dönüştürüldü. Webde dış görsel kaynağına bağlı değildir.

Üretim briefleri:

- `public/brand/industrial/fixture.webp`: Premium industrial CGI; exploded black layered polymer assembly fixture, slotted base plate, upright supports, suspended ribbed housing, orange locating inserts and steel fasteners. Dark charcoal studio background, precise rim lighting, no logos, labels or text. Used by 3dyanimda and 3dsanayi.
- `public/brand/industrial/architecture.webp`: Ivory architectural campus scale model on a charcoal presentation plinth, bronze paths, miniature trees and a floating modular building element. Premium dark studio product rendering, no text or logos. Used by maketyanimda.
- `public/brand/industrial/parts.webp`: Automotive polymer air vent adapter, curved trim bezel and small orange clip. Non-safety-critical interior components, dark charcoal studio composition, detailed polymer surface, no text or logos. Used by parcayanimda.

Bunlar üretim brieflerinin kayıtlarıdır; müşteri onaylı ürün geometrileri değildir. Gerçek üretim fotoğrafları hazır olduğunda hero görseli admin panelinden değiştirilebilir.

## Doğrulama

TypeScript, Vite production build, 5 tenant birim testi ve tüm migrationları uygulayan PostgreSQL/PGlite testleri geçti. RLS testleri markalar arası okuma/yazma/yükleme, özel dosya erişimi, domain eşleştirme ve bildirim kuyruğunu kapsar. Ek testler kurumsal içerik migrationını ve yönetici değişikliklerinin korunmasını doğrular.

Playwright dört marka ana sayfasını, klavye ile uygulama seçimini, teknik teklif bağlantısını, yeni form alanlarını, geliştirme önizlemesinde kapalı gönderimi, mobil menüyü ve yatay taşmayı kontrol eder. Canlı Supabase HTTP/Auth/Storage entegrasyonu ve domain yayını için yeni proje bağlantısı gereklidir.
