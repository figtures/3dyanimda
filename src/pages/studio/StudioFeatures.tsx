import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const StudioFeatures = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    document.title = "Studio · Özellikler";
    (async () => {
      const { data } = await supabase.from("features").select("*").order("sort_order");
      setList(data ?? []); setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;
  const cats = ["module", "sub", "admin_page"] as const;
  const titles: Record<string, string> = { module: "Modüller", sub: "Alt Özellikler", admin_page: "Admin Sayfaları" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl mb-1">Özellik Kataloğu</h1>
        <p className="text-muted-foreground text-sm">Sistem genelinde tanımlı tüm feature flag'ler. İşletme detayından açılıp kapanır.</p>
      </div>
      {cats.map(c => (
        <div key={c}>
          <h2 className="font-display text-lg mb-2">{titles[c]}</h2>
          <Card className="divide-y">
            {list.filter(f => f.category === c).map(f => (
              <div key={f.key} className="flex items-center justify-between p-3 gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{f.key}{f.parent_key && ` · ↳ ${f.parent_key}`}</div>
                </div>
                <Badge variant={f.default_enabled ? "default" : "secondary"}>
                  {f.default_enabled ? "Varsayılan açık" : "Varsayılan kapalı"}
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
};

export default StudioFeatures;