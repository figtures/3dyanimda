/**
 * Cluster blog yazıları — Pillar (Istanbul 3D Baskı Rehberi) destekleyici içerikler.
 * Hardcore SEO için: uzun-form, anahtar kelime zengin, iç linkleme açısından kritik.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  tags: string[];
  /** Pillar'a veya başka cluster'a iç link slug listesi */
  related: string[];
  /** Markdown-ish HTML — Prose bileşeni içinde render edilir */
  body: string;
}

export const POSTS: BlogPost[] = [
  {
    slug: "otomotiv-3d-baski-malzeme-rehberi",
    title: "Otomotiv 3D Baskı Malzemeleri Rehberi — ASA, PA12, PA-CF Karşılaştırması",
    description: "Otomotiv yedek parça ve fonksiyonel parçalar için 3D baskı malzemeleri: ASA, PA12 ve PA-CF'in ısı dayanımı, mekanik performansı ve kullanım alanları.",
    date: "2026-05-08",
    readingMinutes: 12,
    tags: ["3d baskı malzemeleri", "otomotiv", "ASA", "PA12", "PA-CF", "oto yedek parça"],
    related: ["asa-vs-pa-cf-otomotiv", "klasik-arac-yedek-parca-3d-baski", "fdm-vs-sla-vs-sls-hangi-teknoloji"],
    body: `
<p>Otomotiv parçaları, sıradan tüketici ürünlerinden çok daha zorlu koşullarda çalışır: motor odasında <strong>+120°C'ye varan sıcaklıklar</strong>, dış mekanda UV bombardımanı, yağ-gres-yakıt teması, titreşim ve darbe. Bu yüzden <strong>3D baskı malzemeleri</strong> arasında otomotiv için doğru seçim yapmak, parçanın bir hafta mı yoksa yıllarca mı dayanacağını belirler.</p>

<p>Bu rehberde İstanbul'daki üretim atölyemizde her gün <a href="/oto-yedek-parca-3d-uretim">oto yedek parça</a> üretiminde kullandığımız üç ana mühendislik malzemesini — <strong>ASA, PA12 ve PA-CF</strong> — karşılaştırıyoruz.</p>

<h2>Hızlı Karar Tablosu</h2>
<ul>
<li><strong>Dış mekan, UV altında, görsel parça</strong> → ASA</li>
<li><strong>Mekanik dayanım + esneklik, kompleks geometri</strong> → PA12 (SLS)</li>
<li><strong>Motor odası, yüksek sıcaklık, çelik benzeri rijitlik</strong> → PA-CF (karbon takviyeli naylon)</li>
</ul>

<h2>ASA — UV ve Hava Şartlarına Dayanıklı Klasik</h2>
<p>ASA (Akrilonitril Stiren Akrilat), ABS'in dış mekan için geliştirilmiş halidir. Otomotiv dış trim parçalarında — ayna gövdesi, tampon klipsi, far çerçevesi, ızgara — neredeyse standart hale gelmiştir.</p>
<ul>
<li><strong>Sıcaklık aralığı:</strong> -30°C ile +90°C</li>
<li><strong>UV dayanımı:</strong> 5+ yıl dış mekan kullanımında renk solması minimal</li>
<li><strong>Boya uyumu:</strong> Yüzey düzgün, otomotiv boyası iyi tutar</li>
<li><strong>Zayıf yönü:</strong> Motor odası sıcaklığına dayanmaz, yağ teması olan yerlerde tercih edilmez</li>
</ul>
<p><strong>İdeal kullanım:</strong> Klasik araç restorasyonunda dış trim parçaları, kapı kolları, ayna kapakları, antenli logo çerçeveleri.</p>

<h2>PA12 — SLS'nin Yıldız Malzemesi</h2>
<p>PA12 (Naylon 12), SLS (Selektif Lazer Sinterleme) ile basıldığında <strong>izotropik dayanım</strong> kazanır — yani her yöne aynı dayanıklılığa sahiptir. Bu, FDM ile basılmış parçaların en büyük zayıflığı olan katman ayrılması sorununu ortadan kaldırır.</p>
<ul>
<li><strong>Sıcaklık aralığı:</strong> -40°C ile +120°C</li>
<li><strong>Çekme dayanımı:</strong> ~48 MPa (her yönde)</li>
<li><strong>Kimyasal dayanım:</strong> Yağ, gres, benzin, hidrolik sıvı temasına yıllarca dayanır</li>
<li><strong>Esneklik:</strong> Kırılmadan eğilebilir — snap-fit klipsler ve menteşeler için ideal</li>
<li><strong>Zayıf yönü:</strong> Mat-pürüzlü yüzey (görsel parça için ek post-process gerekir)</li>
</ul>
<p><strong>İdeal kullanım:</strong> Hava emiş kanalları, su deposu klipsleri, ayar düğmeleri, kompleks geometrili iç döşeme tutucuları, küçük seri üretim.</p>

<h2>PA-CF — Karbon Takviyeli Naylon, Metal Alternatifi</h2>
<p>PA-CF, naylon matrise <strong>%15-30 karbon fiber</strong> katılmış endüstriyel bir kompozittir. Otomotiv 3D baskıda alüminyum yedek parçaların yerini almaya başlayan tek malzemedir.</p>
<ul>
<li><strong>Sıcaklık aralığı:</strong> -40°C ile +150°C (motor odası için yeterli)</li>
<li><strong>Çekme dayanımı:</strong> ~110 MPa — alüminyumun yarısı, çeliğin onda biri ama 5x daha hafif</li>
<li><strong>Rijitlik:</strong> Karbon takviyesi sayesinde bükülmeye karşı çok dirençli</li>
<li><strong>Boyutsal kararlılık:</strong> Sıcaklık değiştiğinde minimal genleşme</li>
<li><strong>Zayıf yönü:</strong> Pahalı (gram başına 14-22 ₺), aşındırıcı — özel nozzle gerektirir</li>
</ul>
<p><strong>İdeal kullanım:</strong> Karbüratör hava emiş borusu, motor montaj braketi, turbo intake parçaları, hareketli mekanizma kolları, jig & fixture, drone şasi.</p>

<h2>Yan Yana Teknik Karşılaştırma</h2>
<ul>
<li><strong>Maks. çalışma sıcaklığı:</strong> ASA 90°C · PA12 120°C · PA-CF 150°C</li>
<li><strong>Çekme dayanımı (MPa):</strong> ASA 40 · PA12 48 · PA-CF 110</li>
<li><strong>UV dayanımı:</strong> ASA mükemmel · PA12 orta · PA-CF zayıf (boya gerekir)</li>
<li><strong>Yağ/yakıt dayanımı:</strong> ASA zayıf · PA12 mükemmel · PA-CF mükemmel</li>
<li><strong>Maliyet (gram başına):</strong> ASA 6-10 ₺ · PA12 16-24 ₺ · PA-CF 14-22 ₺</li>
</ul>

<h2>Hangi Parça için Hangi Malzeme?</h2>
<ol>
<li><strong>Dış ayna kapağı, kapı kolu, far çerçevesi:</strong> ASA — UV altında yıllarca solmaz, boya tutar.</li>
<li><strong>Konsol havalandırma ızgarası, iç döşeme klipsi:</strong> PA12 — esnek, kırılmaz, görünmediği için yüzey önemli değil.</li>
<li><strong>Karbüratör emiş, turbo bağlantı, motor braketi:</strong> PA-CF — ısı + kimyasal + mekanik yük üçlüsü.</li>
<li><strong>Yarış aracı aero parçaları, splitter, kanat ucu:</strong> PA-CF — hafiflik kritik.</li>
<li><strong>Klasik araç (Anadol, Şahin, eski Mercedes) restorasyon:</strong> ASA dış mekan, PA-CF motor odası.</li>
</ol>

<h2>Sıkça Sorulan Sorular</h2>
<p><strong>PETG veya ABS olmaz mı?</strong> Hobi seviyesinde olur, ama PETG 70°C'de yumuşamaya başlar ve UV altında 1 yılda sararır. ABS UV dayanımı zayıftır. Otomotivde dış mekan için ASA, iç mekan mekanik için PA12/PA-CF tercih edilir.</p>
<p><strong>3D basılmış yedek parça gerçekten orijinaliyle aynı dayanıklılıkta mı?</strong> Uygun malzeme seçildiğinde — özellikle PA-CF — çoğu plastik OEM parçasıyla eşdeğer, hatta üzerinde performans verir. Detaylı karşılaştırmamız: <a href="/blog/klasik-arac-yedek-parca-3d-baski">Klasik Araç Yedek Parça Rehberi</a>.</p>
<p><strong>TPU (esnek) ne zaman kullanılır?</strong> Conta, titreşim sönümleyici lastik takoz, hortum bağlantısı gibi esneklik gereken yerlerde. Otomotivde sert plastik kategorisinin dışındadır.</p>

<h2>Hangi Teknoloji ile Basmalı?</h2>
<p>ASA ve PA-CF tipik olarak <strong>FDM</strong> ile basılır (sertleştirilmiş nozzle gerekir). PA12 ise <strong>SLS</strong> teknolojisinin yıldız malzemesidir — destek yapısı gerektirmediği için kompleks geometrilerde tek seçenektir. Teknoloji karşılaştırması için: <a href="/blog/fdm-vs-sla-vs-sls-hangi-teknoloji">FDM vs SLA vs SLS</a>.</p>

<h2>Sonuç: Doğru Malzeme = Uzun Ömürlü Parça</h2>
<p>Otomotivde malzeme yanlış seçilirse — örneğin motor odasına PLA — parça birkaç haftada deforme olur. Doğru seçildiğinde ise 3D basılmış bir yedek parça orijinaliyle aynı, hatta daha uzun ömürlü olabilir.</p>

<p>Projeniz için hangi malzemenin uygun olduğundan emin değilseniz, STL veya fotoğraf gönderin — ekibimiz ücretsiz mühendislik danışmanlığı versin: <a href="/teklif-al">Teklif Al</a>. Detaylı ASA vs PA-CF karşılaştırması için ayrıca: <a href="/blog/asa-vs-pa-cf-otomotiv">ASA mı PA-CF mi?</a></p>
`,
  },
  {
    slug: "istanbulda-3d-baski-fiyatlari-2026",
    title: "İstanbul'da 3D Baskı Fiyatları 2026 — Gerçek Maliyet Rehberi",
    description: "İstanbul'da 3D baskı fiyatları nasıl hesaplanır? FDM, SLA, SLS ve MJF için 2026 güncel fiyat aralıkları, malzeme katkıları ve teslim süreleri.",
    date: "2026-04-25",
    readingMinutes: 9,
    tags: ["3D baskı fiyat", "İstanbul", "maliyet"],
    related: ["asa-vs-pa-cf-otomotiv", "stl-dosya-baskiya-hazirlama"],
    body: `
<p>İstanbul'da 3D baskı fiyatları 2026 itibarıyla teknolojiye, malzemeye, parça boyutuna ve sipariş adedine göre <strong>gram başına 4 ₺ ile 28 ₺</strong> arasında değişir. Bu yazıda yıllardır İstanbul'da 3D üretim yapan bir stüdyo olarak fiyatların gerçekten nasıl oluştuğunu — pazarlama dilinden uzak — anlatıyoruz.</p>

<h2>3D Baskı Fiyatını Etkileyen 5 Faktör</h2>
<ol>
<li><strong>Hacim (cm³)</strong> — modelin ne kadar malzeme tükettiği fiyatın temelidir.</li>
<li><strong>Doluluk oranı (infill)</strong> — %15 ile %100 arası değişir; dayanım gerektiren parçalarda artar.</li>
<li><strong>Teknoloji</strong> — FDM en ekonomik, SLA reçine ile orta, SLS/MJF en yüksek.</li>
<li><strong>Katman kalınlığı</strong> — 0.05 mm baskı, 0.30 mm baskıdan ~3x daha pahalıdır (süre uzar).</li>
<li><strong>Post-process</strong> — zımpara, boya, kimyasal parlatma ek maliyet getirir.</li>
</ol>

<h2>2026 İstanbul Fiyat Tablosu (gram başına)</h2>
<ul>
<li>FDM PLA / PETG: <strong>4-8 ₺/g</strong></li>
<li>FDM ABS / ASA: <strong>6-10 ₺/g</strong></li>
<li>FDM PA-CF (karbon): <strong>14-22 ₺/g</strong></li>
<li>SLA standart reçine: <strong>10-16 ₺/g</strong></li>
<li>SLA mühendislik reçinesi: <strong>18-28 ₺/g</strong></li>
<li>SLS PA12: <strong>16-24 ₺/g</strong></li>
</ul>

<h2>İstanbul'da Aynı Gün Teslimat Mümkün mü?</h2>
<p><a href="/istanbul/kadikoy/3d-baski">Kadıköy</a>, <a href="/istanbul/besiktas/3d-baski">Beşiktaş</a>, <a href="/istanbul/sisli/3d-baski">Şişli</a>, <a href="/istanbul/atasehir/3d-baski">Ataşehir</a> gibi merkez ilçelerde küçük-orta parçalar için aynı gün motokurye teslim mümkündür. <a href="/teklif-al">Teklif Al</a> sayfasında STL dosyanızı yükleyerek anında fiyat ve süre görebilirsiniz.</p>

<h2>Para Tasarrufu İçin 4 İpucu</h2>
<ul>
<li>Görünür yüz dışında %15 doluluk yeterlidir.</li>
<li>Kabuk kalınlığını dayanım gerektiriyorsa 1.6 mm'ye kadar arttırın.</li>
<li>Çoklu adetlerde tek seferde sipariş verin (set-up tasarrufu).</li>
<li>İnce detay yoksa 0.20 mm katman seçin — kalite/maliyet dengesi en iyisi.</li>
</ul>

<p>Daha kapsamlı bilgi için: <a href="/rehber/istanbul-3d-baski-rehberi">İstanbul 3D Baskı Rehberi (2026)</a>.</p>
`,
  },
  {
    slug: "fdm-vs-sla-vs-sls-hangi-teknoloji",
    title: "FDM vs SLA vs SLS — Hangi 3D Baskı Teknolojisi Sizin İçin Doğru?",
    description: "FDM, SLA ve SLS teknolojilerinin gerçek farkları, dayanım, hassasiyet ve maliyet karşılaştırması. Hangi parça için hangisi?",
    date: "2026-04-18",
    readingMinutes: 11,
    tags: ["FDM", "SLA", "SLS", "teknoloji"],
    related: ["istanbulda-3d-baski-fiyatlari-2026", "asa-vs-pa-cf-otomotiv"],
    body: `
<p>3D baskı teknolojisi seçimi, parçanın <strong>amacı, dayanım gereksinimi ve detay seviyesi</strong> tarafından belirlenir. İstanbul'daki üretim atölyemizde her gün üç teknolojiyi de kullanıyoruz — işte gerçek deneyimimiz.</p>

<h2>FDM (Erimiş Filament)</h2>
<p>En yaygın ve ekonomik teknoloji. Filament, eritilerek katman katman bırakılır.</p>
<ul>
<li><strong>Avantaj:</strong> Düşük maliyet, geniş malzeme yelpazesi (PLA, PETG, ABS, ASA, PA-CF, TPU).</li>
<li><strong>Dezavantaj:</strong> Görünür katman çizgileri, anizotropik dayanım.</li>
<li><strong>Kullanım:</strong> Fonksiyonel prototip, jig & fixture, dayanıklı yedek parça.</li>
</ul>

<h2>SLA (Reçine — Stereolitografi)</h2>
<p>UV ışığı ile reçine sıvının katı haline getirildiği teknoloji.</p>
<ul>
<li><strong>Avantaj:</strong> Çok yüksek detay (0.025 mm), pürüzsüz yüzey, döküm uyumlu.</li>
<li><strong>Dezavantaj:</strong> UV altında zamanla kırılgan, post-process zorunlu.</li>
<li><strong>Kullanım:</strong> Kuyumculuk, dental modeller, mini figürler, görsel prototipler.</li>
</ul>

<h2>SLS (Selektif Lazer Sinterleme)</h2>
<p>Toz haldeki naylon, lazer ile sinterlenir. Destek yapısı gerektirmez.</p>
<ul>
<li><strong>Avantaj:</strong> İzotropik dayanım, kompleks geometri, üretim adedinde uygun.</li>
<li><strong>Dezavantaj:</strong> Daha pahalı, mat-pürüzlü yüzey.</li>
<li><strong>Kullanım:</strong> Seri üretim öncesi, hareketli mekanizmalar, son ürün parçaları.</li>
</ul>

<h2>Karar Matrisi</h2>
<p>Dayanım kritik mi? → SLS veya FDM PA-CF. Görsellik kritik mi? → SLA. Bütçe kritik mi? → FDM. <a href="/teklif-al">Anlık teklif</a> alın, biz sizin için doğru teknolojiyi öneriyoruz.</p>
`,
  },
  {
    slug: "klasik-arac-yedek-parca-3d-baski",
    title: "Klasik Araç Yedek Parça için 3D Baskı Rehberi",
    description: "Anadol, Şahin, klasik Mercedes ve BMW için bulunamayan yedek parçaların 3D baskı ile üretimi — adım adım süreç ve malzeme seçimi.",
    date: "2026-04-12",
    readingMinutes: 10,
    tags: ["klasik araç", "yedek parça", "restorasyon"],
    related: ["asa-vs-pa-cf-otomotiv", "3d-tarama-kullanim-alanlari"],
    body: `
<p>Üretimi 30 yıl önce durmuş bir araç parçasını bulmak imkansız hale geldiyse, çözüm 3D baskıdır. İstanbul'da klasik araç restorasyonu yapan yüzlerce müşterimize <a href="/oto-yedek-parca-3d-uretim">yedek parça üretimi</a> hizmeti veriyoruz.</p>

<h2>Süreç: Tarama → Modelleme → Baskı</h2>
<ol>
<li><strong>3D Tarama:</strong> Mevcut/kırık parça mavi ışık tarayıcı ile ± 0.02 mm hassasiyetle dijitalleştirilir.</li>
<li><strong>Reverse Engineering:</strong> Tarama mesh'i CAD modele çevrilir, kırık bölgeler restore edilir.</li>
<li><strong>Malzeme Seçimi:</strong> Dış mekan parça → ASA, dayanım → PA-CF, esnek conta → TPU.</li>
<li><strong>Baskı + Test:</strong> Parça basılır, kuru montaj testi yapılır, gerekiyorsa revize edilir.</li>
</ol>

<h2>Hangi Parçaları Üretiyoruz?</h2>
<ul>
<li>Konsol panel ve havalandırma ızgaraları</li>
<li>Far çerçeveleri, stop lamba kapakları</li>
<li>İç döşeme klipsleri ve tutucular</li>
<li>Logo, amblem ve kapı kolu</li>
<li>Karbüratör hava emiş parçaları (PA-CF)</li>
</ul>

<h2>Sıkça Sorulan: Orijinaliyle Aynı Dayanıklılıkta mı?</h2>
<p>Evet — uygun mühendislik plastiği seçildiğinde (PA12, PA-CF) çoğu durumda orijinaline yakın hatta üzerinde performans elde edilir. Karbon takviyeli naylon, alüminyumdan hafif ama çelik dayanımına yakın bir alternatiftir.</p>

<p>İlçenize göre teslimat: <a href="/istanbul/kadikoy/3d-yedek-parca">Kadıköy</a>, <a href="/istanbul/sisli/3d-yedek-parca">Şişli</a>, <a href="/istanbul/atasehir/3d-yedek-parca">Ataşehir</a>.</p>
`,
  },
  {
    slug: "asa-vs-pa-cf-otomotiv",
    title: "Otomotiv 3D Baskıda ASA mı, PA-CF mi?",
    description: "Otomotiv parçaları için ASA ve PA-CF (karbon takviyeli naylon) malzemelerinin teknik karşılaştırması — hangisi nerede kullanılır?",
    date: "2026-03-28",
    readingMinutes: 8,
    tags: ["malzeme", "ASA", "PA-CF", "otomotiv"],
    related: ["klasik-arac-yedek-parca-3d-baski", "fdm-vs-sla-vs-sls-hangi-teknoloji"],
    body: `
<p>Otomotiv 3D baskıda en sık karşılaştığımız soru: <strong>ASA mı, PA-CF mi?</strong> İkisi de farklı senaryolar için tasarlanmış mühendislik malzemeleridir.</p>

<h2>ASA — UV ve Hava Dayanımı</h2>
<ul>
<li>UV ışığa karşı dirençli (yıllarca solmaz)</li>
<li>-30°C ile +90°C arası</li>
<li>Yüzeyi düzgün, boya tutar</li>
<li>Kullanım: <strong>dış mekan</strong> trim, ayna gövdesi, tampon klipsleri</li>
</ul>

<h2>PA-CF — Karbon Takviyeli Naylon</h2>
<ul>
<li>Çelik dayanımına yakın, alüminyumdan hafif</li>
<li>+150°C'ye kadar yüksek sıcaklık dayanımı</li>
<li>Yağ, gres, benzin temasına dayanıklı</li>
<li>Kullanım: <strong>motor odası</strong>, hava emiş, mekanizma parçaları</li>
</ul>

<h2>Karar</h2>
<p>Güneşe maruz, görsel parça → ASA. Mekanik yük, ısı, kimyasal → PA-CF. Detaylı malzeme analizi için bizden <a href="/teklif-al">ücretsiz mühendislik danışmanlığı</a> alın.</p>
`,
  },
  {
    slug: "stl-dosya-baskiya-hazirlama",
    title: "STL Dosyanızı Baskıya Nasıl Hazırlarsınız?",
    description: "Manifold olmayan yüzey, ters normal, açık kenar — STL hatalarının çözümü ve baskıya hazır dosya için pratik kılavuz.",
    date: "2026-03-10",
    readingMinutes: 7,
    tags: ["STL", "CAD", "hazırlık"],
    related: ["istanbulda-3d-baski-fiyatlari-2026", "fdm-vs-sla-vs-sls-hangi-teknoloji"],
    body: `
<p>3D baskıda %80 kalite, doğru hazırlanmış STL dosyasından gelir. İşte İstanbul atölyemizde her gün gördüğümüz 5 kritik hata ve çözümleri.</p>

<h2>1. Manifold Olmayan Yüzey</h2>
<p>İçi boş veya su geçirir görünen mesh. Çözüm: Meshmixer / Blender'da "Make Solid" veya "Close Holes" kullanın.</p>

<h2>2. Ters Normal Vektörler</h2>
<p>Yüzey içe bakıyor, yazıcı bunu boşluk sanıyor. Blender'da Edit Mode → Recalculate Normals (Shift+N).</p>

<h2>3. Aşırı Yüksek Çözünürlük</h2>
<p>500 MB STL gerek yok. Decimate modifier ile %30-50'ye düşürün — kalite aynı kalır.</p>

<h2>4. Yanlış Birim</h2>
<p>İnç vs mm karışıklığı en yaygın hata. Export öncesi mutlaka <strong>milimetre</strong> seçin.</p>

<h2>5. İnce Duvarlar</h2>
<p>0.8 mm altı duvarlar FDM'de basılmaz. Min. 1.2 mm kuralını uygulayın.</p>

<p>Hazır değil mi? <a href="/teklif-al">STL'inizi yükleyin</a>, ekibimiz ücretsiz preflight analiz yapsın.</p>
`,
  },
  {
    slug: "3d-tarama-kullanim-alanlari",
    title: "3D Taramanın 7 Pratik Kullanım Alanı",
    description: "Restorasyon, kalite kontrol, dijital arşiv, ortez ve daha fazlası. 3D taramanın gerçek hayatta nerelere uzandığı.",
    date: "2026-02-22",
    readingMinutes: 6,
    tags: ["3D tarama", "reverse engineering"],
    related: ["klasik-arac-yedek-parca-3d-baski", "kalite-kontrol-3d-tarama"],
    body: `
<p>3D tarama — yani fiziksel objenin dijital ikizini çıkarma — sandığınızdan çok daha geniş bir yelpazede kullanılır.</p>

<h2>1. Yedek Parça Çıkarma</h2>
<p>Klasik araç, eski makine veya beyaz eşya parçası — taranır, modellenir, basılır.</p>
<h2>2. Kalite Kontrol</h2>
<p>Üretilmiş parça, CAD modeliyle karşılaştırılır. Sapma raporu çıkar.</p>
<h2>3. Tıbbi / Ortez</h2>
<p>Hasta vücudu taranır, kişiye özel atel veya ortez tasarlanır.</p>
<h2>4. Restorasyon</h2>
<p>Kırık bir vazonun sağlam yarısı taranır, eksik bölge dijital olarak tamamlanır.</p>
<h2>5. Mimari Belgeleme</h2>
<p>Tarihi yapı röleve çalışmaları haftalardan günlere iner.</p>
<h2>6. Sanat & Müze</h2>
<p>Eserlerin dijital arşivi, replika üretimi.</p>
<h2>7. Karakter Modelleme</h2>
<p>İnsan / obje 3D karakter olarak oyun & VR'a hazırlanır.</p>

<p><a href="/hizmetler/3d-tarama">3D Tarama hizmetimiz</a> hakkında detay alın.</p>
`,
  },
  {
    slug: "kalite-kontrol-3d-tarama",
    title: "3D Tarama ile Kalite Kontrol — CMM'e Alternatif mi?",
    description: "Endüstriyel kalite kontrolde 3D taramanın CMM ile karşılaştırması, sapma analizi ve raporlama süreçleri.",
    date: "2026-02-08",
    readingMinutes: 7,
    tags: ["kalite kontrol", "CMM", "endüstriyel"],
    related: ["3d-tarama-kullanim-alanlari", "reverse-engineering-rehber"],
    body: `
<p>Geleneksel CMM (Koordinat Ölçüm Makinesi) noktasal ölçüm yapar; 3D tarayıcı ise <strong>milyonlarca noktayı</strong> saniyeler içinde toplar. Bu farkın anlamı büyük.</p>

<h2>3D Tarama ile Kalite Kontrolün Avantajları</h2>
<ul>
<li>Tüm yüzey haritası (CMM sadece seçilen noktaları ölçer)</li>
<li>Sahada portatif kullanım — büyük parçalar için ideal</li>
<li>Renk kodlu sapma raporu (heatmap)</li>
<li>Dijital arşiv — ileride aynı parçayı tekrar üretmek mümkün</li>
</ul>

<h2>Bizim Süreç</h2>
<ol>
<li>Parçayı tarar, mesh çıkarırız.</li>
<li>CAD ile hizalama (best-fit alignment) yaparız.</li>
<li>Sapma haritası ve PDF raporu teslim ederiz.</li>
</ol>

<p><a href="/hizmetler/3d-tarama">Tarama hizmeti</a> | <a href="/teklif-al">Teklif al</a></p>
`,
  },
  {
    slug: "reverse-engineering-rehber",
    title: "Reverse Engineering — Fiziksel Parçadan CAD'e",
    description: "Reverse engineering nedir, hangi adımlardan oluşur, hangi yazılımlar kullanılır? İstanbul'da gerçek projelerden örnekler.",
    date: "2026-01-25",
    readingMinutes: 8,
    tags: ["reverse engineering", "CAD", "modelleme"],
    related: ["kalite-kontrol-3d-tarama", "3d-tarama-kullanim-alanlari"],
    body: `
<p>Reverse engineering, mevcut bir fiziksel parçayı dijital CAD modeline çevirme sürecidir. Yedek parça üretmek, mevcut tasarımı iyileştirmek veya rakip ürünü analiz etmek için kullanılır.</p>

<h2>5 Aşamalı Süreç</h2>
<ol>
<li><strong>Tarama:</strong> Mavi ışık veya lazer tarayıcı ile mesh çıkarılır.</li>
<li><strong>Temizlik:</strong> Gürültü ve ölü pikseller temizlenir.</li>
<li><strong>Yüzey Yeniden Oluşturma:</strong> NURBS yüzeyleri çıkarılır.</li>
<li><strong>Parametrik Model:</strong> SolidWorks/Fusion'da feature-based model.</li>
<li><strong>Dosya Teslimi:</strong> STEP, IGES, X_T formatlarında üretime hazır.</li>
</ol>

<h2>Kullandığımız Yazılımlar</h2>
<p>Geomagic Design X, SolidWorks, Fusion 360, Rhino, Blender. Hangi yazılımı kullanacağımız parçanın karmaşıklığına göre değişir.</p>

<h2>Tipik Süre</h2>
<p>Basit parça: 1-2 gün. Mekanik karmaşık parça: 5-7 gün. Free-form (organik) yüzey: 1-2 hafta.</p>

<p>Daha fazlası için <a href="/hizmetler/3d-modelleme">3D Modelleme hizmeti</a> sayfamızı inceleyin.</p>
`,
  },
];

export const findPost = (slug?: string) => POSTS.find(p => p.slug === slug);

export const relatedPosts = (slug: string) => {
  const post = findPost(slug);
  if (!post) return [];
  return post.related.map(s => findPost(s)).filter(Boolean) as BlogPost[];
};