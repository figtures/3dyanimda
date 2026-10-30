# 3D Yanımda — SEO kontrol listesi

Son güncelleme: 26 Ekim 2026. Bu belge yerel kod hazırlığını, mevcut canlı gözlemleri ve hesap işlemlerini ayrı değerlendirir. Yeni site kodu henüz GitHub'a gönderilmedi veya yayımlanmadı. 109 maddelik planın güncel satır bazlı durumu `seo-pre-sitemap-status-2026-10-26.json` dosyasındadır. 25 Ekim kayıtları tarihsel başlangıcı korur. Sitemap gönderimi kullanıcı isteğiyle bekletiliyor; tüm maddeler kapanmış değildir.

| Madde | Durum | Kanıt ve kalan iş |
| --- | --- | --- |
| 1. Teknik SEO | Kod hazır; yayın doğrulaması bekliyor | `Seo` ile sayfa bazlı title, açıklama, canonical, OG/Twitter ve keywords; yayın envanterinden dinamik sitemap. Kısa yerel URL'ler ve eski URL'lerden 301 önceki yerel commitlerde hazır. 25 Ekim tam canlı taramada 230/230 sayfa 200, tek H1, self-canonical, indekslemeye uygun ve ana sayfadan href ile erişilebilir. Title/açıklama tekrarı, bozuk OG veya şema hatası yok. Bu eski üretim sürümünün kabulüdür; kısa URL sürümü henüz yayında değildir. |
| 2. JSON-LD | Kod ve işletme verisi hazır; yayın bekliyor | Organization/ProfessionalService, Service, görünür SSS ile aynı kaynaktan FAQPage ve Article mevcut. Ana sayfa ve iletişim sayfasındaki Organization verileri eşleşiyor. Google Maps kaydından doğrulanan haftanın yedi günü 24 saat açık bilgisi ve 40.9974165, 29.0763174 koordinatları CMS'e eklendi; statik sayfalara yansıması için yeniden yayın gerekiyor. |
| 3. Yerel SEO | Kod ve CMS yönetimi hazır | Hizmet × ilçe içerikleri, yerel girişler, hizmet bağlantıları, SSS, teklif CTA'sı ve admin içerik yönetimi mevcut. Kısa URL değişiklikleri yayına alınmalı. Dördüncü hizmet mevcut `/cozumler/yedek-parca-uretimi` sayfasına bağlı; yayımlanmamış ilçe/yedek-parça URL'leri üretilmedi. |
| 4. GEO | Kod hazır; görünürlük sonucu ölçülmedi | Açık bot grupları, site özeti ve sitemap bağlantısı içeren `llms.txt` hazır. Kısa ilçe URL'leri rehberleri dizinden dışlamıyor. Canlı envanterde 17 rehber, 6 malzeme, 8 sektör ve 6 çözüm sayfası var. AI yanıtlarında atıf veya indekslenme süresi doğrulanmış değil. |
| 5. Yandex | Webmaster sahipliği doğrulandı | Kullanıcının 25 Ekim ekranında DNS record yöntemi ve Owner yetkisi doğrulandı. DNS doğrulaması varken ek meta doğrulaması zorunlu değil. Sitemap gönderilmedi; Yandex Business kaydı ayrı açık. |
| 6. İçerik ve dönüşüm | Altyapı hazır; içerik işleri açık | Teklif CTA'sı, WhatsApp, portföy erişimi, blog ve çeviri yönetimi mevcut. Tam İngilizce blog kaydı İngilizce meta/şema kullanıyor; eksik çeviri bütünüyle Türkçeye dönüyor. Tüm hizmetlerin İngilizce çevirisi ve ayrı indekslenebilir dil URL'leri tamamlanmadı. Canlı envanterde blog yazısı yok; 7 portföy kaydı var. Doğrulanmış müşteri referansları ve tamamlanan iş kanıtları ayrıca hazırlanmalı; portföy sayısı tamamlanan müşteri işi sayısı olarak sunulmadı. |
| 7. Yayın sonrası | Açık | CI tarayıcı/export kontrolleri, üretim yayını, gerçek 301/canonical/robots/sitemap/JSON-LD kontrolleri; Search Console ve Yandex sahipliği doğrulandı; sitemap gönderimi özellikle bekletiliyor. Mevcut Google işletme profili bağlantısı var; yeniden kayıt açmadan mevcut kaydın yönetimi teyit edilmeli. |

## Bu turdaki değişiklikler

### Google Maps doğrulaması — sonraki düzeltme

İlk kontrolde eksik olarak kaydedilen saat ve koordinatlar, kullanıcının yönlendirdiği [mevcut Google Maps kaydından](https://maps.google.com/maps?cid=5743532135397653934) doğrulandı. İşletme adı, site adresi, telefon ve posta adresi eşleşti. Haftalık tabloda yedi gün de **24 saat açık**; işletme konumu **40.9974165, 29.0763174**. Bu üç alan yalnızca 3D Yanımda'nın `contact_info` kaydına eklendi ve tekrar okunarak doğrulandı. Diğer alanlar ve diğer markalar değişmedi. JSON-LD için Google'ın belirttiği `00:00`–`23:59` gösterimi kullanılıyor; iletişim sayfası bunu “24 saat açık” olarak gösterecek. Randevulu atölye ziyareti notu korunuyor. Kanıt: `seo-maps-hours-verification-2026-10-25.json`.

Bu düzeltmede 38 ilgili test, TypeScript ve derleme geçti; görünür saatler ile gerçek işletme şeması uyumunu kontrol eden test de başarılı. CMS güncellendi; mevcut canlı statik HTML henüz yeni saat ve koordinatları içermiyor. Önceki inceleme raporu ilk kontrolün tarihsel durumunu korur.

- `robots.txt` üreticisine GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot ve Google-Extended için açık `Allow: /` eklendi. Her grupta `/admin`, `/studio`, `/api/`, `/auth/` tarama kısıtları tekrarlandı. Bunlar erişim denetiminin yerine geçmez.
- `Host:` talep doğrultusunda eklendi; ana alan adı HTTP 301 ve canonical ile belirlenmeye devam ediyor.
- `llms.txt` kısa yerel URL'leri aynı grupta seçiyor; önemli hizmetler, site özeti ve tam XML sitemap bağlantısı içeriyor.
- Yandex doğrulama değişkeni `Seo`, yapılandırma ve dört markanın dağıtım örneklerine eklendi. Her alan adı kendi doğrulama değerini kullanmalı.
- Blog dili ile HTML `lang`, OG locale, SEO override, WebPage ve Article `inLanguage` uyumu sağlandı. Türkçe override'ın İngilizce içeriği ezmesi önlendi.

## Yayın uygulaması

`public/robots.txt` içindeki kapalı varsayılan önizleme içindir. Üretim paketi `scripts/search/discovery.mjs` ile markanın alan adına göre `robots.txt`, `sitemap.xml`, alt sitemap dosyaları ve `llms.txt` üretir. Yalnızca yayımlanmış, indekslenebilir, 200 yanıtlı ve kendisini canonical gösteren sayfalar bu envantere girer. CMS değişiklikleri yayını yeniden üretmelidir; çalışma dizinindeki varsayılan dosyaları elle canlı sitemap gibi değerlendirmemek gerekir.

## Güncel arama motoru notları

- Google FAQ zengin sonuçlarını 7 Mayıs 2026 itibarıyla kaldırdı. SSS ve FAQPage içerik tutarlılığı için korunuyor; zengin sonuç veya AI Overview garantisi olarak işaretlenmiyor. [Google değişiklik kaydı](https://developers.google.com/search/updates)
- Google Search `llms.txt` dosyasını kullanmıyor; dosya isteğe bağlı bir kaynak dizini. İndekslenebilir içerik, iç bağlantılar ve teknik SEO esas olmaya devam ediyor. [Google AI rehberi](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- Yandex `Host:` direktifi yerine 301 yönlendirmeyi kullanıyor. [Yandex açıklaması](https://yandex.ru/blog/webmaster/301-y-redirekt-polnostyu-zamenil-direktivu-host)
- OAI-SearchBot arama, GPTBot model geliştirme amacıyla ayrı kontrol ediliyor. İstenen izinler bu ayrımla eklendi. [OpenAI bot belgeleri](https://developers.openai.com/api/docs/bots)

## Doğrulama

TypeScript kontrolü, 51 dosyada 294 uygulama testi, 94 teknik sözleşme testi ve Vite derlemesi başarılı. Derlemedeki mevcut büyük paket boyutu uyarısı sürüyor. Yerel üretim tarayıcı/export çalıştırması bu ortamda desteklenmediği için CI'da tamamlanmalı. Güncel değişiklikler için canlı yayın, indekslenme, sıralama veya trafik artışı sonucu iddia edilmiyor.

Canlı ana sayfada Google/Yandex doğrulama meta etiketinin görülmemesi hesabın doğrulanmadığını kanıtlamaz; DNS veya başka bir doğrulama yöntemi kullanılmış olabilir.

GitHub gönderimi önceki otomatik onay incelemesinde reddedildi. O ret çözülmedi; gönderim ve yayın yapılmadı.

## Sitemap öncesi 109 madde incelemesi — 25 Ekim güncellemesi

Güncel dağılım: 33 mevcut/doğrulanmış, 20 uygulanmış/doğrulanmış, 7 hazır/yayın bekliyor, 15 gerçek bilgi bekliyor, 4 yetkili hesap/veri bekliyor, 8 koşullu, 9 bu kapsamda gereksiz, 12 yayın/ölçüm bekliyor ve 1 teknik iyileştirme açık. Toplam 109. Eski tamamlanma kayıtları yeni URL değişikliği için yayın kanıtı sayılmadı.

- 191 içerik eşlemesi korundu; 157 seçilmiş hedef kısa URL’ye taşındı. Özgün kaynak URL sütunları değiştirilmedi. Bu bir yayın veya indeks talebi değildir.
- GSC doğru mülkü ve doğrulanmış sahiplik okundu. Ana sayfa dizinde, beyan edilen ve Google’ın seçtiği canonical aynı. Mülk dizin raporu işleniyor; gönderilmiş sitemap satırı yok.
- 28 gün filtresinde 1 tıklama/10 gösterim, %10 CTR ve 2,1 ortalama konum; grafik yalnız 21–22 Ekim verisi içeriyor. Bu veriyle trafik artışı veya marka dışı başarı sonucu çıkarılmaz. GSC alan CWV verisi iki cihazda da yok.
- GSC AI kontrolünde dahil et seçili. Links raporu 0 dış bağlantı/Veri yok ve 366 iç bağlantı bildiriyor; gerçek partner listesi ayrıca gerekiyor.
- Doğru GA4 mülkü ve G-HBTDHJ45M7 akışının gerçek alım/key-event/enhanced measurement kontrolü tamamlanmadı. Farklı mülkün verisi kullanılmadı. WAF gerçek bot logu alınamadı.
- Ana sayfa TBT sorunu açık. CI’ya her ana sayfa tekrarının tam Trace/DevtoolsLog dosyası, CPU profil örneği varlık bilgisi, gzip/hash kayıtları ve lab bundle’ıyla eşleştirilmiş gizli source map arşivi eklendi. İki depolama/bütünlük testi geçti. Üretim build ayarı, GPU/SwiftShader veya throttling yöntemi değiştirilmedi. CI ölçümü çalıştırılmadı; hız kazanımı iddia edilmiyor.

Gerçek proje/müşteri izni/fotoğraf, tarihli fiyat örneği, teknik editör bilgisi, stok üreticisinin TDS’si, 13 eski rehberin ilk yayın tarihi ve ilçe bazlı gerçek teslimat koşulları işletmeden gelmeli. Yayın sonrası 28 günlük karşılaştırma yayın öncesinde kapatılamaz.

Kanıtlar: `seo-pre-sitemap-live-2026-10-25.json`, `seo-search-accounts-2026-10-25.json`, `seo-pre-sitemap-status-2026-10-25.json`. Excel’de 109 bulgu, 20 iş paketi ve 191 eşleme korundu; 33 özet formülü, filtreler, koşullu biçimler, veri doğrulaması ve sabit paneller korundu.

## 26 Ekim — GA4 düzeltmesi ve yayın hazırlığı

Doğru **3D YANIMDA** GA4 mülkü (558123338), web akışı (16069161482) ve koddaki **G-HBTDHJ45M7** kimliği eşleştirildi. Akış son 48 saatte veri aldığını gösteriyor. Uygulamanın kendi `page_view` akışıyla çakışabilecek otomatik history ölçümü kapatıldı. Otomatik form, site içi arama, indirme ve dış bağlantı ölçümü de kontrollü uygulama olaylarıyla uyumlu olacak şekilde kapatıldı. Ayarlar kaydedilip yeniden açılarak doğrulandı; page loads, scrolls ve video engagement korundu.

28 Eylül–25 Ekim tarihli geçmiş raporda 381 görüntüleme, 15 aktif kullanıcı, 610 olay ve 0 anahtar olay görüldü. Bu düzeltme öncesi veri test ziyaretleri ve mükerrer görüntülemeler içerebilir; trafik artışı veya gerçek teklif sayısı olarak yorumlanmadı. Sonraki Admin Events kontrolünde tarayıcı bağlantısı zaman aşımına uğradı. `generate_lead` anahtar olay seçimi, `quote_submit_success` olayının ikinci dönüşüm olmaması ve gerçek izinli lead alımı henüz doğrulanmadı. Sahte teklif veya dosya gönderilmedi; F104 açık kaldı.

Üretimde STL rehberine doğrudan giriş ve menüden 3D Baskı hizmetine geçiş denendi. Her iki rotada tek title/H1/canonical/og:url ve tek JSON-LD bloğu görüldü; hizmete geçişte metadata güncellendi. Geri/ileri, yenileme, bütün şema alanları ve dar ekran tablo kabulü tamamlanmadı. Bu iki kontrol, henüz yayımlanmamış kısa URL sürümünün kabulü değildir.

Lighthouse akışına PR üzerinde yalnız 3dyanimda için üç rota × iki cihaz × üç tekrar içeren 18 ölçümlük tanı çalışması eklendi (`1592488`). Ana daldaki dört marka kapsamı korundu. YAML ve kapsam doğrulandı; CI çalıştırılmadı. TBT kök nedeni ve performans düzeltmesi açık.

GitHub gönderimi otomatik onay incelemesinde tekrar reddedildi. Kamuya açık `figtures/3dyanimda` deposundaki `seo/flat-local-urls` dalına kod aktarımı ve CI çalıştırılması için açık onay bekleniyor. Başka gönderim yolu denenmedi. Mevcut PR #17'nin sayfa içi gezinme ve bağımlılık güvenliği değişiklikleri salt okunur incelendi; üzerine yazılmadı veya birleştirilmedi.

Kanıt: `seo-measurement-followup-2026-10-26.json`. 109/20/191 kapsamı ve tamamlanma sayıları değişmedi; kısmi kabul, tam kapanış olarak işaretlenmedi.
