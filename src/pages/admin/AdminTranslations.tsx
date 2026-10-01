import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { reloadTranslations } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Loader2, Trash2, ChevronDown, AlertCircle, CheckCircle2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { key: string; namespace: string; tr: string; en: string; updated_at?: string };

const NAMESPACE_LABELS: Record<string, { label: string; description: string }> = {
  common: { label: "Genel", description: "Butonlar, etiketler, ortak metinler" },
  nav: { label: "Navigasyon", description: "Üst menü başlıkları" },
  footer: { label: "Alt Bilgi", description: "Footer bağlantı ve metinleri" },
  home: { label: "Ana Sayfa", description: "Hero, vaka şeridi, süreç, yetkinlikler" },
  services: { label: "Hizmetler", description: "Hizmet sayfaları başlık ve açıklamaları" },
  about: { label: "Hakkımızda", description: "Şirket hikayesi, ekip" },
  contact: { label: "İletişim", description: "İletişim formu metinleri" },
  blog: { label: "Blog", description: "Blog liste ve detay sayfaları" },
  portfolio: { label: "Portfolyo", description: "Portfolyo listesi" },
  faq: { label: "SSS", description: "Sıkça sorulan sorular sayfası" },
  quote: { label: "Teklif", description: "Teklif formu" },
};

const KEY_LABELS: Record<string, string> = {
  title: "Başlık",
  subtitle: "Alt başlık",
  description: "Açıklama",
  cta: "Buton",
  eyebrow: "Üst etiket",
  lead: "Tanıtım",
  label: "Etiket",
};

const humanizeKey = (key: string) => {
  const parts = key.split(".");
  const last = parts[parts.length - 1];
  return KEY_LABELS[last] || last.replace(/[._-]/g, " ");
};

