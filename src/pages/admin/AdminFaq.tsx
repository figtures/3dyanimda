import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";

type Faq = {
  id: string;
  question_tr: string; answer_tr: string;
  question_en: string; answer_en: string;
  category: string; sort_order: number; active: boolean;
};

const AdminFaq = () => {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("faq_items").select("*").order("sort_order").order("created_at");
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Faq>) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleAdd = async () => {
    const max = Math.max(0, ...items.map((i) => i.sort_order));
    const { getTenantId } = await import("@/lib/tenant");
    const tid = getTenantId();
    if (!tid) return toast({ title: "Tenant bulunamadı", variant: "destructive" });
    const { data, error } = await supabase.from("faq_items").insert({
      tenant_id: tid,
      question_tr: "Yeni soru", answer_tr: "Cevap...", sort_order: max + 10,
    }).select().single();
    if (error) return toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    setItems((p) => [...p, data as any]);
  };

  const handleSave = async (f: Faq) => {
    const { error } = await supabase.from("faq_items").update({
      question_tr: f.question_tr, answer_tr: f.answer_tr,
      question_en: f.question_en, answer_en: f.answer_en,
      category: f.category, sort_order: f.sort_order, active: f.active,
    }).eq("id", f.id);
    if (error) toast({ title: "Hata", description: error.message, variant: "destructive" });
    else toast({ title: "Kaydedildi" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("SSS silinsin mi?")) return;
    await supabase.from("faq_items").delete().eq("id", id);
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const a = items[idx], b = items[swap];
    await supabase.from("faq_items").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("faq_items").update({ sort_order: a.sort_order }).eq("id", b.id);
    await load();
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-2xl font-semibold">SSS Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-1">Sıkça sorulan sorular. TR/EN dolu olanlar dil seçimine göre yayınlanır.</p>
        </div>
        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" /> Yeni</Button>
      </div>
      {items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">Henüz soru eklenmedi.</Card>
      ) : items.map((f, i) => (
        <Card key={f.id} className="p-5 space-y-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>#{f.sort_order}</span>
              <Button size="sm" variant="ghost" onClick={() => move(f.id, -1)} disabled={i === 0}><ArrowUp className="h-3 w-3" /></Button>
              <Button size="sm" variant="ghost" onClick={() => move(f.id, 1)} disabled={i === items.length - 1}><ArrowDown className="h-3 w-3" /></Button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <Switch checked={f.active} onCheckedChange={(v) => update(f.id, { active: v })} /> Aktif
              </label>
              <Input value={f.category || ""} onChange={(e) => update(f.id, { category: e.target.value })} placeholder="kategori" className="w-32 h-8 text-xs" />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(f.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Türkçe</div>
              <Input value={f.question_tr} onChange={(e) => update(f.id, { question_tr: e.target.value })} placeholder="Soru (TR)" />
              <Textarea value={f.answer_tr} onChange={(e) => update(f.id, { answer_tr: e.target.value })} placeholder="Cevap (TR)" rows={4} />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">English</div>
              <Input value={f.question_en || ""} onChange={(e) => update(f.id, { question_en: e.target.value })} placeholder="Question (EN)" />
              <Textarea value={f.answer_en || ""} onChange={(e) => update(f.id, { answer_en: e.target.value })} placeholder="Answer (EN)" rows={4} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => handleSave(f)}><Save className="h-4 w-4 mr-2" /> Kaydet</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminFaq;