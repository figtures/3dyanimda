import { getTenantId } from "@/lib/tenant";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Upload, Loader2, Trash2, Save } from "lucide-react";
import { resolveMediaItemUrl } from "@/lib/media";

type Media = {
  id: string;
  public_url: string;
  storage_path: string;
  filename: string;
  alt_tr: string;
  alt_en: string;
  category: string;
  tags: string[];
};

const CATEGORIES = ["general", "blog", "hero", "services", "portfolio", "testimonials", "industries", "og"];

const AdminMedia = () => {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [uploadCat, setUploadCat] = useState("general");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("media_library").select("*").order("created_at", { ascending: false });
    setItems(((data as any) ?? []).map((m: Media) => ({ ...m, public_url: resolveMediaItemUrl(m) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const { getTenantId } = await import("@/lib/tenant");
      const tid = getTenantId();
      if (!tid) throw new Error("Tenant bulunamadı");
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${getTenantId()}/${uploadCat}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
        await supabase.from("media_library").insert({
          tenant_id: tid,
          storage_path: path, public_url: pub.publicUrl, filename: file.name,
          mime_type: file.type, size_bytes: file.size, category: uploadCat,
        });
      }
      toast({ title: "Yüklendi" });
      await load();
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleSave = async (m: Media) => {
    const { error } = await supabase.from("media_library").update({
      alt_tr: m.alt_tr, alt_en: m.alt_en, category: m.category,
    }).eq("id", m.id);
    if (error) toast({ title: "Hata", description: error.message, variant: "destructive" });
    else toast({ title: "Kaydedildi" });
  };

  const handleDelete = async (m: Media) => {
    if (!confirm(`${m.filename} silinsin mi?`)) return;
    await supabase.storage.from("site-images").remove([m.storage_path]);
    await supabase.from("media_library").delete().eq("id", m.id);
    setItems((prev) => prev.filter((x) => x.id !== m.id));
  };

  const update = (id: string, patch: Partial<Media>) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const filtered = items.filter((m) =>
    (!filter || m.category === filter) &&
    (!search || m.filename.toLowerCase().includes(search.toLowerCase()) || m.alt_tr?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Görsel Kütüphanesi</h1>
          <p className="text-sm text-muted-foreground mt-1">Sitedeki tüm görseller. Buraya yükledikleriniz blog, hizmet, portfolyo gibi her yerden seçilebilir.</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={uploadCat} onChange={(e) => setUploadCat(e.target.value)} className="text-sm border border-border rounded-md px-2 py-1.5 bg-background">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); e.target.value = ""; }} />
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />} Yükle
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <Input placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button size="sm" variant={!filter ? "default" : "outline"} onClick={() => setFilter("")}>Tümü ({items.length})</Button>
        {CATEGORIES.map((c) => {
          const n = items.filter((i) => i.category === c).length;
          return <Button key={c} size="sm" variant={filter === c ? "default" : "outline"} onClick={() => setFilter(c)}>{c} ({n})</Button>;
        })}
      </div>

      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">Görsel bulunamadı.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <Card key={m.id} className="p-3 space-y-3">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img src={resolveMediaItemUrl(m)} alt={m.alt_tr || m.filename} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="text-xs text-muted-foreground truncate">{m.filename}</div>
              <div className="space-y-2">
                <Input placeholder="Alt metin (TR)" value={m.alt_tr || ""} onChange={(e) => update(m.id, { alt_tr: e.target.value })} className="h-8 text-xs" />
                <Input placeholder="Alt text (EN)" value={m.alt_en || ""} onChange={(e) => update(m.id, { alt_en: e.target.value })} className="h-8 text-xs" />
                <select value={m.category} onChange={(e) => update(m.id, { category: e.target.value })} className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSave(m)}><Save className="h-3 w-3 mr-1" /> Kaydet</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(m)}><Trash2 className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(m.public_url); toast({ title: "URL kopyalandı" }); }}>URL</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;