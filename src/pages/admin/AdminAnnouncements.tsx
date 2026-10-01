import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

type A = {
  id: string;
  message_tr: string;
  message_en: string | null;
  link_url: string | null;
  link_label_tr: string | null;
  link_label_en: string | null;
  variant: string;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  sort_order: number;
};

const empty: Omit<A, "id"> = {
  message_tr: "",
  message_en: "",
  link_url: "",
  link_label_tr: "",
  link_label_en: "",
  variant: "info",
  starts_at: null,
  ends_at: null,
  active: true,
  sort_order: 0,
};

const AdminAnnouncements = () => {
  const [items, setItems] = useState<A[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Omit<A, "id"> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements").select("*").order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as A[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (a: A | (Omit<A, "id"> & { id?: string })) => {
    if ("id" in a && a.id) {
      const { id, ...rest } = a as A;
      const { error } = await supabase.from("announcements").update(rest).eq("id", id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("announcements").insert(a as any);
      if (error) return toast.error(error.message);
    }
    toast.success("Kaydedildi");
    setDraft(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Silmek istediğinizden emin misiniz?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Duyuru Çubuğu</h1>
          <p className="text-sm text-muted-foreground">Site üstünde gösterilen kampanya/duyuru bandı.</p>
        </div>
        <Button onClick={() => setDraft(empty)}><Plus className="h-4 w-4 mr-2" />Yeni Duyuru</Button>
      </div>

      {draft && <Editor value={draft} onChange={setDraft as any} onSave={() => save(draft as any)} onCancel={() => setDraft(null)} />}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">Henüz duyuru yok.</div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id} a={a} onSave={save} onDelete={() => remove(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

const Card = ({ a, onSave, onDelete }: { a: A; onSave: (a: A) => void; onDelete: () => void }) => {
  const [edit, setEdit] = useState<A>(a);
  return (
    <details className="border border-border rounded-lg bg-card p-4">
      <summary className="cursor-pointer flex items-center justify-between gap-3">
        <div className="flex-1 truncate">
          <span className={`text-[10px] uppercase mr-2 px-2 py-0.5 rounded ${a.active ? "bg-green-500/15 text-green-700" : "bg-muted text-muted-foreground"}`}>{a.active ? "Aktif" : "Pasif"}</span>
          <span className="font-medium">{a.message_tr}</span>
        </div>
        <span className="text-xs text-muted-foreground">#{a.sort_order}</span>
      </summary>
      <div className="mt-4 space-y-3">
        <EditorFields value={edit} onChange={setEdit} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1" />Sil</Button>
          <Button size="sm" onClick={() => onSave(edit)}><Save className="h-4 w-4 mr-1" />Kaydet</Button>
        </div>
      </div>
    </details>
  );
};

const Editor = ({ value, onChange, onSave, onCancel }: { value: any; onChange: (v: any) => void; onSave: () => void; onCancel: () => void }) => (
  <div className="border-2 border-accent-blue/30 rounded-lg bg-card p-4 space-y-3">
    <h3 className="font-medium">Yeni Duyuru</h3>
    <EditorFields value={value} onChange={onChange} />
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onCancel}>İptal</Button>
      <Button size="sm" onClick={onSave}><Save className="h-4 w-4 mr-1" />Kaydet</Button>
    </div>
  </div>
);

const EditorFields = ({ value, onChange }: { value: any; onChange: (v: any) => void }) => {
  const u = (k: string, v: any) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label>Mesaj (TR)</Label>
        <Textarea value={value.message_tr ?? ""} onChange={(e) => u("message_tr", e.target.value)} rows={2} />
      </div>
      <div className="md:col-span-2">
        <Label>Mesaj (EN)</Label>
        <Textarea value={value.message_en ?? ""} onChange={(e) => u("message_en", e.target.value)} rows={2} />
      </div>
      <div>
        <Label>Link URL</Label>
        <Input value={value.link_url ?? ""} onChange={(e) => u("link_url", e.target.value)} placeholder="/teklif-al" />
      </div>
      <div>
        <Label>Buton Etiketi (TR)</Label>
        <Input value={value.link_label_tr ?? ""} onChange={(e) => u("link_label_tr", e.target.value)} />
      </div>
      <div>
        <Label>Buton Etiketi (EN)</Label>
        <Input value={value.link_label_en ?? ""} onChange={(e) => u("link_label_en", e.target.value)} />
      </div>
      <div>
        <Label>Stil</Label>
        <Select value={value.variant} onValueChange={(v) => u("variant", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Bilgi (Mavi)</SelectItem>
            <SelectItem value="warn">Uyarı (Sarı)</SelectItem>
            <SelectItem value="promo">Promosyon (Altın)</SelectItem>
            <SelectItem value="danger">Acil (Kırmızı)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Başlangıç</Label>
        <Input type="datetime-local" value={value.starts_at ? new Date(value.starts_at).toISOString().slice(0,16) : ""} onChange={(e) => u("starts_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
      </div>
      <div>
        <Label>Bitiş</Label>
        <Input type="datetime-local" value={value.ends_at ? new Date(value.ends_at).toISOString().slice(0,16) : ""} onChange={(e) => u("ends_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
      </div>
      <div>
        <Label>Sıra</Label>
        <Input type="number" value={value.sort_order ?? 0} onChange={(e) => u("sort_order", Number(e.target.value))} />
      </div>
      <div className="flex items-center gap-2 pt-6">
        <Switch checked={value.active} onCheckedChange={(v) => u("active", v)} />
        <Label>Aktif</Label>
      </div>
    </div>
  );
};

export default AdminAnnouncements;