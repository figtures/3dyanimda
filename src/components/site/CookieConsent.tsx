import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "3dy_cookie_consent_v1";

type Consent = {
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const applyConsent = (c: Consent) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => window.dataLayer!.push(args);
  gtag("consent", "update", {
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
    analytics_storage: c.analytics ? "granted" : "denied",
  });
};

export const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setOpen(true);
        return;
      }
      const c = JSON.parse(raw) as Consent;
      applyConsent(c);
    } catch {
      setOpen(true);
    }
  }, []);

  const save = (c: Omit<Consent, "ts">) => {
    const final: Consent = { ...c, ts: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
    } catch {
      /* ignore */
    }
    applyConsent(final);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5 pointer-events-none">
      <div className="mx-auto max-w-3xl pointer-events-auto rounded-2xl bg-card border border-border shadow-[0_30px_80px_-20px_hsl(222_60%_14%/0.35)] overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="hidden sm:flex h-10 w-10 shrink-0 rounded-full bg-accent-blue-soft items-center justify-center">
              <Cookie className="h-5 w-5 text-accent-blue" />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-[15px] font-semibold text-foreground">
                Çerez Tercihleri
              </h3>
              <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                Sitenin çalışması için zorunlu çerezler dışında, deneyimi iyileştirmek ve trafiği analiz
                etmek için çerezler kullanıyoruz. 6698 sayılı KVKK kapsamında tercihlerinizi siz belirlersiniz.{" "}
                <Link to="/cerez-politikasi" className="text-accent-blue underline underline-offset-2">
                  Detaylı bilgi
                </Link>
                .
              </p>

              {settings && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <Row
                    title="Zorunlu çerezler"
                    desc="Oturum, güvenlik ve form gönderimi için gerekli. Devre dışı bırakılamaz."
                    checked
                    disabled
                  />
                  <Row
                    title="Analitik çerezler"
                    desc="Google Analytics 4 — anonim ziyaret istatistikleri."
                    checked={analytics}
                    onChange={setAnalytics}
                  />
                  <Row
                    title="Pazarlama çerezleri"
                    desc="Reklam ve yeniden hedefleme. Şu anda kullanılmıyor."
                    checked={marketing}
                    onChange={setMarketing}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => save({ analytics: false, marketing: false })}
              className="text-muted-foreground hover:text-foreground transition-colors -mr-1 -mt-1 p-1 rounded-full"
              aria-label="Reddet ve kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-5 sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setSettings((v) => !v)}
            >
              {settings ? "Gizle" : "Ayarlar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => save({ analytics: false, marketing: false })}
            >
              Reddet
            </Button>
            {settings ? (
              <Button
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary-glow"
                onClick={() => save({ analytics, marketing })}
              >
                Tercihleri Kaydet
              </Button>
            ) : (
              <Button
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary-glow"
                onClick={() => save({ analytics: true, marketing: false })}
              >
                Tümünü Kabul Et
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </div>
);