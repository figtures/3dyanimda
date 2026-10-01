import { LegalLayout } from "@/components/site/LegalLayout";
import { COMPANY } from "./CompanyInfo";

export default function ApplicationConsent() {
  return (
    <LegalLayout
      title="Açık Rıza Metni — Başvurular"
      eyebrow="Yasal · Açık Rıza"
      description="İş başvurusu ve makine işletim formu kapsamında verilerinizin işlenmesi için açık rıza metni."
      path="/basvuru-acik-riza-metni"
      updatedAt="03.05.2026"
    >
      <h2>İş Başvuru Adayları İçin</h2>
      <p>
        {COMPANY.legalName} tarafından işletilen kariyer formunu doldurarak; ad-soyad, iletişim bilgileri, CV, eğitim
        ve deneyim, ön yazı ve portföy/LinkedIn bağlantılarımın; başvurumun değerlendirilmesi, mülakat süreçleri,
        gerektiğinde referans kontrolü ve işe alım kararı amaçlarıyla, KVKK m. 5/1 uyarınca <strong>açık rızam</strong>
        ile işlenmesine onay veriyorum.
      </p>
      <p>
        Başvurum sonuçsuz kalsa dahi, ileride uygun pozisyon açıldığında değerlendirilmek üzere verilerimin azami
        <strong> 2 yıl</strong> süreyle saklanmasına onay veriyorum.
      </p>
      <h2>Makine İşletim Talebi Sahipleri İçin</h2>
      <p>
        "Makinemi siz işletin" formunu doldurarak; iletişim ve firma bilgilerimin, makineme ait teknik bilgilerin
        (marka, model, baskı hacmi, konum) ve ilettiğim görsel/dosyaların; talebin değerlendirilmesi, fizibilite
        çalışması ve fiyat teklifi amaçlarıyla işlenmesine <strong>açık rızam</strong> ile onay veriyorum.
      </p>
      <h2>Ortak Hükümler</h2>
      <ul>
        <li>Verilerimin yurt dışı sunucularda (AB / ABD) barındırılmasına onay veriyorum.</li>
        <li>Onayımı her zaman <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> adresine yazarak geri çekebilirim.</li>
        <li>KVKK m. 11 kapsamındaki haklarımı, ilgili Aydınlatma Metni'nde belirtilen yöntemlerle kullanabilirim.</li>
      </ul>
    </LegalLayout>
  );
}
