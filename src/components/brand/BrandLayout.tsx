import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "react-router-dom";
import { ArrowUpRight, Box, Menu, X, MapPin } from "lucide-react";
import { brands, useBrand } from "@/brands/config";
import { demoMode } from "@/lib/supabase";
import { useNavItems } from "@/hooks/useNavItems";
import { resolveMediaUrl } from "@/lib/media";
import { useRedirects } from "@/hooks/useRedirects";
import "@/brands/brand.css";
import "@/brands/modern.css";
import "@/themes/themes.css";
import { getSiteTheme, themeNames } from "@/themes/config";
export function BrandLayout() {
  const brand = useBrand();
  const extraNav = useNavItems("header_extra").filter(
    (item) => item.url.startsWith("/") && !item.url.startsWith("//"),
  );
  const wordmark = resolveMediaUrl(brand.settings.logo_wordmark?.url);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useRedirects();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);
  const theme = getSiteTheme(brand.slug, location.search);
  const preview = import.meta.env.DEV;
  // Keep local preview selection while navigating between pages.
  const query = preview ? location.search : "";
  const link = (path: string) => `${path}${query}`;
  return (
    <div
      className={`brand-site theme-${theme}`}
      data-theme={theme}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
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
      <header className="brand-header">
        <Link
          className="brand-logo"
          to={link("/")}
          aria-label={`${brand.name} anasayfa`}
        >
          {wordmark ? (
            <img
              src={wordmark}
              alt={brand.name}
              style={{ maxWidth: 220, maxHeight: 40 }}
            />
          ) : (
            <>
              <Box strokeWidth={1.7} />
              {brand.name}
            </>
          )}
        </Link>
        <nav
          id="main-navigation"
          aria-label="Ana menü"
          className={open ? "brand-nav is-open" : "brand-nav"}
        >
          {[
            ["/3d-baski", "3D Baskı"],
            ["/3d-tarama", "3D Tarama"],
            ["/3d-modelleme", "3D Modelleme"],
            ["/cozumler", "Çözümler"],
            ["/araclar", "3D Araçlar"],
            ...extraNav.map((item) => [item.url, item.label_tr]),
          ].map(([path, label]) => (
            <NavLink key={path} to={link(path)} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="brand-button header-quote" to={link("/teklif-al")}>
          Teklif Al <ArrowUpRight size={17} />
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <nav className="resource-nav" aria-label="Bilgi ve sektör menüsü">
        {[
          ["/sektorler", "Sektörler"],
          ["/malzemeler", "Malzemeler"],
          ["/rehber", "Teknik rehberler"],
          ["/bolgeler", "Hizmet bölgeleri"],
          ["/hakkimizda", "Hakkımızda"],
          ["/iletisim", "İletişim"],
        ].map(([path, label]) => (
          <Link key={path} to={link(path)}>
            {label}
          </Link>
        ))}
      </nav>
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
          <span>
            <MapPin size={14} /> Örnek Mahallesi · İstanbul
          </span>
          <Link to={link("/gizlilik-politikasi")}>Gizlilik</Link>
          <Link to={link("/iletisim")}>İletişim</Link>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
