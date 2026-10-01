import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft } from "lucide-react";

type Field = { key: string; label: string; type: string; help?: string };

const AdminCollectionItemEdit = () => {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const [schema, setSchema] = useState<Field[]>([]);
  const [collName, setCollName] = useState("");
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: c } = await supabase.from("collections").select("name, schema").eq("id", id!).maybeSingle();
      const { data: it } = await supabase.from("collection_items").select("*").eq("id", itemId!).maybeSingle();
      setSchema(((c as any)?.schema?.fields as Field[]) || []);
      setCollName((c as any)?.name || "");
      setItem(it);
      setLoading(false);
    })();
  }, [id, itemId]);

  const save = async () => {
    if (!item) return;
    setSaving(true);
    const { error } = await supabase
      .from("collection_items")
      .update({
        slug: item.slug,
        title: item.title,
        status: item.status,
        sort_order: item.sort_order,
        data: item.data || {},
        seo: item.seo || {},
      })
      .eq("id", item.id);
    setSaving(false);
    if (error) return toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
  };

  const setData = (key: string, value: any) => setItem({ ...item, data: { ...(item.data || {}), [key]: value } });
  const setSeo = (key: string, value: any) => setItem({ ...item, seo: { ...(item.seo || {}), [key]: value } });

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!item) return <div className="text-sm text-muted-foreground">Kayıt bulunamadı.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={`/admin/collections/${id}`} className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {collName}
        </Link>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Kaydet
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Slug</Label>
            <Input value={item.slug || ""} onChange={(e) => setItem({ ...item, slug: e.target.value })} />
          </div>
          <div>
            <Label>Başlık</Label>
            <Input value={item.title || ""} onChange={(e) => setItem({ ...item, title: e.target.value })} />
          </div>
          <div>
            <Label>Durum</Label>
            <Select value={item.status} onValueChange={(v) => setItem({ ...item, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="published">Yayında</SelectItem>
                <SelectItem value="archived">Arşiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-display text-lg font-semibold">İçerik alanları</h2>
        {schema.length === 0 && <div className="text-sm text-muted-foreground">Koleksiyon şemasında alan tanımlı değil.</div>}
        {schema.map((f) => {
          const v = item.data?.[f.key];
          return (
            <div key={f.key} className="space-y-1">
              <Label>{f.label} <span className="text-[10px] font-mono text-muted-foreground ml-1">{f.key}</span></Label>
              {f.type === "textarea" || f.type === "richtext" ? (
                <Textarea rows={f.type === "richtext" ? 8 : 3} value={v || ""} onChange={(e) => setData(f.key, e.target.value)} />
              ) : f.type === "boolean" ? (
                <div><Switch checked={!!v} onCheckedChange={(c) => setData(f.key, c)} /></div>
              ) : f.type === "number" ? (
                <Input type="number" value={v ?? ""} onChange={(e) => setData(f.key, e.target.value === "" ? null : Number(e.target.value))} />
              ) : (
                <Input value={v || ""} onChange={(e) => setData(f.key, e.target.value)} />
              )}
              {f.help && <p className="text-[10px] text-muted-foreground">{f.help}</p>}
            </div>
          );
        })}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-display text-lg font-semibold">SEO (bu kayıt için)</h2>
        <p className="text-xs text-muted-foreground">Şablon sayfanın meta verisini ezer. Boş bırakılan alanlarda şablon meta'sı kullanılır.</p>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>SEO başlık</Label>
            <Input value={item.seo?.title || ""} onChange={(e) => setSeo("title", e.target.value)} />
          </div>
          <div>
            <Label>OG görsel URL</Label>
            <Input value={item.seo?.og_image || ""} onChange={(e) => setSeo("og_image", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Meta açıklama</Label>
          <Textarea rows={2} value={item.seo?.description || ""} onChange={(e) => setSeo("description", e.target.value)} />
        </div>
      </Card>
    </div>
  );
};

export default AdminCollectionItemEdit;