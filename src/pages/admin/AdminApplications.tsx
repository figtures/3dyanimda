import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type App = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string;
  experience_years: number | null;
  cover_letter: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  cv_file_path: string | null;
  cv_file_name: string | null;
  status: string;
  admin_notes: string | null;
};

const STATUSES = [
  { v: "new", l: "Yeni", c: "bg-accent-blue/15 text-accent-blue" },
  { v: "reviewing", l: "İnceleniyor", c: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  { v: "interview", l: "Görüşme", c: "bg-purple-500/15 text-purple-700 dark:text-purple-400" },
  { v: "hired", l: "Kabul", c: "bg-green-500/15 text-green-700 dark:text-green-400" },
  { v: "rejected", l: "Reddedildi", c: "bg-destructive/15 text-destructive" },
];

const AdminApplications = () => {
  const [items, setItems] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setItems((data ?? []) as App[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const downloadCv = async (path: string, name: string | null) => {
    const { data, error } = await supabase.storage.from("career-uploads").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name ?? "cv";
    a.click();
  };

  const updateField = async (id: string, patch: Partial<App>) => {
    const { error } = await supabase.from("job_applications").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("Bu başvuru silinsin mi?")) return;
    const { error } = await supabase.from("job_applications").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
    toast.success("Silindi");
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl">İş Başvuruları</h1>
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
        <div className="text-center py-12 text-muted-foreground">Başvuru yok.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const st = STATUSES.find((s) => s.v === a.status) ?? STATUSES[0];
            return (
              <details key={a.id} className="border border-border rounded-lg bg-card">
                <summary className="cursor-pointer p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.full_name} <span className="text-muted-foreground text-xs">— {a.position}</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {a.email} · {new Date(a.created_at).toLocaleString("tr-TR")} · {a.experience_years ?? 0} yıl
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded shrink-0 ${st.c}`}>{st.l}</span>
                </summary>
                <div className="p-4 pt-0 text-sm space-y-3 border-t border-border">
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {a.phone && <div><b>Telefon:</b> {a.phone}</div>}
                    {a.linkedin_url && <div><b>LinkedIn:</b> <a href={a.linkedin_url} target="_blank" rel="noreferrer" className="text-accent-blue underline">link</a></div>}
                    {a.portfolio_url && <div><b>Portföy:</b> <a href={a.portfolio_url} target="_blank" rel="noreferrer" className="text-accent-blue underline">link</a></div>}
                  </div>
                  {a.cover_letter && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Ön yazı</div>
                      <pre className="whitespace-pre-wrap font-sans bg-muted/40 p-3 rounded text-xs">{a.cover_letter}</pre>
                    </div>
                  )}
                  {a.cv_file_path && (
                    <Button size="sm" variant="outline" onClick={() => downloadCv(a.cv_file_path!, a.cv_file_name)}>
                      <Download className="h-3 w-3 mr-1" /> {a.cv_file_name ?? "CV indir"}
                    </Button>
                  )}
                  <div className="grid sm:grid-cols-[180px,1fr] gap-3 items-start">
                    <Select value={a.status} onValueChange={(v) => updateField(a.id, { status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Dahili notlar..."
                      value={a.admin_notes ?? ""}
                      onChange={(e) => setItems((s) => s.map((x) => x.id === a.id ? { ...x, admin_notes: e.target.value } : x))}
                      onBlur={(e) => updateField(a.id, { admin_notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onClick={() => remove(a.id)} className="text-destructive hover:text-destructive">
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

export default AdminApplications;