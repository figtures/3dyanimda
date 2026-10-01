import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

type Legal = {
  id: string;
  slug: string;
  title_tr: string; title_en: string;
  content_tr: string; content_en: string;
  effective_date: string | null;
};

const DEFAULTS = [
  { slug: "kvkk-aydinlatma-metni", title_tr: "KVKK Aydınlatma Metni" },
  { slug: "gizlilik-politikasi", title_tr: "Gizlilik Politikası" },
  { slug: "cerez-politikasi", title_tr: "Çerez Politikası" },
  { slug: "kullanim-kosullari", title_tr: "Kullanım Koşulları" },
  { slug: "basvuru-acik-riza-metni", title_tr: "Açık Rıza Metni" },
];

const AdminLegal = () => {
  const [items, setItems] = useState<Legal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("legal_documents").select("*").order("slug");
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Legal>) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleAdd = async () => {
    const slug = window.prompt("Slug (örn. kvkk-aydinlatma-metni):");
    if (!slug) return;
    const { data, error } = await (supabase as any).from("legal_documents").insert({ slug, title_tr: slug }).select().single();
    if (error) return toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    setItems((p) => [...p, data as any]);
  };

  const handleSave = async (it: Legal) => {
    const { id, ...rest } = it;
    const { error } = await (supabase as any).from("legal_documents").update(rest).eq("id", id);
    if (error) return toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    const { error } = await (supabase as any).from("legal_documents").delete().eq("id", id);
    if (error) return toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const seedDefaults = async () => {
    const existing = new Set(items.map((i) => i.slug));
    const toAdd = DEFAULTS.filter((d) => !existing.has(d.slug));
    if (!toAdd.length) return toast({ title: "Tüm varsayılan belgeler mevcut" });
    const { error } = await (supabase as any).from("legal_documents").insert(toAdd);
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    load();
  };

  if (loading) return <div className="grid place-items-center h-64"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Yasal Belgeler</h1>
          <p className="text-sm text-muted-foreground">KVKK, Gizlilik, Çerez, Kullanım Koşulları vb. metinleri yönetin (HTML destekli).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedDefaults}>Varsayılanları Ekle</Button>
          <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> Yeni Belge</Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((it) => (
          <Card key={it.id} className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Input className="font-mono max-w-xs" value={it.slug} onChange={(e) => update(it.id, { slug: e.target.value })} placeholder="slug" />
              <Input type="date" className="max-w-[180px]" value={it.effective_date ?? ""} onChange={(e) => update(it.id, { effective_date: e.target.value || null })} />
              <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={() => handleSave(it)}><Save className="h-4 w-4 mr-1" /> Kaydet</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(it.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <Tabs defaultValue="tr">
              <TabsList><TabsTrigger value="tr">TR</TabsTrigger><TabsTrigger value="en">EN</TabsTrigger></TabsList>
              <TabsContent value="tr" className="space-y-2">
                <Label className="text-xs">Başlık (TR)</Label>
                <Input value={it.title_tr ?? ""} onChange={(e) => update(it.id, { title_tr: e.target.value })} />
                <Label className="text-xs">İçerik (TR — HTML destekli)</Label>
                <Textarea value={it.content_tr ?? ""} onChange={(e) => update(it.id, { content_tr: e.target.value })} rows={14} className="font-mono text-xs" />
              </TabsContent>
              <TabsContent value="en" className="space-y-2">
                <Label className="text-xs">Title (EN)</Label>
                <Input value={it.title_en ?? ""} onChange={(e) => update(it.id, { title_en: e.target.value })} />
                <Label className="text-xs">Content (EN — HTML)</Label>
                <Textarea value={it.content_en ?? ""} onChange={(e) => update(it.id, { content_en: e.target.value })} rows={14} className="font-mono text-xs" />
              </TabsContent>
            </Tabs>
          </Card>
        ))}
        {!items.length && <Card className="p-8 text-center text-sm text-muted-foreground">Henüz belge yok. "Varsayılanları Ekle" ile başlayabilirsiniz.</Card>}
      </div>
    </div>
  );
};

export default AdminLegal;