import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Palette, Type, LayoutGrid } from "lucide-react";

const StudioThemes = () => {
  const [palettes, setPalettes] = useState<any[]>([]);
  const [typos, setTypos] = useState<any[]>([]);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Studio · Tema Kütüphanesi";
    (async () => {
      const [p, t, l] = await Promise.all([
        supabase.from("theme_palettes").select("*").order("sort_order"),
        supabase.from("theme_typographies").select("*").order("sort_order"),
        supabase.from("theme_layouts").select("*").order("sort_order"),
      ]);
      setPalettes(p.data ?? []);
      setTypos(t.data ?? []);
      setLayouts(l.data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl mb-1">Tema Kütüphanesi</h1>
        <p className="text-muted-foreground text-sm">
          5 renk paleti × 5 tipografi × 5 layout = 125 olası kombinasyon. Her kiracı, kendi
          panelinde veya senin atadığın değerlerle karıştırabilir.
        </p>
      </header>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-accent-blue" />
          <h2 className="font-display text-xl">Renk paletleri</h2>
          <Badge variant="outline" className="ml-2 text-[10px]">{palettes.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {palettes.map((p) => {
            const t = p.tokens || {};
            return (
              <Card key={p.slug} className="overflow-hidden">
                <div
                  className="h-24 p-3 flex items-end"
                  style={{ background: `hsl(${t.background})`, color: `hsl(${t.foreground})` }}
                >
                  <div className="flex gap-1">
                    {["primary", "accent", "muted"].map((k) =>
                      t[k] ? (
                        <span key={k} className="h-5 w-5 rounded-full border border-black/10" style={{ background: `hsl(${t[k]})` }} />
                      ) : null,
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium">{p.name}</div>
                  {p.category && <Badge variant="secondary" className="text-[9px] mt-1">{p.category}</Badge>}
                  {p.description && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-3">{p.description}</p>}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-4 w-4 text-accent-blue" />
          <h2 className="font-display text-xl">Tipografi</h2>
          <Badge variant="outline" className="ml-2 text-[10px]">{typos.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {typos.map((t) => (
            <Card key={t.slug} className="p-4">
              <div style={{ fontFamily: `"${t.heading_font}"` }} className="text-3xl leading-tight">Aa Bb</div>
              <div style={{ fontFamily: `"${t.body_font}"` }} className="text-xs text-muted-foreground mt-2">
                The quick brown fox jumps over the lazy dog.
              </div>
              <div className="text-sm font-medium mt-3">{t.name}</div>
              <div className="text-[10px] text-muted-foreground">{t.heading_font} · {t.body_font}</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="h-4 w-4 text-accent-blue" />
          <h2 className="font-display text-xl">Layout varyantları</h2>
          <Badge variant="outline" className="ml-2 text-[10px]">{layouts.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {layouts.map((l) => (
            <Card key={l.slug} className="p-4">
              <div className="text-sm font-medium">{l.name}</div>
              <div className="text-[11px] text-muted-foreground mt-1 line-clamp-3">{l.description}</div>
              <div className="flex gap-1 mt-3 flex-wrap">
                <Badge variant="secondary" className="text-[9px]">{l.hero_variant}</Badge>
                <Badge variant="secondary" className="text-[9px]">{l.section_density}</Badge>
                <Badge variant="secondary" className="text-[9px]">motion: {l.motion_intensity}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudioThemes;