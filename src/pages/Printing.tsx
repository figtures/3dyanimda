import { ServicePage } from "@/components/site/ServicePage";
import img from "@/assets/service-printing.jpg";

const Printing = () => (
  <ServicePage
    path="/hizmetler/3d-baski"
    metaTitle="3D Baskı Hizmeti — FDM, SLA, SLS Profesyonel Üretim"
    metaDescription="FDM, SLA ve SLS teknolojileriyle profesyonel 3D baskı. Otomotiv, endüstriyel parça, prototip ve seri üretim için 12+ malzeme seçeneği. Türkiye geneli kargo."
    eyebrow="3D Baskı"
    serviceType="3D Baskı Üretim"
    title={<>Doğru malzeme, doğru teknoloji, <span className="text-gradient-blue italic font-medium">tek seferde</span> doğru parça.</>}
    lead="FDM, SLA ve SLS makineleri ile parçanızın kullanım amacına en uygun teknoloji ve malzemeyi seçiyoruz. Prototip, küçük seri ve uçtan uca üretim çözümleri."
    image={img}
    imageAlt="3D yazıcı parçayı yazdırırken yakın çekim"
    highlights={[
      { k: "Teknoloji", v: "FDM · SLA · SLS · MJF" },
      { k: "Malzeme", v: "PLA · PETG · ABS · ASA · PA-CF · TPU · Reçine" },
      { k: "Maks. parça", v: "350 × 350 × 400 mm" },
      { k: "Hızlı baskı", v: "48 saat içinde" },
    ]}
    faq={[
      { q: "Hangi 3D baskı teknolojisi benim için doğru?", a: "Genel kural: dayanıklı işlevsel parça için FDM (PA-CF, ASA), yüksek detay/küçük parça için SLA, karmaşık geometri ve esneklik için SLS. Hangisinin uygun olduğunu projenize göre ücretsiz öneriyoruz." },
      { q: "Baskı en fazla ne kadar büyük olabilir?", a: "Tek parça maks. 350 × 350 × 400 mm baskı yapabiliyoruz. Daha büyük parçalar bölünerek basılıp birleştiriliyor; bunun planlamasını biz yapıyoruz." },
      { q: "Baskı kalitesi nasıl?", a: "Standart katman yüksekliğimiz 0.16 mm. Yüksek kalite siparişlerinizde 0.08 mm'ye kadar inebiliyor, SLA ile 0.025 mm katman kalitesinde detay yakalayabiliyoruz." },
      { q: "Boyama, zımpara, montaj yapılıyor mu?", a: "Evet. Baskı sonrası primer + boya, polisaj, vidalı insert montajı, montaj ve test gibi son işlemleri tek elden sunuyoruz." },
      { q: "Seri üretim için uygun musunuz?", a: "100–500 adetlik küçük seri üretimi 3D baskı ile, daha büyük serilerde 3D baskılı kalıp + vakum döküm çözümü öneriyoruz." },
    ]}
    body={<>
      <p className="lead text-xl text-foreground/85"><strong>Doğru baskı; teknoloji, malzeme ve son işlemin birlikte düşünülmesidir.</strong></p>
      <h2>Teknolojiler</h2>
      <h3>FDM (Eriyik Yığma Modelleme)</h3>
      <p>En yaygın 3D baskı teknolojisi. Filament biçimindeki termoplastiğin eritilip katman katman yığılması esasına dayanır. Dayanıklı ve uygun maliyetli; otomotiv, endüstriyel parça ve fonksiyonel prototipler için ideal.</p>
      <h3>SLA (Stereolitografi)</h3>
      <p>UV ışığı ile kürlenen reçine baskı. Çok yüksek detay (0.025 mm katman), pürüzsüz yüzey ve dökümhane uyumlu malzeme seçenekleriyle takı, mücevher, dental, küçük dekoratif parça ve görsel prototipler için tercih edilir.</p>
      <h3>SLS (Selektif Lazer Sinterleme)</h3>
      <p>Naylon tozunun lazer ile sinterlenmesi. Destek yapısı gerektirmez, çok karmaşık geometriler ve esnek menteşeli parçalar tek seferde basılabilir. Endüstriyel uygulamalar için en güçlü çözüm.</p>
      <h2>Malzeme matrisi</h2>
      <ul>
        <li><strong>PLA Pro</strong> — kolay basılır, dekoratif ve düşük gerilim parçalar.</li>
        <li><strong>PETG</strong> — gıda temasına uygun, dayanıklı, ev/ofis uygulamaları.</li>
        <li><strong>ABS / ASA</strong> — UV ve sıcaklık dayanımı, dış mekan ve otomotiv.</li>
        <li><strong>PA / PA-CF</strong> — yüksek mukavemet, motor odası, mühendislik parçaları.</li>
        <li><strong>TPU</strong> — esnek, conta, kavrama yüzeyi, ergonomik tutucular.</li>
        <li><strong>SLA reçine (sert / sert+dökümhane / dental / esnek)</strong>.</li>
      </ul>
      <h2>Son işlem & kalite kontrol</h2>
      <p>İhtiyaca göre zımpara, polisaj, primer + akrilik boya, krom efekt, vidalı insert montajı, sıcak hava ile yüzey iyileştirme, ölçü tahkiki ve sızdırmazlık testi uyguluyoruz.</p>
    </>}
  />
);

export default Printing;