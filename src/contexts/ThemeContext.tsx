import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "./TenantContext";

export type ThemeTokens = {
  background?: string;
  foreground?: string;
  primary?: string;
  accent?: string;
  radius?: string;
};

export type ThemeTypography = {
  heading?: string;
  body?: string;
};

export type Theme = {
  id: string;
  slug: string;
  name: string;
  tokens: ThemeTokens;
  typography: ThemeTypography;
  layout_variant: string;
  preview_image_url: string | null;
};

export type Palette = { slug: string; name: string; tokens: Record<string, string> };
export type Typography = {
  slug: string;
  name: string;
  heading_font: string;
  body_font: string;
  mono_font: string | null;
  google_fonts_url: string | null;
  scale: Record<string, string>;
};
export type Layout = {
  slug: string;
  name: string;
  hero_variant: string;
  nav_variant: string;
  card_variant: string;
  section_density: string;
  motion_intensity: string;
  config: Record<string, any>;
};

export type ThemeConfig = {
  palette: Palette | null;
  typography: Typography | null;
  layout: Layout | null;
  overrides: Record<string, any>;
};

type Ctx = {
  theme: Theme | null;
  config: ThemeConfig;
  loading: boolean;
  refresh: () => void;
};

const ThemeContext = createContext<Ctx>({
  theme: null,
  config: { palette: null, typography: null, layout: null, overrides: {} },
  loading: true,
  refresh: () => {},
});

// Common heading/body fonts → Google Fonts URL fragment
const GOOGLE_FONT_MAP: Record<string, string> = {
  Inter: "Inter:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@500;600;700",
  "Archivo Black": "Archivo+Black",
  "Cormorant Garamond": "Cormorant+Garamond:wght@500;600;700",
  Fraunces: "Fraunces:wght@500;600;700",
  "DM Sans": "DM+Sans:wght@400;500;600;700",
  "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
};

const loadGoogleFonts = (families: string[]) => {
  const id = "tenant-theme-fonts";
  const parts = families.map((f) => GOOGLE_FONT_MAP[f]).filter(Boolean);
  if (!parts.length) return;
  const href = `https://fonts.googleapis.com/css2?${parts.map((p) => `family=${p}`).join("&")}&display=swap`;
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
};

const loadGoogleFontsByUrl = (href: string) => {
  const id = "tenant-theme-fonts";
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
};

const applyConfig = (cfg: ThemeConfig) => {
  const root = document.documentElement;
  const tokenKeys = [
    "background", "foreground", "primary", "primary-foreground",
    "accent", "accent-blue", "muted", "muted-foreground",
    "border", "card", "card-foreground", "ring", "radius",
  ];
  tokenKeys.forEach((k) => root.style.removeProperty(`--${k}`));

  const tokens = { ...(cfg.palette?.tokens ?? {}), ...(cfg.overrides?.tokens ?? {}) } as Record<string, string>;
  Object.entries(tokens).forEach(([k, v]) => {
    if (v) root.style.setProperty(`--${k}`, v);
  });
  if (tokens.primary) root.style.setProperty("--ring", tokens.primary);
  if (tokens.accent) root.style.setProperty("--accent-blue", tokens.accent);

  if (cfg.typography?.google_fonts_url) {
    loadGoogleFontsByUrl(cfg.typography.google_fonts_url);
  } else if (cfg.typography) {
    loadGoogleFonts([cfg.typography.heading_font, cfg.typography.body_font]);
  }
  if (cfg.typography?.heading_font) root.style.setProperty("--font-display", `"${cfg.typography.heading_font}", serif`);
  if (cfg.typography?.body_font) root.style.setProperty("--font-body", `"${cfg.typography.body_font}", sans-serif`);
  if (cfg.typography?.mono_font) root.style.setProperty("--font-mono", `"${cfg.typography.mono_font}", monospace`);

  if (cfg.palette?.slug) root.setAttribute("data-palette", cfg.palette.slug);
  if (cfg.typography?.slug) root.setAttribute("data-typography", cfg.typography.slug);
  if (cfg.layout?.slug) {
    root.setAttribute("data-layout", cfg.layout.slug);
    root.setAttribute("data-hero", cfg.layout.hero_variant);
    root.setAttribute("data-nav", cfg.layout.nav_variant);
    root.setAttribute("data-card", cfg.layout.card_variant);
    root.setAttribute("data-density", cfg.layout.section_density);
    root.setAttribute("data-motion", cfg.layout.motion_intensity);
  }
};

