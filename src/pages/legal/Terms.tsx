import { LegalLayout } from "@/components/site/LegalLayout";
import { COMPANY } from "./CompanyInfo";

export default function Terms() {
  return (
    <LegalLayout
      title="Kullanım Koşulları"
      eyebrow="Yasal · Kullanım"
      description="3dyaninda.com sitesini ve hizmetlerini kullanırken uymanız gereken koşullar."
      path="/kullanim-kosullari"
      updatedAt="03.05.2026"
    >
      <p>
        İşbu Kullanım Koşulları, {COMPANY.legalName} tarafından işletilen 3dyaninda.com web sitesinin ve hizmetlerin
        kullanımına ilişkin şartları düzenler. Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.
      </p>
      <h2>1. Hizmet Tanımı</h2>
      <p>3D tarama, mühendislik modelleme, hassas 3D baskı (FDM, SLA, SLS, MJF), oto yedek parça yeniden üretimi ve endüstriyel parça üretimi.</p>
      <h2>2. Teklif ve Sipariş</h2>
      <ul>
        <li>Site üzerinden iletilen teklifler ön bilgilendirme niteliğindedir.</li>
        <li>Teklif geçerlilik süresi yazılı belirtilmedikçe 7 gündür.</li>
        <li>Sipariş onayı yazılı (e-posta) teyit ile kesinleşir.</li>
        <li>Üretim süreleri tahminidir; mücbir sebep ve sıra durumuna göre değişebilir.</li>
      </ul>
      <h2>3. Fikri Mülkiyet</h2>
      <ul>
        <li>Yüklediğiniz tüm dosyaların yasal sahibi olduğunuzu beyan edersiniz.</li>
        <li>Üçüncü kişilere ait fikri/sınai hak ihlali doğuracak siparişler reddedilir.</li>
        <li>Site içeriği {COMPANY.legalName}'a ait olup izinsiz kullanılamaz.</li>
      </ul>
      <h2>4. Ödeme ve Faturalandırma</h2>
      <ul>
        <li>Bireysel siparişlerde ödeme havale/EFT veya kredi kartı ile peşin alınır.</li>
        <li>Tüm fiyatlar KDV hariçtir; fatura yasal süre içinde düzenlenir.</li>
      </ul>
      <h2>5. Mesafeli Satış ve Cayma Hakkı</h2>
      <p>
        6502 sayılı kanun ve Mesafeli Sözleşmeler Yönetmeliği m. 15/1-(ç) uyarınca <strong>kişiye özel üretim</strong>
        kapsamındaki ürünlerde cayma hakkı kullanılamaz.
      </p>
      <h2>6. Sorumluluk Sınırlaması</h2>
      <ul>
        <li>Müşterinin ilettiği yanlış/eksik dosyadan kaynaklanan hatalardan Şirket sorumlu değildir.</li>
        <li>Güvenlik kritik kullanımlarda ek test ve sertifikasyon gerekir; sorumluluk müşteridedir.</li>
        <li>Şirketin toplam sorumluluğu, sipariş bedeli ile sınırlıdır.</li>
      </ul>
      <h2>7. Mücbir Sebep</h2>
      <p>Doğal afet, salgın, savaş, grev, enerji kesintisi gibi tarafların kontrolü dışındaki durumlarda Şirket sorumlu tutulamaz.</p>
      <h2>8. Uyuşmazlık Çözümü</h2>
      <p>Türk Hukuku uygulanır. İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
    </LegalLayout>
  );
}
