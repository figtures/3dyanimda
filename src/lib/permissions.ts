// Central permission registry. Keys are stored in tenant_roles.permissions[]
// and tenant_users.extra_permissions[]. Wildcards: "*" = all, "scope.*" = all in scope.

export type PermissionDef = {
  key: string;
  label: string;
  description?: string;
};

export type PermissionGroup = {
  scope: string;
  label: string;
  permissions: PermissionDef[];
  /** admin route this scope unlocks (used for sidebar/route guards) */
  adminPath?: string;
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    scope: "blog",
    label: "Blog",
    adminPath: "/admin/blog",
    permissions: [
      { key: "blog.view", label: "Görüntüle" },
      { key: "blog.edit", label: "Oluştur / Düzenle" },
      { key: "blog.delete", label: "Sil" },
    ],
  },
  {
    scope: "portfolio",
    label: "Portfolyo",
    adminPath: "/admin/portfolio",
    permissions: [
      { key: "portfolio.view", label: "Görüntüle" },
      { key: "portfolio.edit", label: "Oluştur / Düzenle" },
      { key: "portfolio.delete", label: "Sil" },
    ],
  },
  {
    scope: "quotes",
    label: "Teklif Talepleri",
    adminPath: "/admin/requests",
    permissions: [
      { key: "quotes.view", label: "Görüntüle" },
      { key: "quotes.edit", label: "Yanıtla / Düzenle" },
      { key: "quotes.delete", label: "Sil" },
    ],
  },
  {
    scope: "messages",
    label: "Mesajlar",
    adminPath: "/admin/messages",
    permissions: [
      { key: "messages.view", label: "Görüntüle" },
      { key: "messages.edit", label: "Yanıtla" },
      { key: "messages.delete", label: "Sil" },
    ],
  },
  {
    scope: "applications",
    label: "İş Başvuruları",
    adminPath: "/admin/applications",
    permissions: [
      { key: "applications.view", label: "Görüntüle" },
      { key: "applications.edit", label: "Düzenle" },
      { key: "applications.delete", label: "Sil" },
    ],
  },
  {
    scope: "machine_ops",
    label: "Makine İşletim Talepleri",
    adminPath: "/admin/machine-ops",
    permissions: [
      { key: "machine_ops.view", label: "Görüntüle" },
      { key: "machine_ops.edit", label: "Düzenle" },
      { key: "machine_ops.delete", label: "Sil" },
    ],
  },
  {
    scope: "jobs",
    label: "Pozisyonlar",
    adminPath: "/admin/jobs",
    permissions: [{ key: "jobs.edit", label: "Yönet" }],
  },
  {
    scope: "homepage",
    label: "Ana Sayfa",
    adminPath: "/admin/homepage",
    permissions: [{ key: "homepage.edit", label: "Düzenle" }],
  },
  {
    scope: "services",
    label: "Hizmet Kartları",
    adminPath: "/admin/services-cards",
    permissions: [{ key: "services.edit", label: "Düzenle" }],
  },
  {
    scope: "contact_info",
    label: "İletişim & Sosyal",
    adminPath: "/admin/contact-info",
    permissions: [{ key: "contact_info.edit", label: "Düzenle" }],
  },
  {
    scope: "navigation",
    label: "Navigasyon",
    adminPath: "/admin/navigation",
    permissions: [{ key: "navigation.edit", label: "Düzenle" }],
  },
  {
    scope: "announcements",
    label: "Duyuru Çubuğu",
    adminPath: "/admin/announcements",
    permissions: [{ key: "announcements.edit", label: "Düzenle" }],
  },
  {
    scope: "newsletter",
    label: "Bülten Aboneleri",
    adminPath: "/admin/subscribers",
    permissions: [
      { key: "newsletter.view", label: "Görüntüle" },
      { key: "newsletter.edit", label: "Yönet" },
    ],
  },
  {
    scope: "redirects",
    label: "URL Yönlendirmeleri",
    adminPath: "/admin/redirects",
    permissions: [{ key: "redirects.edit", label: "Yönet" }],
  },
  {
    scope: "faq",
    label: "SSS",
    adminPath: "/admin/faq",
    permissions: [{ key: "faq.edit", label: "Düzenle" }],
  },
  {
    scope: "testimonials",
    label: "Referanslar",
    adminPath: "/admin/testimonials",
    permissions: [{ key: "testimonials.edit", label: "Düzenle" }],
  },
  {
    scope: "media",
    label: "Görsel Kütüphane",
    adminPath: "/admin/media",
    permissions: [
      { key: "media.view", label: "Görüntüle" },
      { key: "media.upload", label: "Yükle / Sil" },
    ],
  },
  {
    scope: "seo",
    label: "SEO / Meta",
    adminPath: "/admin/seo",
    permissions: [{ key: "seo.edit", label: "Düzenle" }],
  },
  {
    scope: "legal",
    label: "Yasal Belgeler",
    adminPath: "/admin/legal",
    permissions: [{ key: "legal.edit", label: "Düzenle" }],
  },
  {
    scope: "email_templates",
    label: "E-posta Şablonları",
    adminPath: "/admin/email-templates",
    permissions: [{ key: "email_templates.edit", label: "Düzenle" }],
  },
  {
    scope: "translations",
    label: "Çeviriler",
    adminPath: "/admin/translations",
    permissions: [{ key: "translations.edit", label: "Düzenle" }],
  },
  {
    scope: "pricing",
    label: "Fiyatlandırma",
    adminPath: "/admin/pricing",
    permissions: [{ key: "pricing.edit", label: "Düzenle" }],
  },
  {
    scope: "campaigns",
    label: "Kampanyalar",
    adminPath: "/admin/campaigns",
    permissions: [{ key: "campaigns.edit", label: "Düzenle" }],
  },
  {
    scope: "audit",
    label: "Audit Log",
    adminPath: "/admin/audit-log",
    permissions: [{ key: "audit.view", label: "Görüntüle" }],
  },
  {
    scope: "users",
    label: "Ekip & Davetler",
    adminPath: "/admin/team",
    permissions: [
      { key: "users.view", label: "Ekibi görüntüle" },
      { key: "users.invite", label: "Davet et / rol ata" },
      { key: "users.remove", label: "Üyelik kaldır" },
    ],
  },
  {
    scope: "roles",
    label: "Roller",
    adminPath: "/admin/roles",
    permissions: [
      { key: "roles.view", label: "Görüntüle" },
      { key: "roles.edit", label: "Oluştur / Düzenle" },
    ],
  },
  {
    scope: "settings",
    label: "Genel Ayarlar",
    adminPath: "/admin/settings",
    permissions: [
      { key: "settings.edit", label: "Site ayarları" },
      { key: "settings.theme", label: "Tema değiştir" },
      { key: "settings.features", label: "Özellik bayrakları" },
    ],
  },
];

export const ALL_PERMISSIONS: PermissionDef[] = PERMISSION_GROUPS.flatMap((g) => g.permissions);

/** Map admin path -> required permission to access it */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = Object.fromEntries(
  PERMISSION_GROUPS.filter((g) => g.adminPath).flatMap((g) => {
    const viewPerm = g.permissions.find((p) => p.key.endsWith(".view")) ?? g.permissions[0];
    return [[g.adminPath!, viewPerm.key]];
  }),
);

export const ROLE_TEMPLATES = ["owner", "manager", "editor", "viewer"] as const;
export type RoleTemplate = (typeof ROLE_TEMPLATES)[number];