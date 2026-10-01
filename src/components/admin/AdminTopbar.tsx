import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Sun, Moon, LogOut, ExternalLink, User2, KeyRound } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { findGroupForPath, findNavItem } from "@/lib/adminNav";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type Props = {
  onOpenCommand: () => void;
};

export function AdminTopbar({ onOpenCommand }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [session, setSession] = useState<Session | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    setIsDark(next);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const group = findGroupForPath(pathname);
  const item = findNavItem(pathname);
  const email = session?.user.email ?? "";
  const initials = email ? email.slice(0, 2).toUpperCase() : "AD";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="h-full flex items-center gap-3 px-3 md:px-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {group && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span className="text-muted-foreground">{group.label}</span>
                </BreadcrumbItem>
              </>
            )}
            {item && item.to !== "/admin" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <button
          type="button"
          onClick={onOpenCommand}
          className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-xs text-muted-foreground transition-colors min-w-[220px]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Hızlı git…</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">⌘K</kbd>
        </button>

        <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
          <a href="/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Siteyi gör
          </a>
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Tema değiştir">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-muted px-1 py-1 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-accent-blue to-primary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-xs text-muted-foreground">Oturum</div>
              <div className="text-sm truncate">{email}</div>
              {tenant && <div className="text-[11px] text-muted-foreground mt-1">tenant: {tenant.slug}</div>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/team"><User2 className="h-4 w-4 mr-2" /> Ekip</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/roles"><KeyRound className="h-4 w-4 mr-2" /> Roller</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Çıkış yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AdminTopbar;