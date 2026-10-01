import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCSV, downloadCSV } from "@/lib/csv";

type Entry = {
  id: string;
  created_at: string;
  user_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  details: Record<string, unknown> | null;
};

const AdminAuditLog = () => {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) toast.error(error.message);
      setItems((data as Entry[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const exportCsv = () => {
    const csv = toCSV(items, ["created_at", "user_email", "action", "table_name", "record_id", "details"]);
    downloadCSV(`audit-log-${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Son 500 admin işlemi</p>
        </div>
        <Button onClick={exportCsv} disabled={!items.length}><Download className="h-4 w-4 mr-2" />CSV</Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
          Henüz log kaydı yok. Admin işlemleri yapıldıkça burada görünecek.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-3">Tarih</th><th className="p-3">Kullanıcı</th><th className="p-3">İşlem</th><th className="p-3">Tablo</th><th className="p-3">Kayıt</th></tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="p-3 text-muted-foreground text-xs">{new Date(e.created_at).toLocaleString("tr-TR")}</td>
                  <td className="p-3">{e.user_email ?? "—"}</td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 rounded bg-muted">{e.action}</span></td>
                  <td className="p-3 font-mono text-xs">{e.table_name}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground truncate max-w-[200px]">{e.record_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;