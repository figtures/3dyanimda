import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTenantId, onTenantChange } from "@/lib/tenant";
import { useTenant } from "@/contexts/TenantContext";

export const NewsletterSignup = ({ source = "footer" }: { source?: string }) => {
  const { t } = useTranslation();
  const { tenant, loading: tenantLoading } = useTenant();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [tid, setTid] = useState<string | null>(() => getTenantId());

  useEffect(() => {
    if (tenant?.id) setTid(tenant.id);
    const off = onTenantChange((id) => setTid(id));
    return () => { off(); };
  }, [tenant?.id]);

  const waitForTenant = async (): Promise<string | null> => {
    const existing = getTenantId();
    if (existing) return existing;
    return new Promise((resolve) => {
      const timer = setTimeout(() => { off(); resolve(getTenantId()); }, 4000);
      const off = onTenantChange((id) => {
        if (id) { clearTimeout(timer); off(); resolve(id); }
      });
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("newsletter.invalid", "Geçerli bir e-posta giriniz."));
      return;
    }
    setLoading(true);
    const resolvedTid = await waitForTenant();
    if (!resolvedTid) {
      setLoading(false);
      toast.error(t("newsletter.retry", "Lütfen birkaç saniye sonra tekrar deneyin."));
      return;
    }
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ tenant_id: resolvedTid, email: email.trim().toLowerCase(), source });
    setLoading(false);
    if (error && !/duplicate|unique/i.test(error.message)) {
      toast.error(error.message);
      return;
    }
    setOk(true);
    setEmail("");
    toast.success(t("newsletter.ok", "Teşekkürler! Aboneliğiniz alındı."));
    // Fire-and-forget welcome email via Resend
    supabase.functions
      .invoke("send-email", {
        body: {
          to: email.trim().toLowerCase(),
          templateKey: "newsletter_welcome",
          tenantId: resolvedTid,
          locale: "tr",
          variables: { email: email.trim().toLowerCase(), source },
        },
      })
      .catch(() => { /* non-blocking */ });
  };

  if (ok) {
    return (
      <p className="text-sm text-cream/80">{t("newsletter.thanks", "Listemize eklendiniz. Yenilikleri kaçırmayacaksınız.")}</p>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("newsletter.placeholder", "E-posta adresiniz")}
        className="flex-1 bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={loading || (tenantLoading && !tid)}
        className="bg-gold text-primary px-3 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span className="hidden sm:inline">{t("newsletter.subscribe", "Abone Ol")}</span>
      </button>
    </form>
  );
};