import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  machine_brand: string;
  machine_model: string;
  machine_type: string;
  build_volume: string | null;
  current_location: string | null;
  expected_volume: string | null;
  service_scope: string[] | null;
  details: string | null;
  attachment_path: string | null;
  attachment_name: string | null;
  status: string;
  admin_notes: string | null;
};

const STATUSES = [
  { v: "new", l: "Yeni", c: "bg-accent-blue/15 text-accent-blue" },
  { v: "reviewing", l: "İnceleniyor", c: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  { v: "negotiation", l: "Görüşme", c: "bg-purple-500/15 text-purple-700 dark:text-purple-400" },
  { v: "active", l: "Aktif", c: "bg-green-500/15 text-green-700 dark:text-green-400" },
  { v: "rejected", l: "Reddedildi", c: "bg-destructive/15 text-destructive" },
];

const AdminMachineOps = () => {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("machine_operation_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setItems((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const downloadAtt = async (path: string, name: string | null) => {
    const { data, error } = await supabase.storage.from("career-uploads").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name ?? "ek";
    a.click();
  };

  const updateField = async (id: string, patch: Partial<Row>) => {
    const { error } = await supabase.from("machine_operation_requests").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("Bu talep silinsin mi?")) return;
    const { error } = await supabase.from("machine_operation_requests").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
    toast.success("Silindi");
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl">Makine İşletim Talepleri</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü ({items.length})</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.v} value={s.v}>{s.l} ({items.filter(i => i.status === s.v).length})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Talep yok.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const st = STATUSES.find((s) => s.v === r.status) ?? STATUSES[0];
            return (
              <details key={r.id} className="border border-border rounded-lg bg-card">
                <summary className="cursor-pointer p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {r.full_name} <span className="text-muted-foreground text-xs">— {r.company ?? "—"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {r.machine_brand} {r.machine_model} · {new Date(r.created_at).toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded shrink-0 ${st.c}`}>{st.l}</span>
                </summary>
                <div className="p-4 pt-0 text-sm space-y-3 border-t border-border">
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div><b>E-posta:</b> {r.email}</div>
                    {r.phone && <div><b>Telefon:</b> {r.phone}</div>}
                    <div><b>Tür:</b> {r.machine_type}</div>
                    {r.build_volume && <div><b>Hacim:</b> {r.build_volume}</div>}
                    {r.current_location && <div><b>Konum:</b> {r.current_location}</div>}
                    {r.expected_volume && <div><b>Aylık iş:</b> {r.expected_volume}</div>}
                  </div>
                  {r.service_scope?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {r.service_scope.map((s) => <span key={s} className="text-[11px] bg-muted px-2 py-0.5 rounded">{s}</span>)}
                    </div>
                  ) : null}
                  {r.details && (
                    <pre className="whitespace-pre-wrap font-sans bg-muted/40 p-3 rounded text-xs">{r.details}</pre>
                  )}
                  {r.attachment_path && (
                    <Button size="sm" variant="outline" onClick={() => downloadAtt(r.attachment_path!, r.attachment_name)}>
                      <Download className="h-3 w-3 mr-1" /> {r.attachment_name ?? "Eki indir"}
                    </Button>
                  )}
                  <div className="grid sm:grid-cols-[180px,1fr] gap-3 items-start">
                    <Select value={r.status} onValueChange={(v) => updateField(r.id, { status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Dahili notlar..."
                      value={r.admin_notes ?? ""}
                      onChange={(e) => setItems((s) => s.map((x) => x.id === r.id ? { ...x, admin_notes: e.target.value } : x))}
                      onBlur={(e) => updateField(r.id, { admin_notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive hover:text-destructive">
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

export default AdminMachineOps;