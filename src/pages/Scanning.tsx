import { ServicePage } from "@/components/site/ServicePage";
import scanImg from "@/assets/service-scanning.jpg";

const Scanning = () => (
  <ServicePage
    path="/hizmetler/3d-tarama"
    metaTitle="3D Tarama Hizmeti — ±0.02 mm Hassasiyetinde Dijital İkiz"
    metaDescription="El tipi yapılandırılmış ışık tarayıcı ile parçalarınızın yüksek hassasiyetli dijital ikizini çıkartıyoruz. Reverse engineering, kalite kontrol ve restorasyon için profesyonel 3D tarama."
    eyebrow="3D Tarama"
    serviceType="3D Tarama (Reverse Engineering)"
    title={<>Karmaşık geometriyi <span className="text-gradient-blue italic font-medium">milimetrik</span> bir veriye dönüştürüyoruz.</>}
    lead="Mevcut bir parçayı, kalıbı veya prototipi ±0.02 mm hassasiyetinde dijital ortama alıyoruz. Sonrasında elinizde sınırsız kullanabileceğiniz mesh, STL veya parametrik CAD model olur."
    image={scanImg}
    imageAlt="3D tarama yapılırken bir oto yedek parçası"
    highlights={[
      { k: "Hassasiyet", v: "±0.02 mm" },
      { k: "Teknoloji", v: "Yapılandırılmış ışık + fotogrametri" },
      { k: "Çıktı", v: "OBJ · STL · STEP · IGES" },
      { k: "Süre", v: "Aynı gün – 3 iş günü" },
    ]}
    faq={[
      { q: "Hangi büyüklükteki parçalar taranabilir?", a: "5 mm'den 2 metreye kadar parçalar taranabilir. Daha büyük parçalar için fotogrametri tekniği ile uzun ölçek tarama yapıyoruz." },
      { q: "Tarama sonrası ne çıktı alıyorum?", a: "OBJ veya STL formatında mesh, talep ederseniz STEP/IGES formatında parametrik CAD modeli teslim ediyoruz. Mühendislik düzeltmesi ek hizmet olarak sunulur." },
      { q: "Parçayı taramak için yollamam gerekir mi?", a: "İdeal olan parçayı atölyemize ulaştırmanızdır. İstanbul içi alıma da çıkıyoruz; büyük parçalar için yerinde tarama hizmeti vermekteyiz." },
      { q: "Yansıtıcı veya şeffaf yüzeyler taranır mı?", a: "Evet. Yüzeye geçici, iz bırakmayan tarama spreyi uygulayarak şeffaf, parlak veya çok koyu yüzeyleri sorunsuz tarıyoruz." },
      { q: "Tarama verisi gizli tutulur mu?", a: "Evet. NDA imzalıyor ve tarama dosyasını yalnızca proje süresince saklıyoruz. Talep ederseniz teslim sonrası verileri imha ediyoruz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85"><strong>3D tarama, dijital üretimin ilk adımıdır.</strong> Mevcut bir parçayı doğru ölçülerle dijitale almadan, sağlıklı bir 3D üretim ya da reverse engineering yapmak mümkün değildir.</p>
      <h2>Hangi durumlarda 3D tarama gerekir?</h2>
      <ul>
        <li>Teknik resmi olmayan, sadece elinizde fiziksel örneği bulunan bir parçayı yeniden üretmek istediğinizde.</li>
        <li>Bir kalıbın, prototipin ya da el yapımı ürünün CAD karşılığını çıkartmak istediğinizde.</li>
        <li>Üretim sonrası boyutsal kalite kontrolü yapmak (CAD ile karşılaştırma) gerektiğinde.</li>
        <li>Klasik araç parçası, sanat eseri ya da arkeolojik bir nesneyi dijital olarak korumak istediğinizde.</li>
      </ul>
      <h2>Kullandığımız teknoloji</h2>
      <p>Yapılandırılmış ışık (structured light) tarayıcılarımız, parçanın yüzeyine projekte edilen ışık desenini eş zamanlı kameralarla okuyarak nokta bulutu üretir. Bu teknoloji, lazer tarayıcılara göre daha yüksek hızda ve daha temiz veri üretir; küçük detayları ±0.02 mm hassasiyetinde yakalar. Büyük parçalar için fotogrametri ile destekli tarama yapıyoruz.</p>
      <h2>Tarama sonrası süreç</h2>
      <p>Ham nokta bulutu, mesh'e çevrilir; gerekirse delik kapama, gürültü temizliği ve yüzey düzeltmesi yapılır. Talep ederseniz mesh'ten parametrik CAD modeli (STEP, IGES) çıkartırız — bu sayede parçanız ileride kolayca düzenlenebilir hale gelir.</p>
      <h2>Hangi sektörlerde kullanılır?</h2>
      <p>Otomotiv yedek parça, savunma sanayi, medikal protez, kalıp imalat, mücevher, ayakkabı kalıbı, kültürel miras dijitalleştirme, mimari restorasyon ve tasarım stüdyoları sıkça başvurduğumuz sektörler arasındadır.</p>
    </>}
  />
);

export default Scanning;