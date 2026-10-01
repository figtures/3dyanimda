import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube, Twitter } from "lucide-react";
import { COMPANY } from "@/pages/legal/CompanyInfo";
import { useTranslation, Trans } from "react-i18next";
import { useSiteSettings, pickLocale } from "@/hooks/useSiteSettings";
import { useNavItems, pickNavLabel } from "@/hooks/useNavItems";
import { NewsletterSignup } from "./NewsletterSignup";

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const settings = useSiteSettings();
  const extraLinks = useNavItems("footer_extra");
  const ci = (settings["contact_info"] || {}) as any;
  const lng = i18n.language || "tr";
  const email = ci.email || COMPANY.email;
  const phoneE164 = ci.phone || COMPANY.phoneE164;
  const phoneDisplay = ci.phone_display || ci.phone || COMPANY.phone;
  const location = pickLocale(ci, "location", lng, t("footer.location", "İstanbul, Beylikdüzü · Türkiye geneli hizmet"));
  const socials: { url?: string; icon: any; label: string }[] = [
    { url: ci.instagram || "https://instagram.com/3dyaninda", icon: Instagram, label: "Instagram" },
    { url: ci.facebook, icon: Facebook, label: "Facebook" },
    { url: ci.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: ci.youtube, icon: Youtube, label: "YouTube" },
    { url: ci.twitter, icon: Twitter, label: "X" },
  ];
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border border-cream/20 animate-slow-rotate" />
        <div className="absolute -top-12 -right-12 w-[420px] h-[420px] rounded-full border border-cream/10" />
      </div>

      <div className="container-page relative pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
            <Logo variant="light" />
            <p className="font-serif text-2xl text-cream/90 max-w-md leading-snug">
              <Trans i18nKey="footer.tagline" defaults="Karmaşık, nadir ya da tedariki zor parçaları — <em>dijitalden gerçeğe</em> taşıyoruz." components={{ em: <em className="text-gold not-italic" /> }} />
            </p>
            <div className="text-sm text-cream/70 space-y-2 pt-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${email}`} className="hover:text-cream transition-colors">{email}</a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${phoneE164}`} className="hover:text-cream transition-colors">{phoneDisplay}</a>
              </p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {location}</p>
            </div>
            <div className="pt-4 space-y-2">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">{t("footer.newsletter.title", "Bültenimize Katılın")}</h4>
              <p className="text-xs text-cream/60">{t("footer.newsletter.desc", "Yeni hizmetler ve kampanyalardan ilk siz haberdar olun.")}</p>
              <NewsletterSignup />
            </div>
          </div>

          <FooterCol titleKey="footer.col.services" defaultTitle="Hizmetler" links={[
            ["nav.item.3D Tarama", "3D Tarama", "/hizmetler/3d-tarama"],
            ["nav.item.3D Modelleme", "3D Modelleme", "/hizmetler/3d-modelleme"],
            ["nav.item.3D Baskı", "3D Baskı", "/hizmetler/3d-baski"],
            ["footer.link.istanbulPrint", "İstanbul 3D Baskı", "/istanbul-3d-baski"],
            ["footer.link.guide", "Rehber", "/rehber/istanbul-3d-baski-rehberi"],
            ["footer.link.allServices", "Tüm Hizmetler", "/hizmetler"],
          ]} />

          <FooterCol titleKey="footer.col.solutions" defaultTitle="Çözümler" links={[
            ["nav.item.Oto Yedek Parça", "Oto Yedek Parça", "/oto-yedek-parca-3d-uretim"],
            ["footer.link.classicCar", "Klasik Araç", "/cozumler/klasik-arac-restorasyonu"],
            ["footer.link.industrialPart", "Endüstriyel Parça", "/cozumler/endustriyel-parca"],
            ["footer.link.prototype", "Prototip", "/cozumler/prototip"],
            ["footer.link.allIndustries", "Tüm Sektörler", "/sektorler"],
          ]} />

          <FooterCol titleKey="footer.col.districts" defaultTitle="Popüler İlçeler" links={[
            ["footer.link.beylikduzu", "Beylikdüzü 3D Baskı", "/istanbul/beylikduzu/3d-baski"],
            ["footer.link.esenyurt", "Esenyurt 3D Baskı", "/istanbul/esenyurt/3d-baski"],
            ["footer.link.avcilar", "Avcılar 3D Baskı", "/istanbul/avcilar/3d-baski"],
            ["footer.link.hadimkoy", "Hadımköy 3D Baskı", "/istanbul/hadimkoy/3d-baski"],
            ["footer.link.batiOsb", "Batı İstanbul OSB", "/istanbul/bati-osb-3d-uretim"],
            ["footer.link.kadikoy", "Kadıköy 3D Baskı", "/istanbul/kadikoy/3d-baski"],
            ["footer.link.allDistricts", "Tüm İlçeler", "/istanbul-3d-baski"],
          ]} />

          <FooterCol titleKey="footer.col.company" defaultTitle="Kurumsal" links={[
            ["nav.Hakkımızda", "Hakkımızda", "/hakkimizda"],
            ["footer.link.enterprise", "Kurumsal Çözümler", "/kurumsal-cozumler"],
            ["nav.Portföy", "Portföy", "/portfoy"],
            ["nav.Blog", "Blog", "/blog"],
            ["nav.Kariyer", "Kariyer", "/kariyer"],
            ["nav.SSS", "SSS", "/sss"],
            ["nav.İletişim", "İletişim", "/iletisim"],
          ]} />

          {extraLinks.length > 0 && (
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">{t("footer.col.extra", "Hızlı Linkler")}</h4>
              <ul className="space-y-2">
                {extraLinks.map((n) => (
                  <li key={n.id}>
                    {n.url.startsWith("http") ? (
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cream/75 hover:text-cream transition-colors">{pickNavLabel(n, lng)}</a>
                    ) : (
                      <Link to={n.url} className="text-sm text-cream/75 hover:text-cream transition-colors">{pickNavLabel(n, lng)}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-cream/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/50">
            © {new Date().getFullYear()} 3D Yanında — {t("footer.rights", "Tüm hakları saklıdır.")}
            <span className="mx-2 text-cream/30">·</span>
            <Trans
              i18nKey="footer.madeBy"
              defaults="Designed & built by <a>figtures.com</a>"
              components={{
                a: (
                  <a
                    href="https://figtures.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/70 hover:text-gold transition-colors underline-offset-2 hover:underline"
                  />
                ),
              }}
            />
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono uppercase tracking-[0.18em] text-cream/55">
            <Link to="/kvkk-aydinlatma-metni" className="hover:text-cream transition-colors">{t("footer.legal.kvkk", "KVKK")}</Link>
            <Link to="/gizlilik-politikasi" className="hover:text-cream transition-colors">{t("footer.legal.privacy", "Gizlilik")}</Link>
            <Link to="/cerez-politikasi" className="hover:text-cream transition-colors">{t("footer.legal.cookies", "Çerezler")}</Link>
            <Link to="/kullanim-kosullari" className="hover:text-cream transition-colors">{t("footer.legal.terms", "Kullanım")}</Link>
          </div>
          <div className="flex items-center gap-5 text-cream/60">
            {socials.filter((s) => s.url).map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="hover:text-cream transition-colors">
                <s.icon className="h-4 w-4" />
              </a>
            ))}
            <Link to="/teklif-al" className="text-xs font-medium text-cream hover:text-gold">{t("cta.quote", "Teklif Al")} →</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ titleKey, defaultTitle, links }: { titleKey: string; defaultTitle: string; links: [string, string, string][] }) => {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-2 space-y-4">
      <h4 className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">{t(titleKey, defaultTitle)}</h4>
      <ul className="space-y-2">
        {links.map(([key, label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-cream/75 hover:text-cream transition-colors">{t(key, label)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
