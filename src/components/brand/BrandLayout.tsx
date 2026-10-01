import { useState, type CSSProperties } from "react";
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
export function BrandLayout() {
  const brand = useBrand();
  const extraNav = useNavItems("header_extra").filter(
    (item) => item.url.startsWith("/") && !item.url.startsWith("//"),
  );
  const wordmark = resolveMediaUrl(brand.settings.logo_wordmark?.url);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useRedirects();
  const preview = import.meta.env.DEV;
  // Keep local preview selection while navigating between pages.
  const query = preview ? location.search : "";
  const link = (path: string) => `${path}${query}`;
  return (
    <div
      className="brand-site"
      style={
        {
          "--brand-accent": brand.accent,
          "--brand-ink": brand.ink,
        } as CSSProperties
      }
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
                href={`/?tenant=${b.slug}`}
              >
                {b.slug}
              </a>
            ))}
          </div>
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
          aria-label="Ana menü"
          className={open ? "brand-nav is-open" : "brand-nav"}
        >
          {[
            ["/hizmetler", "Üretim çözümleri"],
            ["/hakkimizda", "Çalışma yaklaşımımız"],
            ["/iletisim", "İletişim"],
            ...extraNav.map((item) => [item.url, item.label_tr]),
          ].map(([path, label]) => (
            <NavLink key={path} to={link(path)} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="brand-button header-quote" to={link("/teklif-al")}>
          Teknik teklif <ArrowUpRight size={17} />
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="brand-footer">
        <div className="footer-top">
          <Link className="brand-logo" to={link("/")}>
            <Box />
            {brand.name}
          </Link>
          <p>
            Tasarım, prototip ve özel üretim.
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
