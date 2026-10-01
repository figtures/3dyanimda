import { LegalLayout } from "@/components/site/LegalLayout";

export default function Cookies() {
  return (
    <LegalLayout
      title="Çerez Politikası"
      eyebrow="Yasal · Çerezler"
      description="Sitemizde kullanılan çerezler, amaçları ve tercih yönetimi hakkında bilgilendirme."
      path="/cerez-politikasi"
      updatedAt="03.05.2026"
    >
      <p>
        Bu Çerez Politikası, 3dyaninda.com sitesinde kullanılan çerezler ve benzeri teknolojiler hakkında bilgi verir.
        6698 sayılı KVKK ve BTK düzenlemeleri uyarınca, zorunlu olmayan tüm çerezler için <strong>açık rızanızı</strong> alıyoruz.
        Çerez tercihlerinizi sağ alttaki banner üzerinden istediğiniz zaman değiştirebilirsiniz.
      </p>
      <h2>1. Çerez Nedir?</h2>
      <p>Çerez (cookie), bir web sitesinin tarayıcınız aracılığıyla cihazınıza yerleştirdiği küçük metin dosyasıdır.</p>
      <h2>2. Kullandığımız Çerez Türleri</h2>
      <table>
        <thead><tr><th>Tür</th><th>Amaç</th><th>Süre</th><th>Onay</th></tr></thead>
        <tbody>
          <tr><td>Zorunlu</td><td>Oturum, güvenlik, form gönderimi</td><td>Oturum</td><td>Gerekmez</td></tr>
          <tr><td>Analitik (GA4)</td><td>Anonim ziyaret istatistikleri (_ga, _ga_*)</td><td>2 yıl</td><td>Açık rıza</td></tr>
          <tr><td>Pazarlama</td><td>Şu anda kullanılmıyor</td><td>—</td><td>Açık rıza</td></tr>
          <tr><td>Tercih</td><td>Çerez tercihinizi hatırlama</td><td>12 ay</td><td>Gerekmez</td></tr>
        </tbody>
      </table>
      <h2>3. Google Analytics 4 ve Consent Mode v2</h2>
      <p>
        Sitemizde GA4 (Ölçüm Kimliği: G-T1FDYWXXHE) kullanılır. Google Consent Mode v2 ile uyumlu çalışırız:
        analitik çerezleri varsayılan olarak reddedilmiş şekilde başlatılır; yalnızca onayınızla devreye girer.
        IP adresiniz anonimleştirilir.
      </p>
      <h2>4. Çerezleri Yönetme</h2>
      <ul>
        <li>Sitemizdeki <em>Çerez Tercihleri</em> bannerı üzerinden.</li>
        <li>Tarayıcınızın çerez yönetimi ayarlarından.</li>
        <li>GA opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a></li>
      </ul>
    </LegalLayout>
  );
}
