import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Nav = {
  id: string;
  location: string;
  label_tr: string;
  label_en: string | null;
  url: string;
  parent: string | null;
  badge: string | null;
  description_tr: string | null;
  description_en: string | null;
  sort_order: number;
  active: boolean;
};

const LOCATIONS = [
  { v: "footer_extra", l: "Footer · Hızlı Linkler" },
  { v: "footer_services", l: "Footer · Hizmetler (ek)" },
  { v: "footer_company", l: "Footer · Kurumsal (ek)" },
  { v: "header_extra", l: "Header · Ek Linkler" },
];

const AdminNavigation = () => {
  const [items, setItems] = useState<Nav[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(LOCATIONS[0].v);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("nav_items").select("*").order("location").order("sort_order");
    if (error) toast.error(error.message);
    setItems((data ?? []) as Nav[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async (location: string) => {
    const { data, error } = await supabase.from("nav_items").insert({
      location, label_tr: "Yeni link", url: "/", sort_order: items.filter((i) => i.location === location).length, active: true,
    } as any).select().single();
    if (error) return toast.error(error.message);
    setItems((s) => [...s, data as Nav]);
  };

  const save = async (n: Nav) => {
    const { id, ...patch } = n;
    const { error } = await supabase.from("nav_items").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Kaydedildi");
  };

  const remove = async (id: string) => {
    if (!confirm("Bu link silinsin mi?")) return;
    const { error } = await supabase.from("nav_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
  };

  const patch = (id: string, p: Partial<Nav>) =>
    setItems((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">Navigasyon</h1>
      <p className="text-sm text-muted-foreground mb-6">Header ve footer'a admin tarafında ek linkler ekleyin. Ana mega-menü yapısı koddan yönetilir; bu sayfa ek linkler içindir.</p>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            {LOCATIONS.map((l) => (
              <TabsTrigger key={l.v} value={l.v}>{l.l} ({items.filter((i) => i.location === l.v).length})</TabsTrigger>
            ))}
          </TabsList>
          {LOCATIONS.map((l) => (
            <TabsContent key={l.v} value={l.v} className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => add(l.v)}><Plus className="h-4 w-4 mr-1" /> Yeni link</Button>
              </div>
              {items.filter((i) => i.location === l.v).map((n) => (
                <div key={n.id} className="border border-border rounded-lg bg-card p-4 grid sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-3"><Label>Etiket (TR)</Label><Input value={n.label_tr} onChange={(e) => patch(n.id, { label_tr: e.target.value })} /></div>
                  <div className="sm:col-span-3"><Label>Etiket (EN)</Label><Input value={n.label_en ?? ""} onChange={(e) => patch(n.id, { label_en: e.target.value })} /></div>
                  <div className="sm:col-span-4"><Label>URL</Label><Input value={n.url} onChange={(e) => patch(n.id, { url: e.target.value })} /></div>
                  <div className="sm:col-span-1"><Label>Sıra</Label><Input type="number" value={n.sort_order} onChange={(e) => patch(n.id, { sort_order: Number(e.target.value) })} /></div>
                  <div className="sm:col-span-1 flex items-center gap-2 pb-2"><Switch checked={n.active} onCheckedChange={(v) => patch(n.id, { active: v })} /></div>
                  <div className="sm:col-span-12 flex justify-between">
                    <Button size="sm" variant="ghost" onClick={() => remove(n.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3 mr-1" /> Sil</Button>
                    <Button size="sm" onClick={() => save(n)}><Save className="h-3 w-3 mr-1" /> Kaydet</Button>
                  </div>
                </div>
              ))}
              {items.filter((i) => i.location === l.v).length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">Bu konumda link yok.</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AdminNavigation;