const AdminTranslations = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState<Record<string, Partial<Row>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [openNs, setOpenNs] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("translations").select("*").order("namespace").order("key");
    setRows((data as Row[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filterRow = (r: Row) => {
    if (onlyMissing && r.en?.trim()) return false;
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return r.key.toLowerCase().includes(q) || r.tr?.toLowerCase().includes(q) || r.en?.toLowerCase().includes(q);
  };

  const grouped = useMemo(() => {
    const byNs = new Map<string, Row[]>();
    for (const r of rows) {
      const list = byNs.get(r.namespace) || [];
      list.push(r);
      byNs.set(r.namespace, list);
    }
    return Array.from(byNs.entries())
      .map(([namespace, all]) => {
        const items = all.filter(filterRow);
        const missingEn = all.filter((r) => !r.en?.trim()).length;
        return { namespace, items, total: all.length, missingEn };
      })
      .filter((g) => g.items.length > 0)
      .sort((a, b) => a.namespace.localeCompare(b.namespace));
  }, [rows, filter, onlyMissing]);

  const totalMissing = rows.filter((r) => !r.en?.trim()).length;

  const update = (key: string, field: "tr" | "en", value: string) => {
    setDirty((d) => ({ ...d, [key]: { ...d[key], [field]: value } }));
  };

  const saveAll = async () => {
    const entries = Object.entries(dirty);
    if (!entries.length) return;
    setSaving(true);
    try {
      const { getTenantId } = await import("@/lib/tenant");
      const tid = getTenantId();
      if (!tid) throw new Error("Tenant bulunamadı");
      const updates = entries.map(([key, vals]) => {
        const orig = rows.find((r) => r.key === key)!;
        return { tenant_id: tid, key, namespace: orig.namespace, tr: vals.tr ?? orig.tr, en: vals.en ?? orig.en };
      });
      const { error } = await supabase.from("translations").upsert(updates, { onConflict: "tenant_id,namespace,key" });
      if (error) throw error;
      toast({ title: `${updates.length} çeviri kaydedildi` });
      setDirty({});
      await load();
      await reloadTranslations();
    } catch (e: any) {
      toast({ title: "Kayıt başarısız", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const addNew = async () => {
    const key = prompt("Yeni anahtar (örn: home.hero.title)\n\nFormat: bölüm.alt-bölüm.alan");
    if (!key) return;
    const namespace = key.split(".")[0] || "common";
    const { getTenantId } = await import("@/lib/tenant");
    const tid = getTenantId();
    if (!tid) { toast({ title: "Tenant bulunamadı", variant: "destructive" }); return; }
    const { error } = await supabase.from("translations").insert({ tenant_id: tid, key, namespace, tr: "", en: "" });
    if (error) { toast({ title: "Eklenemedi", description: error.message, variant: "destructive" }); return; }
    await load();
  };

  const remove = async (key: string) => {
    if (!confirm(`"${key}" silinsin mi?`)) return;
    const { error } = await supabase.from("translations").delete().eq("key", key);
    if (error) { toast({ title: "Silinemedi", description: error.message, variant: "destructive" }); return; }
    await load();
    await reloadTranslations();
  };

  const toggleNs = (ns: string) => setOpenNs((p) => ({ ...p, [ns]: !p[ns] }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Languages className="h-5 w-5" /> Çeviriler
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Site metinlerini Türkçe ve İngilizce olarak düzenleyin. Sayfaya/bölüme göre gruplanmıştır.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addNew}><Plus className="h-4 w-4 mr-1" /> Yeni anahtar</Button>
          <Button onClick={saveAll} disabled={!Object.keys(dirty).length || saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Kaydet ({Object.keys(dirty).length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-[11px] uppercase text-muted-foreground">Toplam metin</div>
          <div className="text-2xl font-display font-semibold">{rows.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] uppercase text-muted-foreground">Bölüm</div>
          <div className="text-2xl font-display font-semibold">{new Set(rows.map(r => r.namespace)).size}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] uppercase text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-500" /> EN eksik
          </div>
          <div className="text-2xl font-display font-semibold">{totalMissing}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] uppercase text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Tamamlandı
          </div>
          <div className="text-2xl font-display font-semibold">{Math.round(((rows.length - totalMissing) / Math.max(rows.length, 1)) * 100)}%</div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Ara: anahtar, Türkçe veya İngilizce metin..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-md" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
          Sadece İngilizce çevirisi eksik olanlar
        </label>
        <Button size="sm" variant="ghost" onClick={() => setOpenNs(Object.fromEntries(grouped.map(g => [g.namespace, true])))}>Tümünü aç</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpenNs({})}>Tümünü kapat</Button>
      </div>

      {loading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {grouped.map((g) => {
            const meta = NAMESPACE_LABELS[g.namespace] || { label: g.namespace, description: "" };
                const isOpen = (openNs[g.namespace] ?? (!!filter || onlyMissing));
            return (
              <Card key={g.namespace} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleNs(g.namespace)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
                >
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen ? "" : "-rotate-90")} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold">{meta.label}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">{g.namespace}</Badge>
                    </div>
                    {meta.description && <div className="text-xs text-muted-foreground mt-0.5">{meta.description}</div>}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary">{g.items.length}{g.items.length !== g.total ? `/${g.total}` : ""} metin</Badge>
                    {g.missingEn > 0 && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20">
                        <AlertCircle className="h-3 w-3 mr-1" /> {g.missingEn} EN eksik
                      </Badge>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border divide-y divide-border">
                    {g.items.map((r) => {
                      const d = dirty[r.key] || {};
                      const trVal = d.tr ?? r.tr;
                      const enVal = d.en ?? r.en;
                      const isDirty = !!dirty[r.key];
                      return (
                        <div key={r.key} className={cn("p-4", isDirty && "bg-accent-blue/5")}>
                          <div className="flex items-start gap-3">
                            <div className="w-48 shrink-0">
                              <div className="text-sm font-medium capitalize">{humanizeKey(r.key)}</div>
                              <div className="font-mono text-[10px] text-muted-foreground mt-1 break-all">{r.key}</div>
                            </div>
                            <div className="flex-1 grid md:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] uppercase text-muted-foreground">Türkçe</label>
                                <Textarea rows={2} value={trVal} onChange={(e) => update(r.key, "tr", e.target.value)} />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                                  English {!enVal && <AlertCircle className="h-3 w-3 text-amber-500" />}
                                </label>
                                <Textarea rows={2} value={enVal} onChange={(e) => update(r.key, "en", e.target.value)} className={!enVal ? "border-amber-400/60" : ""} />
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => remove(r.key)} className="text-destructive shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
          {grouped.length === 0 && (
            <Card className="p-12 text-center text-sm text-muted-foreground">
              Bu filtrelerle eşleşen çeviri bulunamadı.
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTranslations;