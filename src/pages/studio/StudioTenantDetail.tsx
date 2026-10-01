import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Save, Trash2, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { ThemeMixer } from "@/components/admin/ThemeMixer";

type Tenant = any;
type Feature = { key: string; label: string; category: string; parent_key: string | null; sort_order: number };
type Theme = { slug: string; name: string; description: string };

const StudioTenantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [themes, setThemes] = useState<Theme[]>([]);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: t }, { data: f }, { data: tf }, { data: th }, { data: tt }, { data: tu }] = await Promise.all([
      supabase.from("tenants").select("*").eq("id", id).maybeSingle(),
      supabase.from("features").select("key,label,category,parent_key,sort_order").order("sort_order"),
      supabase.from("tenant_features").select("feature_key,enabled").eq("tenant_id", id),
      supabase.from("themes").select("slug,name,description").order("name"),
      supabase.from("tenant_themes").select("theme_slug").eq("tenant_id", id),
      supabase.from("tenant_users").select("user_id,role_slug,status,invited_email").eq("tenant_id", id),
    ]);
    setTenant(t);
    setFeatures(f ?? []);
    const map: Record<string, boolean> = {};
    (f ?? []).forEach(x => { map[x.key] = false; });
    (tf ?? []).forEach((x: any) => { map[x.feature_key] = x.enabled; });
    setEnabled(map);
    setThemes(th ?? []);
    setAssigned(new Set((tt ?? []).map((x: any) => x.theme_slug)));
    setUsers(tu ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const toggleFeature = async (key: string, value: boolean) => {
    setEnabled(s => ({ ...s, [key]: value }));
    const { error } = await supabase.from("tenant_features")
      .upsert({ tenant_id: id, feature_key: key, enabled: value } as any, { onConflict: "tenant_id,feature_key" });
    if (error) { toast.error(error.message); load(); }
  };

  const toggleTheme = async (slug: string, value: boolean) => {
    if (value) {
      const { error } = await supabase.from("tenant_themes").insert({ tenant_id: id, theme_slug: slug } as any);
      if (error) return toast.error(error.message);
      setAssigned(s => new Set(s).add(slug));
    } else {
      const { error } = await supabase.from("tenant_themes").delete()
        .eq("tenant_id", id!).eq("theme_slug", slug);
      if (error) return toast.error(error.message);
      const s = new Set(assigned); s.delete(slug); setAssigned(s);
    }
  };

  const setActiveTheme = async (slug: string) => {
    if (!assigned.has(slug)) { toast.error("Önce temayı atayın"); return; }
    const { error } = await supabase.from("tenants").update({ active_theme_slug: slug } as any).eq("id", id!);
    if (error) return toast.error(error.message);
    setTenant({ ...tenant, active_theme_slug: slug });
    toast.success("Aktif tema güncellendi");
  };

  const saveBasics = async () => {
    const { error } = await supabase.from("tenants").update({
      name: tenant.name, slug: tenant.slug, domain: tenant.domain || null,
      custom_domain: tenant.custom_domain || null, status: tenant.status, plan: tenant.plan,
    } as any).eq("id", id!);
    if (error) return toast.error(error.message);
    toast.success("Kaydedildi");
  };

  const deleteTenant = async () => {
    if (!confirm("Bu işletme ve tüm verisi silinecek. Emin misin?")) return;
    const { error } = await supabase.from("tenants").delete().eq("id", id!);
    if (error) return toast.error(error.message);
    toast.success("Silindi");
    window.location.href = "/studio/tenants";
  };

  const ejectTenant = async () => {
    if (!id) return;
    toast.info("Veriler hazırlanıyor...");
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/eject-tenant?tenant_id=${id}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tenant-${tenant?.slug ?? id}.json`;
      a.click();
      toast.success("Veri export edildi");
    } catch (e: any) {
      toast.error(`Eject hatası: ${e.message}`);
    }
  };

  const grouped = useMemo(() => {
    const modules = features.filter(f => f.category === "module");
    const subs = features.filter(f => f.category === "sub");
    const adminPages = features.filter(f => f.category === "admin_page");
    return { modules, subs, adminPages };
  }, [features]);

  if (loading || !tenant) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/studio/tenants"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="font-display text-2xl">{tenant.name}</h1>
            <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={import.meta.env.DEV ? `/?tenant=${tenant.slug}` : `https://${tenant.custom_domain || tenant.domain || ""}/`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-2" /> Önizle</Button>
          </a>
          <Button variant="outline" size="sm" onClick={ejectTenant}>
            <Download className="h-4 w-4 mr-2" /> Eject (veri)
          </Button>
          <Button variant="destructive" size="sm" onClick={deleteTenant}><Trash2 className="h-4 w-4 mr-2" /> Sil</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="themes">Temalar</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Ad</Label>
                <Input value={tenant.name} onChange={(e) => setTenant({ ...tenant, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Slug</Label>
                <Input value={tenant.slug} onChange={(e) => setTenant({ ...tenant, slug: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Domain</Label>
                <Input value={tenant.domain ?? ""} placeholder="x.studio.app"
                  onChange={(e) => setTenant({ ...tenant, domain: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Custom domain</Label>
                <Input value={tenant.custom_domain ?? ""} placeholder="ornek.com"
                  onChange={(e) => setTenant({ ...tenant, custom_domain: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Durum</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={tenant.status} onChange={(e) => setTenant({ ...tenant, status: e.target.value })}>
                  <option value="active">Aktif</option>
                  <option value="paused">Duraklatıldı</option>
                  <option value="archived">Arşiv</option>
                </select>
              </div>
              <div className="space-y-1.5"><Label>Plan</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={tenant.plan} onChange={(e) => setTenant({ ...tenant, plan: e.target.value })}>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end"><Button onClick={saveBasics}><Save className="h-4 w-4 mr-2" /> Kaydet</Button></div>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="space-y-3">
          <div className="space-y-2">
            <h3 className="font-display text-lg">Tema motoru — Palet × Tipografi × Layout</h3>
            <p className="text-sm text-muted-foreground">
              5 renk paleti, 5 tipografi ve 5 layout presetinden istediğin kombinasyonu seç. Seçim anında bu kiracının sitesine uygulanır.
            </p>
          </div>
          <ThemeMixer tenantId={id!} canEdit onSaved={load} />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {(["modules", "subs", "adminPages"] as const).map(group => {
            const list = (grouped as any)[group] as Feature[];
            const title = group === "modules" ? "Site Modülleri" : group === "subs" ? "Alt Özellikler" : "Admin Sayfaları";
            return (
              <div key={group}>
                <h3 className="font-display text-lg mb-2">{title}</h3>
                <Card className="p-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {list.map(f => (
                      <label key={f.key} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/40 cursor-pointer">
                        <div className="min-w-0">
                          <div className="text-sm">{f.label}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{f.key}</div>
                        </div>
                        <Switch checked={!!enabled[f.key]} onCheckedChange={(v) => toggleFeature(f.key, v)} />
                      </label>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          <Card className="p-4">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bu işletmede henüz kullanıcı yok. Owner davet etmek için /admin/team kısmını kullan.</p>
            ) : (
              <div className="space-y-2">
                {users.map((u: any) => (
                  <div key={u.user_id} className="flex items-center gap-3 p-2 border-b last:border-0">
                    <div className="flex-1 text-sm font-mono">{u.user_id}</div>
                    <Badge variant="outline">{u.role_slug}</Badge>
                    <Badge variant={u.status === "active" ? "default" : "secondary"}>{u.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudioTenantDetail;