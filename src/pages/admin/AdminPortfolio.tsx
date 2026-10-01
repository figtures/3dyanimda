import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, Save, X, Edit, Eye, EyeOff, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { resolveMediaUrl } from "@/lib/media";

type Project = {
  id: string;
  slug: string;
  title_tr: string;
  title_en: string | null;
  excerpt_tr: string | null;
  excerpt_en: string | null;
  content_tr: string | null;
  content_en: string | null;
  cover_image_url: string | null;
  gallery: string[];
  industry: string | null;
  materials: string[] | null;
  tags: string[] | null;
  sort_order: number;
  published: boolean;
  updated_at: string;
};

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-");

const empty = (): Partial<Project> => ({
  slug: "", title_tr: "", title_en: "", excerpt_tr: "", excerpt_en: "",
  content_tr: "", content_en: "", cover_image_url: "", gallery: [],
  industry: "", materials: [], tags: [], sort_order: 0, published: false,
});

const AdminPortfolio = () => {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_projects" as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title_tr?.trim() || !editing.slug?.trim()) {
      toast.error("Başlık (TR) ve slug zorunlu");
      return;
    }
    setSaving(true);
    const payload: any = {
      slug: editing.slug.trim(),
      title_tr: editing.title_tr.trim(),
      title_en: editing.title_en ?? "",
      excerpt_tr: editing.excerpt_tr ?? "",
      excerpt_en: editing.excerpt_en ?? "",
      content_tr: editing.content_tr ?? "",
      content_en: editing.content_en ?? "",
      cover_image_url: editing.cover_image_url || null,
      gallery: editing.gallery ?? [],
      industry: editing.industry ?? "",
      materials: editing.materials ?? [],
      tags: editing.tags ?? [],
      sort_order: editing.sort_order ?? 0,
      published: editing.published ?? false,
      published_at: editing.published ? new Date().toISOString() : null,
    };
    const q = editing.id
      ? supabase.from("portfolio_projects" as any).update(payload).eq("id", editing.id)
      : supabase.from("portfolio_projects" as any).insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Kaydedildi");
    setEditing(null);
    load();
  };

  const remove = async (p: Project) => {
    if (!confirm(`"${p.title_tr}" silinsin mi?`)) return;
    const { error } = await supabase.from("portfolio_projects" as any).delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Silindi");
    load();
  };

  const togglePublish = async (p: Project) => {
    const next = !p.published;
    const { error } = await supabase.from("portfolio_projects" as any)
      .update({ published: next, published_at: next ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  if (editing) {
    const set = (patch: Partial<Project>) => setEditing({ ...editing, ...patch });
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <X className="h-4 w-4" /> Listeye dön
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={!!editing.published} onCheckedChange={v => set({ published: v })} id="pub" />
              <Label htmlFor="pub" className="text-sm">Yayında</Label>
            </div>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Kaydet
            </Button>
          </div>
        </div>

        <div className="space-y-4 bg-card border border-border rounded-lg p-6">
          <Tabs defaultValue="tr">
            <TabsList>
              <TabsTrigger value="tr">Türkçe</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="tr" className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label>Başlık (TR)</Label>
                <Input value={editing.title_tr ?? ""} onChange={e => {
                  set({ title_tr: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) });
                }} />
              </div>
              <div className="space-y-1.5">
                <Label>Özet (TR)</Label>
                <Textarea rows={2} value={editing.excerpt_tr ?? ""} onChange={e => set({ excerpt_tr: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>İçerik (TR — markdown / düz metin)</Label>
                <Textarea rows={10} value={editing.content_tr ?? ""} onChange={e => set({ content_tr: e.target.value })} />
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label>Title (EN)</Label>
                <Input value={editing.title_en ?? ""} onChange={e => set({ title_en: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Excerpt (EN)</Label>
                <Textarea rows={2} value={editing.excerpt_en ?? ""} onChange={e => set({ excerpt_en: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Content (EN)</Label>
                <Textarea rows={10} value={editing.content_en ?? ""} onChange={e => set({ content_en: e.target.value })} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Slug (URL)</Label>
              <Input className="font-mono text-sm" value={editing.slug ?? ""} onChange={e => set({ slug: e.target.value })} />
              <p className="text-xs text-muted-foreground">/portfoy/{editing.slug || "..."}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Sıralama</Label>
              <Input type="number" value={editing.sort_order ?? 0} onChange={e => set({ sort_order: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Sektör</Label>
              <Input value={editing.industry ?? ""} onChange={e => set({ industry: e.target.value })} placeholder="Otomotiv, Endüstri, Medikal..." />
            </div>
            <div className="space-y-1.5">
              <Label>Malzemeler (virgülle)</Label>
              <Input value={(editing.materials ?? []).join(", ")} onChange={e => set({ materials: e.target.value.split(",").map(x => x.trim()).filter(Boolean) })} placeholder="PLA, ABS, PA-CF" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Etiketler (virgülle)</Label>
              <Input value={(editing.tags ?? []).join(", ")} onChange={e => set({ tags: e.target.value.split(",").map(x => x.trim()).filter(Boolean) })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Kapak Görseli</Label>
            <div className="flex items-center gap-3">
              {editing.cover_image_url && <img src={resolveMediaUrl(editing.cover_image_url)} alt="" className="h-16 w-24 object-cover rounded border border-border" />}
              <Button type="button" variant="outline" size="sm" onClick={() => setCoverPickerOpen(true)}>
                <ImagePlus className="h-4 w-4 mr-2" /> {editing.cover_image_url ? "Değiştir" : "Seç"}
              </Button>
              {editing.cover_image_url && <Button type="button" variant="ghost" size="sm" onClick={() => set({ cover_image_url: "" })}>Kaldır</Button>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Galeri ({(editing.gallery ?? []).length} görsel)</Label>
            <div className="flex flex-wrap gap-2">
              {(editing.gallery ?? []).map((url, i) => (
                <div key={i} className="relative group">
                  <img src={resolveMediaUrl(url)} alt="" className="h-20 w-20 object-cover rounded border border-border" />
                  <button type="button"
                    onClick={() => set({ gallery: (editing.gallery ?? []).filter((_, j) => j !== i) })}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setGalleryPickerOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Görsel ekle
              </Button>
            </div>
          </div>
        </div>

        <MediaPicker
          open={coverPickerOpen}
          onOpenChange={setCoverPickerOpen}
          onSelect={(m) => set({ cover_image_url: m.public_url })}
          category="portfolio"
        />
        <MediaPicker
          open={galleryPickerOpen}
          onOpenChange={setGalleryPickerOpen}
          onSelect={(m) => set({ gallery: [...(editing.gallery ?? []), m.public_url] })}
          category="portfolio"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Portfolyo Projeleri</h1>
        <Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4 mr-2" /> Yeni Proje</Button>
      </div>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Henüz proje yok.</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-20"></th>
                <th className="px-4 py-3">Başlık</th>
                <th className="px-4 py-3">Sektör</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    {p.cover_image_url
                      ? <img src={resolveMediaUrl(p.cover_image_url)} alt="" className="h-10 w-14 object-cover rounded" />
                      : <div className="h-10 w-14 bg-muted rounded" />}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title_tr}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.industry || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={p.published ? "text-emerald-600" : "text-muted-foreground"}>
                      {p.published ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => togglePublish(p)} className="p-2 hover:bg-muted rounded" title={p.published ? "Taslağa al" : "Yayınla"}>
                        {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setEditing(p)} className="p-2 hover:bg-muted rounded"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => remove(p)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPortfolio;