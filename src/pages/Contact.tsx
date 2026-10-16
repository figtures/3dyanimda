import { previewSearch } from "@/lib/tenant";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { useBrand } from "@/brands/config";
import { BusinessProfileLinks } from "@/components/brand/BusinessProfileLinks";
export default function Contact() {
  const b = useBrand();
  const { search } = useLocation();
  const business = b.business;
  const { visitNote, deliveryNote, onsiteNote } = business;
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
          to={`/teklif-al${previewSearch(search)}`}
        >
          Teknik teklif talebi <ArrowUpRight size={18} />
        </Link>
        <div className="contact-details">
          {(business.addressText || visitNote) && <div>
            <h2>Atölye ziyareti ve randevu</h2>
            {visitNote && <p>{visitNote}</p>}
            {business.addressText && <address>{business.addressText}</address>}
          </div>}
          {deliveryNote && <div>
            <h2>Teslimat seçenekleri</h2>
            <p>{deliveryNote}</p>
          </div>}
          {onsiteNote && <div>
            <h2>3D tarama ve yerinde hizmet</h2>
            <p>{onsiteNote}</p>
          </div>}
          {business.email && (
            <div>
              <h2>E-posta</h2>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </div>
          )}
          {business.phone && (
            <div>
              <h2>Telefon</h2>
              <a href={`tel:${business.phone}`}>
                {business.phoneDisplay}
              </a>
            </div>
          )}
        </div>
        {business.sameAs.length > 0 && <section className="contact-profile-section" aria-label="İşletme profilleri">
          <h2>{b.name} profilleri</h2>
          <BusinessProfileLinks profile={business} />
        </section>}
        {business.mapEmbedUrl && <iframe className="business-map" title={`${b.name} konumu`} src={business.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />}
      </section>
    </>
  );
}
