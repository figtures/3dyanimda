import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ADMIN_DASHBOARD, ADMIN_NAV, AdminNavItem } from "@/lib/adminNav";
import { useAuth } from "@/hooks/useAuth";
import { useFeatures } from "@/contexts/FeatureContext";
import {
  LogOut, Sparkles, ExternalLink, Clock, X,
  FileText, Inbox, MessageSquare, Briefcase, Quote, HelpCircle, Image as ImageIcon, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGlobalSearch, SearchHit } from "@/hooks/useGlobalSearch";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { ADMIN_ACTIONS } from "@/lib/adminActions";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const HIT_ICONS: Record<SearchHit["kind"], any> = {
  blog: FileText, quote: Inbox, message: MessageSquare,
  portfolio: Briefcase, testimonial: Quote, faq: HelpCircle,
  job: Briefcase, media: ImageIcon, application: Briefcase,
};

export function AdminCommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { isSuperAdmin, hasPermission } = useAuth();
  const { isEnabled, loading: featuresLoading } = useFeatures();
  const [query, setQuery] = useState("");
  const { groups, loading } = useGlobalSearch(query, open);
  const { items: recent, push: pushRecent, clear: clearRecent } = useRecentSearches();

  useEffect(() => { if (!open) setQuery(""); }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const navGroups = useMemo(() => {
    const filter = (n: AdminNavItem) => {
      if (n.superAdminOnly && !isSuperAdmin) return false;
      if (n.perm && !hasPermission(n.perm)) return false;
      if (n.feature && !featuresLoading && !isEnabled(n.feature)) return false;
      return true;
    };
    return ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter(filter) })).filter((g) => g.items.length);
  }, [isSuperAdmin, featuresLoading, hasPermission, isEnabled]);

  const go = (path: string, external?: boolean) => {
    if (query.trim()) pushRecent(query);
    onOpenChange(false);
    if (external) window.open(path, "_blank"); else navigate(path);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="relative">
        <CommandInput
          placeholder="Her şeyi ara — blog, teklif, mesaj, sayfa, eylem…"
          value={query}
          onValueChange={setQuery}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>{loading ? "Aranıyor…" : "Sonuç bulunamadı."}</CommandEmpty>

        {/* Live content results */}
        {hasQuery && groups.map((g) => {
          const Icon = HIT_ICONS[g.key];
          return (
            <CommandGroup key={`hit-${g.key}`} heading={g.label}>
              {g.items.map((h) => (
                <CommandItem key={h.id} onSelect={() => go(h.to)} value={`${h.title} ${h.subtitle ?? ""} ${h.kind}`}>
                  <Icon className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">{h.title}</span>
                  {h.subtitle && (
                    <span className="ml-2 text-xs text-muted-foreground truncate font-mono">{h.subtitle}</span>
                  )}
                  {h.badge && (
                    <span className="ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {h.badge}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        {hasQuery && groups.length > 0 && <CommandSeparator />}

        {/* Recent searches when no query */}
        {!hasQuery && recent.length > 0 && (
          <>
            <CommandGroup heading="Son aramalar">
              {recent.map((r) => (
                <CommandItem key={r} onSelect={() => setQuery(r)} value={`recent ${r}`}>
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{r}</span>
                </CommandItem>
              ))}
              <CommandItem onSelect={() => clearRecent()} value="son aramalari temizle clear">
                <X className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Son aramaları temizle</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Actions */}
        <CommandGroup heading="Eylemler">
          {ADMIN_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <CommandItem key={a.id} onSelect={() => a.to && go(a.to, a.external)} value={`eylem ${a.label} ${a.keywords ?? ""}`}>
                <Icon className="h-4 w-4 mr-2" />
                <span>{a.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Genel">
          <CommandItem onSelect={() => go(ADMIN_DASHBOARD.to)} value="dashboard genel bakis">
            <ADMIN_DASHBOARD.icon className="h-4 w-4 mr-2" />
            Dashboard
          </CommandItem>
          {isSuperAdmin && (
            <CommandItem onSelect={() => go("/studio")} value="studio paneli super admin">
              <Sparkles className="h-4 w-4 mr-2" />
              Studio Paneli
            </CommandItem>
          )}
        </CommandGroup>

        {navGroups.map((g) => (
          <div key={g.key}>
            <CommandSeparator />
            <CommandGroup heading={g.label}>
              {g.items.map((n) => {
                const Icon = n.icon;
                return (
                  <CommandItem
                    key={n.to}
                    onSelect={() => go(n.to)}
                    value={`${n.label} ${n.description ?? ""} ${n.to}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{n.label}</span>
                    {n.description && (
                      <span className="ml-2 text-xs text-muted-foreground truncate">{n.description}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}

        <CommandSeparator />
        <CommandGroup heading="Hesap">
          <CommandItem
            onSelect={async () => {
              onOpenChange(false);
              await supabase.auth.signOut();
              navigate("/admin/login");
            }}
            value="cikis logout sign out"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış yap
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span><kbd className="font-mono px-1 py-0.5 rounded bg-muted">↑↓</kbd> gezin</span>
          <span><kbd className="font-mono px-1 py-0.5 rounded bg-muted">↵</kbd> aç</span>
          <span><kbd className="font-mono px-1 py-0.5 rounded bg-muted">esc</kbd> kapat</span>
        </div>
        <span>Her şey için ara</span>
      </div>
    </CommandDialog>
  );
}

export default AdminCommandPalette;