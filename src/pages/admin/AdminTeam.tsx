import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2, UserPlus, Mail } from "lucide-react";

type Member = {
  id: string;
  user_id: string;
  role_slug: string;
  status: string;
  invited_email: string | null;
  created_at: string;
};

type RoleOpt = { slug: string; name: string };

const AdminTeam = () => {
  const { tenant, hasPermission, membership } = useAuth();
  const canInvite = hasPermission("users.invite");
  const canRemove = hasPermission("users.remove");

  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<RoleOpt[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [roleSlug, setRoleSlug] = useState("editor");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!tenant) return;
    setLoading(true);
    const [m, r] = await Promise.all([
      supabase
        .from("tenant_users")
        .select("id, user_id, role_slug, status, invited_email, created_at")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tenant_roles")
        .select("slug, name")
        .or(`tenant_id.eq.${tenant.id},tenant_id.is.null`)
        .order("is_system", { ascending: false }),
    ]);
    setMembers((m.data as any) ?? []);
    setRoles((r.data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const invite = async () => {
    if (!tenant || !email.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("invite-tenant-user", {
      body: { tenant_id: tenant.id, email: email.trim().toLowerCase(), role_slug: roleSlug },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({ title: "Davet gönderilemedi", description: error?.message || (data as any)?.error, variant: "destructive" });
      return;
    }
    toast({ title: "Davet edildi", description: `${email} ekibe eklendi.` });
    setEmail("");
    load();
  };

  const changeRole = async (id: string, slug: string) => {
    const { error } = await supabase.from("tenant_users").update({ role_slug: slug }).eq("id", id);
    if (error) toast({ title: "Güncellenemedi", description: error.message, variant: "destructive" });
    else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Bu üyeyi kaldırmak istediğine emin misin?")) return;
    const { error } = await supabase.from("tenant_users").delete().eq("id", id);
    if (error) toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    else setMembers((p) => p.filter((m) => m.id !== id));
  };

  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Ekip</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tenant.name} altında çalışan kullanıcıları yönetin. Davet edilen kişi e-postasıyla
          /admin/login üzerinden giriş yaptığında otomatik olarak aktif olur.
        </p>
      </div>

      {canInvite && (
        <Card className="p-5 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-accent-blue" /> Üye davet et
          </h3>
          <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2">
            <div>
              <Label className="text-xs">E-posta</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ad@firma.com" />
            </div>
            <div>
              <Label className="text-xs">Rol</Label>
              <select
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value)}
                className="w-full h-10 border border-border rounded-md px-3 bg-background text-sm"
              >
                {roles.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={invite} disabled={busy || !email.trim()}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Davet Et"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Kullanıcı</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Durum</th>
                <th className="p-3">Eklendi</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Henüz ekip üyesi yok.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-xs">{m.invited_email ?? m.user_id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {canInvite && m.role_slug !== "owner" ? (
                        <select
                          value={m.role_slug}
                          onChange={(e) => changeRole(m.id, e.target.value)}
                          className="border border-border rounded px-2 py-1 bg-background text-xs"
                        >
                          {roles
                            .filter((r) => r.slug !== "owner")
                            .map((r) => (
                              <option key={r.slug} value={r.slug}>
                                {r.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded text-xs font-medium">
                          {m.role_slug}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          m.status === "active"
                            ? "text-emerald-600 text-xs"
                            : "text-amber-600 text-xs"
                        }
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(m.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="p-3 text-right">
                      {canRemove && m.role_slug !== "owner" && m.user_id !== membership?.tenant_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => remove(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default AdminTeam;