import { LegalLayout } from "@/components/site/LegalLayout";
import { COMPANY } from "./CompanyInfo";

export default function Privacy() {
  return (
    <LegalLayout
      title="Gizlilik Politikası"
      eyebrow="Yasal · Gizlilik"
      description="Kişisel verilerinizi nasıl topladığımız, kullandığımız, sakladığımız ve koruduğumuza dair detaylı politika."
      path="/gizlilik-politikasi"
      updatedAt="03.05.2026"
    >
      <p>
        {COMPANY.legalName} ("Şirket", "Biz") olarak, müşterilerimizin, ziyaretçilerimizin, iş ortaklarımızın ve aday
        çalışanlarımızın kişisel verilerinin gizliliğine büyük önem veriyoruz. Bu Gizlilik Politikası,
        <a href="https://3dyaninda.com"> 3dyaninda.com</a> üzerinden veya bizimle iletişime geçtiğiniz diğer kanallar
        aracılığıyla edindiğimiz kişisel verilerin nasıl işlendiğini açıklar.
      </p>

      <h2>1. Topladığımız Bilgiler</h2>
      <h3>1.1 Doğrudan Sağladığınız Bilgiler</h3>
      <ul>
        <li>Teklif formu: ad, e-posta, telefon, firma, parça açıklaması, STL/STEP dosyası.</li>
        <li>İletişim formu: ad, e-posta, telefon, mesaj.</li>
        <li>Kariyer formu: ad, iletişim, CV, ön yazı, portföy bağlantıları.</li>
      </ul>
      <h3>1.2 Otomatik Toplanan Bilgiler</h3>
      <ul>
        <li>IP adresi, tarayıcı türü, cihaz bilgisi, ziyaret edilen sayfalar, oturum süresi.</li>
        <li>Çerezler aracılığıyla — yalnızca onayınız ile analitik verisi.</li>
      </ul>

      <h2>2. Verilerin Kullanım Amaçları</h2>
      <ul>
        <li>Talep ettiğiniz hizmeti sunmak ve teklif vermek.</li>
        <li>Sözleşmesel yükümlülüklerimizi yerine getirmek.</li>
        <li>Müşteri destek ve iletişim sağlamak.</li>
        <li>Yasal yükümlülükleri (vergi, TTK, KVKK) yerine getirmek.</li>
        <li>Site güvenliğini sağlamak ve dolandırıcılığı önlemek.</li>
        <li>Hizmet kalitesini iyileştirmek (anonim analitik).</li>
      </ul>

      <h2>3. Üçüncü Taraf Hizmet Sağlayıcılar</h2>
      <table>
        <thead><tr><th>Sağlayıcı</th><th>Amaç</th><th>Lokasyon</th></tr></thead>
        <tbody>
          <tr><td>Bulut altyapı sağlayıcısı</td><td>Veritabanı, dosya depolama</td><td>AB (Frankfurt)</td></tr>
          <tr><td>Google Analytics 4</td><td>Anonim site analitiği (onay ile)</td><td>ABD / AB</td></tr>
          <tr><td>Resend</td><td>İşlem e-postaları</td><td>AB / ABD</td></tr>
          <tr><td>CDN / Hosting sağlayıcısı</td><td>CDN ve site barındırma</td><td>Global</td></tr>
        </tbody>
      </table>

      <h2>4. Veri Güvenliği</h2>
      <p>
        Verileriniz; TLS 1.3 ile şifrelenmiş bağlantılar üzerinden iletilir, sunucularda şifrelenmiş olarak saklanır.
        Veritabanı erişimi RLS (Row Level Security) politikaları ile sınırlandırılmıştır. Yalnızca yetkilendirilmiş
        personelimiz, görev tanımları çerçevesinde verilere erişebilir.
      </p>

      <h2>5. Çocukların Gizliliği</h2>
      <p>Sitemiz 18 yaş altındaki kullanıcılara yönelik değildir. Bilerek 18 yaş altı kişilerden veri toplamayız.</p>

      <h2>6. Politikadaki Değişiklikler</h2>
      <p>
        Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler için sitemizde duyuru yayınlarız. Güncel
        sürüm her zaman bu sayfada yayımlanır.
      </p>

      <h2>7. İletişim</h2>
      <p>
        Gizlilik ile ilgili sorularınız için: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </LegalLayout>
  );
}