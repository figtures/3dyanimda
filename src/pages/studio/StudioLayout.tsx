import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Palette, ToggleLeft, LogOut, Sparkles, LayoutDashboard, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const StudioLayout = () => {
  const { session, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
      isActive ? "bg-foreground text-background" : "hover:bg-muted text-foreground/80"
    );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-display font-semibold">Studio</span>
        </div>
        <nav className="space-y-1 flex-1">
          <NavLink to="/studio" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Genel</NavLink>
          <NavLink to="/studio/onboard" className={linkClass}><Rocket className="h-4 w-4" /> Yeni İşletme</NavLink>
          <NavLink to="/studio/tenants" className={linkClass}><Building2 className="h-4 w-4" /> İşletmeler</NavLink>
          <NavLink to="/studio/themes" className={linkClass}><Palette className="h-4 w-4" /> Temalar</NavLink>
          <NavLink to="/studio/features" className={linkClass}><ToggleLeft className="h-4 w-4" /> Özellik Kataloğu</NavLink>
        </nav>
        <div className="text-[11px] text-muted-foreground px-2 mb-2 truncate">{session.user.email}</div>
        <Button variant="outline" size="sm" onClick={logout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" /> Çıkış
        </Button>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-10"><Outlet /></div>
      </main>
    </div>
  );
};

export default StudioLayout;