const applyTheme = (theme: Theme | null) => {
  const root = document.documentElement;
  if (!theme) {
    // Reset overrides → fall back to index.css defaults
    ["--background", "--foreground", "--primary", "--accent", "--accent-blue", "--ring", "--radius"].forEach((k) =>
      root.style.removeProperty(k),
    );
    root.removeAttribute("data-theme");
    root.removeAttribute("data-layout");
    return;
  }
  const t = theme.tokens ?? {};
  if (t.background) root.style.setProperty("--background", t.background);
  if (t.foreground) root.style.setProperty("--foreground", t.foreground);
  if (t.primary) {
    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--ring", t.primary);
  }
  if (t.accent) {
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-blue", t.accent);
  }
  if (t.radius) root.style.setProperty("--radius", t.radius);

  // Typography
  const typo = theme.typography ?? {};
  loadGoogleFonts([typo.heading, typo.body].filter(Boolean) as string[]);
  if (typo.heading) root.style.setProperty("--font-display", `"${typo.heading}", serif`);
  if (typo.body) root.style.setProperty("--font-body", `"${typo.body}", sans-serif`);

  root.setAttribute("data-theme", theme.slug);
  root.setAttribute("data-layout", theme.layout_variant);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { tenant } = useTenant();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [config, setConfig] = useState<ThemeConfig>({ palette: null, typography: null, layout: null, overrides: {} });
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);

      // 1) Try new tenant_theme_config (palette + typography + layout)
      let cfgRow: any = null;
      if (tenant?.id) {
        const { data } = await supabase
          .from("tenant_theme_config")
          .select("palette_slug, typography_slug, layout_slug, custom_overrides")
          .eq("tenant_id", tenant.id)
          .maybeSingle();
        cfgRow = data;
      }

      // Only apply theme engine when tenant has an explicit config row.
      // Otherwise leave the site on its built-in design system (index.css defaults).
      if (cfgRow) {
        const [palRes, typRes, layRes] = await Promise.all([
          cfgRow.palette_slug
            ? supabase.from("theme_palettes").select("*").eq("slug", cfgRow.palette_slug).maybeSingle()
            : Promise.resolve({ data: null } as any),
          cfgRow.typography_slug
            ? supabase.from("theme_typographies").select("*").eq("slug", cfgRow.typography_slug).maybeSingle()
            : Promise.resolve({ data: null } as any),
          cfgRow.layout_slug
            ? supabase.from("theme_layouts").select("*").eq("slug", cfgRow.layout_slug).maybeSingle()
            : Promise.resolve({ data: null } as any),
        ]);
        if (cancelled) return;
        const nextConfig: ThemeConfig = {
          palette: (palRes.data as any) ?? null,
          typography: (typRes.data as any) ?? null,
          layout: (layRes.data as any) ?? null,
          overrides: cfgRow?.custom_overrides ?? {},
        };
        setConfig(nextConfig);
        applyConfig(nextConfig);
      } else {
        // Reset any previously-applied theme attributes
        const root = document.documentElement;
        ["palette", "typography", "layout", "hero", "nav", "card", "density", "motion"].forEach((k) =>
          root.removeAttribute(`data-${k}`),
        );
        setConfig({ palette: null, typography: null, layout: null, overrides: {} });
      }

      // Legacy theme (backward compat, optional)
      if (tenant?.active_theme_slug) {
        const { data } = await supabase.from("themes").select("*").eq("slug", tenant.active_theme_slug).maybeSingle();
        if (!cancelled) setTheme((data as unknown as Theme) ?? null);
      } else {
        setTheme(null);
      }

      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [tenant?.id, tenant?.active_theme_slug, tick]);

  // Listen for in-page tema config changes (mixer save)
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    window.addEventListener("tenant-theme-changed", onChange);
    return () => window.removeEventListener("tenant-theme-changed", onChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, config, loading, refresh: () => setTick((n) => n + 1) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useThemeConfig = () => useContext(ThemeContext).config;