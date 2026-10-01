import { Phone, MessageCircle, FileUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { COMPANY } from "@/pages/legal/CompanyInfo";

/**
 * Mobil için sabit alt CTA çubuğu — Tel, WhatsApp, Teklif al.
 * Local SEO + dönüşüm sinyali için kritik.
 */
export const MobileStickyCTA = () => {
  const { t } = useTranslation();
  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-8px_24px_-12px_hsl(222_50%_14%/0.18)]"
      role="region"
      aria-label={t("mobileCta.aria", "Hızlı iletişim")}
    >
      <div className="grid grid-cols-3 divide-x divide-border">
        <a
          href={`tel:${COMPANY.phoneE164}`}
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-foreground hover:bg-accent-blue-soft transition-colors"
          aria-label={t("mobileCta.callAria", "Telefonla ara")}
        >
          <Phone className="h-4 w-4 text-accent-blue" />
          {t("mobileCta.call", "Ara")}
        </a>
        <a
          href={`https://api.whatsapp.com/send?phone=${COMPANY.whatsapp}&text=${encodeURIComponent("Merhaba, 3D Yanında için bir teklif almak istiyorum.")}&type=phone_number&app_absent=0`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-foreground hover:bg-accent-blue-soft transition-colors"
          aria-label={t("mobileCta.waAria", "WhatsApp'tan yaz")}
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          {t("mobileCta.wa", "WhatsApp")}
        </a>
        <Link
          to="/teklif-al"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold text-primary-foreground bg-primary hover:bg-primary-glow transition-colors"
        >
          <FileUp className="h-4 w-4" />
          {t("cta.quote", "Teklif al")}
        </Link>
      </div>
    </div>
  );
};
