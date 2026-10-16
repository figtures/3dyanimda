import { useTenant } from "@/contexts/TenantContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { computeEstimate, fmtTRY, qualities } from "@/lib/quote-engine";
const settingDefinitions = [
 {key:"margin_percent",label:"Kâr marjı (%)",description:"Maliyet üzerine uygulanır."},
 {key:"vat_percent",label:"KDV (%)",description:"Ön tahminin vergi oranı."},
 {key:"labor_per_hour",label:"Saatlik işçilik (₺)",description:"Tahmini üretim süresiyle çarpılır."},
 {key:"min_order_price",label:"Minimum sipariş (₺)",description:"KDV dahil toplam alt sınırı."},
 {key:"infill_percent",label:"Varsayılan doluluk (%)",description:"Yeni tekliflerde başlangıç değeri; 5–100."},
];

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
  setup_fee: 0, min_price: 0, description: "", color: "", active: true, sort_order: 0,
});

const AdminPricing = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewVolume, setPreviewVolume] = useState(100);
  const [previewQuantity, setPreviewQuantity] = useState(1);
  const [previewMaterial, setPreviewMaterial] = useState("");
  const [previewQuality, setPreviewQuality] = useState(1);
  const [savedSettingKeys, setSavedSettingKeys] = useState<string[]>([]);

  const load = async () => {
    if (!tenant) return;
    setLoading(true);
    const [m, s] = await Promise.all([
      supabase.from("materials").select("*").eq("tenant_id", tenant.id).order("sort_order"),
      supabase.from("pricing_settings").select("*").eq("tenant_id", tenant.id).order("key"),
    ]);
    if (m.error) toast.error(m.error.message);
    if (s.error) toast.error(s.error.message);
    setMaterials(m.data ?? []);
    setSavedSettingKeys((s.data ?? []).map(row => row.key));
    setSettings(settingDefinitions.map(def => ({...def, value:Number(s.data?.find(row => row.key === def.key)?.value ?? (def.key === "infill_percent" ? 20 : 0))})));
    setLoading(false);
  };

  useEffect(() => { load(); }, [tenant?.id]);

  const updateMat = (i: number, patch: Partial<Material>) => {
    setMaterials(prev => prev.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  };

  const addMat = () => setMaterials(prev => [...prev, { ...blankMaterial(), sort_order: prev.length }]);

  const removeMat = async (i: number) => {
    const m = materials[i];
    if (!confirm(`"${m.name || "Yeni malzeme"}" silinsin mi?`)) return;
    if (m.id) {
      const { error } = await supabase.from("materials").delete().eq("tenant_id", tenant!.id).eq("id", m.id);
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
      if (materials.some(m => !m.name.trim() || [m.density_g_cm3,m.price_per_gram,m.setup_fee,m.min_price,m.sort_order].some(v => !Number.isFinite(v) || v < 0))) throw new Error("Malzeme adı ve sıfır veya pozitif sayısal değerler gerekli.");
      if (settings.some(s => !Number.isFinite(s.value) || s.value < 0 || (s.key === "infill_percent" && (s.value < 5 || s.value > 100)))) throw new Error("Fiyat ayarlarını kontrol edin; doluluk 5–100 arasında olmalı.");
      // Upsert materials
      for (const m of materials) {
        const payload = {
          tenant_id: tid,
          name: m.name, technology: m.technology, density_g_cm3: m.density_g_cm3,
          price_per_gram: m.price_per_gram, setup_fee: m.setup_fee, min_price: m.min_price,
          description: m.description || null, color: m.color || null, active: m.active, sort_order: m.sort_order,
        };
        if (m.id) {
          const { error } = await supabase.from("materials").update(payload).eq("tenant_id", tid).eq("id", m.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("materials").insert(payload);
          if (error) throw error;
        }
      }
      // Update settings
      for (const s of settings) {
        const { error } = await supabase.from("pricing_settings").upsert({ tenant_id:tid, key:s.key, value:s.value, label:s.label, description:s.description }, {onConflict:"tenant_id,key"});
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

  const config = Object.fromEntries(settings.map(s => [s.key,s.value]));
  const missingSettings = settingDefinitions.filter(s => s.key !== "infill_percent" && !savedSettingKeys.includes(s.key));
  const readyMaterials = materials.filter(m => m.active && m.technology === "FDM" && m.density_g_cm3 > 0 && m.price_per_gram > 0);
  const chosen = materials.find(m => (m.id || m.name) === previewMaterial);
  const estimate = chosen?.technology === "FDM" ? computeEstimate(previewVolume,{id:chosen.id || "preview",name:chosen.name,density:chosen.density_g_cm3,pricePerGram:chosen.price_per_gram,setupFee:chosen.setup_fee,minPrice:chosen.min_price},qualities[previewQuality].multiplier,config.infill_percent,previewQuantity,{marginPct:config.margin_percent,vatPct:config.vat_percent,laborPerHour:config.labor_per_hour,minOrder:config.min_order_price}) : null;
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

      <section className="bg-card border border-border rounded-lg p-6 space-y-3" aria-label="Anlık fiyat hazırlığı">
        <h2 className="font-display text-lg">Anlık fiyat hazırlığı</h2>
        <p className="text-sm">{readyMaterials.length} aktif FDM malzemesinin fiyat ve yoğunluk değerleri hazır.</p>
        {missingSettings.length > 0 && <p className="text-sm text-destructive">Henüz kaydedilmemiş genel ayarlar: {missingSettings.map(s => s.label).join(", ")}. Aşağıdaki değerleri kontrol edip Tümünü Kaydet’e basın.</p>}
        {!readyMaterials.length && <p className="text-sm text-destructive">En az bir aktif FDM malzemesinde yoğunluk ve gram fiyatı 0’dan büyük olmalı. Bu alanlar tamamlanmadan müşteriye anlık tutar gösterilmez.</p>}
        <p className="text-xs text-muted-foreground">Fiyatlandırma marka bazındadır. Kapalı yüzeyli model yüklendiğinde ilk uygun FDM malzemesiyle ön tahmin gösterilir; müşteri seçimini değiştirebilir. Açık yüzey, son işlem ve diğer teknolojiler teknik teklif olarak değerlendirilir. Formdaki değişiklikler kaydedilene kadar canlı siteye yansımaz.</p>
      </section>
      {/* Global Settings */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-display text-lg mb-1">Genel Ayarlar</h2>
        <p className="text-sm text-muted-foreground mb-4">Bu markanın fiyat motorunu buradan yönetin. Eksik ayarlar ilk kayıtta oluşturulur. Sıfır fiyatlı malzemeler teknik teklife yönlendirilir.</p>
        <details className="text-xs mb-4"><summary className="cursor-pointer">Hesaplama formülü</summary><p className="mt-2">Ağırlık = hacim × yoğunluk × (0,25 + doluluk × 0,75). Süre = hacim × (0,4 + doluluk × 0,6) ÷ 10 × kalite. Birim maliyet = (ağırlık × gram fiyatı + süre × saatlik işçilik) × kalite. Toplam = (birim maliyet × adet × adet katsayısı + kurulum) × (1 + marj) × (1 + KDV). 5–9 adet katsayısı 0,92; 10+ adet 0,85. Malzeme ve sipariş minimumlarının en yükseği uygulanır. Yüzdeler hesapta 100’e bölünür.</p></details>
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

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-display text-lg">Hızlı fiyatlandırma · canlı önizleme</h2>
        <p className="text-sm text-muted-foreground">Kaydetmeden önce mevcut form değerleriyle hesaplayın. Müşteriye yansıması için Tümünü Kaydet’e basın. <Link className="underline" to="/admin/campaigns">Kampanyaları yönet</Link></p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="text-sm">Malzeme<select className="w-full border rounded p-2 bg-background" value={previewMaterial} onChange={e=>setPreviewMaterial(e.target.value)}><option value="">FDM malzemesi seçin</option>{materials.filter(m=>m.technology === "FDM").map((m,i)=><option key={m.id || i} value={m.id || m.name}>{m.name || "İsimsiz"}</option>)}</select></label>
          <label className="text-sm">Hacim (cm³)<Input type="number" min="0.01" step="0.01" value={previewVolume} onChange={e=>setPreviewVolume(Number(e.target.value))}/></label>
          <label className="text-sm">Adet<Input type="number" min="1" max="1000" value={previewQuantity} onChange={e=>setPreviewQuantity(Number(e.target.value))}/></label>
          <label className="text-sm">Kalite<select className="w-full border rounded p-2 bg-background" value={previewQuality} onChange={e=>setPreviewQuality(Number(e.target.value))}>{qualities.map((q,i)=><option key={q.id} value={i}>{q.name}</option>)}</select></label>
        </div>
        <p role="status" className="text-xl font-semibold">{estimate ? `${fmtTRY(estimate.total)} · KDV dahil, kampanya öncesi` : "Hesaplama için malzeme, pozitif yoğunluk ve gram fiyatı girin."}</p>
      </section>
      {/* Materials */}
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Malzemeler</h2>
          <Button variant="outline" size="sm" onClick={addMat}>
            <Plus className="h-4 w-4 mr-2" /> Malzeme Ekle
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">Aktif malzemeler teklif formunda teknolojiye göre listelenir. Fiyat veya yoğunluk 0 ise malzeme yalnızca teknik teklif talebi olarak sunulur. Otomatik ön hesaplama yalnızca fiyatlandırması tamamlanmış FDM seçeneklerinde kullanılır. Aktif olması stok garantisi anlamına gelmez.</p>
        <div className="space-y-3">
          {materials.map((m, i) => (
            <div key={m.id ?? `new-${i}`} className="border border-border rounded-md p-4 bg-background">
              {m.active && m.technology === "FDM" && (m.density_g_cm3 <= 0 || m.price_per_gram <= 0) && <p className="text-xs text-destructive mb-3">Anlık fiyat eksik: {[m.density_g_cm3 <= 0 && "yoğunluk",m.price_per_gram <= 0 && "gram fiyatı"].filter(Boolean).join(" ve ")} girin.</p>}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2 md:col-span-2">
                  <Label className="text-xs">Ad</Label>
                  <Input maxLength={100} value={m.name} onChange={e => updateMat(i, { name: e.target.value })} />
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
