import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { useBrand } from "@/brands/config";
export default function Contact() {
  const b = useBrand();
  const { search } = useLocation();
  const contact = b.settings.contact_info ?? {};
  return (
    <>
      <Seo
        title="İletişim"
        description={`${b.name} ile 3D üretim projenizi paylaşın; dosya, numune ve teklif kapsamını birlikte değerlendirelim.`}
        path="/iletisim"
        pageType="ContactPage"
      />
      <section className="brand-inner">
        <p className="brand-eyebrow">TANIŞALIM</p>
        <h1>
          Bir fikir, bir parça
          <br />
          ya da bir soru.
        </h1>
        <p className="section-lead">
          Dosyanızı veya teknik ihtiyacınızı paylaşın. Projeniz için doğru
          üretim yolunu birlikte değerlendirelim.
        </p>
        <Link
          className="brand-button dark"
          to={`/teklif-al${import.meta.env.DEV ? search : ""}`}
        >
          Teknik teklif talebi <ArrowUpRight size={18} />
        </Link>
        <div className="contact-details">
          <div>
            <h2>Atölye ziyareti ve randevu</h2>
            <p>
              Örnek Mahallesi, Ataşehir'deki atölyemize gelmeden önce randevu
              alın. Ziyaret ve elden teslim planını teklif talebinizde
              belirtebilirsiniz.
            </p>
            {contact.address_tr && <p>{contact.address_tr}</p>}
          </div>
          <div>
            <h2>Teslimat seçenekleri</h2>
            <p>
              Kargo, kurye ve elden teslim seçeneklerimiz vardır. İstanbul
              dışındaki şehirlere de kargo gönderimi yapıyoruz. Teslimat yöntemi
              ve takvimi proje özelinde birlikte belirlenir.
            </p>
          </div>
          <div>
            <h2>3D tarama ve yerinde hizmet</h2>
            <p>
              3D tarama hizmetimizi yerinde de sunuyoruz. Taranacak parçayı,
              yaklaşık ölçülerini ve bulunduğu konumu paylaşın; uygun çalışma
              koşullarını ve randevuyu birlikte değerlendirelim.
            </p>
          </div>
          {contact.email && (
            <div>
              <h2>E-posta</h2>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
          )}
          {contact.phone && (
            <div>
              <h2>Telefon</h2>
              <a href={`tel:${contact.phone}`}>
                {contact.phone_display || contact.phone}
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
