# Yeni Supabase kurulumu

Bu adımlar yalnızca yeni, boş ve bu dört marka için ayrılmış proje içindir. Kaynak firmanın veritabanına uygulanmaz.

## 1. Yeni proje bağlantısı

`.env.example` dosyasını `.env` olarak kopyalayın. Yeni projenin URL ve publishable/anon key değerlerini girin. Service role anahtarı frontend'e konulmaz.

```sh
npx supabase login
npx supabase link --project-ref YENI_PROJE_REF
npx supabase db push
```

Tarih sıralı bütün migrationlar uygulanır. Son iki migration tenant izolasyonunu güçlendirir, dört markayı ve başlangıç içeriklerini ekler. Tekrar üretilebilir seed kaynağı `src/brands/catalog.json` + `scripts/seed-brands.mjs` dosyalarıdır. Migration uygulandıktan sonra içerik değişiklikleri için admin panelini veya yeni migration kullanın; uygulanmış migrationları yeniden yazmayın.

## 2. İlk yöneticiyi açıkça atayın

Yeni Supabase Auth panelinden kendi yönetici hesabınızı oluşturun. Bu kullanıcının UUID'sini kullanarak SQL Editor'da çalıştırın:

```sql
insert into public.user_roles(user_id, role)
values ('KENDI_AUTH_USER_UUID', 'super_admin')
on conflict (user_id,role) do nothing;

insert into public.tenant_users(tenant_id,user_id,role_slug,status)
select id,'KENDI_AUTH_USER_UUID','owner','active'
from public.tenants
where slug in ('3dyanimda','3dsanayi','maketyanimda','parcayanimda')
on conflict (tenant_id,user_id) do nothing;
```

`/admin/login` seçili markanın yönetimine, `/studio/tenants` tüm markaların ayarlarına erişir. Her gerçek alan adı kendi Auth oturumunu tutar; kullanıcı aynı hesapla oturum açabilir. Kaynak firmanın kullanıcıları aktarılmaz. Geliştirme önizleme seçimi yalnızca localhost'tadır; production'da Studio'nun Önizle bağlantısı ilgili domaini açar.

## 3. Gerçek alan adlarını bağlayın

Henüz `.com`, `.com.tr` veya başka uzantılar varsayılmadı. Dört tenant yalnızca yerel test eşleşmeleriyle oluşturulur.

Studio'dan ilgili tenant'ın `domain` alanına protokolsüz, küçük harfli kesin alan adını girin. Bu işlem `tenant_domains` tablosuna domaini ve `www` karşılığını ekler. Host eşleşmeleri veritabanında benzersizdir. `custom_domain`, canonical tercihi olarak `domain` değerinden önce gelir.

Her domaini aynı uygulama dağıtımına bağlayın. Domain doğrulaması ve TLS hosting sağlayıcısında yapılır. Hosting katmanında www/canonical yönlendirmelerini kurun. Uygulama bilinmeyen hostu başka markaya yönlendirmez. Yerel aliaslar public içerik testleri içindir; özel içerikler için yine kimlik doğrulama ve üyelik gerekir.

## 4. İçerikleri yönetin

| Panel | Yeni arayüzdeki karşılığı |
| --- | --- |
| Ana Sayfa | Hero metni/görseli ve uzmanlık metni |
| İçerik & Bölgeler | Hizmet, çözüm, malzeme, rehber ve konum sayfaları; yayın kontrolü |
| Fiyatlandırma / Kampanyalar | Marka bazlı Studio hesabı; aktif FDM malzemeleri ve fiyat ayarları |
| Site Ayarları | Header yatay logo |
| İletişim | E-posta, telefon ve adres |
| Navigasyon | Header ek bağlantıları |
| SEO | Sayfa başlığı, açıklama, görsel ve noindex |
| Yasal | Markanın kendi gizlilik ve yasal belgeleri |
| Talepler | Yalnızca seçili markanın teklifleri ve dosyaları |
| Sayfalar / Koleksiyonlar / Rotalar | Markaya özel CMS ve yerel içerik sayfaları |

Yeni markalarda yasal unvan, telefon, e-posta veya teslimat taahhüdü uydurulmadı. Yasal belgeler ve gerçek iletişim bilgileri panelde tamamlanmalıdır. Eski firmanın ilçe SEO metinleri yeni markalara kopyalanmadı; `/istanbul/:ilce/:hizmet`, yalnızca yeni yerel kayıt yayınlanmışsa karşılığına yönlenir. Ayrıntılar `docs/CONTENT-SEO.md` içinde.

## 5. E-posta yönlendirmeleri

Supabase secrets olarak `RESEND_API_KEY`, uzun rastgele `QUOTE_WORKER_SECRET` ve `BRAND_EMAIL_ROUTES` tanımlayın. Sonuncusu marka slug'ını alıcı ve doğrulanmış göndericiye bağlayan JSON'dur:

```json
{
  "3dyanimda": {"from": "3D Yanımda <DOGRULANMIS_GONDERICI>", "to": ["BILDIRIM_ALICISI"]},
  "3dsanayi": {"from": "3D Sanayi <DOGRULANMIS_GONDERICI>", "to": ["BILDIRIM_ALICISI"]},
  "maketyanimda": {"from": "Maket Yanımda <DOGRULANMIS_GONDERICI>", "to": ["BILDIRIM_ALICISI"]},
  "parcayanimda": {"from": "Parça Yanımda <DOGRULANMIS_GONDERICI>", "to": ["BILDIRIM_ALICISI"]}
}
```

