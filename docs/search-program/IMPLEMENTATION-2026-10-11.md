# 11 Ekim 2026 uygulama ve doğrulama kaydı

Bu kayıt yapılan kod düzeltmelerini gösterir. Notion'daki 20 aşamanın tamamı için yayın/insan incelemesi/gerçek dünya ölçümü onayı değildir. Genel program kararı hâlâ BLOCKED / NO-GO'dur. Kullanıcının devrettiği AI incelemesi insan veya hukuk incelemesi olarak gösterilmemiştir.

## Uygulanan düzeltmeler

- Dört marka için 1200×630 PNG paylaşım görselleri; OG/Twitter başlık, açıklama, görsel, boyut ve dil alanları.
- React Suspense sırasında oluşan mükerrer JSON-LD giderildi. Tek grafik, kararlı kimlikler ve çelişen alanları reddeden birleştirme kullanılıyor.
- Arama başlıkları tam görünür H1 korunarak sadeleştirildi. Export denetimi tüm sayfalarda benzersiz başlık/açıklama, bir H1, canonical, sosyal görsel, iç bağlantı, erişim derinliği ve yetim sayfaları kontrol ediyor. Başlık/açıklama piksel ölçümleri tavsiye niteliğindedir; Google gösterimi garantisi değildir.
- 15 birincil kaynak kayıt altına alındı; ilgili malzeme, dosya hazırlığı ve tarama sayfalarına kapsamı açık teknik notlar eklendi. Genel kaynaklar işletmenin kapasitesi veya bütün iddiaları için kanıt olarak sunulmuyor.
- Görünür güncelleme tarihi, schema ve sitemap aynı anlamlı içerik tarihini kullanıyor. Canlı veritabanı tetikleyicisi yalnız durum/inceleme kaydındaki değişikliklerin içerik tarihini ileri taşımasını engelliyor.
- Ana görsellerin duyarlı AVIF sürümleri hazırlandı. Türkçe yazı tipi alt kümeleri 186 KB yerine 64 KB; özgün font ve lisansları yedek olarak korunuyor. Ekran dışı 3D gösterimler gecikmeli yükleniyor.
- Export, okunabilir ilk HTML'yi koruyor; gereken CSS gömülüyor ve JavaScript kapalıyken tam CSS yedeği var. Yalnız aynı sayfa/markaya ait anonim okuma yanıtları ilk açılışta bir kez kullanılabiliyor; yazma, kullanıcı oturumu, başka marka ve sonraki gezinmeler canlı API'ye gidiyor.
- Özel demo alan adı açıkça tanımlandı, gerçek Supabase bağlantısı eklendi. Marka/tema seçimi iç bağlantılarda korunuyor. Bu özel önizleme noindex kalır.
- EmailJS bildirim işçisi canlı Supabase'e kuruldu. Alıcı sunucu tarafında info@3dyanimda.com olarak sabit. Yetkisiz çağrı 401 döndü. Gerçek teslimat testi yapılmadı.
- Resmî kaynaklara dayalı, arama/eğitim/kullanıcı isteği/sosyal botları ayıran 13 kayıtlı bot envanteri ve operasyon dokümanı eklendi.

## Gerçek test kanıtı

327 kapsamlı aday sayfa/tema senaryosu ve sonraki 48 değişiklik senaryosu geçti. Son kaynakta 80 Vitest testi, 41 Node/Chromium testi ve TypeScript kontrolü geçti. Dört paylaşım kartı ve 12 marka/tema ana sayfa görüntüsü AI tarafından görsel olarak incelendi. Tüm eski içerik ve özgün model/görseller için 8 Ekim kanıtları değişmeden korunmuştur; eski bütün-sayfa incelemesi yeni yapılmış gibi gösterilmez.

Lighthouse 13.5.0 gerçek Chromium üzerinde çalıştırıldı. İlk aşama 7 hedef × 3 tekrar, son kontrast/ilk açılış düzeltmeleri için iki hedef × 3 tekrar yapıldı. Ham sıkıştırılmış JSON raporları ve SHA-256 değerleri docs/audits altında bulunur. Oturum kurtarmasında ağ hatası alan ölçüm geçersiz sayıldı ve yeniden çalıştırıldı.

| Son ölçüm, 3dyanimda | Mobil performans (3 tekrar) | Erişilebilirlik | En iyi uygulamalar |
|---|---|---|---|
| /3d-baski | 86 / 99 / 87 | 100 / 100 / 100 | 100 / 100 / 100 |
| /teklif-al | 99 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 |

Ölçümler gzip sunuculu yerel aday artifact içindir. Canlı CDN/DNS/TLS performansı değildir. Localhost noindex olduğu için SEO kategorisi 66–69; bu gerçek alan adının SEO puanı değildir. TBT, field INP değildir. Hizmet sayfasında medyan lab LCP yaklaşık 4,0 saniye: 2,5 saniye hedefi henüz karşılanmadı. Bu açık gizlenmiyor.

## Kapanmayan gereksinimler

1. Dört gerçek alan adının Cloudflare yayını, TLS/HTTP/robots/sitemap/CDN doğrulaması için hesap erişimi. Bu ortamın alan adı istekleri proxy kaynaklı 502/connection-refused verdi; origin'in bozuk olduğu kanıtlanmadı.
2. EmailJS service/template/public/private anahtarları, worker secret ve zamanlayıcı; ardından sahibinin yetkilendirdiği gerçek teslimat testi. Anahtarlar sohbete yazılmamalı, güvenli secret alanına girilmeli.
3. Yasal işletmeci kimliği ve yayımlanabilir hukuk metinleri. Altı eksik hukuk sayfası dürüst boş durumla noindex kalır; sahte metin/şube/sertifika üretilmedi.
4. GSC/Bing sahipliği ve canlı indeksleme, GA4 gerçek alım, haricî schema ve Meta/LinkedIn/X önizleme doğrulaması, CDN/WAF/bot logları.
5. Hizmet sayfası LCP hedefi, rotaya özgü kabul edilmiş bütçeler ve CI regresyon bağlantısı; 28 günlük CrUX/INP ve canlı kullanıcı verisi.
6. Kaynak değişimi alarmı, gerçek nöbet/yedek sorumluları, saklama politikası, geri dönüş tatbikatı ve protokolün bağımsız insan onayları.
7. İki gerçek GEO model yüzeyinde 700 gözlem planının yürütülmesi, maliyet/erişim düzeni ve bağımsız değerlendirme. Gerçek model gözlemi hâlâ 0; indeksleme, sıralama veya satış artışı garanti edilmez.

Eksiklerin bir bölümü kodla, diğerleri gerçek hesap/işletme bilgisi ve zaman içinde oluşan kanıtla kapanır. Bu çalışma genel protokol kaydını otomatik PASS yapmaz.
