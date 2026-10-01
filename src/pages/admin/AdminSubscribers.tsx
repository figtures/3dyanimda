import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Trash2 } from "lucide-react";
import { toCSV, downloadCSV } from "@/lib/csv";

type Sub = { id: string; email: string; source: string | null; status: string; created_at: string };

const AdminSubscribers = () => {
  const [items, setItems] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Sub[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const csv = toCSV(items, ["email", "source", "status", "created_at"]);
    downloadCSV(`aboneler-${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  const remove = async (id: string) => {
    if (!confirm("Silmek istediğinizden emin misiniz?")) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((p) => p.filter((x) => x.id !== id));
    toast.success("Silindi");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Bülten Aboneleri</h1>
          <p className="text-sm text-muted-foreground">Toplam {items.length} abone</p>
        </div>
        <Button onClick={exportCsv} disabled={!items.length}>
          <Download className="h-4 w-4 mr-2" /> CSV İndir
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">Henüz abone yok.</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-3">E-posta</th><th className="p-3">Kaynak</th><th className="p-3">Durum</th><th className="p-3">Tarih</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 font-medium">{s.email}</td>
                  <td className="p-3 text-muted-foreground">{s.source ?? "—"}</td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 rounded bg-muted">{s.status}</span></td>
                  <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleString("tr-TR")}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove(s.id)} className="text-destructive hover:opacity-80" aria-label="Sil"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribers;