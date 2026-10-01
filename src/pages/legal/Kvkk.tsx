import { LegalLayout } from "@/components/site/LegalLayout";
import { COMPANY } from "./CompanyInfo";

export default function Kvkk() {
  return (
    <LegalLayout
      title="KVKK Aydınlatma Metni"
      eyebrow="Yasal · KVKK"
      description="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sahibi olarak haklarınız ve veri işleme süreçlerimiz hakkında bilgilendirme."
      path="/kvkk-aydinlatma-metni"
      updatedAt="03.05.2026"
    >
      <div className="legal-box">
        <strong>Veri Sorumlusu:</strong> {COMPANY.legalName}<br />
        <strong>Adres:</strong> {COMPANY.address}<br />
        <strong>E-posta:</strong> {COMPANY.email}<br />
        <strong>MERSİS:</strong> {COMPANY.mersis || "—"}<br />
        <strong>Vergi Dairesi / No:</strong> {COMPANY.taxOffice || "—"} {COMPANY.taxNo && `/ ${COMPANY.taxNo}`}<br />
        <strong>KEP:</strong> {COMPANY.kep || "—"}
      </div>

      <p>
        İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m. 10 kapsamında,
        veri sorumlusu sıfatıyla {COMPANY.legalName} ("Şirket", "Biz") tarafından kişisel verilerinizin
        hangi amaçla, hukuki sebeplerle, kimlere ve hangi yöntemle işlendiği ile KVKK m. 11 uyarınca sahip
        olduğunuz hakları açıklamak amacıyla hazırlanmıştır.
      </p>

      <h2>1. İşlenen Kişisel Veri Kategorileri</h2>
      <ul>
        <li><strong>Kimlik:</strong> Ad-soyad.</li>
        <li><strong>İletişim:</strong> E-posta, telefon, adres.</li>
        <li><strong>Müşteri İşlem:</strong> Teklif talepleri, sipariş geçmişi, parça açıklaması, dosya ekleri (STL/STEP/CAD).</li>
        <li><strong>İşlem Güvenliği:</strong> IP adresi, çerez kayıtları, kullanıcı tarayıcı bilgisi.</li>
        <li><strong>Pazarlama:</strong> Anonim site analitik verileri (Google Analytics 4 — onayınız ile).</li>
        <li><strong>Özgeçmiş Verileri:</strong> Yalnızca kariyer formu doldurmanız halinde; ad, iletişim, eğitim, deneyim, CV.</li>
      </ul>

      <h2>2. Kişisel Verilerin İşlenme Amaçları</h2>
      <ul>
        <li>Teklif taleplerinin değerlendirilmesi ve fiyatlandırılması.</li>
        <li>3D tarama, modelleme ve baskı hizmetlerinin sunulması.</li>
        <li>Sözleşme öncesi ve sonrası süreçlerin yürütülmesi.</li>
        <li>Müşteri ilişkileri ve iletişim faaliyetlerinin yürütülmesi.</li>
        <li>Mali, hukuki ve idari yükümlülüklerin yerine getirilmesi.</li>
        <li>İş başvurularının değerlendirilmesi (yalnızca açık rıza ile).</li>
        <li>Site güvenliği ve hizmet kalitesinin iyileştirilmesi.</li>
      </ul>

      <h2>3. Hukuki Sebepler</h2>
      <p>Kişisel verileriniz KVKK m. 5/2 ve m. 6/3 uyarınca aşağıdaki hukuki sebeplere dayanılarak işlenir:</p>
      <ul>
        <li>Bir sözleşmenin kurulması veya ifası ile doğrudan ilgili olması (m. 5/2-c).</li>
        <li>Hukuki yükümlülüğümüzün yerine getirilmesi (m. 5/2-ç) — vergi, ticaret kanunu vb.</li>
        <li>Bir hakkın tesisi, kullanılması veya korunması için zorunlu olması (m. 5/2-e).</li>
        <li>Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (m. 5/2-f).</li>
        <li>Açık rızanız (analitik çerezler, kariyer başvurusu, pazarlama).</li>
      </ul>

      <h2>4. Aktarım</h2>
      <p>
        Kişisel verileriniz; yalnızca işbu metinde belirtilen amaçların gerçekleştirilmesi için zorunlu olduğu
        ölçüde; iş ortaklarımıza, hizmet aldığımız bulut altyapı sağlayıcılarımıza (AB sunucuları),
        e-posta servis sağlayıcımıza, kargo şirketlerine ve yetkili kamu kurumlarına KVKK
        m. 8 ve m. 9 hükümleri uyarınca aktarılabilir. Yurt dışı aktarımı, KVKK m. 9 uyarınca açık rızanız veya
        yeterli korumanın bulunduğu hâllerde gerçekleştirilir.
      </p>

      <h2>5. Toplama Yöntemi</h2>
      <p>
        Kişisel verileriniz; web sitemiz üzerindeki formlar (teklif, iletişim, kariyer), e-posta yazışmaları,
        telefon görüşmeleri ve çerezler aracılığıyla; otomatik veya kısmen otomatik yöntemlerle toplanır.
      </p>

      <h2>6. Saklama Süresi</h2>
      <ul>
        <li>Teklif & müşteri verileri: ticari ilişkinin sona ermesinden itibaren 10 yıl (TTK m. 82).</li>
        <li>Mali kayıtlar: 5 yıl (VUK m. 253).</li>
        <li>İş başvuruları: değerlendirme süresince ve en fazla 2 yıl.</li>
        <li>Çerez kayıtları: çerez türüne göre oturum sonu — 12 ay.</li>
        <li>Pazarlama / analitik: rıza geri alınana kadar.</li>
      </ul>

      <h2>7. KVKK m. 11 Kapsamındaki Haklarınız</h2>
      <p>Veri sahibi olarak Şirketimize başvurarak;</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içi veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>KVKK m. 7'de öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
        <li>Düzeltme/silme/yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>Otomatik sistemler vasıtasıyla yapılan analiz sonuçlarına itiraz etme,</li>
        <li>Kanuna aykırı işleme nedeniyle uğradığınız zararın giderilmesini talep etme,</li>
      </ul>
      <p>haklarına sahipsiniz.</p>

      <h2>8. Başvuru Yöntemi</h2>
      <p>
        Haklarınızı kullanmak için Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ uyarınca taleplerinizi;
        ıslak imzalı dilekçe ile {COMPANY.address} adresine, KEP adresimize ({COMPANY.kep || "—"}) veya kayıtlı e-posta
        adresinizden <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> adresine iletebilirsiniz. Başvurunuz en
        geç 30 gün içinde sonuçlandırılır.
      </p>
    </LegalLayout>
  );
}