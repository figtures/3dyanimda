import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowUpRight, Loader2, ShieldCheck } from "lucide-react";
import { supabase, backendConfigured } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./admin-login.css";

export default function AdminResetPassword() {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(backendConfigured);
  const [account, setAccount] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(() => new URLSearchParams(window.location.hash.slice(1)).has("error") ? "Bağlantı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyin." : "");
  const submitting = useRef(false);
  useEffect(() => {
    if (!backendConfigured) return;
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) { setAccount(session?.user.email || null); setLoading(false); }
    });
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setAccount(data.session?.user.email || null);
      if (sessionError) setError("Bağlantı doğrulanamadı. Yeni bir bağlantı isteyin.");
      setLoading(false);
    }).catch(() => { if (active) { setError("Bağlantı kurulamadı. Lütfen yeniden deneyin."); setLoading(false); } });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  async function requestLink(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current || !backendConfigured) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: new URL("/admin/reset-password", window.location.origin).href,
      });
      if (requestError) throw requestError;
      setSent(true);
    } catch { setError("E-posta gönderilemedi. Biraz sonra yeniden deneyin veya yöneticiyle iletişime geçin."); }
    finally { submitting.current = false; setBusy(false); }
  }
  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current || !account || !backendConfigured) return;
    setError("");
    if (password.length < 12) { setError("En az 12 karakterlik bir şifre belirleyin."); return; }
    if (password !== confirmation) { setError("Şifreler eşleşmiyor."); return; }
    submitting.current = true; setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword(""); setConfirmation(""); setDone(true);
      // Revoke refresh sessions after a successful password update.
      try {
        const { error: signOutError } = await supabase.auth.signOut({ scope: "global" });
        if (signOutError) throw signOutError;
      } catch { setError("Şifreniz kaydedildi; diğer oturumlar kapatılamadı. Yöneticiyle iletişime geçin."); }
    } catch { setError("Şifre güncellenemedi. Daha güçlü bir şifre deneyin; bağlantı süresi dolduysa yeni bağlantı isteyin."); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <main className="brand-admin-login">
    <Helmet><title>Şifre belirleme | {tenant?.name}</title><meta name="robots" content="noindex,nofollow"/><meta name="referrer" content="no-referrer"/></Helmet>
    <aside className="admin-login-intro">
      <Link to="/" className="admin-login-brand">{tenant?.name}<ArrowUpRight size={22}/></Link>
      <div><p className="admin-login-kicker">HESAP ERİŞİMİ</p><h1>Yönetim hesabına<br/>güvenle dön.</h1><p>Şifreni yalnızca bu ekranda belirle. E-posta bağlantını veya şifreni paylaşmana gerek yok.</p></div>
      <span className="admin-login-foot"><ShieldCheck size={18}/> Güvenli şifre belirleme</span>
    </aside>
    <section className="admin-login-panel" aria-label="Şifre belirleme">
      <div className="admin-login-form">
        <h2>{done ? "Şifren kaydedildi." : account ? "Yeni şifreni belirle." : "Şifre bağlantısı iste."}</h2>
        {loading ? <p role="status"><Loader2 className="inline animate-spin mr-2"/> Bağlantı doğrulanıyor…</p> : done ? <p role="status" className="admin-login-description">Yeni şifrenle yönetim paneline giriş yapabilirsin.</p> : account ? <>
          <p className="admin-login-description">{account} hesabının şifresini değiştiriyorsun.</p>
          <form onSubmit={savePassword} className="space-y-5" aria-busy={busy}>
            <div><Label htmlFor="new-password">Yeni şifre</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/></div>
            <div><Label htmlFor="confirm-password">Yeni şifre tekrar</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={e=>setConfirmation(e.target.value)} disabled={busy}/></div>
            <p className="text-sm">En az 12 karakter kullan.</p>
            <Button type="submit" className="w-full h-12" disabled={busy}>{busy ? "Kaydediliyor…" : "Şifreyi kaydet"}</Button>
          </form>
        </> : sent ? <p role="status" className="admin-login-notice">Bu adrese bağlı bir hesap varsa şifre bağlantısı gönderilir. Gelen kutunu ve spam klasörünü kontrol et.</p> : <>
          <p className="admin-login-description">Yönetici hesabının e-posta adresini yaz. Şifreni belirleyebilmen için bağlantı gönderelim.</p>
          <form onSubmit={requestLink} className="space-y-5" aria-busy={busy}>
            <div><Label htmlFor="recovery-email">E-posta adresi</Label><Input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></div>
            <Button type="submit" className="w-full h-12" disabled={busy || !backendConfigured}>{busy ? "Gönderiliyor…" : "Şifre bağlantısı gönder"}</Button>
          </form>
        </>}
        {error && <p role="alert" className="admin-login-notice mt-4">{error}</p>}
        {!backendConfigured && <p className="admin-login-notice">Bu önizlemede hesap işlemleri kapalıdır.</p>}
        <Link to="/admin/login" className="admin-login-back">Yönetici girişine dön <ArrowUpRight size={15}/></Link>
      </div>
    </section>
  </main>;
}