```sh
npx supabase functions deploy send-email
npx supabase functions deploy send-quote-email
npx supabase functions deploy sitemap
npx supabase functions deploy invite-tenant-user
npx supabase functions deploy provision-tenant-user
npx supabase functions deploy eject-tenant
```

`send-quote-email` artık tarayıcıdan çağrılmaz. Sunucu cron işinin POST ile çağıracağı bir worker'dır; Authorization başlığında `Bearer QUOTE_WORKER_SECRET` ister. Cron ayrıca yapılandırılmalıdır; bu çalışmada gerçek e-posta gönderilmedi. Eksik e-posta ayarında teklifler ve bildirim kuyruğu saklanmaya devam eder. Beş başarısız denemeden sonra kayıtlar operatör incelemesi bekler. Aynı bildirim için Resend idempotency anahtarı kullanılır; sağlayıcının idempotency süresi dışında otomatik exactly-once garantisi yoktur.

`send-email` Auth kullanıcısını ve tenant yetkisini doğrular; gönderici marka secret'ından seçilir. `bootstrap-first-admin` dağıtılmaz; eski otomatik yetki verme davranışı kapatılmıştır.

## 6. Hosting ve SEO

Supabase public URL/key ile üretim bundle'ı oluşturun. Tenant kayıtlarındaki gerçek domainleri ve DNS/TLS ayarlarını önce tamamlayın. Canonical host bilgisi ve içerik yayın durumu doğrulanmadan export durur.

```sh
npm run build
SITE_HOSTS=3dyanimda.com,3dsanayi.com,maketyanimda.com,parcayanimda.com npm run export:sites
```

Domain listesi örnektir: yalnızca satın alınmış, doğrulanmış ve tenant'a atanmış gerçek hostları yazın. İlk kullanımda `npx playwright install chromium` gerekir; alternatif Chromium binary'si `CHROMIUM_EXECUTABLE` ile belirtilebilir.

Her `release/HOST/` dizini o markanın HTML sayfaları, ortak JS/CSS, sitemap ve robots dosyalarını içerir. Her domain kendi dizininden servis edilir. `_redirects` ve `_headers`, Cloudflare Pages/Netlify biçimindedir. Başka bir host için aynı kuralları adapte edin: mevcut HTML sayfalarını sun, admin/studio yollarında app.html kullan, bulunmayan public URL'lerde 404.html ve HTTP 404 dön. Canonical dışındaki www/domain aliasları sunucu katmanında 301/308 yönlendirilmeli.

İçerik değişikliklerinden sonra `npm run build` ve `npm run export:sites` yeniden çalıştırılıp çıktı yeniden yayınlanmalıdır. Bu sürüm otomatik rebuild webhook'u kurmaz. Anlık API verisi istemcide yenilenebilir; arama motorunun aldığı statik HTML son export'un snapshot'ıdır. Yayından kaldırılan içeriği HTTP'den kaldırmak için rebuild/deploy gerekir.

Supabase sitemap fonksiyonu da yayın/noindex kurallarını uygular. Statik export kullanılıyorsa üretilen `/sitemap.xml` esas alınır; ikinci bir proxy gerekli değildir.

Yeni Supabase üzerinde Auth girişi, marka A/B RLS, teklif + yükleme, signed URL, admin düzenlemesi ve e-posta cron gerçek servislerle doğrulanmalı. Yerel PostgreSQL ve örnek API testleri gerçek Supabase servis entegrasyonunun yerine geçmez.

## 7. 3D Studio

Tüm markalarda `/teklif-al` içinde STL önizleme, döndürme/yakınlaştırma, mm bazlı boyut/hacim ölçümü, FDM malzeme, kalite, renk, doluluk ve adet seçimi vardır. Fiyat formülü kaynak motorla aynı tutulmuştur. Sonuç müşteri tarafında hesaplanan ön tahmindir; resmi fiyat veya ödeme tutarı olarak güvenilmez. Aktif kampanya varsa ön tahmine uygulanır; yapay geri sayım bulunmaz.

Production ortamında aktif malzeme ve `margin_percent`, `vat_percent`, `labor_per_hour`, `min_order_price` ayarları eksiksiz olmalıdır. Eksik ayarda fiyat gösterilmez; teknik talep alınır. SLA/SLS fiyatı FDM hacim formülüyle hesaplanmaz. Tarama ve modelleme talepleri kapsam üzerinden değerlendirilir.

STL dışında OBJ/3MF/STEP/IGES dosyaları teknik incelemeye alınır; bu formatlarda otomatik önizleme/ölçüm yoktur. Dosya sınırı 20 MB. Dosyalar tenant klasöründe özel storage'a gider. Form, yapılandırmayı mevcut teklif kayıtlarına ve bildirim kuyruğuna bağlar. Geliştirme demosunun fiyatları örnektir ve gönderim kapalıdır.

## Durum

Yeni arayüz, içerik altyapısı, Studio ve HTML export kodu hazırdır. Canlı Supabase migration, domain/DNS, hosting ve e-posta dağıtımı henüz yapılmadı.
