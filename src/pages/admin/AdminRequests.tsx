import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Download, Archive, ArchiveRestore, Send, Save, Paperclip,
  Mail, Phone, Building2, Package, FileText, Clock, X, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toCSV, downloadCSV } from "@/lib/csv";
import { cn } from "@/lib/utils";

type Quote = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service_type: string | null;
  material_pref: string | null;
  quantity: number | null;
  part_description: string;
  stl_file_path: string | null;
  stl_file_name: string | null;
  status: string;
  admin_notes: string | null;
  archived: boolean;
  archived_at: string | null;
  last_reply_at: string | null;
  applied_campaign_name: string | null;
  applied_discount_amount: number | null;
  tenant_id: string;
};

type Contact = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
};

type Reply = {
  id: string;
  created_at: string;
  subject: string | null;
  body: string;
  to_email: string;
  status: string;
  error_message: string | null;
};

type Tab = "active" | "archive" | "contacts";

const STATUSES = [
  { id: "new", label: "Yeni", tone: "bg-accent-blue/15 text-accent-blue" },
  { id: "in_review", label: "İncelemede", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { id: "quoted", label: "Teklif verildi", tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  { id: "won", label: "Kazanıldı", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { id: "lost", label: "Kaybedildi", tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
];
const statusMeta = (s: string) => STATUSES.find((x) => x.id === s) ?? { id: s, label: s, tone: "bg-muted text-muted-foreground" };

const AdminRequests = () => {
  const [tab, setTab] = useState<Tab>("active");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [q, c] = await Promise.all([
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    if (q.error) toast.error(q.error.message);
    if (c.error) toast.error(c.error.message);
    setQuotes((q.data ?? []) as Quote[]);
    setContacts((c.data ?? []) as Contact[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const active = useMemo(() => quotes.filter((q) => !q.archived), [quotes]);
  const archived = useMemo(() => quotes.filter((q) => q.archived), [quotes]);
  const visible = tab === "active" ? active : tab === "archive" ? archived : [];
  const selectedQuote = quotes.find((q) => q.id === selectedId) ?? null;

  const exportCsv = () => {
    if (tab === "contacts") {
      downloadCSV(`contacts-${new Date().toISOString().slice(0, 10)}.csv`,
        toCSV(contacts as any, ["created_at", "full_name", "email", "phone", "subject", "message"]));
    } else {
      const rows = tab === "active" ? active : archived;
      downloadCSV(`quotes-${tab}-${new Date().toISOString().slice(0, 10)}.csv`,
        toCSV(rows as any, ["created_at", "full_name", "email", "phone", "company", "service_type", "material_pref", "quantity", "status", "archived", "part_description"]));
    }
  };

  const patchQuote = (id: string, patch: Partial<Quote>) =>
    setQuotes((s) => s.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="font-display text-2xl">Talepler</h1>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-2" /> CSV İndir
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto">
        {([
          { id: "active" as Tab, label: `Aktif Teklifler (${active.length})` },
          { id: "archive" as Tab, label: `Arşiv (${archived.length})` },
          { id: "contacts" as Tab, label: `İletişim Mesajları (${contacts.length})` },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-4 py-2 text-sm border-b-2 -mb-px whitespace-nowrap",
              tab === t.id ? "border-accent-blue text-accent-blue" : "border-transparent text-muted-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : tab === "contacts" ? (
        <div className="space-y-3">
          {contacts.map((c) => (
            <details key={c.id} className="border border-border rounded-lg bg-card">
              <summary className="cursor-pointer p-4">
                <span className="font-medium">{c.full_name}</span>
                <span className="text-xs text-muted-foreground ml-2">{c.email} · {new Date(c.created_at).toLocaleString("tr-TR")}</span>
              </summary>
              <div className="p-4 pt-0 text-sm space-y-2 border-t border-border">
                {c.subject && <div><b>Konu:</b> {c.subject}</div>}
                {c.phone && <div><b>Telefon:</b> {c.phone}</div>}
                <pre className="whitespace-pre-wrap font-sans bg-muted/40 p-3 rounded text-xs">{c.message}</pre>
              </div>
            </details>
          ))}
          {contacts.length === 0 && <div className="text-center py-12 text-muted-foreground">Henüz mesaj yok.</div>}
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5">Müşteri</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">Konfigürasyon</th>
                <th className="text-left px-4 py-2.5">Durum</th>
                <th className="text-left px-4 py-2.5 hidden sm:table-cell">Tarih</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((q) => {
                const meta = statusMeta(q.status);
                return (
                  <tr key={q.id} className="border-t border-border hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedId(q.id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-2">
                        {q.full_name}
                        {q.stl_file_path && <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />}
                        {q.last_reply_at && <Mail className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{q.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                      {q.material_pref ?? "—"} · {q.quantity ?? 1} adet
                      {q.applied_campaign_name && <span className="ml-1 text-amber-600">· 🎁 {q.applied_campaign_name}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] px-2 py-1 rounded font-medium", meta.tone)}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                      {new Date(q.created_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                  {tab === "archive" ? "Arşivde teklif yok." : "Henüz teklif talebi yok."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <QuoteDetail
        quote={selectedQuote}
        onClose={() => setSelectedId(null)}
        onPatch={(patch) => selectedQuote && patchQuote(selectedQuote.id, patch)}
      />
    </div>
  );
};

/* -------------------- Detail Sheet -------------------- */

function QuoteDetail({
  quote, onClose, onPatch,
}: { quote: Quote | null; onClose: () => void; onPatch: (patch: Partial<Quote>) => void }) {
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [status, setStatus] = useState("new");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!quote) return;
    setNotes(quote.admin_notes ?? "");
    setStatus(quote.status);
    setReplySubject(`Teklif talebiniz hk. — ${quote.full_name}`);
    setReplyBody("");
    (async () => {
      const { data } = await supabase
        .from("quote_replies").select("id, created_at, subject, body, to_email, status, error_message")
        .eq("quote_id", quote.id).order("created_at", { ascending: false });
      setReplies((data ?? []) as Reply[]);
    })();
  }, [quote?.id]);

  if (!quote) return null;

  const saveNotes = async () => {
    setSavingNotes(true);
    const { error } = await supabase.from("quote_requests").update({ admin_notes: notes }).eq("id", quote.id);
    setSavingNotes(false);
    if (error) return toast.error(error.message);
    onPatch({ admin_notes: notes });
    toast.success("Not kaydedildi");
  };

  const changeStatus = async (next: string) => {
    setStatus(next);
    const { error } = await supabase.from("quote_requests").update({ status: next }).eq("id", quote.id);
    if (error) { toast.error(error.message); return; }
    onPatch({ status: next });
  };

  const toggleArchive = async () => {
    const next = !quote.archived;
    const { error } = await supabase
      .from("quote_requests")
      .update({ archived: next, archived_at: next ? new Date().toISOString() : null })
      .eq("id", quote.id);
    if (error) return toast.error(error.message);
    onPatch({ archived: next, archived_at: next ? new Date().toISOString() : null });
    toast.success(next ? "Arşivlendi" : "Arşivden çıkarıldı");
    if (next) onClose();
  };

  const openAttachment = async () => {
    if (!quote.stl_file_path) return;
    const { data, error } = await supabase.storage
      .from("stl-uploads")
      .createSignedUrl(quote.stl_file_path, 300, { download: quote.stl_file_name ?? undefined });
    if (error || !data?.signedUrl) {
      toast.error("Dosya bulunamadı veya erişim izniniz yok.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const sendReply = async () => {
    if (!replyBody.trim()) { toast.error("Yanıt boş olamaz"); return; }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        to: quote.email,
        subject: replySubject || "Teklif talebiniz",
        text: replyBody,
        tenantId: quote.tenant_id,
        variables: { name: quote.full_name, email: quote.email },
      },
    });
    if (error || (data as any)?.error) {
      setSending(false);
      toast.error((data as any)?.error || error?.message || "Gönderilemedi");
      await supabase.from("quote_replies").insert({
        tenant_id: quote.tenant_id, quote_id: quote.id,
        subject: replySubject, body: replyBody, to_email: quote.email,
        status: "failed", error_message: (data as any)?.error || error?.message || null,
      });
      return;
    }
    await supabase.from("quote_replies").insert({
      tenant_id: quote.tenant_id, quote_id: quote.id,
      subject: replySubject, body: replyBody, to_email: quote.email,
      status: "sent",
    });
    const now = new Date().toISOString();
    await supabase.from("quote_requests")
      .update({ last_reply_at: now, status: status === "new" ? "in_review" : status })
      .eq("id", quote.id);
    onPatch({ last_reply_at: now, status: status === "new" ? "in_review" : status });
    if (status === "new") setStatus("in_review");
    setReplyBody("");
    const { data: r } = await supabase
      .from("quote_replies").select("id, created_at, subject, body, to_email, status, error_message")
      .eq("quote_id", quote.id).order("created_at", { ascending: false });
    setReplies((r ?? []) as Reply[]);
    setSending(false);
    toast.success("Yanıt gönderildi");
  };

  return (
    <Sheet open={!!quote} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="font-display text-xl flex items-center gap-2 pr-8">
            {quote.full_name}
            <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium", statusMeta(status).tone)}>
              {statusMeta(status).label}
            </span>
            {quote.archived && <Badge variant="outline" className="text-[10px]">Arşiv</Badge>}
          </SheetTitle>
        </SheetHeader>

        {/* Müşteri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-4">
          <InfoRow icon={<Mail className="h-3.5 w-3.5" />}
            value={<a href={`mailto:${quote.email}`} className="text-accent-blue hover:underline">{quote.email}</a>} />
          {quote.phone && <InfoRow icon={<Phone className="h-3.5 w-3.5" />}
            value={<a href={`tel:${quote.phone}`} className="hover:underline">{quote.phone}</a>} />}
          {quote.company && <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} value={quote.company} />}
          <InfoRow icon={<Package className="h-3.5 w-3.5" />}
            value={`${quote.material_pref ?? "—"} · ${quote.quantity ?? 1} adet`} />
          <InfoRow icon={<Clock className="h-3.5 w-3.5" />}
            value={new Date(quote.created_at).toLocaleString("tr-TR")} />
        </div>

        {/* Açıklama */}
        <section className="mt-5">
          <SectionTitle icon={<FileText className="h-4 w-4" />} title="Talep Detayı" />
          <pre className="whitespace-pre-wrap font-sans bg-muted/40 border border-border p-3 rounded-md text-[13px] leading-relaxed">
            {quote.part_description}
          </pre>
          {quote.applied_campaign_name && (
            <div className="mt-2 text-xs text-amber-600">
              🎁 Uygulanan kampanya: <b>{quote.applied_campaign_name}</b>
              {quote.applied_discount_amount ? ` · −${Number(quote.applied_discount_amount).toLocaleString("tr-TR")} ₺` : ""}
            </div>
          )}
          {quote.stl_file_path && (
            <button
              onClick={openAttachment}
              className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/40"
            >
              <Paperclip className="h-4 w-4 text-accent-blue" />
              <span className="font-mono">{quote.stl_file_name ?? "Eklenen dosya"}</span>
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </section>

        {/* Durum & arşiv */}
        <section className="mt-5">
          <SectionTitle title="Durum" />
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s.id} onClick={() => changeStatus(s.id)}
                className={cn("text-xs px-2.5 py-1.5 rounded border transition",
                  status === s.id ? `${s.tone} border-current` : "border-border hover:bg-muted/40 text-muted-foreground")}>
                {s.label}
              </button>
            ))}
            <button onClick={toggleArchive}
              className="ml-auto text-xs px-2.5 py-1.5 rounded border border-border hover:bg-muted/40 inline-flex items-center gap-1.5">
              {quote.archived ? <><ArchiveRestore className="h-3.5 w-3.5" /> Arşivden çıkar</>
                : <><Archive className="h-3.5 w-3.5" /> Arşivle</>}
            </button>
          </div>
        </section>

        {/* Notes */}
        <section className="mt-5">
          <SectionTitle title="Dahili notlar" />
          <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Müşteri görmez; ekip notları…" />
          <div className="flex justify-end mt-2">
            <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
              {savingNotes ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Notu kaydet
            </Button>
          </div>
        </section>

        {/* Reply */}
        <section className="mt-5">
          <SectionTitle icon={<Mail className="h-4 w-4" />} title={`Müşteriye yanıt (${quote.email})`} />
          <Label className="text-xs">Konu</Label>
          <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} />
          <Label className="text-xs mt-2 block">Mesaj</Label>
          <Textarea rows={6} value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Merhaba, talebinizi inceledik…" />
          <div className="flex justify-end mt-2">
            <Button onClick={sendReply} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Yanıtı gönder
            </Button>
          </div>

          {replies.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Gönderilen yanıtlar</div>
              {replies.map((r) => (
                <div key={r.id} className="border border-border rounded-md p-3 bg-muted/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(r.created_at).toLocaleString("tr-TR")} → {r.to_email}</span>
                    <span className={cn("px-1.5 py-0.5 rounded",
                      r.status === "sent" ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600")}>
                      {r.status === "sent" ? "Gönderildi" : "Hata"}
                    </span>
                  </div>
                  {r.subject && <div className="text-sm font-medium mt-1">{r.subject}</div>}
                  <pre className="whitespace-pre-wrap font-sans text-[13px] mt-1">{r.body}</pre>
                  {r.error_message && <div className="text-[11px] text-rose-500 mt-1">{r.error_message}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wide text-muted-foreground">
      {icon}<span>{title}</span>
    </div>
  );
}

export default AdminRequests;