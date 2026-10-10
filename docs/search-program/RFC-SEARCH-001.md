# RFC-SEARCH-001 — Notion protokol uyumu

Durum: **IMPLEMENTATION PREPARED / RELEASE BLOCKED**. Yayın veya bağımsız insan imzası değildir.

## Somut değişiklik ve gerekçe
GEO-06'nın boyut/link sınırını aşabilen llms dizinini sınırla; SEO-07 gerçek lab sonuçlarını yanlış artifact üzerinde toplamayı engelle; GEO-09 için tekrarlanabilir aday prompt seti hazırla; 20 aşamanın kapsamını kanıt ve açıklarla kaydet.

Kapsam: 3dyanimda.com, 3dsanayi.com, maketyanimda.com, parcayanimda.com. Dil/pazar: tr-TR / Türkiye. 796 mevcut landing içeriği ve 56 sabit indeks sayfası; yasal utility sayfaları ayrı noindex kapsamındadır.

## Seçenekler
1. Hiç değiştirmeme: llms dizini protokol link sınırını aşar; ölçüm kanıtı eksik kalır.
2. Seçilmiş sınırlı dizin + tam sitemap (hazırlanan): keşif dosyası yönetilebilir kalır, tüm canonical rota kümesi korunur.
3. llms dosyasını kaldırma: Google için özel gereklilik olmadığından teknik olarak mümkündür; kullanıcı playbook'unda yer aldığı için burada seçilmedi.

## Arama ve sosyal etki
URL, canonical, redirects ve robots izinleri değişmiyor. Sitemap kapsamı daralmıyor. llms bağlantı seti küçülüyor; bunun sıralama veya görünürlük artışı olduğu ileri sürülmüyor. OG eksikleri kayıtta açık; bu RFC'de tamamlandığı iddia edilmiyor.

## Yönlendirme ve sorgu politikası
Mevcut kod sabit hizmet alias'larını ve CMS yönlendirmelerini aynı marka içinde doğrular; zinciri son yayımlı hedefe indirger. Worker HTTPS/apex/slash düzeltmesiyle kalıcı tek yönlendirme yapar ve campaign parametrelerini korur; canonical sorgu parametresi içermez. Yeni redirect eklenmedi; geçmiş coğrafi konsolidasyon önerisi uygulanmadı.

## Doğrulama
[URL envanterindeki](url-inventory.json) 40 örnek; discovery boyut/etiket/izolasyon testleri; yeni artifact sonrası tam HTML/sitemap/schema denetimi; canlı GSC/validator/social ölçümleri. Tarihsel statik rapor yeni export için yeniden kullanılmaz. Mobil+masaüstü Lighthouse 10 route × 3 tekrar × 2 cihaz/marka; CrUX ayrı.

## Sahiplik ve gerçek onay durumu
| İş | Sorumlu | Hesap veren | Bağımsız inceleyen / yedek | Durum |
|---|---|---|---|---|
| Kod ve otomatik doğrulama | Codex (AI) | Proje sahibi | Atanmadı | Kod hazırlanmış; bağımsız review yok |
| İşletme gerçekleri | Proje sahibi | Proje sahibi | Atanmadı | İletişim/hizmet bilgileri kullanıcı beyanına bağlı |
| Arama ve GEO programı | Proje sahibi | Proje sahibi | Atanmadı | GSC/model erişimi ve yedek eksik |
| Yayın ve geri dönüş | Codex uygulama hazırlığı | Proje sahibi | Operasyon yedeği atanmadı | Cloudflare erişimi ve tatbikat eksik |
| Hukuk/gizlilik | Uygun gerçek uzman atanmadı | Proje sahibi | Atanmadı | AI bu rolün imzasını oluşturmaz |
| Kör değerlendirme | Atanmadı | Proje sahibi | İkinci değerlendirici atanmadı | 0 gerçek run |

Tek kişi için birden fazla hayalî rol/backup oluşturulmadı. Kullanıcının önceki yayın ve AI inceleme yetkisi korunur; yeni dokümanın bağımsız insan incelemesi şartına eşdeğer olduğu iddia edilmez.

## Risk ve telafi
- Yanlış başarı iddiası: 20 gate BLOCKED; 0 Lighthouse/model sonucu açık kayıtlı.
- Yanlış iş kimliği: yalnız kullanıcı doğrulaması; yasal işletmeci/saat/sertifika bilinmeyen bırakılır.
- Yanlış artifact ölçümü: Lighthouse canlı manifest hash alanlarıyla yerel export'u karşılaştırır.
- GEO maliyet/yanlılık: 700 gözlem adayı; bütçe ve izin olmadan otomatik veya ücretli batch başlatılmaz.
- Yeni site saha verisi eksikliği: uydurulmuş CrUX/GSC verisi yerine sınırlı başlangıç/izleme kararı gerekir.
- llms çıktısı: deterministik 80 link / 50 KiB; tam sitemap; uygunsuz girdi ve bütçe aşımında build hatası.

## Rollback
Başlangıç: dda4d28a0141a2036b933ee608bed83e0ce94674. llms generator değişikliğini geri al, dört markanın export'unu yeniden üret, HTML/discovery kontrolünü çalıştır. Canlıya çıkıldıysa aynı artifact'ı geri yükle ve edge cache/headers/bot kontrollerini tekrarla. RTO hedefi öneri: llms/canonical/schema 60 dakika; gerçek süre ölçülmedi.

## Takip
T+0/T+24h: production artifact, robots/sitemap/headers/critical routes ve quote/mail kontrolü.
T+7/T+30: aynı prompt seti ve model koşulları, GSC/CrUX, doğruluk/citation, kaynak güncelliği ve açıklar.
Gerçek yayın zamanı bilinmediği için geçmiş/tahminî bir deployment tarihi, gerçekleştirilmiş toplantı, tetiklenmiş otomasyon veya imzalı exception yazılmadı.
