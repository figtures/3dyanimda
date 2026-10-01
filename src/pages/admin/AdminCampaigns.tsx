import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";

type Campaign = {
  id?: string;
  name: string;
  badge: string | null;
  message: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_quote_amount: number;
  min_quantity: number;
  countdown_seconds: number;
  active: boolean;
  sort_order: number;
};

const blank = (): Campaign => ({
  name: "", badge: "FLASH", message: "Şimdi gönder, indirim kazan!",
  discount_type: "percent", discount_value: 10,
  min_quote_amount: 0, min_quantity: 1,
  countdown_seconds: 600, active: true, sort_order: 0,
});

const AdminCampaigns = () => {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("discount_campaigns").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const upd = (i: number, patch: Partial<Campaign>) =>
    setItems(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));

  const add = () => setItems(prev => [...prev, { ...blank(), sort_order: prev.length }]);

  const remove = async (i: number) => {
    const c = items[i];
    if (!confirm(`"${c.name || "Yeni kampanya"}" silinsin mi?`)) return;
    if (c.id) {
      const { error } = await supabase.from("discount_campaigns").delete().eq("id", c.id);
      if (error) return toast.error(error.message);
    }
    setItems(prev => prev.filter((_, idx) => idx !== i));
    toast.success("Silindi");
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const { getTenantId } = await import("@/lib/tenant");
      const tid = getTenantId();
      if (!tid) throw new Error("Tenant bulunamadı");
      for (const c of items) {
        const payload = {
          tenant_id: tid,
          name: c.name, badge: c.badge || null, message: c.message,
          discount_type: c.discount_type, discount_value: c.discount_value,
          min_quote_amount: c.min_quote_amount, min_quantity: c.min_quantity,
          countdown_seconds: c.countdown_seconds, active: c.active, sort_order: c.sort_order,
        };
        if (c.id) {
          const { error } = await supabase.from("discount_campaigns").update(payload).eq("id", c.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("discount_campaigns").insert(payload);
          if (error) throw error;
        }
      }
      toast.success("Kaydedildi");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Kayıt hatası");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Kampanyalar & İndirimler</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Müşteri teklif sayfasında belirlediğiniz koşulları sağladığında, geri sayımlı bir indirim bandı belirir. Süre dolmadan gönderirse indirim uygulanır.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-2" /> Yeni</Button>
          <Button onClick={saveAll} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Tümünü Kaydet
          </Button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-10 text-center">
          <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Henüz kampanya yok. "Yeni" ile ekleyin.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((c, i) => (
          <div key={c.id ?? `new-${i}`} className="border border-border rounded-md p-4 bg-card">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="col-span-2 md:col-span-2">
                <Label className="text-xs">Kampanya adı</Label>
                <Input value={c.name} onChange={e => upd(i, { name: e.target.value })} placeholder="örn. Hızlı Karar İndirimi" />
              </div>
              <div>
                <Label className="text-xs">Rozet</Label>
                <Input value={c.badge ?? ""} onChange={e => upd(i, { badge: e.target.value })} placeholder="FLASH" />
              </div>
              <div>
                <Label className="text-xs">İndirim tipi</Label>
                <select value={c.discount_type}
                  onChange={e => upd(i, { discount_type: e.target.value as any })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="percent">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">İndirim değeri</Label>
                <Input type="number" step="0.01" value={c.discount_value}
                  onChange={e => upd(i, { discount_value: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-xs">Süre (saniye)</Label>
                <Input type="number" value={c.countdown_seconds}
                  onChange={e => upd(i, { countdown_seconds: parseInt(e.target.value) || 0 })} />
              </div>

              <div className="col-span-2 md:col-span-3">
                <Label className="text-xs">Mesaj (banner üzerinde gösterilir)</Label>
                <Textarea rows={2} value={c.message}
                  onChange={e => upd(i, { message: e.target.value })}
                  placeholder="Bu süre içinde gönder, %10 indirim kazan!" />
              </div>
              <div>
                <Label className="text-xs">Min. tahmini tutar (₺)</Label>
                <Input type="number" value={c.min_quote_amount}
                  onChange={e => upd(i, { min_quote_amount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-xs">Min. adet</Label>
                <Input type="number" value={c.min_quantity}
                  onChange={e => upd(i, { min_quantity: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label className="text-xs">Sıra (öncelik)</Label>
                <Input type="number" value={c.sort_order}
                  onChange={e => upd(i, { sort_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Switch checked={c.active} onCheckedChange={v => upd(i, { active: v })} id={`ca-${i}`} />
                <Label htmlFor={`ca-${i}`} className="text-sm">Aktif</Label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(i)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-1" /> Sil
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-muted-foreground border border-border rounded-md p-3 bg-muted/30">
        <strong>Nasıl çalışır?</strong> Müşteri STL yükleyip tahmini fiyat oluşunca, koşullara uyan en yüksek öncelikli aktif kampanya seçilir. Geri sayım başlar; süre dolmadan teklif gönderilirse indirim tutarı uygulanır ve teklif kaydında saklanır.
      </div>
    </div>
  );
};

export default AdminCampaigns;