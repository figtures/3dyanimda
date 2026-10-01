import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, ExternalLink, Trash2, Pencil } from "lucide-react";
import { getTenantId } from "@/lib/tenant";

type PageRow = {
  id: string;
  slug: string;
  template: string;
  status: "draft" | "published" | "archived";
  title: string | null;
  updated_at: string;
};

const AdminPages = () => {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("/");
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("id, slug, template, status, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast({ title: "Yüklenemedi", description: error.message, variant: "destructive" });
    setRows((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(
    (r) => !q || r.slug.toLowerCase().includes(q.toLowerCase()) || (r.title || "").toLowerCase().includes(q.toLowerCase())
  );

  const handleCreate = async () => {
    const tid = getTenantId();
    if (!tid) return toast({ title: "Tenant bulunamadı", variant: "destructive" });
    const slug = newSlug.trim().startsWith("/") ? newSlug.trim() : "/" + newSlug.trim();
    if (!slug || slug === "/") return toast({ title: "Geçerli bir slug girin (örn. /yeni-sayfa)", variant: "destructive" });
    const { data, error } = await supabase
      .from("pages")
      .insert({ tenant_id: tid, slug, title: newTitle || slug, template: "generic", status: "draft", meta: {} })
      .select()
      .single();
    if (error) return toast({ title: "Oluşturulamadı", description: error.message, variant: "destructive" });
    toast({ title: "Sayfa oluşturuldu" });
    setCreating(false);
    setNewSlug("/");
    setNewTitle("");
    window.location.href = `/admin/pages/${(data as any).id}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu sayfa ve tüm içerik blokları silinecek. Emin misiniz?")) return;
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) return toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    setRows((p) => p.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Sayfalar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sitedeki tüm dinamik sayfalar. Hero, içerik, SSS ve CTA bloklarını düzenleyin.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4 mr-2" /> Yeni sayfa
        </Button>
      </div>

      {creating && (
        <Card className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">URL (slug)</label>
              <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="/yeni-sayfa" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Başlık</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Sayfa başlığı" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCreating(false)}>Vazgeç</Button>
            <Button onClick={handleCreate}>Oluştur</Button>
          </div>
        </Card>
      )}

      <Input placeholder="Ara: slug veya başlık…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />

      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">Sayfa bulunamadı.</Card>
      ) : (
        <Card className="divide-y">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{r.title || r.slug}</span>
                  <Badge variant={r.status === "published" ? "default" : "secondary"}>{r.status}</Badge>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{r.template}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">{r.slug}</div>
              </div>
              <a href={r.slug} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" title="Aç">
                <ExternalLink className="h-4 w-4" />
              </a>
              <Link to={`/admin/pages/${r.id}`}>
                <Button size="sm" variant="outline"><Pencil className="h-3 w-3 mr-1" /> Düzenle</Button>
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

export default AdminPages;