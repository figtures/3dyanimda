> **11 Ekim güncellemesi:** Kod düzeltmeleri, çalışan Lighthouse ölçümleri ve açık kalan işler [güncel uygulama kaydında](IMPLEMENTATION-2026-10-11.md). Aşağıdaki 10 Ekim metni önceki keşif durumudur; buradaki "0 Lighthouse" ifadesi güncel durumu anlatmaz.

# SEO / GEO protokol karşılaştırması — 10 Ekim 2026

**Sonuç: Program tamamlanmadı.** İki Notion ana sayfası ve bağlı 20 protokolün genişletilmiş bölümleri okundu. [Gereksinim kaydı](requirements.json) 123 kontrol grubunu, kaynaklarını, eldeki kanıtı ve açıkları içerir. 123, tek tek çalıştırılmış test sayısı değildir. 20 aşamanın tamamı program düzeyinde BLOCKED; geçmişte geçen alt testler bu durumu değiştirmez.

## Bu değişiklikte yapılanlar

- `llms.txt` tüm 213 sayfayı tekrar eden bir liste olmaktan çıkarıldı: marka başına en çok 80 bağlantı / 50 KiB. Ana hizmetler ve teklif sayfası öncelikli; diğer kategoriler dengeli seçilir. Sitemap'in tam kapsamı korunur.
- Discovery girdisinde açıkça noindex, indeks dışı, 200 dışı veya başka canonical bulunan kayıtlar reddedilir. Bu statik kontrol canlı HTTP doğrulamasının yerine geçmez.
- Mobil ve masaüstünde 10 URL × 3 tekrar ölçen Lighthouse çalıştırıcısı hazırlandı. Canlı manifest, onaylı export ile eşleşmeden puan toplamaz; ham JSON/HTML raporlarını saklar. Lab LCP/CLS/TBT ile field INP birbirine karıştırılmaz.
- 50 Türkçe aday prompt hazırlandı: beş sınıfta 10'ar soru. Standart tekrar 5; karşılaştırma/risk tekrarları 10. İki yüzey için 700 gözlem planı vardır; **0 gerçek model yanıtı toplanmıştır**.
- 852 beklenen indekslenebilir URL ve marka başına 10 doğrulama URL'si, mevcut gerçek rota kaynaklarından türetildi. Bu bir canlı tarama değildir.
- 20 aşamalı hazırlık kaydının yanlışlıkla yayın onayına dönüşmesini engelleyen kontrol eklendi. `audit:protocols` envanter bütünlüğünü; `--release` ise programın hâlâ kapalı olduğunu raporlar.

## Doğrulama

11 odaklı Node testi geçti: eski discovery/Worker kontrolleri, yeni boyut/kapsam/izolasyon kontrolleri ve protokol envanteri doğrulaması. Lighthouse çalıştırıcısının sözdizimi kontrol edildi. Gerçek Lighthouse motoru veya Chrome ile başarılı bir performans çalıştırması yapılmadı.

Lighthouse denemesi, yerel onaylı export bulunmadığı için 0 çalıştırmayla BLOCKED kaydedildi. Dört alan adının `/search-manifest.json` isteği bu yürütme ortamından 502 döndü; bunun origin arızası olduğu kanıtlanmadı. Bu nedenle canlı yayının mevcut kaynakla eşleştiği doğrulanamadı.

8 Ekim tarihli rapor 796 yayımlanmış CMS içeriği, 0 taslak ve 876 yerel HTML çıktısı içeriyor. Aynı rapor Cloudflare yüklemesinin kimlik doğrulaması eksikliğinde durduğunu açıkça söylüyor. Bu geçmiş kanıt, yeni değişikliklerin export edilip canlıya alındığı anlamına gelmez.

## Kodda ve içerikte açık işler

| Alan | Kalan iş |
|---|---|
| Sosyal paylaşım | Tüm sayfalarda zorunlu, markaya uygun raster OG görseli; gerçek boyut/MIME doğrulaması; Meta/LinkedIn/X önizlemeleri |
| İçerik kalitesi | Tüm URL'lerde başlık/açıklama tekrarları, piksel genişliği ve iç bağlantı/derinlik taraması |
| Kaynak ve doğruluk | Kritik iddiaların kaynak/konum/izin/geçerlilik kaydı, answer-unit sözleşmesi ve uygun bağımsız inceleme |
| Güncellik | Anlamlı içerik değişimi ile UI/schema/sitemap tarihlerini bağlayan kontrol; kaynak değişimi alarmları |
| Schema | Sürümlü alan sözleşmeleri, geniş negatif testler ve haricî validator kanıtları |
| Performans | Gerçek Lighthouse sonuçları, kabul edilmiş route bütçeleri, CI karşılaştırması, CrUX/INP field verisi |
| Botlar | Arama/eğitim/kullanıcı tetiklemeli/sosyal amaçları ayrı kayıt; resmî bot doğrulaması; CDN/WAF/log testleri |
| Operasyon | Çalışan alarm, geri dönüş tatbikatı, kanıt saklama/silme politikası ve gerçek nöbet sorumluları |

## Dış erişim veya işletme bilgisi gerekenler

1. **Yayın:** Cloudflare hesabı/domain yetkisi; dört alan adında onaylı artifact, DNS ve TLS doğrulaması.
2. **E-posta:** EmailJS service/template kimlikleri ve anahtarlarının güvenli secret alanına kurulması; sabit alıcı `info@3dyanimda.com`; gerçek teslimat testi. Anahtarları sohbete yazmayın.
3. **Arama/ölçüm:** Google Search Console ve Bing alan adı sahipliği; gerekli GA4 akışları; canlı alım ve indeksleme kayıtları.
4. **İşletme:** Doğru yasal işletmeci bilgileri ve yayımlanabilir hukuk metinleri; varsa gerçek resmî sosyal profil bağlantıları. Bilinmeyen adres/şube/saat/fiyat/sertifika uydurulmayacak.
5. **Protokoldeki inceleme:** Gerçek yedek sorumlu ve gerekli bağımsız uzmanların kimliği. Mevcut owner-delegated AI incelemesi, insan veya Legal imzası olarak gösterilemez.
6. **GEO ölçümü:** Gerçek model yüzeyleri, izinli erişim yöntemi, maliyet sınırı ve bağımsız değerlendiriciler. Hazırlanan 700 gözlem planı çalıştırılmış değildir.

## Dokümanların projeye uyarlanması

- Kullanıcının doğruladığı `info@3dyanimda.com`, telefon ve Ataşehir atölye bilgileri geçerlidir. Figtures şablon iletişimi taşınmadı.
- Çok dilli site yokken hreflang/ikinci dil sayfaları üretilmedi.
- Google artık `rel=next/prev` kullanmıyor; olası sayfalama URL'leri kendi canonical'ını taşımalı.
- Google AI özellikleri için özel `llms.txt`/AI schema zorunluluğu yok. Bu dosya isteğe bağlı bir dizindir.
- İlk yayından önce “Indexed” veya 28 günlük gerçek kullanıcı verisi üretilemez. Bu yeni-site çelişkisi için sınırlı, kayıtlı bir başlangıç kararı gerekir.
- GEO-01/GEO-09 saklama süreleri ve GEO-01/GEO-10 bazı geri dönüş hedefleri çelişiyor. Varsayım imza yerine kullanılmadı.

Resmî teknik kaynaklar: [Google AI özellikleri](https://developers.google.com/search/docs/appearance/ai-features), [Google sayfalama](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview), [Web Vitals](https://web.dev/articles/vitals).

## Çalıştırma

```bash
node --test scripts/search/discovery.test.mjs scripts/search/llms-directory.test.mjs scripts/quality/check-protocols.test.mjs
npm run audit:protocols
npm run audit:protocols -- docs/search-program/requirements.json --release
```

Son komutun çıkış kodu **2** olması beklenir: envanter sağlam olsa da yayın kanıtı tamamlanmamıştır. Bu kontrol mevcut deploy komutunu otomatik olarak değiştirmez; gerçek yayın sertifikası yerine geçmez.

Lighthouse için onaylı üretim export'unu geri üretin, Chrome ve Lighthouse CLI'ı kurun, `CHROME_PATH` tanımlayın. Bu çalışma ortamında npm registry'de görülen sürüm 13.5.0'dır; motor bu değişiklikte kurulup çalıştırılmadı. Kurulumu kilitli bir QA ortamında tutun.

```bash
npm install --no-save --ignore-scripts lighthouse@13.5.0
CHROME_PATH=/absolute/path/to/chrome npm run audit:lighthouse -- .cloudflare/3dyanimda/release/3dyanimda.com docs/audits/lighthouse-3dyanimda.json
```

Çalıştırıcı önce canlı artifact eşleşmesini kontrol eder. 502, oturum açma ekranı, yanlış deploy veya eksik veri başarılı skor olarak kaydedilmez. Üç tekrarlı lab medyanları CrUX alan verisini ve protokolün haricî kontrollerini karşılamaz.

## Geri dönüş

Kod tabanı için başlangıç commit'i `dda4d28a0141a2036b933ee608bed83e0ce94674`. Bu değişiklik veritabanı içeriği, hesap yetkileri, DNS veya bot erişim politikasını değiştirmez. Sorun halinde yalnız yeni discovery/QA değişiklikleri geri alınır, export yeniden üretilip mevcut HTML denetimi tekrar çalıştırılır. Bu bir geri dönüş planıdır; üretim-benzeri tatbikat yapılmış değildir.
