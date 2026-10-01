import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2, ShieldCheck } from "lucide-react";

type Row = { id: string; user_id: string; role: string; created_at: string; email?: string };

const AdminUsers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newUserId.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: newUserId.trim(), role: newRole as any });
    setAdding(false);
    if (error) toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    else { toast({ title: "Rol atandı" }); setNewUserId(""); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Rol silinsin mi?")) return;
    await supabase.from("user_roles").delete().eq("id", id);
    setRows((p) => p.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Kullanıcı Rolleri</h1>
        <p className="text-sm text-muted-foreground mt-1">Admin/editör yetkisi vermek için kullanıcının User ID'sini (auth.uid) ekleyin. Kullanıcı önce e-posta/parola ile kayıt olmalıdır.</p>
      </div>

      <Card className="p-5">
        <h3 className="font-medium mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent-blue" /> Yeni rol ata</h3>
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="User ID (uuid)" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} className="flex-1 min-w-[260px]" />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="border border-border rounded-md px-3 py-2 bg-background text-sm">
            <option value="admin">admin</option>
            <option value="moderator">moderator</option>
            <option value="user">user</option>
          </select>
          <Button onClick={handleAdd} disabled={adding || !newUserId.trim()}>{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ata"}</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">User ID, Cloud → Auth → Users sekmesinden alınabilir.</p>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-3">User ID</th><th className="p-3">Rol</th><th className="p-3">Eklendi</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Henüz rol atanmamış.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{r.user_id}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded text-xs font-medium">{r.role}</span></td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString("tr-TR")}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3 w-3" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;