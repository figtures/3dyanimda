import BrandNavigation from "./BrandNavigation";
import {
  Link,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "react-router-dom";
import { ArrowUpRight, Box, MapPin } from "lucide-react";
import { brands, useBrand } from "@/brands/config";
import { demoMode } from "@/lib/supabase";
import { useRedirects } from "@/hooks/useRedirects";
import "@/brands/brand.css";
import "@/brands/modern.css";
import "@/themes/themes.css";
import { getSiteTheme, themeNames } from "@/themes/config";
import GrowthAnalytics from "./GrowthAnalytics";
import { CookieConsent } from "@/components/site/CookieConsent";
export function BrandLayout() {
  const brand = useBrand();
  const address = brand.settings.verified_business_identity?.address;
  const addressLabel = address ? [address.streetAddress, address.addressLocality, address.addressRegion].filter(Boolean).join(" · ") : "";
  const location = useLocation();
  useRedirects();
  const theme = getSiteTheme(brand.slug, location.search);
  const preview = import.meta.env.DEV;
  // Keep local preview selection while navigating between pages.
  const query = preview ? location.search : "";
  const link = (path: string) => `${path}${query}`;
  return (
    <div
      className={`brand-site theme-${theme}`}
      data-theme={theme}

    >
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      {preview && (
        <div className="brand-preview">
          <span>
            {demoMode
              ? "Tasarım önizlemesi · Formlar gönderilmez"
              : "Geliştirme ortamı"}
          </span>
          <div>
            {brands.map((b) => (
              <a
                key={b.slug}
                aria-current={brand.slug === b.slug ? "page" : undefined}
                href={`/?${new URLSearchParams({ tenant: b.slug, theme })}`}
              >
                {b.slug}
              </a>
            ))}
          </div>
          <label className="theme-picker">
            Tema
            <select
              aria-label="Önizleme teması"
              value={theme}
              onChange={(event) => {
                const params = new URLSearchParams(location.search);
                params.set("theme", event.target.value);
                window.location.assign(`${location.pathname}?${params}`);
              }}
            >
              {themeNames.map((name, i) => (
                <option value={name} key={name}>
                  {i + 1} · {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <BrandNavigation />
      <GrowthAnalytics />
      <main id="main">
        <Outlet />
      </main>
      <footer className="brand-footer">
        <div className="footer-directory">
          {[
            [
              "Hizmetler",
              [
                ["/3d-baski", "3D Baskı"],
                ["/3d-tarama", "3D Tarama"],
                ["/3d-modelleme", "3D Modelleme"],
                ["/teklif-al", "3D Studio & Teklif"],
              ],
            ],
            [
              "Keşfedin",
              [
                ["/cozumler", "Uygulama alanları"],
                ["/sektorler", "Sektörler"],
                ["/malzemeler", "Malzemeler"],
                ["/rehber", "Bilgi merkezi"],
                ["/araclar", "Ücretsiz 3D araçlar"],
                ["/bolgeler", "Hizmet bölgeleri"],
              ],
            ],
            [
              "Kurumsal",
              [
                ["/hakkimizda", "Hakkımızda"],
                ["/iletisim", "İletişim"],
                ["/gizlilik-politikasi", "Gizlilik"],
                ["/yasal", "Yasal bilgiler"],
              ],
            ],
          ].map(([title, links]) => (
            <div key={String(title)}>
              <h3>{String(title)}</h3>
              {(links as string[][]).map(([path, label]) => (
                <Link key={path} to={link(path)}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-top">
          <Link className="brand-logo" to={link("/")}>
            <Box />
            {brand.name}
          </Link>
          <p>
            3D baskı, 3D tarama ve 3D modelleme.
            <br />
            Teknik ihtiyaçlarınıza odaklanır.
          </p>
          <Link to={link("/teklif-al")} className="footer-link">
            Projenizi değerlendirelim <ArrowUpRight />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
          {addressLabel && <span><MapPin size={14} /> {addressLabel}</span>}
          <Link to={link("/gizlilik-politikasi")}>Gizlilik</Link>
          <Link to={link("/iletisim")}>İletişim</Link>
          {import.meta.env.VITE_GA4_MEASUREMENT_ID && <button type="button" onClick={() => window.dispatchEvent(new Event("brand:privacy-settings"))}>Çerez tercihleri</button>}
        </div>
      </footer>
      <ScrollRestoration />
      {!preview && import.meta.env.VITE_GA4_MEASUREMENT_ID && <CookieConsent />}
    </div>
  );
}
