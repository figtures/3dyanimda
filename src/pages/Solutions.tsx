import { ServicePage } from "@/components/site/ServicePage";
import autoImg from "@/assets/auto-parts-collection.jpg";
import scanImg from "@/assets/service-scanning.jpg";
import printImg from "@/assets/service-printing.jpg";

export const ClassicCar = () => (
  <ServicePage
    path="/cozumler/klasik-arac-restorasyonu"
    metaTitle="Klasik Araç Restorasyonu için 3D Üretilmiş Yedek Parça"
    metaDescription="Mercedes W123, BMW E30, Renault 12, Tofaş Şahin, Murat 124, Anadol gibi klasik araçların artık üretilmeyen plastik trim, kapı kolu, gösterge ve aparat parçalarını 3D ile yeniden üretiyoruz."
    eyebrow="Klasik Araç Restorasyonu"
    serviceType="Klasik Araç Yedek Parça Üretimi"
    title={<>Klasik aracınıza <span className="text-gradient-blue italic font-medium">orijinaline sadık</span> yedek parçalar.</>}
    lead="Üretimi durmuş, sahafa düşmüş ya da hiçbir yerde bulunamayan klasik araç parçalarını mevcut bir örnekten ya da teknik resimden yola çıkarak 3D olarak yeniden üretiyoruz."
    image={autoImg}
    imageAlt="Klasik araç için 3D üretilmiş yedek parçalar"
    highlights={[
      { k: "Tipik teslim", v: "7 – 14 iş günü" },
      { k: "Malzeme", v: "ASA · ABS · PA-CF" },
      { k: "Detay", v: "Renk + yüzey eşleştirme" },
      { k: "Garantil", v: "Bozuk parçada ücretsiz yenileme" },
    ]}
    faq={[
      { q: "Sadece bir fotoğraftan parça üretebilir misiniz?", a: "Evet, ölçü referansı (cetvel, başka bir parça) ile birlikte gönderirseniz mühendislerimiz modelleme yapabilir. Mevcut bir örnek varsa süreç çok daha hızlı işler." },
      { q: "Üretilen parça orijinaline benzer mi?", a: "Renk eşleştirme, yüzey dokusu (pürüzlü/kabartmalı) ve görünüm açısından orijinaline çok yakın sonuç alıyoruz. ASA + boya kombinasyonu en sık tercih ettiğimiz yöntem." },
      { q: "Kapı kolu, kontrol düğmesi gibi mekanik parçalar üretilebilir mi?", a: "Evet. PA-CF gibi yüksek mukavemetli malzemelerle, hatta vidalı insert montajıyla kullanıma hazır şekilde üretiyoruz." },
      { q: "Restorasyoncum size parça gönderebilir mi?", a: "Tabii. Restoratörler ve klasik araç tamircileri ile sürekli çalışıyoruz, profesyonel iş ortaklığı koşulları sunuyoruz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85"><strong>Klasik araba sahibi olmak güzeldir; yedek parça aramak değil.</strong> Klasik araç sahipleri için en büyük dert; basit bir trim parçasının ya da küçük bir aparatın bulunamamasıdır.</p>
      <h2>Hangi modeller için çalışıyoruz?</h2>
      <p>Mercedes W123, W124, W126, BMW E30, E36, E34, Audi 80, VW Golf MK1-MK3, Renault 12, 9, 11, 21, Toros, Tofaş Şahin, Doğan, Kartal, Murat 124, 131, Anadol A1-STC, Ford Taunus ve Cortina, Opel Kadett ve Rekord, Volvo 240, Saab 900 — Türkiye yollarında görmüş olduğumuz hemen her klasik için çalışıyoruz.</p>
      <h2>Tipik üretim örnekleri</h2>
      <ul>
        <li>Kapı kol kapakları, kapı çeker iç kapakları</li>
        <li>Gösterge çerçeveleri, kontrol düğmesi muhafazaları</li>
        <li>Far halkaları, sinyal lambası gövdeleri</li>
        <li>Hava kanal ızgaraları, kalorifer kontrol düğmeleri</li>
        <li>Tampon plastik dolguları, çamurluk içi tutucular</li>
        <li>Konsol parçaları, koltuk plastik kapakları</li>
      </ul>
      <h2>Süreç</h2>
      <p>Mevcut sağlam bir örneği bize ulaştırın ya da kırık parçanın net fotoğraflarını gönderin. Tarama + mühendislik düzeltmesi sonrası size onay için render gönderiyoruz; onayınızla baskıya alıyor, son işlem ve renk eşleştirmesi sonrası kargolayıp adresinize teslim ediyoruz.</p>
    </>}
  />
);

export const Industrial = () => (
  <ServicePage
    path="/cozumler/endustriyel-parca"
    metaTitle="Endüstriyel Parça 3D Üretimi — Hattınız Durmasın"
    metaDescription="Üretim hattınızda kırılan ya da yurt dışından beklediğiniz endüstriyel parçaları 3D tarama ve baskı ile 48 saat içinde yeniden üretiyoruz. PA-CF, SLS naylon, MJF."
    eyebrow="Endüstriyel Parça"
    serviceType="Endüstriyel Parça 3D Üretim"
    title={<>Hattınız <span className="text-gradient-blue italic font-medium">küçük bir parça</span> yüzünden durmasın.</>}
    lead="Bir konveyör tutucusu, bir sensör braketi, bir hava manifoldu — endüstriyel üretim hatlarında her gün küçük parçalar büyük duruşlara yol açar. Biz bu duruşları en aza indiriyoruz."
    image={printImg}
    imageAlt="Endüstriyel 3D baskı parçası örneği"
    highlights={[
      { k: "Hızlı baskı", v: "48 saat içinde teslim" },
      { k: "Teknoloji", v: "FDM (PA-CF) · SLS · MJF" },
      { k: "Saat dayanımı", v: "120 °C'ye kadar" },
      { k: "Seri üretim", v: "100 – 500 adet" },
    ]}
    faq={[
      { q: "Yıpranmış parçanın fotoğrafını gönderebilir miyim?", a: "Evet, ama mümkünse sağlam bir referans örnek de ekleyin. Mühendislerimiz bu sayede çok daha hızlı modelleme yapar." },
      { q: "Sıcaklık dayanımı yüksek malzeme var mı?", a: "Evet. PA-CF 120 °C'ye kadar, PEEK ise (özel sipariş) 250 °C'ye kadar dayanır. Uygulamanızı bize aktarın, doğru malzemeyi öneririz." },
      { q: "Parça periyodik tüketim malzemesi. Stokta tutuyor musunuz?", a: "Evet. Kurumsal müşterilerimiz için kalıp + 50 adetlik mini stok tutuyor, talep geldiğinde aynı gün gönderim sağlıyoruz." },
      { q: "Çift vardiya kapasiteniz var mı?", a: "Evet. Acil sipariş durumlarında 24 saat baskı kapasitesi devreye alınır; ek ücret talep edilebilir." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85"><strong>Bir saatlik hat duruşu, çoğu zaman bir aylık 3D baskı bütçesinden daha pahalıdır.</strong></p>
      <h2>Tipik endüstriyel uygulamalar</h2>
      <ul>
        <li>Sensör braketleri, kablo tutucuları, vakum nozulları</li>
        <li>Konveyör itici, kılavuz ve durdurucu parçaları</li>
        <li>Pnömatik gövde, hava manifoldu, ölçü mastarları</li>
        <li>Robot kol uç efektörleri (gripper jaws)</li>
        <li>Forklift, iş makinesi plastik kapakları</li>
      </ul>
      <h2>Sürekli partner modeli</h2>
      <p>Kurumsal firmalarımıza özel sürekli partner modelimizde, sık tüketilen parçalarınızı dijital arşivimize alıyor; talep geldiğinde aynı gün üretim & gönderim sağlıyoruz. Bu sayede ne stok tutmak zorunda kalıyorsunuz ne de hat duruşu yaşıyorsunuz.</p>
    </>}
  />
);

export const Prototype = () => (
  <ServicePage
    path="/cozumler/prototip"
    metaTitle="Hızlı Prototip Üretimi — 48 Saatte Elinizde"
    metaDescription="Yeni ürün geliştirme sürecinizdeki prototipleri 48 saat içinde üretiyoruz. Konsept doğrulama, fonksiyonel test, sunum modeli ve mock-up için profesyonel 3D baskı."
    eyebrow="Prototip Üretimi"
    serviceType="Hızlı Prototip Üretimi"
    title={<>Fikrinizi <span className="text-gradient-blue italic font-medium">48 saatte</span> elinize alın.</>}
    lead="Konsept doğrulama, kullanıcı testi, yatırımcı sunumu ya da iç değerlendirme için ihtiyaç duyduğunuz fiziksel prototipi en kısa sürede üretiyoruz."
    image={scanImg}
    imageAlt="Hızlı prototip üretimi"
    highlights={[
      { k: "Süre", v: "48 saat içinde teslim" },
      { k: "Doğruluk", v: "0.08 mm katman (yüksek kalite)" },
      { k: "Boyama", v: "Primer + akrilik / krom efekt" },
      { k: "Gizlilik", v: "NDA imzalı süreç" },
    ]}
    faq={[
      { q: "Sadece bir eskizim var. Yine de prototip alabilir miyim?", a: "Evet. Mühendislik & modelleme ekibimiz eskizden CAD'e, CAD'den prototipe kadar tüm süreci tek elden yönetir." },
      { q: "Prototip için en uygun teknoloji hangisi?", a: "Dış görünüş ve sunum için SLA, fonksiyonel test için FDM (PA-CF), karmaşık geometri için SLS önerilir." },
      { q: "Renk ve malzeme örnekleri görebilir miyim?", a: "Atölyemizdeki örneklerden kargo ile gönderebiliriz veya İstanbul içi ofise davet edip görsel inceleme yaptırabiliriz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85"><strong>Hızlı prototipleme; ürün geliştirmenin maliyetini ve süresini büyük ölçüde düşürür.</strong></p>
      <h2>Hangi tip prototipleri üretiyoruz?</h2>
      <ul>
        <li>Konsept prototipler — şekil ve oran doğrulama.</li>
        <li>Fonksiyonel prototipler — montaj ve mekanik test.</li>
        <li>Estetik prototipler — sunum ve fuar modelleri.</li>
        <li>Kullanılabilirlik prototipleri — kullanıcı testi için.</li>
      </ul>
      <h2>Süreç</h2>
      <p>Brief alındıktan sonra varsa CAD dosyanızı, yoksa eskiz/fotoğrafınızı değerlendirip 24 saat içinde teklif gönderiyoruz. Onay sonrası ortalama 48 saat içinde üretim tamamlanıyor; istanbul içi kurye ile aynı gün, Türkiye geneli ertesi gün teslim alıyorsunuz.</p>
    </>}
  />
);