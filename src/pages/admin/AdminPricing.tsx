import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Material = {
  id?: string;
  name: string;
  technology: string;
  density_g_cm3: number;
  price_per_gram: number;
  setup_fee: number;
  min_price: number;
  description: string | null;
  color: string | null;
  active: boolean;
  sort_order: number;
};

type Setting = {
  key: string;
  value: number;
  label: string;
  description: string | null;
};

const blankMaterial = (): Material => ({
  name: "", technology: "FDM", density_g_cm3: 1.24, price_per_gram: 0,
  setup_fee: 25, min_price: 80, description: "", color: "", active: true, sort_order: 0,
});

const AdminPricing = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [m, s] = await Promise.all([
      supabase.from("materials").select("*").order("sort_order"),
      supabase.from("pricing_settings").select("*").order("key"),
    ]);
    if (m.error) toast.error(m.error.message);
    if (s.error) toast.error(s.error.message);
    setMaterials(m.data ?? []);
    setSettings(s.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateMat = (i: number, patch: Partial<Material>) => {
    setMaterials(prev => prev.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  };

  const addMat = () => setMaterials(prev => [...prev, { ...blankMaterial(), sort_order: prev.length }]);

  const removeMat = async (i: number) => {
    const m = materials[i];
    if (!confirm(`"${m.name || "Yeni malzeme"}" silinsin mi?`)) return;
    if (m.id) {
      const { error } = await supabase.from("materials").delete().eq("id", m.id);
      if (error) return toast.error(error.message);
    }
    setMaterials(prev => prev.filter((_, idx) => idx !== i));
    toast.success("Silindi");
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const { getTenantId } = await import("@/lib/tenant");
      const tid = getTenantId();
      if (!tid) throw new Error("Tenant bulunamadı");
      // Upsert materials
      for (const m of materials) {
        const payload = {
          tenant_id: tid,
          name: m.name, technology: m.technology, density_g_cm3: m.density_g_cm3,
          price_per_gram: m.price_per_gram, setup_fee: m.setup_fee, min_price: m.min_price,
          description: m.description || null, color: m.color || null, active: m.active, sort_order: m.sort_order,
        };
        if (m.id) {
          const { error } = await supabase.from("materials").update(payload).eq("id", m.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("materials").insert(payload);
          if (error) throw error;
        }
      }
      // Update settings
      for (const s of settings) {
        const { error } = await supabase.from("pricing_settings").update({ value: s.value }).eq("key", s.key);
        if (error) throw error;
      }
      toast.success("Kaydedildi");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Kayıt hatası");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Fiyatlandırma</h1>
        <Button onClick={saveAll} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Tümünü Kaydet
        </Button>
      </div>

      {/* Global Settings */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-display text-lg mb-1">Genel Ayarlar</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Formül: <code className="bg-muted px-1.5 py-0.5 rounded">((hacim × yoğunluk × doluluk_faktörü) × ₺/g + işçilik_saati × saat × kalite × adet) + kurulum</code>, sonra ×(1+marj)×(1+KDV), min sipariş ile kıyaslanır.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {settings.map((s, i) => (
            <div key={s.key} className="space-y-1.5">
              <Label className="text-sm">{s.label}</Label>
              <Input type="number" step="0.01" value={s.value}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setSettings(prev => prev.map((x, idx) => idx === i ? { ...x, value: isNaN(v) ? 0 : v } : x));
                }} />
              {s.description && <p className="text-[11px] text-muted-foreground">{s.description}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Malzemeler</h2>
          <Button variant="outline" size="sm" onClick={addMat}>
            <Plus className="h-4 w-4 mr-2" /> Malzeme Ekle
          </Button>
        </div>

        <div className="space-y-3">
          {materials.map((m, i) => (
            <div key={m.id ?? `new-${i}`} className="border border-border rounded-md p-4 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2 md:col-span-2">
                  <Label className="text-xs">Ad</Label>
                  <Input value={m.name} onChange={e => updateMat(i, { name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Teknoloji</Label>
                  <select value={m.technology} onChange={e => updateMat(i, { technology: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option>FDM</option>
                    <option>SLA</option>
                    <option>SLS</option>
                    <option>MJF</option>
                    <option>DLP</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Yoğunluk (g/cm³)</Label>
                  <Input type="number" step="0.01" value={m.density_g_cm3}
                    onChange={e => updateMat(i, { density_g_cm3: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">Fiyat (₺/g)</Label>
                  <Input type="number" step="0.01" value={m.price_per_gram}
                    onChange={e => updateMat(i, { price_per_gram: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">Kurulum (₺)</Label>
                  <Input type="number" step="1" value={m.setup_fee}
                    onChange={e => updateMat(i, { setup_fee: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">Min Fiyat (₺)</Label>
                  <Input type="number" step="1" value={m.min_price}
                    onChange={e => updateMat(i, { min_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">Renk</Label>
                  <Input value={m.color ?? ""} onChange={e => updateMat(i, { color: e.target.value })} placeholder="örn. Çoklu" />
                </div>
                <div>
                  <Label className="text-xs">Sıra</Label>
                  <Input type="number" value={m.sort_order}
                    onChange={e => updateMat(i, { sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <Label className="text-xs">Açıklama</Label>
                  <Textarea rows={1} value={m.description ?? ""}
                    onChange={e => updateMat(i, { description: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch checked={m.active} onCheckedChange={v => updateMat(i, { active: v })} id={`a-${i}`} />
                  <Label htmlFor={`a-${i}`} className="text-sm">Aktif (müşteriye gösterilir)</Label>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeMat(i)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" /> Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPricing;