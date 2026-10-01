import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { BlockType } from "@/lib/cms/blocks";

type AnyData = Record<string, any>;

function L({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-muted-foreground">{children}</label>;
}

function KVList({ items, onChange, keyLabel = "Etiket", valLabel = "Değer", addLabel = "Satır ekle" }: {
  items: { k: string; v: string }[];
  onChange: (next: { k: string; v: string }[]) => void;
  keyLabel?: string; valLabel?: string; addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input value={it.k} placeholder={keyLabel} onChange={(e) => onChange(items.map((x, j) => j === i ? { ...x, k: e.target.value } : x))} className="w-1/3" />
          <Input value={it.v} placeholder={valLabel} onChange={(e) => onChange(items.map((x, j) => j === i ? { ...x, v: e.target.value } : x))} />
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { k: "", v: "" }])}>
        <Plus className="h-3 w-3 mr-1" /> {addLabel}
      </Button>
    </div>
  );
}

function QAList({ items, onChange }: { items: { q: string; a: string }[]; onChange: (next: { q: string; a: string }[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="border rounded-md p-3 space-y-2 bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Soru {i + 1}</span>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input value={it.q} placeholder="Soru" onChange={(e) => onChange(items.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
          <Textarea value={it.a} placeholder="Cevap" rows={3} onChange={(e) => onChange(items.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { q: "", a: "" }])}>
        <Plus className="h-3 w-3 mr-1" /> Soru ekle
      </Button>
    </div>
  );
}

function BreadcrumbsEditor({ items, onChange }: { items: { label: string; to?: string }[]; onChange: (next: { label: string; to?: string }[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input value={it.label} placeholder="Etiket (Anasayfa)" onChange={(e) => onChange(items.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
          <Input value={it.to || ""} placeholder="/yol (son için boş)" onChange={(e) => onChange(items.map((x, j) => j === i ? { ...x, to: e.target.value || undefined } : x))} />
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { label: "" }])}>
        <Plus className="h-3 w-3 mr-1" /> Breadcrumb ekle
      </Button>
    </div>
  );
}

export function BlockEditor({ type, data, onChange }: { type: BlockType; data: AnyData; onChange: (next: AnyData) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });

  switch (type) {
    case "hero":
      return (
        <div className="space-y-3">
          <div><L>Eyebrow (üst etiket)</L><Input value={data.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} /></div>
          <div><L>Başlık (HTML destekli)</L><Textarea rows={2} value={data.title_html || ""} onChange={(e) => set("title_html", e.target.value)} /></div>
          <div><L>Açıklama</L><Textarea rows={3} value={data.lead || ""} onChange={(e) => set("lead", e.target.value)} /></div>
          <div>
            <L>Breadcrumbs</L>
            <BreadcrumbsEditor items={data.breadcrumbs || []} onChange={(v) => set("breadcrumbs", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><L>Birincil buton etiket</L><Input value={data.cta_primary?.label || ""} onChange={(e) => set("cta_primary", { ...data.cta_primary, label: e.target.value })} /></div>
            <div><L>Birincil buton link</L><Input value={data.cta_primary?.to || ""} onChange={(e) => set("cta_primary", { ...data.cta_primary, to: e.target.value })} /></div>
            <div><L>İkincil buton etiket</L><Input value={data.cta_secondary?.label || ""} onChange={(e) => set("cta_secondary", { ...data.cta_secondary, label: e.target.value })} /></div>
            <div><L>İkincil buton link</L><Input value={data.cta_secondary?.to || ""} onChange={(e) => set("cta_secondary", { ...data.cta_secondary, to: e.target.value })} /></div>
          </div>
        </div>
      );
    case "service_body":
      return (
        <div className="space-y-3">
          <div><L>İçerik (HTML — h2/h3/p/ul/ol/li/strong destekli)</L>
            <Textarea rows={14} className="font-mono text-xs" value={data.body_html || ""} onChange={(e) => set("body_html", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><L>Görsel URL</L><Input value={data.image_url || ""} onChange={(e) => set("image_url", e.target.value)} placeholder="/cms/foto.jpg veya https://…" /></div>
            <div><L>Görsel alt</L><Input value={data.image_alt || ""} onChange={(e) => set("image_alt", e.target.value)} /></div>
          </div>
          <div><L>Özet etiketi</L><Input value={data.aside_label || ""} onChange={(e) => set("aside_label", e.target.value)} placeholder="Özet" /></div>
          <div>
            <L>Özellikler (etiket / değer)</L>
            <KVList items={data.highlights || []} onChange={(v) => set("highlights", v)} keyLabel="Etiket (Hassasiyet)" valLabel="Değer (±0.02 mm)" addLabel="Özellik ekle" />
          </div>
        </div>
      );
    case "richtext":
      return (
        <div className="space-y-3">
          <div><L>HTML</L><Textarea rows={14} className="font-mono text-xs" value={data.html || ""} onChange={(e) => set("html", e.target.value)} /></div>
          <div>
            <L>Genişlik</L>
            <select value={data.container || "narrow"} onChange={(e) => set("container", e.target.value)} className="w-full border rounded-md h-9 px-2 bg-background">
              <option value="narrow">Dar (3xl)</option>
              <option value="wide">Geniş</option>
            </select>
          </div>
        </div>
      );
    case "faq":
      return (
        <div className="space-y-3">
          <div><L>Schema serviceType (opsiyonel, JSON-LD için)</L><Input value={data.service_type || ""} onChange={(e) => set("service_type", e.target.value)} placeholder="ör. 3D Tarama" /></div>
          <div><L>Sorular</L><QAList items={data.items || []} onChange={(v) => set("items", v)} /></div>
        </div>
      );
    case "cta":
      return <p className="text-sm text-muted-foreground">Global CTA bölümü görüntülenir. İçerik <em>Ana Sayfa</em> → <em>CTA içeriği</em> ayarlarından düzenlenir.</p>;
    case "feature_grid":
      return (
        <div className="space-y-3">
          <div>
            <L>Sütun sayısı</L>
            <select value={data.columns || 3} onChange={(e) => set("columns", Number(e.target.value))} className="w-full border rounded-md h-9 px-2 bg-background">
              <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
            </select>
          </div>
          <div className="space-y-2">
            <L>Özellikler</L>
            {(data.items || []).map((it: any, i: number) => (
              <div key={i} className="border rounded p-3 space-y-2 bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => set("items", (data.items || []).filter((_: any, j: number) => j !== i))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input value={it.title || ""} placeholder="Başlık" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, title: e.target.value } : x))} />
                <Textarea value={it.description || ""} placeholder="Açıklama" rows={2} onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, description: e.target.value } : x))} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("items", [...(data.items || []), { title: "", description: "" }])}>
              <Plus className="h-3 w-3 mr-1" /> Özellik ekle
            </Button>
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="space-y-2">
          {(data.images || []).map((img: any, i: number) => (
            <div key={i} className="flex gap-2">
              <Input value={img.url || ""} placeholder="Görsel URL" onChange={(e) => set("images", (data.images || []).map((x: any, j: number) => j === i ? { ...x, url: e.target.value } : x))} />
              <Input value={img.alt || ""} placeholder="Alt" onChange={(e) => set("images", (data.images || []).map((x: any, j: number) => j === i ? { ...x, alt: e.target.value } : x))} className="w-1/3" />
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => set("images", (data.images || []).filter((_: any, j: number) => j !== i))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set("images", [...(data.images || []), { url: "", alt: "" }])}>
            <Plus className="h-3 w-3 mr-1" /> Görsel ekle
          </Button>
        </div>
      );
    case "card_grid":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><L>Eyebrow</L><Input value={data.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} /></div>
            <div>
              <L>Sütun sayısı</L>
              <select value={data.columns || 3} onChange={(e) => set("columns", Number(e.target.value))} className="w-full border rounded-md h-9 px-2 bg-background">
                <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
              </select>
            </div>
          </div>
          <div><L>Başlık (HTML)</L><Textarea rows={2} value={data.title_html || ""} onChange={(e) => set("title_html", e.target.value)} /></div>
          <div><L>Açıklama</L><Textarea rows={2} value={data.lead || ""} onChange={(e) => set("lead", e.target.value)} /></div>
          <div className="space-y-2">
            <L>Kartlar</L>
            {(data.items || []).map((it: any, i: number) => (
              <div key={i} className="border rounded p-3 space-y-2 bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Kart {i + 1}</span>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => set("items", (data.items || []).filter((_: any, j: number) => j !== i))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={it.title || ""} placeholder="Başlık" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, title: e.target.value } : x))} />
                  <Input value={it.icon || ""} placeholder="İkon (Lucide adı: Car, Factory…)" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, icon: e.target.value } : x))} />
                </div>
                <Textarea value={it.description || ""} placeholder="Açıklama" rows={2} onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, description: e.target.value } : x))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={it.to || ""} placeholder="Link /yol" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, to: e.target.value } : x))} />
                  <Input value={it.badge || ""} placeholder="Rozet metni (opsiyonel)" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, badge: e.target.value } : x))} />
                </div>
                <label className="text-xs text-muted-foreground inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!it.primary} onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, primary: e.target.checked } : x))} />
                  Vurgulu kart (mavi çerçeve + rozet)
                </label>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("items", [...(data.items || []), { title: "", description: "", icon: "Sparkles", to: "" }])}>
              <Plus className="h-3 w-3 mr-1" /> Kart ekle
            </Button>
          </div>
        </div>
      );
    case "stats":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><L>Eyebrow</L><Input value={data.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} /></div>
            <div>
              <L>Arka plan</L>
              <select value={data.variant || "cream"} onChange={(e) => set("variant", e.target.value)} className="w-full border rounded-md h-9 px-2 bg-background">
                <option value="cream">Cream</option><option value="default">Beyaz</option>
              </select>
            </div>
          </div>
          <div><L>Başlık (HTML)</L><Textarea rows={2} value={data.title_html || ""} onChange={(e) => set("title_html", e.target.value)} /></div>
          <div className="space-y-2">
            <L>Metrikler</L>
            {(data.items || []).map((it: any, i: number) => (
              <div key={i} className="border rounded p-3 space-y-2 bg-muted/30">
                <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">#{i + 1}</span><Button variant="ghost" size="sm" className="text-destructive" onClick={() => set("items", (data.items || []).filter((_: any, j: number) => j !== i))}><Trash2 className="h-3 w-3" /></Button></div>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={it.metric || ""} placeholder="Metrik (ör. %72)" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, metric: e.target.value } : x))} />
                  <Input value={it.label || ""} placeholder="Etiket" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, label: e.target.value } : x))} />
                </div>
                <Textarea value={it.note || ""} placeholder="Not (opsiyonel)" rows={2} onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, note: e.target.value } : x))} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("items", [...(data.items || []), { metric: "", label: "", note: "" }])}><Plus className="h-3 w-3 mr-1" /> Metrik ekle</Button>
          </div>
          <div><L>Alt not (opsiyonel)</L><Textarea rows={2} value={data.footnote || ""} onChange={(e) => set("footnote", e.target.value)} /></div>
        </div>
      );
    case "process_steps":
      return (
        <div className="space-y-3">
          <div><L>Eyebrow</L><Input value={data.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} /></div>
          <div><L>Başlık (HTML)</L><Textarea rows={2} value={data.title_html || ""} onChange={(e) => set("title_html", e.target.value)} /></div>
          <div className="space-y-2">
            <L>Adımlar</L>
            {(data.items || []).map((it: any, i: number) => (
              <div key={i} className="border rounded p-3 space-y-2 bg-muted/30">
                <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">#{i + 1}</span><Button variant="ghost" size="sm" className="text-destructive" onClick={() => set("items", (data.items || []).filter((_: any, j: number) => j !== i))}><Trash2 className="h-3 w-3" /></Button></div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={it.phase || ""} placeholder="01" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, phase: e.target.value } : x))} />
                  <Input className="col-span-2" value={it.title || ""} placeholder="Başlık" onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, title: e.target.value } : x))} />
                </div>
                <Textarea value={it.description || ""} placeholder="Açıklama" rows={2} onChange={(e) => set("items", (data.items || []).map((x: any, j: number) => j === i ? { ...x, description: e.target.value } : x))} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("items", [...(data.items || []), { phase: "", title: "", description: "" }])}><Plus className="h-3 w-3 mr-1" /> Adım ekle</Button>
          </div>
        </div>
      );
    case "bullet_list":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><L>Eyebrow</L><Input value={data.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} /></div>
            <div>
              <L>Sütun</L>
              <select value={data.columns || 2} onChange={(e) => set("columns", Number(e.target.value))} className="w-full border rounded-md h-9 px-2 bg-background"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select>
            </div>
            <div>
              <L>İkon</L>
              <select value={data.variant || "check"} onChange={(e) => set("variant", e.target.value)} className="w-full border rounded-md h-9 px-2 bg-background"><option value="check">Onay</option><option value="dot">Nokta</option></select>
            </div>
          </div>
          <div><L>Başlık (HTML)</L><Textarea rows={2} value={data.title_html || ""} onChange={(e) => set("title_html", e.target.value)} /></div>
          <div className="space-y-2">
            <L>Maddeler</L>
            {(data.items || []).map((it: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={it} onChange={(e) => set("items", (data.items || []).map((x: string, j: number) => j === i ? e.target.value : x))} />
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => set("items", (data.items || []).filter((_: string, j: number) => j !== i))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("items", [...(data.items || []), ""])}><Plus className="h-3 w-3 mr-1" /> Madde ekle</Button>
          </div>
        </div>
      );
    case "preset_section":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <L>Koleksiyondan bölüm</L>
            <Input
              value={data.preset_slug || ""}
              onChange={(e) => set("preset_slug", e.target.value)}
              placeholder="örn. about-body"
            />
            <p className="text-xs text-muted-foreground">
              "Koleksiyonlar → CMS Bölümleri" altındaki bir kaydın slug'ı. İçerik panelden düzenlenir, kod değişikliği gerekmez.
            </p>
          </div>
          <div className="space-y-2 border-t pt-3">
            <L>Paylaşımlı bölüm (kod tarafından beslenir)</L>
            <select
              value={data.preset || ""}
              onChange={(e) => set("preset", e.target.value || undefined)}
              className="w-full border rounded-md h-9 px-2 bg-background"
              disabled={!!data.preset_slug}
            >
              <option value="">— Yok —</option>
              <option value="services_grid">Hizmetler grid'i (Hizmet Kartları'ndan)</option>
              <option value="process">Süreç (4 adım)</option>
              <option value="capabilities">Yetkinlikler tablosu</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              İçeriği başka admin modüllerinden gelen, tüm tenantlarda aynı çalışan bileşenler.
            </p>
          </div>
        </div>
      );
  }
  return null;
}