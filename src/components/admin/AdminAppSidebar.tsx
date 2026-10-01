import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, ShieldCheck, Search as SearchIcon } from "lucide-react";
import { ADMIN_DASHBOARD, ADMIN_NAV, AdminNavItem } from "@/lib/adminNav";
import { useAuth } from "@/hooks/useAuth";
import { useFeatures } from "@/contexts/FeatureContext";
import { useTenant } from "@/contexts/TenantContext";
import { cn } from "@/lib/utils";

type Props = {
  badges: Record<string, number>;
  onOpenCommand: () => void;
};

export function AdminAppSidebar({ badges, onOpenCommand }: Props) {
  const { pathname } = useLocation();
  const { isSuperAdmin, hasPermission } = useAuth();
  const { isEnabled, loading: featuresLoading } = useFeatures();
  const { tenant } = useTenant();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const filterItem = (n: AdminNavItem) => {
    if (n.superAdminOnly && !isSuperAdmin) return false;
    if (n.perm && !hasPermission(n.perm)) return false;
    if (n.feature && !featuresLoading && !isEnabled(n.feature)) return false;
    return true;
  };

  const visibleGroups = useMemo(
    () =>
      ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter(filterItem) })).filter(
        (g) => g.items.length > 0
      ),
    [isSuperAdmin, featuresLoading, hasPermission, isEnabled]
  );

  const isActive = (to: string, end?: boolean) =>
    end ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const renderItem = (n: AdminNavItem) => {
    const Icon = n.icon;
    const badge = n.badgeKey ? badges[n.badgeKey] ?? 0 : 0;
    const active = isActive(n.to, n.end);
    const link = (
      <NavLink to={n.to} end={n.end} className="w-full flex items-center gap-2 min-w-0">
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate flex-1">{n.label}</span>}
        {!collapsed && badge > 0 && (
          <span className="ml-auto text-[10px] font-mono bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </NavLink>
    );
    return (
      <SidebarMenuItem key={n.to}>
        <div className="relative">
          <SidebarMenuButton asChild isActive={active} tooltip={collapsed ? n.label : undefined}>
            {link}
          </SidebarMenuButton>
          {collapsed && badge > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive pointer-events-none" />
          )}
        </div>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <div className={cn("flex items-center gap-2 px-2 py-2", collapsed && "justify-center px-0")}>
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-accent-blue to-primary grid place-items-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin</div>
              <div className="font-display font-semibold truncate text-sm leading-tight">{tenant?.name ?? "—"}</div>
            </div>
          )}
        </div>
        {!collapsed ? (
          <button
            type="button"
            onClick={onOpenCommand}
            className="mx-2 mb-2 flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-muted/40 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Hızlı git…</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">⌘K</kbd>
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onOpenCommand}
                className="mx-auto my-1 h-8 w-8 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"
              >
                <SearchIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Hızlı git (⌘K)</TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>

      <SidebarContent>
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={collapsed ? "Studio Paneli" : undefined}>
                    <NavLink to="/studio" className="w-full flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Studio Paneli</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItem(ADMIN_DASHBOARD)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleGroups.map((g) => (
          <SidebarGroup key={g.key}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>{g.items.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        {!collapsed && tenant?.slug && (
          <div className="px-2 py-1.5 text-[11px] text-muted-foreground truncate">
            tenant: <span className="font-mono">{tenant.slug}</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminAppSidebar;