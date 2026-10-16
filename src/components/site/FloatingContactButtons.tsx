import { Phone } from "lucide-react";
import { useBrand } from "@/brands/config";
import { useFeature } from "@/contexts/FeatureContext";
import "./floating-contact.css";

/** Normalize a configured international number; never fall back to another brand. */
export function contactNumber(value: unknown): string {
  if (typeof value !== "string" || !/^[+\d\s().-]+$/.test(value)) return "";
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^0[2-5]\d{9}$/.test(digits)) digits = "90" + digits.slice(1);
  else if (/^[2-5]\d{9}$/.test(digits)) digits = "90" + digits;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : "";
}

export const FloatingContactButtons = () => {
  const brand = useBrand();
  const enabled = useFeature("floating_contact");
  const contact = brand.settings.contact_info || {};
  const number = contactNumber(contact.whatsapp || contact.phone);
  const phone = contactNumber(contact.phone);
  if (!enabled || contact.floating_enabled === false) return null;
  const showWhatsApp = !!number && contact.floating_whatsapp !== false;
  const showPhone = !!phone && contact.floating_phone === true;
  if (!showWhatsApp && !showPhone) return null;
  const message = `Merhaba, ${brand.name} üzerinden ulaşıyorum. Projem hakkında bilgi almak istiyorum.`;
  return (
    <div className="floating-contact" aria-label="Hızlı iletişim">
      {showWhatsApp && <a className="floating-whatsapp" href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} ile WhatsApp’tan iletişime geç`}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.91 11.91 0 0 0 12.04 0C5.47 0 .12 5.35.12 11.92c0 2.1.55 4.16 1.59 5.97L.02 24l6.25-1.64a11.88 11.88 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.44-8.43ZM12.04 21.8a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.23-.37a9.86 9.86 0 0 1-1.51-5.27c0-5.46 4.44-9.9 9.9-9.9a9.84 9.84 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.45-4.44 9.88-9.94 9.88Zm5.43-7.4c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.5 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35Z"/></svg>
        <span className="floating-contact-label">WhatsApp’tan yazın</span>
      </a>}
      {showPhone && <a className="floating-phone" href={`tel:+${phone}`} aria-label={`${brand.name} telefonla ara`}><Phone size={24} aria-hidden="true" /></a>}
    </div>
  );
};
