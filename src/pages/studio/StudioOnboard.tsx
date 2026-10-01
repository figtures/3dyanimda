import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, Check, Sparkles, Rocket } from "lucide-react";
import { toast } from "sonner";

type Theme = { slug: string; name: string; description: string | null };
type Feature = { key: string; label: string; category: string; default_enabled: boolean; sort_order: number };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

const STEPS = ["İşletme", "Tema", "Modüller", "Sahip & Domain"] as const;

const StudioOnboard = () => {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [info, setInfo] = useState({ name: "", slug: "", plan: "starter" });
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("premium-studio");
  const [extraThemes, setExtraThemes] = useState<Set<string>>(new Set());
  const [features, setFeatures] = useState<Feature[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [owner, setOwner] = useState({ email: "", domain: "", custom_domain: "" });

  useEffect(() => {
    document.title = "Studio · Yeni İşletme Sihirbazı";
    (async () => {
      const [{ data: th }, { data: f }] = await Promise.all([
        supabase.from("themes").select("slug,name,description").order("name"),
        supabase.from("features").select("key,label,category,default_enabled,sort_order").order("sort_order"),
      ]);
      setThemes(th ?? []);
      setFeatures(f ?? []);
      const map: Record<string, boolean> = {};
      (f ?? []).forEach((x: any) => { map[x.key] = x.default_enabled; });
      setFlags(map);
    })();
  }, []);

  const moduleFlags = useMemo(() => features.filter(f => f.category === "module"), [features]);

  const canNext = () => {
    if (step === 0) return !!info.name && !!info.slug;
    if (step === 3) return !!owner.email;
    return true;
  };

  const finish = async () => {
    setBusy(true);
    try {
      // 1) Create tenant
      const { data: t, error } = await supabase.from("tenants").insert({
        name: info.name,
        slug: info.slug,
        plan: info.plan,
        active_theme_slug: activeTheme,
        domain: owner.domain || null,
        custom_domain: owner.custom_domain || null,
        status: "active",
      } as any).select().single();
      if (error || !t) throw new Error(error?.message || "tenant create failed");

      // 2) Assign themes (active + extras)
      const themeSlugs = Array.from(new Set([activeTheme, ...extraThemes]));
      await supabase.from("tenant_themes").insert(
        themeSlugs.map(s => ({ tenant_id: t.id, theme_slug: s })) as any
      );

      // 3) Feature flags
      await supabase.from("tenant_features").insert(
        Object.entries(flags).map(([k, v]) => ({ tenant_id: t.id, feature_key: k, enabled: v })) as any
      );

      // 4) Owner invite via edge function
      const inv = await supabase.functions.invoke("invite-tenant-user", {
        body: { tenant_id: t.id, email: owner.email, role_slug: "owner" },
      });
      if (inv.error) {
        toast.error(`Tenant oluştu ama davet hatası: ${inv.error.message}`);
      } else {
        toast.success("İşletme hazır 🚀");
      }
      nav(`/studio/tenants/${t.id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl flex items-center gap-2">
          <Rocket className="h-6 w-6" /> Yeni İşletme Sihirbazı
        </h1>
        <p className="text-sm text-muted-foreground">4 adımda yeni müşterinizi yayına alın.</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-semibold border ${
              i < step ? "bg-foreground text-background border-foreground" :
              i === step ? "bg-accent-blue text-white border-accent-blue" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card className="p-6 min-h-[300px]">
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>İşletme adı *</Label>
              <Input value={info.name}
                onChange={(e) => setInfo({ ...info, name: e.target.value, slug: info.slug || slugify(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL kısa adı) *</Label>
              <Input value={info.slug} onChange={(e) => setInfo({ ...info, slug: slugify(e.target.value) })} />
              <p className="text-xs text-muted-foreground">Önizleme: <code>/?tenant={info.slug || "ornek"}</code></p>
            </div>
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={info.plan} onChange={(e) => setInfo({ ...info, plan: e.target.value })}>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Aktif tema seç (ek temaları da atayabilirsin):</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {themes.map(th => {
                const isActive = activeTheme === th.slug;
                const isExtra = extraThemes.has(th.slug);
                return (
                  <Card key={th.slug} className={`p-4 cursor-pointer border-2 ${isActive ? "border-accent-blue" : "border-transparent"}`}
                    onClick={() => setActiveTheme(th.slug)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium">{th.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{th.description}</div>
                      </div>
                      {isActive && <Badge>Aktif</Badge>}
                    </div>
                    {!isActive && (
                      <label className="flex items-center gap-2 mt-3 text-xs" onClick={(e) => e.stopPropagation()}>
                        <Switch checked={isExtra}
                          onCheckedChange={(v) => {
                            const s = new Set(extraThemes);
                            v ? s.add(th.slug) : s.delete(th.slug);
                            setExtraThemes(s);
                          }} />
                        <span>Ek tema olarak ata</span>
                      </label>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Bu işletme için açılacak modüller:</p>
            <div className="grid sm:grid-cols-2 gap-1">
              {moduleFlags.map(f => (
                <label key={f.key} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/40">
                  <div>
                    <div className="text-sm">{f.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{f.key}</div>
                  </div>
                  <Switch checked={!!flags[f.key]} onCheckedChange={(v) => setFlags({ ...flags, [f.key]: v })} />
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Alt-özellikler ve admin sayfa görünürlükleri sonradan İşletme Detayı'ndan ince ayarlanabilir.</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Sahip e-postası * (davet edilecek)</Label>
              <Input type="email" value={owner.email}
                onChange={(e) => setOwner({ ...owner, email: e.target.value })} placeholder="owner@firma.com" />
              <p className="text-xs text-muted-foreground">Owner rolüyle eklenir, tüm tenant izinlerine sahip olur.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Subdomain (opsiyonel)</Label>
              <Input value={owner.domain} placeholder="firma.studio.app"
                onChange={(e) => setOwner({ ...owner, domain: e.target.value.trim() })} />
            </div>
            <div className="space-y-1.5">
              <Label>Custom domain (opsiyonel)</Label>
              <Input value={owner.custom_domain} placeholder="firma.com"
                onChange={(e) => setOwner({ ...owner, custom_domain: e.target.value.trim() })} />
              <p className="text-xs text-muted-foreground">DNS yönlendirmesi sonradan kurulabilir.</p>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={step === 0 || busy} onClick={() => setStep(s => s - 1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Geri
        </Button>
        {step < STEPS.length - 1 ? (
          <Button disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
            İleri <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button disabled={!canNext() || busy} onClick={finish}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Oluştur ve Yayına Al
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudioOnboard;