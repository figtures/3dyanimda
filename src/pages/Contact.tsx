import { previewSearch } from "@/lib/tenant";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { useBrand } from "@/brands/config";
import { BusinessProfileLinks } from "@/components/brand/BusinessProfileLinks";
import { WEEKDAYS } from "@/lib/business-profile";
export default function Contact() {
  const b = useBrand();
  const { search } = useLocation();
  const business = b.business;
  const { visitNote, deliveryNote, onsiteNote } = business;
  const directions = business.googleBusinessUrl || (b.slug === '3dyanimda' ? business.directionsUrl : undefined);
  const hasConfiguredServiceAreas = Object.prototype.hasOwnProperty.call(b.settings.contact_info ?? {}, 'service_areas');
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
            {directions && <a href={directions} target="_blank" rel="noopener noreferrer" className="contact-directions">Haritada yol tarifi alın <ArrowUpRight size={16} aria-hidden="true" /></a>}
          </div>}
          {business.openingHours.length > 0 && <div>
            <h2>Çalışma saatleri</h2>
            <dl className="business-hours">{business.openingHours.map(hours => <div key={hours.dayOfWeek}><dt>{WEEKDAYS.find(day => day.key === hours.dayOfWeek)?.label}</dt><dd><time>{hours.opens}</time>–<time>{hours.closes}</time></dd></div>)}</dl>
          </div>}
          {(deliveryNote || business.deliveryAreas.length > 0) && <div>
            <h2>Teslimat seçenekleri</h2>
            {deliveryNote && <p>{deliveryNote}</p>}
            {business.deliveryAreas.length > 0 && <p>Kargo / teslimat bölgeleri: {business.deliveryAreas.join(', ')}</p>}
          </div>}
          {(onsiteNote || (hasConfiguredServiceAreas && business.serviceAreas.length > 0)) && <div>
            <h2>3D tarama ve yerinde hizmet</h2>
            {onsiteNote && <p>{onsiteNote}</p>}
            {(b.slug === '3dyanimda' || hasConfiguredServiceAreas) && business.serviceAreas.length > 0 && <p>Yerinde hizmet bölgeleri: {business.serviceAreas.join(', ')}. Uygunluk ve randevu proje koşullarına göre değerlendirilir.</p>}
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
          {(b.slug === '3dyanimda' || Object.prototype.hasOwnProperty.call(b.settings.contact_info ?? {}, 'contact_languages')) && business.availableLanguages.length > 0 && <div><h2>İletişim dilleri</h2><p>{business.availableLanguages.join(', ')}</p></div>}
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
