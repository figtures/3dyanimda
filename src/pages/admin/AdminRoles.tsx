import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { PERMISSION_GROUPS } from "@/lib/permissions";
import { Loader2, Plus, Trash2, Save, Lock } from "lucide-react";

type Role = {
  id: string;
  tenant_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const AdminRoles = () => {
  const { tenant, hasPermission } = useAuth();
  const canEdit = hasPermission("roles.edit");

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Role | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!tenant) return;
    setLoading(true);
    const { data } = await supabase
      .from("tenant_roles")
      .select("*")
      .or(`tenant_id.eq.${tenant.id},tenant_id.is.null`)
      .order("is_system", { ascending: false })
      .order("name");
    setRoles((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const startNew = () => {
    setEditing({
      id: "",
      tenant_id: tenant!.id,
      slug: "",
      name: "",
      description: "",
      permissions: [],
      is_system: false,
    });
  };

  const startEdit = (r: Role) => setEditing({ ...r, permissions: [...r.permissions] });

  const togglePerm = (key: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      permissions: editing.permissions.includes(key)
        ? editing.permissions.filter((p) => p !== key)
        : [...editing.permissions, key],
    });
  };

  const save = async () => {
    if (!editing || !tenant) return;
    if (!editing.name.trim()) return toast({ title: "İsim gerekli", variant: "destructive" });
    setBusy(true);
    const slug = editing.slug || slugify(editing.name);
    if (editing.id) {
      const { error } = await supabase
        .from("tenant_roles")
        .update({
          name: editing.name,
          description: editing.description,
          permissions: editing.permissions,
        })
        .eq("id", editing.id);
      setBusy(false);
      if (error) return toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("tenant_roles").insert({
        tenant_id: tenant.id,
        slug,
        name: editing.name,
        description: editing.description,
        permissions: editing.permissions,
        is_system: false,
      });
      setBusy(false);
      if (error) return toast({ title: "Oluşturulamadı", description: error.message, variant: "destructive" });
    }
    toast({ title: "Kaydedildi" });
    setEditing(null);
    load();
  };

  const remove = async (r: Role) => {
    if (!confirm(`"${r.name}" rolünü silmek istediğine emin misin?`)) return;
    const { error } = await supabase.from("tenant_roles").delete().eq("id", r.id);
    if (error) toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    else load();
  };

  const groupedTotal = useMemo(() => PERMISSION_GROUPS.reduce((n, g) => n + g.permissions.length, 0), []);

  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Roller & İzinler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistem rolleri (Owner / Manager / Editor / Viewer) her tenant'ta hazır gelir. Kendi
            özelleştirilmiş rollerinizi oluşturabilir, her izni tek tek seçebilirsiniz.
          </p>
        </div>
        {canEdit && (
          <Button onClick={startNew}>
            <Plus className="h-4 w-4 mr-1" /> Yeni Rol
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {roles.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{r.name}</h3>
                    {r.is_system && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Lock className="h-2.5 w-2.5 mr-0.5" /> sistem
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.slug}</p>
                  {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                  <p className="text-xs mt-2">
                    {r.permissions.includes("*")
                      ? "Tüm izinler"
                      : `${r.permissions.length} / ${groupedTotal} izin`}
                  </p>
                </div>
                {canEdit && !r.is_system && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                      Düzenle
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {canEdit && r.is_system && r.slug !== "owner" && (
                  <Button size="sm" variant="outline" onClick={() => startEdit({ ...r, tenant_id: tenant.id, id: "", is_system: false, slug: `${r.slug}_copy`, name: `${r.name} (Kopya)` })}>
                    Kopyala
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <Card className="p-5 space-y-4 border-accent-blue/40">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">{editing.id ? "Rolü Düzenle" : "Yeni Rol"}</h3>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              İptal
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">İsim</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Açıklama (opsiyonel)</Label>
              <Input
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            {PERMISSION_GROUPS.map((g) => {
              const allKeys = g.permissions.map((p) => p.key);
              const all = allKeys.every((k) => editing.permissions.includes(k));
              return (
                <div key={g.scope} className="border border-border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{g.label}</h4>
                    <button
                      type="button"
                      className="text-xs text-accent-blue hover:underline"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          permissions: all
                            ? editing.permissions.filter((k) => !allKeys.includes(k))
                            : Array.from(new Set([...editing.permissions, ...allKeys])),
                        })
                      }
                    >
                      {all ? "Hepsini kaldır" : "Hepsini seç"}
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {g.permissions.map((p) => (
                      <label key={p.key} className="flex items-start gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={editing.permissions.includes(p.key)}
                          onCheckedChange={() => togglePerm(p.key)}
                        />
                        <div>
                          <div>{p.label}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{p.key}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              İptal
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Kaydet
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminRoles;