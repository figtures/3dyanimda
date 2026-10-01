import { Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useFeature } from "@/contexts/FeatureContext";
import { COMPANY } from "@/pages/legal/CompanyInfo";

/**
 * Sağ alta sabitlenmiş yüzen WhatsApp & telefon butonları.
 * - Feature flag: `floating_contact` (süper admin tenant bazında kapatabilir)
 * - Tenant admin `contact_info.floating_enabled` ile kendi panelinden açıp kapatır
 */
export const FloatingContactButtons = () => {
  const enabled = useFeature("floating_contact");
  const settings = useSiteSettings();
  const ci: any = settings["contact_info"] || {};

  if (!enabled) return null;
  if (ci.floating_enabled === false) return null;

  const phoneE164 = ci.phone || COMPANY.phoneE164;
  const waNumber = (ci.whatsapp || COMPANY.whatsapp || "").replace(/[^0-9]/g, "");
  const showWa = !!waNumber && ci.floating_whatsapp !== false;
  const showPhone = !!phoneE164 && ci.floating_phone !== false;

  if (!showWa && !showPhone) return null;

  return (
    <div
      className="fixed right-4 z-40 flex flex-col gap-3 bottom-20 lg:bottom-6"
      aria-label="Hızlı iletişim"
    >
      {showWa && (
        <a
          href={`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent("Merhaba, bilgi almak istiyorum.")}&type=phone_number&app_absent=0`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile yaz"
          className="group relative grid place-items-center h-14 w-14 rounded-full bg-emerald-500 text-white shadow-deep hover:bg-emerald-600 transition-all hover:scale-105"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping opacity-75" aria-hidden />
          <MessageCircle className="relative h-6 w-6" />
        </a>
      )}
      {showPhone && (
        <a
          href={`tel:${phoneE164}`}
          aria-label="Telefonla ara"
          className="grid place-items-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-deep hover:bg-primary-glow transition-all hover:scale-105"
        >
          <Phone className="h-6 w-6" />
        </a>
      )}
    </div>
  );
};