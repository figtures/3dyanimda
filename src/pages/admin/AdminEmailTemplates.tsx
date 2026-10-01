import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Tpl = {
  id: string;
  key: string;
  description: string;
  subject_tr: string;
  subject_en: string;
  body_tr: string;
  body_en: string;
  variables: string[];
  active: boolean;
};

const empty = (): Tpl => ({
  id: "", key: "", description: "",
  subject_tr: "", subject_en: "", body_tr: "", body_en: "",
  variables: [], active: true,
});

const AdminEmailTemplates = () => {
  const [items, setItems] = useState<Tpl[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tpl | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("email_templates").select("*").order("key");
    if (error) toast.error(error.message);
    setItems((data ?? []) as Tpl[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.key.trim()) return toast.error("Anahtar gerekli");
    const variables = Array.from(new Set(
      [...(editing.body_tr + " " + editing.body_en + " " + editing.subject_tr + " " + editing.subject_en).matchAll(/\{\{\s*(\w+)\s*\}\}/g)]
        .map((m) => m[1])
    ));
    const payload = { ...editing, variables };
    if (editing.id) {
      const { error } = await supabase.from("email_templates").update({
        key: payload.key, description: payload.description,
        subject_tr: payload.subject_tr, subject_en: payload.subject_en,
        body_tr: payload.body_tr, body_en: payload.body_en,
        variables, active: payload.active,
      }).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { getTenantId } = await import("@/lib/tenant");
      const tid = getTenantId();
      if (!tid) return toast.error("Tenant bulunamadı");
      const { error } = await supabase.from("email_templates").insert({
        tenant_id: tid,
        key: payload.key, description: payload.description,
        subject_tr: payload.subject_tr, subject_en: payload.subject_en,
        body_tr: payload.body_tr, body_en: payload.body_en,
        variables, active: payload.active,
      });
      if (error) return toast.error(error.message);
    }
    toast.success("Kaydedildi");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Şablon silinsin mi?")) return;
    const { error } = await supabase.from("email_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
  };

  const sendTest = async (tpl: Tpl) => {
    const to = window.prompt("Test e-postası adresi:", "");
    if (!to) return;
    const { getTenantId } = await import("@/lib/tenant");
    const tid = getTenantId();
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        to,
        templateKey: tpl.key,
        tenantId: tid,
        locale: "tr",
        variables: { email: to, name: "Test", source: "admin-test" },
      },
    });
    if (error) return toast.error(error.message);
    if ((data as any)?.error) return toast.error((data as any).error);
    toast.success("Test e-postası gönderildi");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl">E-posta Şablonları</h1>
        <Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4 mr-1" /> Yeni</Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <div key={t.id} className="border border-border bg-card rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-xs text-accent-blue">{t.key}</div>
                <div className="text-sm truncate">{t.description || t.subject_tr}</div>
                {t.variables?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {t.variables.map((v) => <span key={v} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{`{{${v}}}`}</span>)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-1 rounded ${t.active ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {t.active ? "Aktif" : "Pasif"}
                </span>
                <Button size="sm" variant="outline" onClick={() => setEditing(t)}>Düzenle</Button>
                <Button size="sm" variant="ghost" onClick={() => sendTest(t)} title="Test gönder">
                  <Send className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(t.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-12 text-muted-foreground">Şablon yok.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-auto" onClick={() => setEditing(null)}>
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-4 my-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl">{editing.id ? "Şablonu Düzenle" : "Yeni Şablon"}</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Anahtar (key)</Label>
                <Input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} placeholder="ör. quote_received" />
              </div>
              <div className="flex items-end gap-2">
                <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                <span className="text-sm">{editing.active ? "Aktif" : "Pasif"}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs">Açıklama</Label>
              <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>

            <Tabs defaultValue="tr">
              <TabsList>
                <TabsTrigger value="tr">Türkçe</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="tr" className="space-y-3">
                <div>
                  <Label className="text-xs">Konu (TR)</Label>
                  <Input value={editing.subject_tr} onChange={(e) => setEditing({ ...editing, subject_tr: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Gövde (TR)</Label>
                  <Textarea rows={10} value={editing.body_tr} onChange={(e) => setEditing({ ...editing, body_tr: e.target.value })} />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-3">
                <div>
                  <Label className="text-xs">Subject (EN)</Label>
                  <Input value={editing.subject_en} onChange={(e) => setEditing({ ...editing, subject_en: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Body (EN)</Label>
                  <Textarea rows={10} value={editing.body_en} onChange={(e) => setEditing({ ...editing, body_en: e.target.value })} />
                </div>
              </TabsContent>
            </Tabs>

            <p className="text-[11px] text-muted-foreground">
              Yer tutucular: <code className="font-mono bg-muted px-1 rounded">{`{{name}}`}</code>, <code className="font-mono bg-muted px-1 rounded">{`{{email}}`}</code>, vb. otomatik algılanır.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>İptal</Button>
              <Button onClick={save}><Save className="h-4 w-4 mr-1" /> Kaydet</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplates;