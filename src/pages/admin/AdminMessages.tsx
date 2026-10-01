import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Msg = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
};

const STATUSES = [
  { v: "new", l: "Yeni", c: "bg-accent-blue/15 text-accent-blue" },
  { v: "in_progress", l: "İşlemde", c: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  { v: "replied", l: "Yanıtlandı", c: "bg-green-500/15 text-green-700 dark:text-green-400" },
  { v: "spam", l: "Spam", c: "bg-destructive/15 text-destructive" },
];

const AdminMessages = () => {
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setItems((data ?? []) as Msg[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateField = async (id: string, patch: Partial<Msg>) => {
    const { error } = await supabase.from("contact_messages").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("Bu mesaj silinsin mi?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
    toast.success("Silindi");
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl">İletişim Mesajları</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü ({items.length})</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.v} value={s.v}>{s.l} ({items.filter((i) => i.status === s.v).length})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Mesaj yok.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const st = STATUSES.find((s) => s.v === m.status) ?? STATUSES[0];
            return (
              <details key={m.id} className="border border-border rounded-lg bg-card">
                <summary className="cursor-pointer p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.full_name} <span className="text-muted-foreground text-xs">— {m.email}</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {new Date(m.created_at).toLocaleString("tr-TR")}{m.subject ? ` · ${m.subject}` : ""}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded shrink-0 ${st.c}`}>{st.l}</span>
                </summary>
                <div className="p-4 pt-0 text-sm space-y-3 border-t border-border">
                  {m.phone && <div className="text-xs"><b>Telefon:</b> {m.phone}</div>}
                  <pre className="whitespace-pre-wrap font-sans bg-muted/40 p-3 rounded text-xs">{m.message}</pre>
                  <div className="grid sm:grid-cols-[180px,1fr] gap-3 items-start">
                    <Select value={m.status} onValueChange={(v) => updateField(m.id, { status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Dahili notlar..."
                      value={m.admin_notes ?? ""}
                      onChange={(e) => setItems((s) => s.map((x) => x.id === m.id ? { ...x, admin_notes: e.target.value } : x))}
                      onBlur={(e) => updateField(m.id, { admin_notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-between">
                    <a href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject ?? "İletişim formu")}`}
                       className="inline-flex items-center text-xs text-accent-blue hover:underline">
                      <Mail className="h-3 w-3 mr-1" /> E-posta ile yanıtla
                    </a>
                    <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" /> Sil
                    </Button>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;