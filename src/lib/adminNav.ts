import { ComponentType } from "react";
import {
  LayoutDashboard, FileText, Calculator, Inbox, ShieldCheck, Tag, Languages, Settings,
  Image as ImageIcon, Users, HelpCircle, Quote, Home, LayoutGrid, Contact, Briefcase,
  Search, Scale, Wrench, Mail, MessageSquare, Menu as MenuIcon, Megaphone, Send,
  ArrowRightLeft, History, KeyRound, Palette, FileStack, Database, Route,
} from "lucide-react";

export type AdminNavItem = {
  to: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  perm?: string;
  feature?: string;
  end?: boolean;
  superAdminOnly?: boolean;
  badgeKey?: "quotes" | "messages" | "apps" | "ops";
};

export type AdminNavGroup = {
  key: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_DASHBOARD: AdminNavItem = {
  to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true,
  description: "Genel bakış ve KPI'lar",
};

export const ADMIN_NAV: AdminNavGroup[] = [
  { key: "inbox", label: "Gelen Kutusu", items: [
    { to: "/admin/requests", label: "Teklif Talepleri", description: "Yeni teklif başvuruları", icon: Inbox, perm: "quotes.view", feature: "admin.requests", badgeKey: "quotes" },
    { to: "/admin/messages", label: "Mesajlar", description: "İletişim formundan gelen mesajlar", icon: MessageSquare, perm: "messages.view", feature: "admin.messages", badgeKey: "messages" },
    { to: "/admin/applications", label: "İş Başvuruları", description: "Açık pozisyonlara başvurular", icon: Briefcase, perm: "applications.view", feature: "admin.applications", badgeKey: "apps" },
    { to: "/admin/machine-ops", label: "Makine Talepleri", description: "Saatlik makine kiralama", icon: Wrench, perm: "machine_ops.view", feature: "admin.machine_ops", badgeKey: "ops" },
    { to: "/admin/subscribers", label: "Bülten Aboneleri", description: "E-posta listesi", icon: Send, perm: "newsletter.view", feature: "admin.subscribers" },
  ]},
  { key: "content", label: "İçerik", items: [
    { to: "/admin/homepage", label: "Ana Sayfa", description: "Hero ve bölüm metinleri", icon: Home, perm: "homepage.edit", feature: "admin.homepage" },
    { to: "/admin/pages", label: "Sayfalar", description: "Hizmet, çözüm ve diğer sayfalar (blok editörü)", icon: FileStack },
    { to: "/admin/collections", label: "Koleksiyonlar", description: "Lokasyon, sektör vb. tekrarlanabilir içerik tipleri", icon: Database },
    { to: "/admin/routes", label: "Dinamik Rotalar", description: "URL desenlerini şablonlara bağlayın", icon: Route },
    { to: "/admin/services-cards", label: "Hizmet Kartları", description: "Ana sayfa hizmet kartları", icon: LayoutGrid, perm: "services.edit", feature: "admin.services_cards" },
    { to: "/admin/portfolio", label: "Portfolyo", description: "Tamamlanan projeler", icon: Briefcase, perm: "portfolio.view", feature: "admin.portfolio" },
    { to: "/admin/blog", label: "Blog", description: "Yazılar ve içerik", icon: FileText, perm: "blog.view", feature: "admin.blog" },
    { to: "/admin/faq", label: "SSS", description: "Sıkça sorulan sorular", icon: HelpCircle, perm: "faq.edit", feature: "admin.faq" },
    { to: "/admin/testimonials", label: "Referanslar", description: "Müşteri yorumları", icon: Quote, perm: "testimonials.edit", feature: "admin.testimonials" },
    { to: "/admin/media", label: "Görsel Kütüphanesi", description: "Tüm medya varlıkları", icon: ImageIcon, perm: "media.view", feature: "admin.media" },
  ]},
  { key: "site", label: "Site Yapısı", items: [
    { to: "/admin/navigation", label: "Navigasyon", description: "Üst menü ve alt menü", icon: MenuIcon, perm: "navigation.edit", feature: "admin.navigation" },
    { to: "/admin/announcements", label: "Duyuru Çubuğu", description: "Üst banner", icon: Megaphone, perm: "announcements.edit", feature: "admin.announcements" },
    { to: "/admin/contact-info", label: "İletişim & Sosyal", description: "Telefon, adres, sosyal hesaplar", icon: Contact, perm: "contact_info.edit", feature: "admin.contact_info" },
    { to: "/admin/content", label: "İçerik & Bölgeler", description: "Hizmetler ve yerel sayfalar; yayın kalite kontrolü", icon: Search, perm: "seo.edit" },
    { to: "/admin/seo", label: "SEO / Meta", description: "Sayfa bazlı SEO ayarları", icon: Search, perm: "seo.edit", feature: "admin.seo" },
    { to: "/admin/redirects", label: "Yönlendirmeler", description: "URL redirect kuralları", icon: ArrowRightLeft, perm: "redirects.edit", feature: "admin.redirects" },
    { to: "/admin/legal", label: "Yasal Belgeler", description: "KVKK, çerez, şartlar", icon: Scale, perm: "legal.edit", feature: "admin.legal" },
  ]},
  { key: "sales", label: "Satış", items: [
    { to: "/admin/pricing", label: "Fiyatlandırma", description: "Malzeme ve fiyat motoru", icon: Calculator, perm: "pricing.edit", feature: "admin.pricing" },
    { to: "/admin/campaigns", label: "Kampanyalar", description: "İndirim ve promosyon", icon: Tag, perm: "campaigns.edit", feature: "admin.campaigns" },
  ]},
  { key: "career", label: "Kariyer", items: [
    { to: "/admin/jobs", label: "Açık Pozisyonlar", description: "İş ilanları", icon: Briefcase, perm: "jobs.edit", feature: "admin.jobs" },
  ]},
  { key: "appearance", label: "Görünüm", items: [
    { to: "/admin/theme", label: "Tema", description: "Renk, font, layout", icon: Palette, perm: "settings.theme" },
    { to: "/admin/settings", label: "Logo & Ayarlar", description: "Marka ve genel ayarlar", icon: Settings, perm: "settings.edit" },
    { to: "/admin/translations", label: "Çeviriler", description: "TR / EN site metinleri", icon: Languages, perm: "translations.edit", feature: "admin.translations" },
    { to: "/admin/email-templates", label: "E-posta Şablonları", description: "Otomatik e-postalar", icon: Mail, perm: "email_templates.edit", feature: "admin.email_templates" },
  ]},
  { key: "system", label: "Sistem", items: [
    { to: "/admin/team", label: "Ekip", description: "Tenant kullanıcıları", icon: Users, perm: "users.view" },
    { to: "/admin/roles", label: "Roller & İzinler", description: "Yetki yönetimi", icon: KeyRound, perm: "roles.view" },
    { to: "/admin/audit-log", label: "Audit Log", description: "Sistem aktivite kaydı", icon: History, perm: "audit.view", feature: "admin.audit_log" },
    { to: "/admin/users", label: "Sistem Kullanıcıları", description: "Super admin yönetimi", icon: ShieldCheck, superAdminOnly: true },
  ]},
];

export function findNavItem(path: string): AdminNavItem | null {
  if (path === "/admin" || path === "/admin/") return ADMIN_DASHBOARD;
  for (const g of ADMIN_NAV) {
    for (const i of g.items) {
      if (path === i.to || path.startsWith(i.to + "/")) return i;
    }
  }
  return null;
}

export function findGroupForPath(path: string): AdminNavGroup | null {
  for (const g of ADMIN_NAV) {
    if (g.items.some((i) => path === i.to || path.startsWith(i.to + "/"))) return g;
  }
  return null;
}