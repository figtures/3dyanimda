import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Tenant = {
  id: string; slug: string; name: string; domain: string | null; custom_domain: string | null;
  status: string; plan: string; active_theme_slug: string | null; created_at: string;
};

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

const StudioTenants = () => {
  const [list, setList] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", domain: "", plan: "starter" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    setList((data as Tenant[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { document.title = "Studio · İşletmeler"; load(); }, []);

  const create = async () => {
    if (!form.name || !form.slug) { toast.error("İsim ve slug zorunlu"); return; }
    setBusy(true);
    const { data, error } = await supabase.from("tenants").insert({
      name: form.name, slug: form.slug, domain: form.domain || null, plan: form.plan,
      active_theme_slug: "premium-studio",
    } as any).select().single();
    if (error) { toast.error(error.message); setBusy(false); return; }
    // assign premium theme by default
    await supabase.from("tenant_themes").insert({ tenant_id: data.id, theme_slug: "premium-studio" } as any);
    // enable default features
    const { data: feats } = await supabase.from("features").select("key, default_enabled");
    if (feats?.length) {
      await supabase.from("tenant_features").insert(
        feats.map(f => ({ tenant_id: data.id, feature_key: f.key, enabled: f.default_enabled })) as any
      );
    }
    toast.success("İşletme oluşturuldu");
    setOpen(false); setForm({ name: "", slug: "", domain: "", plan: "starter" });
    setBusy(false); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl mb-1">İşletmeler</h1>
          <p className="text-muted-foreground text-sm">Tüm müşterilerini ve onların durumunu burada gör.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Yeni İşletme</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni işletme</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>İşletme adı</Label>
                <Input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL kısa adı)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Domain (opsiyonel)</Label>
                <Input value={form.domain} placeholder="ornek.com"
                  onChange={(e) => setForm({ ...form, domain: e.target.value.trim() })} />
              </div>
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button onClick={create} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Oluştur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="grid gap-3">
          {list.map(t => (
            <Link key={t.id} to={`/studio/tenants/${t.id}`}>
              <Card className="p-4 hover:bg-muted/40 transition-colors flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-muted grid place-items-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    /{t.slug} · {t.custom_domain || t.domain || "domain yok"}
                  </div>
                </div>
                <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                <Badge variant="outline">{t.plan}</Badge>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
          {list.length === 0 && (
            <Card className="p-10 text-center text-muted-foreground text-sm">Henüz işletme yok.</Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StudioTenants;