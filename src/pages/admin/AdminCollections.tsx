import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Database } from "lucide-react";
import { getTenantId } from "@/lib/tenant";

type Row = { id: string; slug: string; name: string; description: string | null; updated_at: string };

const AdminCollections = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("collections")
      .select("id, slug, name, description, updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast({ title: "Yüklenemedi", description: error.message, variant: "destructive" });
    setRows((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const tid = getTenantId();
    if (!tid) return toast({ title: "Tenant bulunamadı", variant: "destructive" });
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    if (!s || !name.trim()) return toast({ title: "Slug ve isim zorunlu", variant: "destructive" });
    const { data, error } = await supabase
      .from("collections")
      .insert({ tenant_id: tid, slug: s, name: name.trim(), schema: { fields: [] } })
      .select()
      .single();
    if (error) return toast({ title: "Oluşturulamadı", description: error.message, variant: "destructive" });
    setCreating(false); setName(""); setSlug("");
    window.location.href = `/admin/collections/${(data as any).id}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu koleksiyon ve tüm kayıtları silinecek. Emin misiniz?")) return;
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) return toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    setRows((p) => p.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Koleksiyonlar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lokasyonlar, sektörler, ekip vb. tekrarlanabilir içerik tipleri. Şablon sayfalarla birlikte SEO sayfaları üretir.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4 mr-2" /> Yeni koleksiyon
        </Button>
      </div>

      {creating && (
        <Card className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">İsim</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lokasyonlar" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Slug (kod adı)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="lokasyonlar" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCreating(false)}>Vazgeç</Button>
            <Button onClick={handleCreate}>Oluştur</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          Henüz koleksiyon yok. Örnek: "Lokasyonlar" → şehir/ilçe sayfaları için.
        </Card>
      ) : (
        <Card className="divide-y">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-4">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{r.slug}</div>
              </div>
              <Link to={`/admin/collections/${r.id}`}>
                <Button size="sm" variant="outline"><Pencil className="h-3 w-3 mr-1" /> Yönet</Button>
              </Link>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default AdminCollections;