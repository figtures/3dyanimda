import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminAppSidebar } from "@/components/admin/AdminAppSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";

const AdminLayout = () => {
  const { session, isAdmin, loading } = useAdminAuth();
  const [badges, setBadges] = useState<Record<string, number>>({ quotes: 0, messages: 0, apps: 0, ops: 0 });
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchCounts = async () => {
      const [q, m, a, o] = await Promise.all([
        supabase.from("quote_requests").select("id", { head: true, count: "exact" }).eq("status", "new"),
        supabase.from("contact_messages").select("id", { head: true, count: "exact" }).eq("status", "new"),
        supabase.from("job_applications").select("id", { head: true, count: "exact" }).eq("status", "new"),
        supabase.from("machine_operation_requests").select("id", { head: true, count: "exact" }).eq("status", "new"),
      ]);
      setBadges({ quotes: q.count ?? 0, messages: m.count ?? 0, apps: a.count ?? 0, ops: o.count ?? 0 });
    };
    fetchCounts();
    const iv = setInterval(fetchCounts, 60000);
    return () => clearInterval(iv);
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AdminAppSidebar badges={badges} onOpenCommand={() => setCmdOpen(true)} />
        <SidebarInset className="flex flex-col min-w-0">
          <AdminTopbar onOpenCommand={() => setCmdOpen(true)} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6 lg:p-8 w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
        <AdminCommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;