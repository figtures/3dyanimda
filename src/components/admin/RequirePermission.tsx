import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";

export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { hasPermission, loading, session, canAccessAdmin } = useAuth();
  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!canAccessAdmin || !hasPermission(permission)) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <ShieldAlert className="h-10 w-10 mx-auto text-destructive" />
        <h2 className="text-lg font-semibold">Yetkiniz yok</h2>
        <p className="text-sm text-muted-foreground">
          Bu sayfayı görüntülemek için gerekli izne (<code>{permission}</code>) sahip değilsiniz.
          Yöneticinizden talep edin.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}