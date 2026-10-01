import { ServicePage } from "@/components/site/ServicePage";
import img from "@/assets/service-modeling.jpg";

const Modeling = () => (
  <ServicePage
    path="/hizmetler/3d-modelleme"
    metaTitle="3D Modelleme & CAD Hizmeti — Reverse Engineering"
    metaDescription="Parametrik CAD modelleme, reverse engineering, STL onarımı ve baskıya hazır dosya hazırlığı. SolidWorks, Fusion 360 ve Rhino üzerinde mühendislik kalitesinde üretim."
    eyebrow="3D Modelleme"
    serviceType="3D Modelleme & CAD"
    title={<>Fikri ve fiziksel parçayı <span className="text-gradient-blue italic font-medium">üretilebilir</span> bir CAD modeline dönüştürüyoruz.</>}
    lead="Eskiz, fotoğraf, tarama verisi ya da kırık bir parça — başlangıç ne olursa olsun, mühendislik kalitesinde, baskıya tamamen hazır 3D modeller hazırlıyoruz."
    image={img}
    imageAlt="CAD ekranında 3D parça modeli"
    highlights={[
      { k: "Yazılımlar", v: "SolidWorks · Fusion 360 · Rhino · Blender" },
      { k: "Çıktı", v: "STEP · STL · IGES · 3MF" },
      { k: "Onarım", v: "STL düzeltme & topology" },
      { k: "Süre", v: "1 – 7 iş günü" },
    ]}
    faq={[
      { q: "Sadece fotoğraf gönderebilir miyim?", a: "Evet. Birden fazla açıdan net fotoğraflar ve mümkünse referans ölçüler gönderirseniz, mühendislerimiz bu veriyle modelleme yapabilir." },
      { q: "Modelleme dosyasının sahipliği bende mi?", a: "Evet. Teslim edilen tüm CAD ve STL dosyalarının fikri mülkiyeti tamamen size aittir. Biz arşiv amaçlı tutmuyoruz, talep ederseniz imha ediyoruz." },
      { q: "STL dosyamı baskıya hazırlar mısınız?", a: "Evet. Açık yüzey, ters normal, manifold olmayan bölge gibi STL hatalarını ayıklayıp baskıya hazır 3MF/STL dosyası teslim ediyoruz." },
      { q: "Karmaşık organik formları modelleyebiliyor musunuz?", a: "Evet. Heykel, takı, anatomik formlar ve ergonomik ürünler için Blender ve ZBrush ile sculpt yapıyor; sonrasında baskıya uygun retopology uyguluyoruz." },
      { q: "Modellemeye değişiklik talep edebilir miyim?", a: "Standart fiyatımıza 2 revizyon turu dahildir. Daha fazlası için saatlik veya proje bazlı ek ücret uygulanır." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85"><strong>İyi bir baskı, iyi bir modelle başlar.</strong> Tasarımdaki en küçük hata bile baskıda saatlerinizi ve kilolarca filamenti çöpe gönderebilir.</p>
      <h2>Nasıl çalışıyoruz?</h2>
      <ol>
        <li>Brief & referans toplama — fikrinizi, fotoğrafları, ölçüleri veya mevcut parçayı topluyoruz.</li>
        <li>Konsept modelleme — temel formu hızlı bir şekilde çıkartıp size onay için sunuyoruz.</li>
        <li>Mühendislik detaylandırma — toleranslar, montaj noktaları, et kalınlıkları, yapısal kaburgalar ekleniyor.</li>
        <li>Üretim için optimizasyon — destek minimizasyonu, baskı yönü, malzeme önerisi.</li>
        <li>Teslim & revizyon — STEP, STL, 3MF ve dilerseniz işlenmiş render dosyaları.</li>
      </ol>
      <h2>Reverse engineering</h2>
      <p>Mevcut bir parçanın taranmasının ardından mühendislerimiz nokta bulutunu parametrik bir CAD modeline çevirir. Bu sayede parça ileride güncellenebilir, ölçeklendirilebilir veya farklı bir varyasyonu kolayca üretilebilir hale gelir.</p>
      <h2>Hangi sektörler için modelleme yapıyoruz?</h2>
      <p>Otomotiv yedek parça, endüstriyel makine, ev gereçleri, mücevher, ayakkabı, oyuncak, mimari maket, medikal aparat, mobilya bağlantı elemanları gibi geniş bir yelpazede çalışıyoruz.</p>
    </>}
  />
);

export default Modeling;