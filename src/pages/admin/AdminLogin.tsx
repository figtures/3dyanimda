import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase, backendConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useTenant } from "@/contexts/TenantContext";
import { Helmet } from "react-helmet-async";
import "./admin-login.css";

export default function AdminLogin() {
  const { session, isAdmin, loading } = useAdminAuth();
  const { tenant } = useTenant();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setError(""); }, [tenant?.id]);
  if (session && isAdmin && !loading) return <Navigate to="/admin" replace />;
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if(busy || !backendConfigured) return;
    setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email:email.trim(), password });
      if(error) setError(error.status===429 ? "Çok fazla deneme yapıldı. Biraz sonra yeniden deneyin." : "Giriş tamamlanamadı. E-posta ve şifrenizi kontrol edin.");
    } catch { setError("Bağlantı kurulamadı. Lütfen yeniden deneyin."); }
    finally { setBusy(false); }
  }
  return <main className="brand-admin-login">
    <Helmet><title>{tenant?.name} | Yönetim girişi</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <aside className="admin-login-intro">
      <Link to="/" className="admin-login-brand">{tenant?.name}<ArrowUpRight size={22}/></Link>
      <div><p className="admin-login-kicker">MARKA YÖNETİMİ</p><h1>Üretimin arkasındaki<br/>kontrol alanı.</h1><p>İçerikleri, teklif taleplerini ve işletme ayarlarını tek yerden yönetin.</p></div>
      <span className="admin-login-foot"><ShieldCheck size={18}/> {tenant?.name} çalışma alanı</span>
    </aside>
    <section className="admin-login-panel" aria-label="Yönetici girişi">
      <div className="admin-login-form">
        <p className="admin-login-kicker">{tenant?.name}</p><h2>Tekrar hoş geldiniz.</h2>
        <p className="admin-login-description">Bu markada yetkilendirilmiş hesabınızla devam edin.</p>
        {!backendConfigured && <p className="admin-login-notice" role="status">Bu tasarım önizlemesinde gerçek hesap girişi kapalıdır.</p>}
        {session && !isAdmin && !loading ? <div role="alert" className="admin-login-notice"><p>Bu hesabın {tenant?.name} yönetim alanına erişim yetkisi yok.</p><Button variant="outline" onClick={async()=>{await supabase.auth.signOut();setPassword("");}}>Farklı hesapla giriş yap</Button></div> :
        <form onSubmit={onSubmit} className="space-y-5" aria-busy={busy || loading}>
          <div className="space-y-2"><Label htmlFor="admin-email">E-posta adresi</Label><Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></div>
          <div className="space-y-2"><Label htmlFor="admin-password">Şifre</Label><div className="admin-password-field"><Input id="admin-password" type={visible?"text":"password"} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/><button type="button" aria-label={visible?"Şifreyi gizle":"Şifreyi göster"} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy || loading || !backendConfigured} className="w-full h-12">{busy || loading?<><Loader2 className="h-4 w-4 animate-spin"/> Kontrol ediliyor…</>:<>Yönetim paneline gir <ArrowUpRight size={17}/></>}</Button>
        </form>}
        <Link to="/" className="admin-login-back">Siteye geri dön <ArrowUpRight size={15}/></Link>
      </div>
    </section>
  </main>;
}
