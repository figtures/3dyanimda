// Backward-compat shim. Prefer useAuth() going forward.
// `isAdmin` here means: can the user access the admin panel for the current tenant
// (either super_admin or any tenant membership).
import { useAuth } from "./useAuth";

export function useAdminAuth() {
  const { session, canAccessAdmin, loading } = useAuth();
  return { session, isAdmin: loading ? null : canAccessAdmin, loading };
}