import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { MediaPicker, MediaItem } from "@/components/admin/MediaPicker";
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, Star } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";

type T = {
  id: string;
  author_name: string; author_title: string; company: string;
  quote_tr: string; quote_en: string;
  avatar_url: string | null; rating: number;
  sort_order: number; active: boolean;
};

const AdminTestimonials = () => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("sort_order").order("created_at");
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<T>) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleAdd = async () => {
    const max = Math.max(0, ...items.map((i) => i.sort_order));
    const { getTenantId } = await import("@/lib/tenant");
    const tid = getTenantId();
    if (!tid) return toast({ title: "Tenant bulunamadı", variant: "destructive" });
    const { data, error } = await supabase.from("testimonials").insert({
      tenant_id: tid,
      author_name: "Yeni Müşteri", quote_tr: "Yorum...", sort_order: max + 10,
    }).select().single();
    if (error) return toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    setItems((p) => [...p, data as any]);
  };

  const handleSave = async (t: T) => {
    const { error } = await supabase.from("testimonials").update({
      author_name: t.author_name, author_title: t.author_title, company: t.company,
      quote_tr: t.quote_tr, quote_en: t.quote_en, avatar_url: t.avatar_url,
      rating: t.rating, sort_order: t.sort_order, active: t.active,
    }).eq("id", t.id);
    if (error) toast({ title: "Hata", description: error.message, variant: "destructive" });
    else toast({ title: "Kaydedildi" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Referans silinsin mi?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    setItems((p) => p.filter((x) => x.id !== id));
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-2xl font-semibold">Referanslar</h1>
          <p className="text-sm text-muted-foreground mt-1">Müşteri yorumları. Avatarlar görsel kütüphanesinden seçilir.</p>
        </div>
        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" /> Yeni</Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">Henüz referans eklenmedi.</Card>
      ) : items.map((t) => (
        <Card key={t.id} className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">Sıra: 
              <Input type="number" value={t.sort_order} onChange={(e) => update(t.id, { sort_order: Number(e.target.value) })} className="inline-block w-20 h-7 ml-2" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs flex items-center gap-2"><Switch checked={t.active} onCheckedChange={(v) => update(t.id, { active: v })} /> Aktif</label>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>

          <div className="grid md:grid-cols-[120px_1fr] gap-4">
            <div className="space-y-2">
              <div className="aspect-square bg-muted rounded-full overflow-hidden grid place-items-center">
                {t.avatar_url ? <img src={resolveMediaUrl(t.avatar_url)} alt={t.author_name} className="w-full h-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setPickerFor(t.id)}>Avatar Seç</Button>
              {t.avatar_url && <Button size="sm" variant="ghost" className="w-full text-destructive text-xs" onClick={() => update(t.id, { avatar_url: null })}>Kaldır</Button>}
            </div>
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-2">
                <Input value={t.author_name} onChange={(e) => update(t.id, { author_name: e.target.value })} placeholder="Ad Soyad" />
                <Input value={t.author_title || ""} onChange={(e) => update(t.id, { author_title: e.target.value })} placeholder="Unvan" />
                <Input value={t.company || ""} onChange={(e) => update(t.id, { company: e.target.value })} placeholder="Şirket" />
              </div>
              <Textarea value={t.quote_tr} onChange={(e) => update(t.id, { quote_tr: e.target.value })} placeholder="Yorum (TR)" rows={3} />
              <Textarea value={t.quote_en || ""} onChange={(e) => update(t.id, { quote_en: e.target.value })} placeholder="Quote (EN)" rows={3} />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => update(t.id, { rating: n })}>
                      <Star className={`h-5 w-5 ${n <= t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Button size="sm" onClick={() => handleSave(t)}><Save className="h-4 w-4 mr-2" /> Kaydet</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <MediaPicker
        open={!!pickerFor}
        onOpenChange={(v) => { if (!v) setPickerFor(null); }}
        category="testimonials"
        onSelect={(m: MediaItem) => { if (pickerFor) update(pickerFor, { avatar_url: m.public_url }); setPickerFor(null); }}
      />
    </div>
  );
};

export default AdminTestimonials;