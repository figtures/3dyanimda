import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";

type Seo = {
  id: string;
  path: string;
  title_tr: string; title_en: string;
  description_tr: string; description_en: string;
  keywords_tr: string; keywords_en: string;
  og_image_url: string;
  noindex: boolean;
};

const COMMON_PATHS = ["/", "/hakkimizda", "/hizmetler", "/portfoy", "/blog", "/iletisim", "/sss", "/teklif-al"];

const AdminSeo = () => {
  const [items, setItems] = useState<Seo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("seo_meta").select("*").order("path");
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Seo>) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleAdd = async () => {
    const path = window.prompt("Sayfa yolu (örn. /hakkimizda):", "/");
    if (!path) return;
    const { data, error } = await (supabase as any).from("seo_meta").insert({ path }).select().single();
    if (error) return toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    setItems((p) => [...p, data as any]);
  };

  const handleSave = async (it: Seo) => {
    const { id, ...rest } = it;
    const { error } = await (supabase as any).from("seo_meta").update(rest).eq("id", id);
    if (error) return toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    const { error } = await (supabase as any).from("seo_meta").delete().eq("id", id);
    if (error) return toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const seedDefaults = async () => {
    const existing = new Set(items.map((i) => i.path));
    const toAdd = COMMON_PATHS.filter((p) => !existing.has(p)).map((path) => ({ path }));
    if (!toAdd.length) return toast({ title: "Tüm varsayılan sayfalar mevcut" });
    const { error } = await (supabase as any).from("seo_meta").insert(toAdd);
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    load();
  };

  if (loading) return <div className="grid place-items-center h-64"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">SEO / Meta Yönetimi</h1>
          <p className="text-sm text-muted-foreground">Sayfa bazlı başlık, açıklama, anahtar kelimeler ve OG görseli.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedDefaults}>Varsayılanları Ekle</Button>
          <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> Yeni Sayfa</Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((it) => (
          <Card key={it.id} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Input
                className="font-mono max-w-sm"
                value={it.path}
                onChange={(e) => update(it.id, { path: e.target.value })}
                placeholder="/path"
              />
              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-xs">noindex</Label>
                <Switch checked={it.noindex} onCheckedChange={(v) => update(it.id, { noindex: v })} />
              </div>
              <Button size="sm" onClick={() => handleSave(it)}><Save className="h-4 w-4 mr-1" /> Kaydet</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(it.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>

            <Tabs defaultValue="tr">
              <TabsList><TabsTrigger value="tr">TR</TabsTrigger><TabsTrigger value="en">EN</TabsTrigger></TabsList>
              <TabsContent value="tr" className="space-y-2">
                <Input placeholder="Başlık (TR)" value={it.title_tr ?? ""} onChange={(e) => update(it.id, { title_tr: e.target.value })} />
                <Textarea placeholder="Açıklama (TR)" value={it.description_tr ?? ""} onChange={(e) => update(it.id, { description_tr: e.target.value })} rows={2} />
                <Input placeholder="Anahtar kelimeler (virgülle, TR)" value={it.keywords_tr ?? ""} onChange={(e) => update(it.id, { keywords_tr: e.target.value })} />
              </TabsContent>
              <TabsContent value="en" className="space-y-2">
                <Input placeholder="Title (EN)" value={it.title_en ?? ""} onChange={(e) => update(it.id, { title_en: e.target.value })} />
                <Textarea placeholder="Description (EN)" value={it.description_en ?? ""} onChange={(e) => update(it.id, { description_en: e.target.value })} rows={2} />
                <Input placeholder="Keywords (comma separated, EN)" value={it.keywords_en ?? ""} onChange={(e) => update(it.id, { keywords_en: e.target.value })} />
              </TabsContent>
            </Tabs>

            <div className="space-y-1">
              <Label className="text-xs">OG Görseli</Label>
              <div className="flex items-center gap-3">
                {it.og_image_url && <img src={resolveMediaUrl(it.og_image_url)} alt="" className="h-16 w-28 object-cover rounded border" />}
                <Button variant="outline" size="sm" onClick={() => setPickerFor(it.id)}>{it.og_image_url ? "Değiştir" : "Seç"}</Button>
                {it.og_image_url && (
                  <Button variant="ghost" size="sm" onClick={() => update(it.id, { og_image_url: "" })}>Kaldır</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!items.length && <Card className="p-8 text-center text-sm text-muted-foreground">Henüz SEO girdisi yok. "Varsayılanları Ekle" ile başlayabilirsiniz.</Card>}
      </div>
      <MediaPicker
        open={pickerFor !== null}
        onOpenChange={(v) => { if (!v) setPickerFor(null); }}
        category="og"
        onSelect={(m) => { if (pickerFor) update(pickerFor, { og_image_url: m.public_url }); setPickerFor(null); }}
      />
    </div>
  );
};

export default AdminSeo;