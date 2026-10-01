import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { getTenantId } from "@/lib/tenant";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "";

type Row = {
  id: string;
  pattern: string;
  template_page_id: string | null;
  collection_id: string | null;
  param_mapping: any;
  priority: number;
  is_active: boolean;
  notes: string | null;
};

const AdminRoutes = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [pages, setPages] = useState<{ id: string; slug: string; title: string | null }[]>([]);
  const [colls, setColls] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: p }, { data: c }] = await Promise.all([
      supabase.from("route_templates").select("*").order("priority", { ascending: false }),
      supabase.from("pages").select("id, slug, title").order("slug"),
      supabase.from("collections").select("id, name, slug").order("name"),
    ]);
    setRows((r as any) || []);
    setPages((p as any) || []);
    setColls((c as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const tid = getTenantId();
    if (!tid) return;
    const { data, error } = await supabase
      .from("route_templates")
      .insert({ tenant_id: tid, pattern: "/yeni/:slug", param_mapping: { slug: "slug" }, priority: 0, is_active: true })
      .select()
      .single();
    if (error) return toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    setRows((p) => [data as any, ...p]);
  };

  const save = async (row: Row) => {
    setSaving(row.id);
    let mapping = row.param_mapping;
    if (typeof mapping === "string") {
      try { mapping = JSON.parse(mapping); } catch { return toast({ title: "Param mapping JSON geçersiz", variant: "destructive" }); }
    }
    const { error } = await supabase
      .from("route_templates")
      .update({
        pattern: row.pattern,
        template_page_id: row.template_page_id,
        collection_id: row.collection_id,
        param_mapping: mapping || {},
        priority: row.priority,
        is_active: row.is_active,
        notes: row.notes,
      })
      .eq("id", row.id);
    setSaving(null);
    if (error) return toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
  };

  const remove = async (id: string) => {
    if (!confirm("Bu rota silinecek. Emin misiniz?")) return;
    const { error } = await supabase.from("route_templates").delete().eq("id", id);
    if (error) return toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    setRows((p) => p.filter((r) => r.id !== id));
  };

  const update = (i: number, patch: Partial<Row>) => {
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dinamik Rotalar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            URL desenlerini şablon sayfalara ve koleksiyonlara bağlayın. Örn. <code>/:city/:district</code> → "Lokasyon Şablonu" + "Lokasyonlar" koleksiyonu.
          </p>
        </div>
        <Button onClick={add}><Plus className="h-4 w-4 mr-2" /> Yeni rota</Button>
      </div>

      <Card className="p-4 bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-sm">
            <div className="font-medium">Dinamik sitemap</div>
            <div className="text-muted-foreground text-xs">Yayındaki sayfalar + aktif rotalar üzerinden otomatik üretilir. Google Search Console'a bu URL'i girin.</div>
          </div>
          <code className="text-xs bg-background px-2 py-1 rounded border break-all">
            {SUPABASE_URL}/functions/v1/sitemap?tenant=&lt;tenant-slug&gt;
          </code>
        </div>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Henüz dinamik rota yok.</Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <Card key={r.id} className="p-4 space-y-3">
              <div className="grid md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                  <Label>URL deseni</Label>
                  <Input value={r.pattern} onChange={(e) => update(i, { pattern: e.target.value })} placeholder="/:city/:district" />
                </div>
                <div className="md:col-span-4">
                  <Label>Şablon sayfa</Label>
                  <Select value={r.template_page_id || ""} onValueChange={(v) => update(i, { template_page_id: v || null })}>
                    <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                    <SelectContent>
                      {pages.map((p) => <SelectItem key={p.id} value={p.id}>{p.title || p.slug}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Label>Koleksiyon (opsiyonel)</Label>
                  <Select value={r.collection_id || "__none"} onValueChange={(v) => update(i, { collection_id: v === "__none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Yok" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Yok</SelectItem>
                      {colls.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label>Aktif</Label>
                  <div className="pt-2"><Switch checked={r.is_active} onCheckedChange={(c) => update(i, { is_active: c })} /></div>
                </div>
              </div>
              <div className="grid md:grid-cols-12 gap-3">
                <div className="md:col-span-3">
                  <Label>Öncelik</Label>
                  <Input type="number" value={r.priority} onChange={(e) => update(i, { priority: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-9">
                  <Label>Parametre eşleme (JSON)</Label>
                  <Input
                    value={typeof r.param_mapping === "string" ? r.param_mapping : JSON.stringify(r.param_mapping || {})}
                    onChange={(e) => update(i, { param_mapping: e.target.value })}
                    placeholder='{"slug":"district","city":"data.city"}'
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Anahtar = URL parametresi adı. Değer = "slug" (kayıt slug'ı) veya "data.alan_adi" (data alanı ile filtre).
                  </p>
                </div>
              </div>
              <div>
                <Label>Not</Label>
                <Textarea rows={2} value={r.notes || ""} onChange={(e) => update(i, { notes: e.target.value })} />
              </div>
              <div className="flex justify-between">
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Sil
                </Button>
                <Button size="sm" onClick={() => save(r)} disabled={saving === r.id}>
                  {saving === r.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />} Kaydet
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;