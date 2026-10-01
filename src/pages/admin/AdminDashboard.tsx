import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Loader2, FileText, Inbox, Briefcase, Wrench, TrendingUp, Mail,
  Home, Search, Languages, ArrowUpRight, Activity,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import type { Session } from "@supabase/supabase-js";

type Counts = {
  quotesCur: number; quotesPrev: number; quotes7: number;
  contactsCur: number; contactsPrev: number; contacts7: number;
  applications: number; applicationsNew: number;
  machineOps: number; machineOpsNew: number;
  byDay: { day: string; quotes: number; contacts: number }[];
  byMaterial: { name: string; value: number }[];
  recentMessages: { id: string; full_name: string; email: string; subject: string | null; created_at: string }[];
};

const COLORS = ["hsl(var(--accent-blue))", "hsl(var(--primary))", "#a78bfa", "#22c55e", "#f59e0b", "#ef4444"];
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

const greetingFor = (d: Date) => {
  const h = d.getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi öğleden sonralar";
  return "İyi akşamlar";
};

const trendPct = (cur: number, prev: number) => {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
};

const AdminDashboard = () => {
  const [data, setData] = useState<Counts | null>(null);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [session, setSession] = useState<Session | null>(null);
  const { tenant } = useTenant();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const dPeriod = new Date(now.getTime() - period * 86400000).toISOString();
      const dPrev = new Date(now.getTime() - period * 2 * 86400000).toISOString();
      const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();

      const [quotes, contacts, apps, ops, recent] = await Promise.all([
        supabase.from("quote_requests").select("created_at,material_pref").gte("created_at", dPrev),
        supabase.from("contact_messages").select("created_at").gte("created_at", dPrev),
        supabase.from("job_applications").select("status"),
        supabase.from("machine_operation_requests").select("status"),
        supabase.from("contact_messages").select("id,full_name,email,subject,created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const q = quotes.data ?? [];
      const c = contacts.data ?? [];
      const a = apps.data ?? [];
      const m = ops.data ?? [];

      const buckets = Math.min(period, 30);
      const days: Record<string, { quotes: number; contacts: number }> = {};
      for (let i = buckets - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        days[dayKey(d)] = { quotes: 0, contacts: 0 };
      }
      q.forEach((r: any) => { const k = dayKey(new Date(r.created_at)); if (days[k]) days[k].quotes++; });
      c.forEach((r: any) => { const k = dayKey(new Date(r.created_at)); if (days[k]) days[k].contacts++; });
      const byDay = Object.entries(days).map(([day, v]) => ({ day: day.slice(5), ...v }));

      const matMap: Record<string, number> = {};
      q.filter((r: any) => r.created_at >= dPeriod).forEach((r: any) => {
        const k = r.material_pref || "Belirtilmedi";
        matMap[k] = (matMap[k] ?? 0) + 1;
      });
      const byMaterial = Object.entries(matMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

      setData({
        quotesCur: q.filter((r: any) => r.created_at >= dPeriod).length,
        quotesPrev: q.filter((r: any) => r.created_at < dPeriod).length,
        quotes7: q.filter((r: any) => r.created_at >= d7).length,
        contactsCur: c.filter((r: any) => r.created_at >= dPeriod).length,
        contactsPrev: c.filter((r: any) => r.created_at < dPeriod).length,
        contacts7: c.filter((r: any) => r.created_at >= d7).length,
        applications: a.length,
        applicationsNew: a.filter((r: any) => r.status === "new").length,
        machineOps: m.length,
        machineOpsNew: m.filter((r: any) => r.status === "new").length,
        byDay,
        byMaterial,
        recentMessages: (recent.data ?? []) as any,
      });
    })();
  }, [period]);

  const greeting = useMemo(() => greetingFor(new Date()), []);
  const userName = session?.user.email?.split("@")[0] ?? "";

  if (!data) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <PageHeader
        title={`${greeting}${userName ? `, ${userName}` : ""}`}
        description={tenant ? `${tenant.name} panelindesin. Son ${period} günün özetini aşağıda bulabilirsin.` : undefined}
        icon={<Activity className="h-5 w-5" />}
        actions={
          <div className="inline-flex rounded-md border border-border bg-card overflow-hidden">
            {([7, 30, 90] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-accent-blue text-white" : "text-muted-foreground hover:bg-muted"}`}
              >
                {p} gün
              </button>
            ))}
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat to="/admin/requests" icon={<FileText className="h-4 w-4" />} label={`Teklifler (${period}g)`} value={data.quotesCur} trend={trendPct(data.quotesCur, data.quotesPrev)} sub={`${data.quotes7} son 7 gün`} />
        <Stat to="/admin/messages" icon={<Inbox className="h-4 w-4" />} label={`Mesajlar (${period}g)`} value={data.contactsCur} trend={trendPct(data.contactsCur, data.contactsPrev)} sub={`${data.contacts7} son 7 gün`} />
        <Stat to="/admin/applications" icon={<Briefcase className="h-4 w-4" />} label="İş Başvuruları" value={data.applications} sub={`${data.applicationsNew} yeni`} highlight={data.applicationsNew > 0} />
        <Stat to="/admin/machine-ops" icon={<Wrench className="h-4 w-4" />} label="Makine Talepleri" value={data.machineOps} sub={`${data.machineOpsNew} yeni`} highlight={data.machineOpsNew > 0} />
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hızlı eylemler</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <QuickAction to="/admin/homepage" icon={<Home className="h-4 w-4" />} label="Ana sayfa içeriği" />
          <QuickAction to="/admin/blog" icon={<FileText className="h-4 w-4" />} label="Blog yazıları" />
          <QuickAction to="/admin/seo" icon={<Search className="h-4 w-4" />} label="SEO ayarları" />
          <QuickAction to="/admin/translations" icon={<Languages className="h-4 w-4" />} label="Çevirileri düzenle" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-accent-blue" /> Son {Math.min(period, 30)} gün aktivitesi
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byDay}>
              <XAxis dataKey="day" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="quotes" fill="hsl(var(--accent-blue))" name="Teklif" radius={[3, 3, 0, 0]} />
              <Bar dataKey="contacts" fill="hsl(var(--primary))" name="Mesaj" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-medium mb-3">Malzeme tercihi ({period}g)</div>
          {data.byMaterial.length === 0 ? (
            <div className="text-xs text-muted-foreground py-16 text-center">Bu dönemde teklif yok</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.byMaterial} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 11 }}>
                  {data.byMaterial.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4 text-accent-blue" /> Son mesajlar
          </div>
          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
            <Link to="/admin/messages">Tümünü gör <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
          </Button>
        </div>
        {data.recentMessages.length === 0 ? (
          <div className="text-xs text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
            Henüz mesaj yok. İletişim formuna gelen mesajlar burada görünür.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.recentMessages.map((m) => (
              <Link to="/admin/messages" key={m.id} className="flex items-center justify-between py-2.5 hover:bg-muted/40 px-2 -mx-2 rounded transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{m.full_name} <span className="text-muted-foreground text-xs">— {m.email}</span></div>
                  <div className="text-xs text-muted-foreground truncate">{m.subject ?? "(konusuz)"}</div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 ml-3">{new Date(m.created_at).toLocaleDateString("tr-TR")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ to, icon, label, value, sub, highlight, trend }: { to: string; icon: React.ReactNode; label: string; value: number; sub: string; highlight?: boolean; trend?: number }) => (
  <Link to={to} className={`group block bg-card border rounded-xl p-4 hover:border-accent-blue hover:shadow-sm transition-all ${highlight ? "border-accent-blue/60 bg-accent-blue/[0.03]" : "border-border"}`}>
    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
      <span>{label}</span>
      <span className="text-muted-foreground/60 group-hover:text-accent-blue transition-colors">{icon}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <div className="text-2xl font-display font-semibold tracking-tight">{value}</div>
      {typeof trend === "number" && (
        <span className={`text-[11px] font-medium ${trend > 0 ? "text-emerald-600 dark:text-emerald-400" : trend < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
  </Link>
);

const QuickAction = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link to={to} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card hover:border-accent-blue hover:bg-muted/40 transition-colors group">
    <span className="text-muted-foreground group-hover:text-accent-blue transition-colors">{icon}</span>
    <span className="text-sm flex-1 truncate">{label}</span>
    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent-blue transition-colors" />
  </Link>
);

export default AdminDashboard;
