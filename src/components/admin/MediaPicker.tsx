import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { resolveMediaItemUrl } from "@/lib/media";
import { getTenantId } from "@/lib/tenant";

export type MediaItem = {
  id: string;
  public_url: string;
  storage_path: string;
  filename: string;
  alt_tr?: string | null;
  alt_en?: string | null;
  category?: string | null;
  width?: number | null;
  height?: number | null;
};

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (item: MediaItem) => void;
  category?: string;
}

export const MediaPicker = ({ open, onOpenChange, onSelect, category }: MediaPickerProps) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("media_library").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) toast({ title: "Yüklenemedi", description: error.message, variant: "destructive" });
    else setItems(((data as MediaItem[] | null) ?? [])
      .sort((a, b) => Number(b.category === category) - Number(a.category === category))
      .map((m) => ({ ...m, public_url: resolveMediaItemUrl(m) })));
    setLoading(false);
  };

  useEffect(() => { if (open) load(); /* eslint-disable-next-line */ }, [open, category]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${getTenantId()}/${category || "general"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      const { error: insErr } = await supabase.from("media_library").insert({
        tenant_id: getTenantId()!,
        storage_path: path,
        public_url: pub.publicUrl,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        category: category || "general",
      });
      if (insErr) throw insErr;
      toast({ title: "Yüklendi" });
      await load();
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleDelete = async (m: MediaItem) => {
    if (!confirm("Görseli silmek istiyor musun?")) return;
    await supabase.storage.from("site-images").remove([m.storage_path]);
    await supabase.from("media_library").delete().eq("id", m.id);
    await load();
  };

  const filtered = items.filter((m) => !search || m.filename.toLowerCase().includes(search.toLowerCase()) || m.alt_tr?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader><DialogTitle>Görsel Seç</DialogTitle></DialogHeader>
        <div className="flex gap-2 items-center">
          <Input placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />} Yükle
          </Button>
        </div>
        <div className="overflow-auto flex-1 -mx-6 px-6">
          {loading ? (
            <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8" /> Henüz görsel yok. Yüklemek için butona tıkla.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
              {filtered.map((m) => (
                <div key={m.id} className="group relative border border-border rounded-lg overflow-hidden bg-muted/40">
                  <button type="button" onClick={() => { onSelect(m); onOpenChange(false); }} className="block w-full aspect-square">
                    <img src={resolveMediaItemUrl(m)} alt={m.alt_tr || m.filename} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">{m.filename}</div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(m); }} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};