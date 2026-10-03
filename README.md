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

- Açık zeminli ortak arayüz; tüm markalarda belirgin 3D baskı, 3D tarama ve 3D modelleme erişimi.
- Ortak anasayfa, hizmetler, yaklaşım, iletişim ve proje talep ekranları; mobil menü; markaya özel içerikler.
- Admin ve süper admin Studio modülleri korundu. Teklif ekranındaki müşteri 3D Studio’su ve kaynak fiyat motoru tekrar bağlandı; aktif FDM fiyatları ve kampanyalar tenant verisinden okunur.
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
node scripts/test-export.mjs
```

`test:db` tüm migrationları PGlite/PostgreSQL üzerinde sıfırdan uygular. Supabase Auth ve Storage sistem tablolarını minimal bir test ortamında taklit eder; RLS gerçekten çalıştırılır. Bu test canlı Supabase API, Storage HTTP/CORS ve Auth entegrasyon testinin yerine geçmez.

Tarayıcı testi dört marka, marka korunarak teklif sayfasına geçiş, önizlemede gönderimin kapalı olması, mobil menü, yatay taşma, bilinmeyen marka ve JavaScript hatalarını kontrol eder. Ekran görüntüleri `docs/previews/` altına yazılır. Var olan Chromium için `CHROMIUM_EXECUTABLE` kullanılabilir.

## Yeni Supabase ve yayına geçiş

[Kurulum adımları](docs/SETUP.md). Yeni proje bağlantısı ve kesin domain uzantıları henüz verilmediği için canlı migration/deploy yapılmadı.

`npm run export:sites`, kayıtlı canonical domainler ve public Supabase API üzerinden her marka için HTML, sitemap, robots ve 404 çıktısı hazırlar. Statik içerik güncellemesi rebuild/deploy gerektirir. SEO/GEO sıralaması veya görünürlüğü için sonuç garantisi verilmez.

Fiyatlandırma paneli korunur; kaynak firmaya ait örnek malzeme fiyatları yeni markalara kopyalanmaz. Public teklif akışı, markanın fiyat ayarları tamamlandığında STL hacmi üzerinden ön tahmin verir; eksik ayarda yalnızca teknik değerlendirme talebi alınır. STL dışındaki dosyalar teknik incelemeye yönlenir. Eski kaynak migrationlarındaki demo içerik yalnızca askıya alınmış demo tenant'ta kalır. Yeni dört tenant'a müşteri, kullanıcı, referans veya eski firma içeriği kopyalanmaz.
