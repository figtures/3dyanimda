import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, ArrowRight } from "lucide-react";

type R = { id: string; from_path: string; to_path: string; active: boolean; created_at: string };

const AdminRedirects = () => {
  const [items, setItems] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("url_redirects").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as R[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!from.startsWith("/") || !to.startsWith("/")) {
      toast.error("Yollar / ile başlamalı");
      return;
    }
    const { getTenantId } = await import("@/lib/tenant");
    const tid = getTenantId();
    if (!tid) return toast.error("Tenant bulunamadı");
    const { error } = await supabase.from("url_redirects").insert({ tenant_id: tid, from_path: from, to_path: to });
    if (error) return toast.error(error.message);
    setFrom(""); setTo(""); load();
  };

  const toggle = async (r: R, active: boolean) => {
    await supabase.from("url_redirects").update({ active }).eq("id", r.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("url_redirects").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Yönlendirmeler</h1>
        <p className="text-sm text-muted-foreground">Eski URL’leri yeni sayfalara yönlendirin. Sunucudaki kalıcı yönlendirmeler, site yeniden yayınlandığında güncellenir.</p>
      </div>

      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <h3 className="font-medium text-sm">Yeni Yönlendirme</h3>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto]">
          <Input placeholder="/eski-yol" value={from} onChange={(e) => setFrom(e.target.value)} />
          <ArrowRight className="h-5 w-5 text-muted-foreground self-center" />
          <Input placeholder="/yeni-yol" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" />Ekle</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">Henüz yönlendirme yok.</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-3">Kaynak</th><th className="p-3"></th><th className="p-3">Hedef</th><th className="p-3">Aktif</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{r.from_path}</td>
                  <td className="p-3"><ArrowRight className="h-4 w-4 text-muted-foreground" /></td>
                  <td className="p-3 font-mono text-xs">{r.to_path}</td>
                  <td className="p-3"><Switch checked={r.active} onCheckedChange={(v) => toggle(r, v)} /></td>
                  <td className="p-3 text-right"><button onClick={() => remove(r.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRedirects;