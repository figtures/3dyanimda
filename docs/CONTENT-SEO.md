# İçerik ve yerel yayın sistemi

2 Ekim 2026 itibarıyla her marka için 181 detay sayfası kaydı vardır. 18 kayıt yayın durumundadır: 3 hizmet, 4 markaya özel çözüm, 6 malzeme, 4 rehber, 1 İstanbul sayfası. Ana sayfa ve 8 ortak giriş sayfasıyla birlikte başlangıç HTML export envanteri marka başına 27 URL'dir. SEO panelinde noindex seçilen URL'ler bu sayıdan düşer.

163 yerel kayıt taslaktır: İstanbul için 3 hizmet sayfası, 39 ilçenin her biri için genel sayfa ve 3 hizmet sayfası (156), Örnek Mahallesi için genel sayfa ve 3 hizmet sayfası (4). Şehir, ilçe ve mahalle modeli başka yerlere de genişletilebilir; bilinmeyen her yer adına otomatik sayfa açılmaz.

## Yönetim

`/admin/content` ekranında hizmet, çözüm, malzeme, rehber ve konum içerikleri düzenlenir. `seo.edit` yetkisi gerekir. Yeni sayfa oluşturulabilir. Bölümler `title/body`, sorular `q/a` dizileridir. İlk sürümde bu iki alan JSON olarak düzenlenir. Genel CMS blok editörü ayrıca korunur; coğrafi URL alanı yeni kontrollü kayıtları kullanır.

`landing_pages` kayıtları tenant kimliğiyle ayrılır. Anonim kullanıcı yalnızca kendi markasının yayınlanmış kayıtlarını okuyabilir. Yönetici değişiklikleri seed tekrarında üzerine yazılmaz. Taslak konumlar site haritasına ve halka açık bağlantı listesine alınmaz. `/bolgeler` dizinindeki ilçe adları, yayınlanmış ayrı bir yerel sayfa yoksa bölge bilgisi önceden doldurulmuş teklif akışına gider.

## Yayın kapısı

Yayınlama kontrolü PostgreSQL trigger'ında uygulanır:

- Başlık, açıklama ve anlamlı en az iki içerik bölümü.
- Yerel sayfada bölgeye özgü bağlam, numune/teslimat açıklaması, kamuya açık kaynak veya kişisel veri içermeyen işletme teyidi, geçmiş/geçerli kontrol tarihi ve iki yanıtlı soru.
- Marka/yer adları çıkarılarak kelime kümelerinin Jaccard benzerliği hesaplanır. Yayındaki başka bir konum metniyle oran 0,80 veya üzerindeyse yayın reddedilir. Kontrol diğer markaları da kapsar. Sadece büyük-küçük harf veya yer adı değişikliği bu kontrolü aşmaz.
- Eşzamanlı yayınlar advisory transaction lock kullanır. Tüm bu kurallar servis rolüyle yapılan yazmalarda da trigger tarafından uygulanır.

Karakter sayısı ve benzerlik eşiği editoryal korumalardır; Google kalite ölçütü değildir. Benzerlik algoritması semantik eşdeğerliği kusursuz tespit etmez. Editör yerel yararlılığı, bilgilerin güncelliğini ve teslim vaatlerinin doğruluğunu ayrıca değerlendirmelidir. Mahalle/ilçe adını değiştirmek veya eşanlamlı kelimeler üretmek yayın stratejisi değildir.

Şube bulunmayan bölgelerde sahte adres veya ayrı LocalBusiness eklenmez. İşletme kimliği tenant'ın canonical alan adı ve gerçek çalışma yeriyle oluşturulur. Malzeme teknik bilgileri genel bilgilendirmedir; sertifikalı uygunluk veya kapasite iddiası taşımaz. Kaynak firmanın teslimat süreleri, fiyatları, referansları ve tamamlanan iş sayıları devralınmamıştır.

## SEO / GEO

Canonical ve meta etiketleri tenant bazlıdır; Service, BreadcrumbList ve görünür soru/yanıtlarla tutarlı FAQPage verisi eklenir. FAQ markup zengin sonuç garantisi değildir. Konum sayfaları `/bolgeler/sehir/ilce/mahalle` hiyerarşisini kullanır; hizmet detayları bu yolun sonuna eklenir. Eski `/istanbul/ilce/hizmet` yolu ancak ilgili yeni kayıt yayındaysa yönlenir; aksi halde noindex 404 görünümü sunar.

`npm run export:sites`, her kayıtlı canonical host üzerinden production uygulamasını açıp içeriği HTML'e yazar. JavaScript çalıştırmayan okuyucular başlıkları, metinleri, canonical ve şemayı ilk HTML'de görebilir. Her marka kendi robots ve sitemap çıktısını alır. Taslak veya noindex kayıtlar sitemap'e girmez. Hosting'in gerçek 404 ve domain yönlendirmelerini desteklemesi gerekir; yalnızca SPA catch-all 200 kullanmayın.

Bu sürümde ayrı bir AI metin dosyasına görünürlük garantisi bağlanmaz. Google'ın resmi açıklaması: standart SEO ve yararlı, özgün içerik AI arama görünürlüğü için de temeldir. Referanslar:

- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content

İndekslenme, sıralama, alıntılanma veya cezasızlık garanti edilemez. Yayından sonra gerçek arama sorguları ve dönüşümler üzerinden içerik geliştirilmelidir.
