# Dört marka · Ortak 3D üretim platformu

3dyanimda, 3dsanayi, maketyanimda ve parcayanimda için ortak React arayüzü, markaya özel içerik ve tek Supabase veritabanı. ATAVIER bu çalışmanın dışında.


Kaynak: `figtures/3d-yaninda-website`, main snapshot `524bac7c98d6e791a406c312e6c03b2a40285b7d`. Özgün firmanın `.env` dosyası alınmadı; kaynak repoya veya veritabanına yazılmadı. Bu çalışma bağımsız bir Git kopyasıdır; upstream geçmişi içermez.

Proje reposu: [figtures/3dyanimda](https://github.com/figtures/3dyanimda).

[Kurumsal tasarım ve görsel kaynakları](docs/DESIGN.md).

## Yerel çalışma

Node 22 veya üzeri:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Supabase değişkenleri boşken yalnızca geliştirme ortamında salt okunur tasarım önizlemesi çalışır:

- `http://localhost:8080/?tenant=3dyanimda`
- `http://localhost:8080/?tenant=3dsanayi`
- `http://localhost:8080/?tenant=maketyanimda`
- `http://localhost:8080/?tenant=parcayanimda`

Önizlemede formlar devre dışıdır; başka firmanın backend'ine istek yapılmaz. Production'da `?tenant=` dikkate alınmaz; bilinmeyen alan adı başka markaya düşmez.

## Uygulanan değişiklikler

- Env ile seçilen dört ortak tema (`industrial`, `industrialtwo`, `editorial`, `studio`); tüm markalarda belirgin 3D baskı, 3D tarama ve 3D modelleme erişimi.
- Ortak anasayfa, hizmetler, yaklaşım, iletişim ve proje talep ekranları; mobil menü; markaya özel içerikler.
- Admin ve süper admin Studio modülleri korundu. Teklif ekranındaki müşteri 3D Studio’su ve kaynak fiyat motoru tekrar bağlandı; aktif FDM fiyatları ve kampanyalar tenant verisinden okunur.
- **Admin → Site Yapısı → İşletme Kimliği** (`/admin/contact-info`): her marka kendi işletme adını, iletişim/adres bilgilerini, Google Haritalar profilini, sosyal hesaplarını ve hakkımızda metni/fotoğrafını yönetir. Kayıtlar seçili tenant'ın `contact_info` ayarında tutulur; `settings.edit` yetkisi gerekir. Google profilinin **Paylaş → Bağlantıyı kopyala** URL'si ile harita yerleştirme URL'si ayrı alanlardır. Boşaltılan isteğe bağlı alanlar gizlenir. Değişiklikler ortak dört temanın iletişim, hakkımızda, footer ve işletme şemasında kullanılır; statik canlı sayfalar için ilgili Cloudflare sitesi yeniden build/deploy edilmelidir. Google İşletme Profili üzerindeki bilgiler ayrıca Google'da düzenlenir.
- Her marka için 181 detay kayıt: 18 yayına hazır içerik ve 163 taslak yerel sayfa. Yönetim panelindeki İçerik & Bölgeler bölümünden düzenlenir. PostgreSQL yayın kontrolü, yetersiz yerel bilgiyi ve yer adı değiştirilmiş kopyaları engeller. Ayrıntılar: [İçerik ve SEO](docs/CONTENT-SEO.md).
- Supabase istemcisi her isteğe alan adı bağlamı ekler. RLS, içerik sorgularını seçili tenant ile sınırlar; özel veriler için ayrıca kullanıcı üyeliği/yetkisi aranır. Public host seçimi kimlik doğrulama değildir.
- Marka çözülmeden alt sayfalar ve içerik sorguları başlamaz. Ayarlar, çeviriler, SEO, yönlendirmeler ve menü verileri tenant bazında ayrılır.
- Blog/portföy/yasal sayfa slug'ları, şablon anahtarları, abone e-postaları ve yönlendirme adresleri tenant içinde benzersizdir.
- Yüklenen dosyalar tenant dizininde tutulur. Özel proje dosyalarını yalnızca ilgili yetkiye sahip yöneticiler okuyabilir.
- Teklif kaydı ve bildirim kuyruğu aynı veritabanı işleminde oluşur. E-posta gönderimi sunucu tarafındaki worker'a ayrıldı.
- İlk giriş yapan kullanıcıyı otomatik yönetici yapan eski endpoint kapatıldı. İlk yetki açıkça atanır.
- Canonical, OpenGraph, JSON-LD ve sitemap marka bağlamına taşındı. Kaynak firmanın statik sitemap'i, telefonları, konumu, örnek referansları ve teknik kapasite iddiaları yeni başlangıç sayfalarına taşınmadı.

## Doğrulama

```sh
npm run typecheck
npm test
npm run test:db
npm run build
npx playwright install chromium
npm run test:browser
npm run test:themes
npm run test:theme-env
node scripts/test-export.mjs
```

`test:db` tüm migrationları PGlite/PostgreSQL üzerinde sıfırdan uygular. Supabase Auth ve Storage sistem tablolarını minimal bir test ortamında taklit eder; RLS gerçekten çalıştırılır. Bu test canlı Supabase API, Storage HTTP/CORS ve Auth entegrasyon testinin yerine geçmez.

Tarayıcı testi dört marka, marka korunarak teklif sayfasına geçiş, önizlemede gönderimin kapalı olması, mobil menü, yatay taşma, bilinmeyen marka ve JavaScript hatalarını kontrol eder. Ekran görüntüleri `docs/previews/` altına yazılır. Var olan Chromium için `CHROMIUM_EXECUTABLE` kullanılabilir.

## Yeni Supabase ve yayına geçiş

[Kurulum adımları](docs/SETUP.md). Yeni proje bağlantısı ve kesin domain uzantıları henüz verilmediği için canlı migration/deploy yapılmadı.

`npm run export:sites`, kayıtlı canonical domainler ve public Supabase API üzerinden her marka için HTML, sitemap, robots ve 404 çıktısı hazırlar. Statik içerik güncellemesi rebuild/deploy gerektirir. SEO/GEO sıralaması veya görünürlüğü için sonuç garantisi verilmez.

Fiyatlandırma paneli korunur; kaynak firmaya ait örnek malzeme fiyatları yeni markalara kopyalanmaz. Teklif önizlemesi STL, OBJ, 3MF, STEP/STP ve IGES/IGS dosyalarını tarayıcıda açar; markanın fiyat ayarları tamamlandığında kapalı yüzeyli modellerin hacminden ön tahmin verir. Açık yüzeyler görüntülenir fakat hacim bazlı fiyat üretilmez. STL/OBJ için milimetre kabul edilir; 3MF/CAD ölçü birimleri dosyadan okunur. 3MF parça yerleşimleri ve temel renkler korunur; doku görselleri ve ayrı OBJ/MTL dosyaları yüklenmez. Önizleme sınırı 20 MB, 500.000 üçgen ve 2.000 parçadır; görüntü kontrolleri orijinal CAD geometrisini değiştirmez. Dosyalar önizleme sırasında sunucuya gönderilmez. Eski kaynak migrationlarındaki demo içerik yalnızca askıya alınmış demo tenant'ta kalır. Yeni dört tenant'a müşteri, kullanıcı, referans veya eski firma içeriği kopyalanmaz.

Cloudflare marka komutları (`npm run deploy:maketyanimda` vb.) build değişkenleri boşsa o markanın kayıtlı public Supabase bağlantısı, kendi `.com` alan adı, Worker adı ve `industrial` temasıyla çalışır. Ortam değişkenleri bu varsayılanları, yerel `deploy/<marka>/.env` ise ortam değişkenlerini geçersiz kılar. `SITE_DOMAIN=https://maketyanimda.com/` gibi kök URL'ler normalize edilir; başka markanın alan adı, URL yolu veya kimlik bilgileri reddedilir. Gizli dağıtım anahtarlarının varsayılanı yoktur; Cloudflare Builds yetkilendirmesi ayrıca gerekir. Özel alan adı route'u ancak `WORKER_CUSTOM_DOMAIN=true` ile oluşturulur; mevcut Cloudflare domain ayarları kullanılabilir.

## Three interface themes

Set `VITE_SITE_THEME=industrial`, `industrialtwo`, `editorial` or `studio` in `.env.local`.
Per-brand overrides are available; see [theme setup and previews](docs/THEMES.md).
Restart development / rebuild production after changing env values.

`industrial` retains the current orange/charcoal design. `industrialtwo` preserves the original green Industrial palette with the current shared home flow. Select it in the private preview theme picker, or set `VITE_SITE_THEME=industrialtwo` for a brand build. Existing environment defaults are unchanged.
