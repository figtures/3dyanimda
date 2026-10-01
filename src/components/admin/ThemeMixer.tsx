import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Palette as PaletteIcon, Type, LayoutGrid } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Palette = {
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  tokens: Record<string, string>;
};
type Typo = {
  slug: string;
  name: string;
  description: string | null;
  heading_font: string;
  body_font: string;
  google_fonts_url: string | null;
};
type Layout = {
  slug: string;
  name: string;
  description: string | null;
  hero_variant: string;
  card_variant: string;
  section_density: string;
  motion_intensity: string;
};

type Selection = {
  palette_slug: string | null;
  typography_slug: string | null;
  layout_slug: string | null;
};

interface ThemeMixerProps {
  tenantId: string;
  /** Caller is allowed to write tenant_theme_config */
  canEdit?: boolean;
  /** Notified when config saved */
  onSaved?: () => void;
}

/** Inject typography fonts on demand for live preview swatches */
function ensureFontLoaded(href: string | null) {
  if (!href || typeof document === "undefined") return;
  const id = `mixer-font-${btoa(href).replace(/[^a-z0-9]/gi, "").slice(0, 24)}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export const ThemeMixer = ({ tenantId, canEdit = true, onSaved }: ThemeMixerProps) => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [typos, setTypos] = useState<Typo[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selection, setSelection] = useState<Selection>({
    palette_slug: null,
    typography_slug: null,
    layout_slug: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [palRes, typRes, layRes, cfgRes] = await Promise.all([
        supabase.from("theme_palettes").select("*").order("sort_order"),
        supabase.from("theme_typographies").select("*").order("sort_order"),
        supabase.from("theme_layouts").select("*").order("sort_order"),
        supabase
          .from("tenant_theme_config")
          .select("palette_slug, typography_slug, layout_slug")
          .eq("tenant_id", tenantId)
          .maybeSingle(),
      ]);
      if (!active) return;
      const ps = (palRes.data ?? []) as any[];
      const ts = (typRes.data ?? []) as any[];
      const ls = (layRes.data ?? []) as any[];
      setPalettes(ps);
      setTypos(ts);
      setLayouts(ls);
      ts.forEach((t) => ensureFontLoaded(t.google_fonts_url));
      setSelection({
        palette_slug: cfgRes.data?.palette_slug ?? ps[0]?.slug ?? null,
        typography_slug: cfgRes.data?.typography_slug ?? ts[0]?.slug ?? null,
        layout_slug: cfgRes.data?.layout_slug ?? ls[0]?.slug ?? null,
      });
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [tenantId]);

  const save = async () => {
    if (!canEdit) return;
    setSaving(true);
    const { error } = await supabase.from("tenant_theme_config").upsert(
      {
        tenant_id: tenantId,
        palette_slug: selection.palette_slug,
        typography_slug: selection.typography_slug,
        layout_slug: selection.layout_slug,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" }
    );
    setSaving(false);
    if (error) {
      toast({ title: "Tema kaydedilemedi", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tema güncellendi", description: "Site ve panele anında uygulandı." });
    onSaved?.();
    // trigger reload of ThemeProvider via storage event
    window.dispatchEvent(new Event("tenant-theme-changed"));
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const activePalette = palettes.find((p) => p.slug === selection.palette_slug);
  const activeTypo = typos.find((t) => t.slug === selection.typography_slug);
  const activeLayout = layouts.find((l) => l.slug === selection.layout_slug);

  return (
    <div className="space-y-8">
      {/* Column: Palettes */}
      <section>
        <header className="flex items-center gap-2 mb-3">
          <PaletteIcon className="h-4 w-4 text-accent-blue" />
          <h3 className="font-medium">Renk paleti</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">5 preset</Badge>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {palettes.map((p) => {
            const active = p.slug === selection.palette_slug;
            const t = p.tokens || {};
            return (
              <button
                key={p.slug}
                onClick={() => canEdit && setSelection((s) => ({ ...s, palette_slug: p.slug }))}
                className={cn(
                  "text-left rounded-lg border overflow-hidden transition focus:outline-none",
                  active ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                )}
              >
                <div
                  className="h-20 p-3 flex items-end"
                  style={{
                    background: t.background ? `hsl(${t.background})` : "#fff",
                    color: t.foreground ? `hsl(${t.foreground})` : "#000",
                  }}
                >
                  <div className="flex gap-1">
                    {["primary", "accent", "muted"].map((k) =>
                      t[k] ? (
                        <span key={k} className="h-5 w-5 rounded-full border border-black/10" style={{ background: `hsl(${t[k]})` }} />
                      ) : null
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  {p.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{p.description}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Column: Typography */}
      <section>
        <header className="flex items-center gap-2 mb-3">
          <Type className="h-4 w-4 text-accent-blue" />
          <h3 className="font-medium">Tipografi</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">5 preset</Badge>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {typos.map((t) => {
            const active = t.slug === selection.typography_slug;
            return (
              <button
                key={t.slug}
                onClick={() => canEdit && setSelection((s) => ({ ...s, typography_slug: t.slug }))}
                className={cn(
                  "text-left rounded-lg border p-4 transition focus:outline-none bg-card",
                  active ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                )}
              >
                <div style={{ fontFamily: `"${t.heading_font}"` }} className="text-2xl leading-tight">
                  Aa Bb
                </div>
                <div style={{ fontFamily: `"${t.body_font}"` }} className="text-xs text-muted-foreground mt-2">
                  The quick brown fox jumps over the lazy dog.
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium">{t.name}</span>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{t.heading_font} · {t.body_font}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Column: Layouts */}
      <section>
        <header className="flex items-center gap-2 mb-3">
          <LayoutGrid className="h-4 w-4 text-accent-blue" />
          <h3 className="font-medium">Layout</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">5 preset</Badge>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {layouts.map((l) => {
            const active = l.slug === selection.layout_slug;
            return (
              <button
                key={l.slug}
                onClick={() => canEdit && setSelection((s) => ({ ...s, layout_slug: l.slug }))}
                className={cn(
                  "text-left rounded-lg border overflow-hidden transition focus:outline-none bg-card",
                  active ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                )}
              >
                <LayoutWireframe variant={l.hero_variant} density={l.section_density} />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{l.name}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  {l.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{l.description}</p>}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-[9px]">{l.section_density}</Badge>
                    <Badge variant="secondary" className="text-[9px]">motion: {l.motion_intensity}</Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live preview + save */}
      <Card className="p-5 sticky bottom-4 backdrop-blur bg-card/95 border-primary/20 shadow-lg">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div
            className="flex-1 rounded-md border p-4"
            style={{
              background: activePalette?.tokens.background ? `hsl(${activePalette.tokens.background})` : undefined,
              color: activePalette?.tokens.foreground ? `hsl(${activePalette.tokens.foreground})` : undefined,
            }}
          >
            <div style={{ fontFamily: activeTypo?.heading_font }} className="text-2xl">
              {activePalette?.name ?? "Önizleme"}
            </div>
            <div style={{ fontFamily: activeTypo?.body_font }} className="text-sm opacity-80 mt-1">
              {activeLayout?.name} layout · {activeTypo?.name}
            </div>
            <div className="mt-3 flex gap-2">
              <span
                className="px-3 py-1.5 rounded text-xs font-medium"
                style={{
                  background: activePalette?.tokens.primary ? `hsl(${activePalette.tokens.primary})` : undefined,
                  color: activePalette?.tokens["primary-foreground"]
                    ? `hsl(${activePalette.tokens["primary-foreground"]})`
                    : undefined,
                }}
              >
                Primary CTA
              </span>
              <span
                className="px-3 py-1.5 rounded text-xs font-medium border"
                style={{
                  borderColor: activePalette?.tokens.border ? `hsl(${activePalette.tokens.border})` : undefined,
                  color: activePalette?.tokens.foreground ? `hsl(${activePalette.tokens.foreground})` : undefined,
                }}
              >
                Secondary
              </span>
            </div>
          </div>
          <Button onClick={save} disabled={!canEdit || saving} size="lg" className="min-w-40">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bu kombinasyonu uygula"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

function LayoutWireframe({ variant, density }: { variant: string; density: string }) {
  const gap = density === "spacious" ? 6 : density === "dense" ? 2 : 4;
  return (
    <svg viewBox="0 0 160 80" className="w-full h-20 bg-muted/40">
      <rect x="0" y="0" width="160" height="10" fill="currentColor" opacity="0.15" />
      {variant === "immersive" && (
        <rect x="0" y="10" width="160" height="50" fill="currentColor" opacity="0.35" />
      )}
      {variant === "split" && (
        <>
          <rect x="6" y={10 + gap} width="70" height={48 - gap} fill="currentColor" opacity="0.3" />
          <rect x="84" y={10 + gap} width="70" height={48 - gap} fill="currentColor" opacity="0.2" />
        </>
      )}
      {variant === "corporate" && (
        <>
          <rect x="0" y="10" width="160" height="40" fill="currentColor" opacity="0.4" />
          <rect x="6" y="55" width="46" height="20" fill="currentColor" opacity="0.2" />
          <rect x="58" y="55" width="46" height="20" fill="currentColor" opacity="0.2" />
          <rect x="110" y="55" width="44" height="20" fill="currentColor" opacity="0.2" />
        </>
      )}
      {variant === "standard" && (
        <>
          <rect x="6" y={10 + gap} width="148" height="30" fill="currentColor" opacity="0.3" />
          <rect x="6" y={44 + gap} width="70" height="28" fill="currentColor" opacity="0.2" />
          <rect x="84" y={44 + gap} width="70" height="28" fill="currentColor" opacity="0.2" />
        </>
      )}
      {variant === "minimal" && (
        <>
          <rect x="30" y="22" width="100" height="6" fill="currentColor" opacity="0.5" />
          <rect x="40" y="32" width="80" height="3" fill="currentColor" opacity="0.3" />
          <rect x="60" y="58" width="40" height="4" fill="currentColor" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

export default ThemeMixer;