import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Job = {
  id: string;
  slug: string;
  title_tr: string;
  title_en: string | null;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  level: string | null;
  icon: string | null;
  summary_tr: string | null;
  summary_en: string | null;
  description_tr: string | null;
  description_en: string | null;
  requirements_tr: string | null;
  requirements_en: string | null;
  active: boolean;
  sort_order: number;
};

const empty = (): Partial<Job> => ({
  slug: "yeni-pozisyon-" + Date.now(),
  title_tr: "Yeni Pozisyon",
  title_en: "",
  location: "Beylikdüzü / İstanbul",
  employment_type: "Tam Zamanlı",
  level: "Mid",
  icon: "Briefcase",
  active: true,
  sort_order: 0,
});

const AdminJobs = () => {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("job_postings").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Job[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const { data, error } = await supabase.from("job_postings").insert(empty() as any).select().single();
    if (error) return toast.error(error.message);
    setItems((s) => [data as Job, ...s]);
  };

  const save = async (j: Job) => {
    const { id, ...patch } = j;
    const { error } = await supabase.from("job_postings").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Kaydedildi");
  };

  const remove = async (id: string) => {
    if (!confirm("Bu pozisyon silinsin mi?")) return;
    const { error } = await supabase.from("job_postings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
  };

  const patch = (id: string, p: Partial<Job>) =>
    setItems((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl">Açık Pozisyonlar</h1>
        <Button size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Yeni Pozisyon</Button>
      </div>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Henüz pozisyon yok.</div>
      ) : (
        <div className="space-y-3">
          {items.map((j) => (
            <details key={j.id} className="border border-border rounded-lg bg-card" open={items.length === 1}>
              <summary className="cursor-pointer p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{j.title_tr} {!j.active && <span className="text-xs text-muted-foreground">(pasif)</span>}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{j.location} · {j.employment_type} · {j.level}</div>
                </div>
              </summary>
              <div className="p-4 pt-0 border-t border-border grid gap-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Slug</Label><Input value={j.slug} onChange={(e) => patch(j.id, { slug: e.target.value })} /></div>
                  <div><Label>Sıra</Label><Input type="number" value={j.sort_order} onChange={(e) => patch(j.id, { sort_order: Number(e.target.value) })} /></div>
                  <div><Label>Başlık (TR)</Label><Input value={j.title_tr} onChange={(e) => patch(j.id, { title_tr: e.target.value })} /></div>
                  <div><Label>Başlık (EN)</Label><Input value={j.title_en ?? ""} onChange={(e) => patch(j.id, { title_en: e.target.value })} /></div>
                  <div><Label>Departman</Label><Input value={j.department ?? ""} onChange={(e) => patch(j.id, { department: e.target.value })} /></div>
                  <div><Label>Konum</Label><Input value={j.location ?? ""} onChange={(e) => patch(j.id, { location: e.target.value })} /></div>
                  <div><Label>Çalışma Şekli</Label><Input value={j.employment_type ?? ""} onChange={(e) => patch(j.id, { employment_type: e.target.value })} /></div>
                  <div><Label>Seviye</Label><Input value={j.level ?? ""} onChange={(e) => patch(j.id, { level: e.target.value })} /></div>
                  <div><Label>İkon (lucide adı)</Label><Input value={j.icon ?? ""} onChange={(e) => patch(j.id, { icon: e.target.value })} placeholder="Briefcase, ScanLine, PenTool, Wrench, Building2..." /></div>
                  <div className="flex items-center gap-2 pt-6"><Switch checked={j.active} onCheckedChange={(v) => patch(j.id, { active: v })} /><Label>Aktif</Label></div>
                </div>
                <div><Label>Özet (TR)</Label><Textarea rows={2} value={j.summary_tr ?? ""} onChange={(e) => patch(j.id, { summary_tr: e.target.value })} /></div>
                <div><Label>Özet (EN)</Label><Textarea rows={2} value={j.summary_en ?? ""} onChange={(e) => patch(j.id, { summary_en: e.target.value })} /></div>
                <div><Label>Açıklama (TR)</Label><Textarea rows={4} value={j.description_tr ?? ""} onChange={(e) => patch(j.id, { description_tr: e.target.value })} /></div>
                <div><Label>Gereksinimler (TR — her satır bir madde)</Label><Textarea rows={4} value={j.requirements_tr ?? ""} onChange={(e) => patch(j.id, { requirements_tr: e.target.value })} /></div>
                <div className="flex justify-between">
                  <Button size="sm" variant="ghost" onClick={() => remove(j.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" /> Sil
                  </Button>
                  <Button size="sm" onClick={() => save(j)}><Save className="h-3 w-3 mr-1" /> Kaydet</Button>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobs;