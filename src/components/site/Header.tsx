import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu, X, ChevronDown, ArrowUpRight, Scan, Layers, Printer,
  Car, Factory, Stethoscope, Building2, Shield, Lightbulb, Sparkles, Plane,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "./LanguageSwitch";
import { useTranslation } from "react-i18next";

type NavLeaf = { to: string; label: string; desc?: string; icon?: React.ComponentType<{ className?: string }>; badge?: string };
type NavGroup = { label: string; columns?: { title: string; items: NavLeaf[] }[]; cta?: { title: string; desc: string; to: string } };
type NavItem = { to: string; label: string } | NavGroup;

const nav: NavItem[] = [
  { to: "/hakkimizda", label: "Hakkımızda" },
  {
    label: "Hizmetler",
    columns: [
      {
        title: "Üretim hizmetleri",
        items: [
          { to: "/hizmetler/3d-tarama", label: "3D Tarama", desc: "±0.02 mm hassasiyetinde dijital ikiz", icon: Scan },
          { to: "/hizmetler/3d-modelleme", label: "3D Modelleme", desc: "Reverse engineering & CAD", icon: Layers },
          { to: "/hizmetler/3d-baski", label: "3D Baskı", desc: "FDM · SLA · SLS · MJF", icon: Printer },
          { to: "/hizmetler", label: "Tüm hizmetler", desc: "Hizmetlerimize genel bakış" },
        ],
      },
    ],
    cta: { title: "STL ile teklif al", desc: "24 saatte ücretsiz ön teklif", to: "/teklif-al" },
  },
  {
    label: "Sektörler",
    columns: [
      {
        title: "Ana uzmanlık",
        items: [
          { to: "/oto-yedek-parca-3d-uretim", label: "Oto Yedek Parça", desc: "Bulunamayan parçayı yeniden üretim", icon: Car, badge: "Ana" },
          { to: "/cozumler/klasik-arac-restorasyonu", label: "Klasik Araç Restorasyonu", desc: "Orijinaline sadık parçalar", icon: Car },
        ],
      },
      {
        title: "Diğer sektörler",
        items: [
          { to: "/sektorler/endustriyel", label: "Endüstriyel & Üretim", desc: "Hat duruşunu önleyin", icon: Factory },
          { to: "/sektorler/medikal", label: "Medikal & Diş", desc: "Anatomik & dental modeller", icon: Stethoscope },
          { to: "/sektorler/mimari-tasarim", label: "Mimari & Tasarım", desc: "Maket & ürün prototipi", icon: Building2 },
          { to: "/sektorler/savunma-havacilik", label: "Savunma & Havacılık", desc: "Düşük adet özel parça", icon: Shield },
          { to: "/sektorler/egitim-arge", label: "Eğitim & Ar-Ge", desc: "Akademik destek", icon: Lightbulb },
          { to: "/sektorler/sanat-mucevher", label: "Sanat & Mücevher", desc: "Hassas SLA reçine", icon: Sparkles },
          { to: "/sektorler/drone-hobi", label: "Drone & Hobi", desc: "PA-CF & TPU", icon: Plane },
        ],
      },
    ],
    cta: { title: "Tüm sektörler", desc: "Hangi alanlarda çalışıyoruz?", to: "/sektorler" },
  },
  { to: "/portfoy", label: "Portföy" },
  { to: "/blog", label: "Blog" },
  { to: "/sss", label: "SSS" },
  { to: "/kariyer", label: "Kariyer" },
  { to: "/iletisim", label: "İletişim" },
];

const isGroup = (i: NavItem): i is NavGroup => "columns" in i;

export const Header = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        open
          ? "bg-primary text-primary-foreground border-b border-primary-foreground/10"
          : scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-[0_8px_30px_-12px_hsl(222_50%_14%/0.12)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-[76px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden lg:flex items-center gap-0.5" aria-label={t("nav.aria") || "Ana navigasyon"}>
          {nav.map((item) =>
            isGroup(item) ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  className={`inline-flex items-center gap-1 px-3.5 py-2 text-[14px] font-medium rounded-full transition-all ${
                    openMenu === item.label
                      ? "bg-accent-blue-soft text-primary"
                      : "text-foreground/75 hover:text-primary hover:bg-accent-blue-soft/60"
                  }`}
                  aria-expanded={openMenu === item.label}
                >
                  {t(`nav.${item.label}`, item.label)}
                  <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform ${openMenu === item.label ? "rotate-180" : ""}`} />
                </button>

                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200 ${
                    openMenu === item.label
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-1 pointer-events-none"
                  }`}
                >
                  <MegaMenu group={item} />
                </div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-[14px] font-medium rounded-full transition-all ${
                    isActive
                      ? "text-primary bg-accent-blue-soft"
                      : "text-foreground/75 hover:text-primary hover:bg-accent-blue-soft/60"
                  }`
                }
              >
                {t(`nav.${item.label}`, item.label)}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitch />
          <Button asChild size="sm" className="group bg-primary text-primary-foreground hover:bg-primary-glow rounded-full h-11 px-6 shadow-soft">
            <Link to="/teklif-al">
              {t("cta.quote", "Teklif Al")}
              <ArrowUpRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
        </div>

        <button
          className={`lg:hidden p-2 -mr-2 rounded-full transition-colors ${
            open
              ? "text-primary-foreground hover:bg-primary-foreground/10"
              : "text-primary hover:bg-accent-blue-soft"
          }`}
          aria-label={t("nav.toggle", "Menüyü aç/kapat")}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-x-0 top-[76px] bottom-0 z-40 bg-primary text-primary-foreground overflow-hidden flex flex-col animate-in fade-in duration-200">
          {/* Blueprint grid overlays */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
            aria-hidden
          />

          {/* Nav list */}
          <nav className="relative z-10 flex-1 overflow-y-auto px-7 pt-6 pb-4 flex flex-col gap-1">
            {(() => {
              let idx = 0;
              return nav.map((item) => {
                idx += 1;
                const num = String(idx).padStart(2, "0");
                if (isGroup(item)) {
                  return (
                    <MobileGroup
                      key={item.label}
                      group={item}
                      label={t(`nav.${item.label}`, item.label)}
                      index={num}
                      onNavigate={() => setOpen(false)}
                    />
                  );
                }
                return (
                  <Link
                    key={item.to}
                    to={item.to!}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between py-3 border-b border-primary-foreground/10"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] font-mono text-primary-foreground/30 tabular-nums">{num}</span>
                      <span className="text-lg font-light tracking-wide transition-transform group-active:translate-x-1">
                        {t(`nav.${item.label}`, item.label)}
                      </span>
                    </div>
                  </Link>
                );
              });
            })()}
          </nav>

          {/* Footer */}
          <div className="relative z-10 px-7 pb-8 pt-5 flex flex-col gap-5 border-t border-primary-foreground/10 bg-primary/40 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <LanguageSwitch />
              <div className="h-px flex-1 bg-primary-foreground/10" />
            </div>

            <Button
              asChild
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-none h-14 px-6 justify-between text-sm font-bold tracking-widest uppercase group"
            >
              <Link to="/teklif-al" onClick={() => setOpen(false)}>
                {t("cta.quote", "Teklif Al")}
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>

            <div className="flex justify-between items-center text-[8px] font-mono text-primary-foreground/30 tracking-[0.25em] uppercase">
              <span>3D YANINDA // v1.0</span>
              <span>41.0017° N, 28.6417° E</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const MobileGroup = ({ group, label, index, onNavigate }: { group: NavGroup; label: string; index: string; onNavigate: () => void }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const items = group.columns?.flatMap((c) => c.items) ?? [];
  return (
    <div className="border-b border-primary-foreground/10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full group flex items-center justify-between py-3"
      >
        <div className="flex items-baseline gap-4">
          <span className="text-[10px] font-mono text-primary-foreground/30 tabular-nums">{index}</span>
          <span className="text-lg font-light tracking-wide transition-transform group-active:translate-x-1">{label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-primary-foreground/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="pb-3 pl-8 space-y-0.5">
          {items.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              onClick={onNavigate}
              className="flex items-center gap-3 py-2 text-[13.5px] text-primary-foreground/75 hover:text-primary-foreground transition-colors"
            >
              {c.icon && <c.icon className="h-4 w-4 opacity-60" />}
              <span>{t(`nav.item.${c.label}`, c.label)}</span>
              {c.badge && (
                <span className="text-[9px] font-mono uppercase bg-primary-foreground/10 text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {c.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const MegaMenu = ({ group }: { group: NavGroup }) => {
  const { t } = useTranslation();
  const wide = (group.columns?.length ?? 0) > 1 || (group.columns?.[0]?.items.length ?? 0) > 4;
  return (
    <div
      className={`rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-[0_30px_80px_-30px_hsl(222_60%_14%/0.35)] overflow-hidden ${
        wide ? "w-[720px]" : "w-[360px]"
      }`}
    >
      <div className={`grid ${wide ? "grid-cols-3" : "grid-cols-1"}`}>
        {group.columns?.map((col) => (
          <div key={col.title} className={`p-5 ${wide ? "col-span-2" : ""}`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground px-2 mb-2">{t(`nav.col.${col.title}`, col.title)}</p>
            <ul className={`grid ${wide && col.items.length > 4 ? "grid-cols-2 gap-1" : "gap-1"}`}>
              {col.items.map((it) => (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    className="group flex items-start gap-3 rounded-xl px-2.5 py-2 hover:bg-accent-blue-soft/70 transition-colors"
                  >
                    {it.icon && (
                      <span className="rounded-lg bg-accent-blue-soft p-1.5 mt-0.5 group-hover:bg-white transition-colors">
                        <it.icon className="h-4 w-4 text-accent-blue" />
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-foreground group-hover:text-primary truncate">{t(`nav.item.${it.label}`, it.label)}</span>
                        {it.badge && <span className="text-[9px] font-mono uppercase bg-accent-blue text-white px-1.5 py-0.5 rounded-full">{it.badge}</span>}
                      </span>
                      {it.desc && <span className="block text-[12px] text-muted-foreground mt-0.5 truncate">{t(`nav.desc.${it.label}`, it.desc)}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {group.cta && wide && (
          <Link
            to={group.cta.to}
            className="relative col-span-1 bg-primary text-primary-foreground p-5 flex flex-col justify-between overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent-blue/30 blur-3xl group-hover:bg-accent-blue/50 transition-colors" aria-hidden />
            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/60">{t("nav.cta.eyebrow", "Hızlı yol")}</p>
              <h4 className="font-display text-lg font-semibold mt-2 leading-tight text-primary-foreground">{t(`nav.cta.title.${group.cta.title}`, group.cta.title)}</h4>
              <p className="text-cream/75 text-[12px] mt-1.5 leading-snug">{t(`nav.cta.desc.${group.cta.title}`, group.cta.desc)}</p>
            </div>
            <span className="relative inline-flex items-center gap-1 text-[12px] font-medium text-gold mt-4">
              {t("nav.cta.continue", "Devam et")} <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};
