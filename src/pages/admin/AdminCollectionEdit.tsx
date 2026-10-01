import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Trash2, GripVertical, ArrowLeft, Pencil } from "lucide-react";
import { getTenantId } from "@/lib/tenant";

type FieldType = "text" | "textarea" | "richtext" | "image" | "url" | "number" | "boolean";
type Field = { key: string; label: string; type: FieldType; required?: boolean; help?: string };
type Schema = { fields: Field[] };

type Coll = { id: string; slug: string; name: string; description: string | null; schema: Schema };
type Item = { id: string; slug: string; title: string | null; status: string; sort_order: number; updated_at: string };

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Kısa metin" },
  { value: "textarea", label: "Çok satır metin" },
  { value: "richtext", label: "Zengin HTML" },
  { value: "image", label: "Görsel URL" },
  { value: "url", label: "Link / URL" },
  { value: "number", label: "Sayı" },
  { value: "boolean", label: "Evet / Hayır" },
];

const AdminCollectionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [coll, setColl] = useState<Coll | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: c } = await supabase.from("collections").select("*").eq("id", id).maybeSingle();
    const { data: it } = await supabase
      .from("collection_items")
      .select("id, slug, title, status, sort_order, updated_at")
      .eq("collection_id", id)
      .order("sort_order", { ascending: true });
    setColl(c ? { ...(c as any), schema: (c as any).schema || { fields: [] } } : null);
    setItems((it as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const save = async () => {
    if (!coll) return;
    setSaving(true);
    const { error } = await supabase
      .from("collections")
      .update({ name: coll.name, slug: coll.slug, description: coll.description, schema: coll.schema })
      .eq("id", coll.id);
    setSaving(false);
    if (error) return toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
  };

  const addField = () => {
    if (!coll) return;
    const k = `field_${coll.schema.fields.length + 1}`;
    setColl({ ...coll, schema: { fields: [...coll.schema.fields, { key: k, label: "Yeni alan", type: "text" }] } });
  };
  const updateField = (i: number, patch: Partial<Field>) => {
    if (!coll) return;
    const fs = [...coll.schema.fields];
    fs[i] = { ...fs[i], ...patch };
    setColl({ ...coll, schema: { fields: fs } });
  };
  const removeField = (i: number) => {
    if (!coll) return;
    setColl({ ...coll, schema: { fields: coll.schema.fields.filter((_, idx) => idx !== i) } });
  };

  const createItem = async () => {
    if (!coll) return;
    const tid = getTenantId();
    if (!tid) return;
    const slug = prompt("Yeni kayıt için slug (örn. istanbul-kadikoy):");
    if (!slug) return;
    const { data, error } = await supabase
      .from("collection_items")
      .insert({ collection_id: coll.id, tenant_id: tid, slug: slug.trim(), data: {}, status: "draft", sort_order: items.length })
      .select()
      .single();
    if (error) return toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    window.location.href = `/admin/collections/${coll.id}/items/${(data as any).id}`;
  };

  const deleteItem = async (iid: string) => {
    if (!confirm("Bu kayıt silinecek. Emin misiniz?")) return;
    const { error } = await supabase.from("collection_items").delete().eq("id", iid);
    if (error) return toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    setItems((p) => p.filter((x) => x.id !== iid));
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!coll) return <div className="text-sm text-muted-foreground">Koleksiyon bulunamadı.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/admin/collections" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Koleksiyonlar
        </Link>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Kaydet
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>İsim</Label>
            <Input value={coll.name} onChange={(e) => setColl({ ...coll, name: e.target.value })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={coll.slug} onChange={(e) => setColl({ ...coll, slug: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Açıklama</Label>
          <Textarea value={coll.description || ""} onChange={(e) => setColl({ ...coll, description: e.target.value })} rows={2} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Şema (alanlar)</h2>
            <p className="text-xs text-muted-foreground">Her kayıt bu alanları içerir. Şablonda <code className="text-[10px]">{`{{item.alan_kodu}}`}</code> ile kullanın.</p>
          </div>
          <Button size="sm" variant="outline" onClick={addField}><Plus className="h-3 w-3 mr-1" /> Alan ekle</Button>
        </div>
        <div className="space-y-2">
          {coll.schema.fields.map((f, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md">
              <div className="col-span-3">
                <Label className="text-[10px]">Anahtar</Label>
                <Input value={f.key} onChange={(e) => updateField(i, { key: e.target.value })} />
              </div>
              <div className="col-span-3">
                <Label className="text-[10px]">Etiket</Label>
                <Input value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} />
              </div>
              <div className="col-span-3">
                <Label className="text-[10px]">Tip</Label>
                <Select value={f.type} onValueChange={(v) => updateField(i, { type: v as FieldType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-[10px]">Yardım</Label>
                <Input value={f.help || ""} onChange={(e) => updateField(i, { help: e.target.value })} />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeField(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {coll.schema.fields.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">Henüz alan yok.</div>
          )}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Kayıtlar ({items.length})</h2>
            <p className="text-xs text-muted-foreground">Bu koleksiyona ait içerik kayıtları.</p>
          </div>
          <Button size="sm" onClick={createItem}><Plus className="h-3 w-3 mr-1" /> Kayıt ekle</Button>
        </div>
        <div className="divide-y">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{it.title || it.slug}</span>
                  <Badge variant={it.status === "published" ? "default" : "secondary"}>{it.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground font-mono">{it.slug}</div>
              </div>
              <Link to={`/admin/collections/${coll.id}/items/${it.id}`}>
                <Button size="sm" variant="outline"><Pencil className="h-3 w-3 mr-1" /> Düzenle</Button>
              </Link>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteItem(it.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Kayıt yok.</div>}
        </div>
      </Card>
    </div>
  );
};

export default AdminCollectionEdit;