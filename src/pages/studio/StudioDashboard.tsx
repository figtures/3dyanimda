import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Building2, Palette, ToggleLeft, Users } from "lucide-react";

const StudioDashboard = () => {
  const [stats, setStats] = useState({ tenants: 0, themes: 0, features: 0, users: 0 });
  useEffect(() => {
    document.title = "Studio · Genel";
    (async () => {
      const [t, th, f, u] = await Promise.all([
        supabase.from("tenants").select("id", { head: true, count: "exact" }),
        supabase.from("themes").select("slug", { head: true, count: "exact" }),
        supabase.from("features").select("key", { head: true, count: "exact" }),
        supabase.from("tenant_users").select("id", { head: true, count: "exact" }),
      ]);
      setStats({ tenants: t.count ?? 0, themes: th.count ?? 0, features: f.count ?? 0, users: u.count ?? 0 });
    })();
  }, []);

  const items = [
    { label: "İşletme", value: stats.tenants, icon: Building2 },
    { label: "Tema", value: stats.themes, icon: Palette },
    { label: "Özellik", value: stats.features, icon: ToggleLeft },
    { label: "Kullanıcı (toplam)", value: stats.users, icon: Users },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl mb-1">Studio</h1>
        <p className="text-muted-foreground text-sm">Ürün stüdyosu paneli — tüm işletmeleri buradan yönet.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((i) => (
          <Card key={i.label} className="p-5">
            <i.icon className="h-5 w-5 text-muted-foreground mb-3" />
            <div className="text-2xl font-display">{i.value}</div>
            <div className="text-xs text-muted-foreground">{i.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudioDashboard;