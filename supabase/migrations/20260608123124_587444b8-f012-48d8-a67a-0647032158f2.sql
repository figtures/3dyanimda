
-- ============ FEATURES (master list) ============
CREATE TABLE public.features (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'module',
  parent_key text REFERENCES public.features(key) ON DELETE CASCADE,
  default_enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.features TO anon, authenticated;
GRANT ALL ON public.features TO service_role;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "features readable" ON public.features FOR SELECT USING (true);
CREATE POLICY "super admins manage features" ON public.features
  USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE TRIGGER trg_features_updated_at BEFORE UPDATE ON public.features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TENANT_FEATURES ============
CREATE TABLE public.tenant_features (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key text NOT NULL REFERENCES public.features(key) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, feature_key)
);
GRANT SELECT ON public.tenant_features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tenant_features TO authenticated;
GRANT ALL ON public.tenant_features TO service_role;
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_features readable" ON public.tenant_features FOR SELECT USING (true);
CREATE POLICY "owner manage tenant_features" ON public.tenant_features
  USING (tenant_user_has_permission(tenant_id, 'settings.features'))
  WITH CHECK (tenant_user_has_permission(tenant_id, 'settings.features'));
CREATE POLICY "super admins manage tenant_features" ON public.tenant_features
  USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE TRIGGER trg_tf_updated_at BEFORE UPDATE ON public.tenant_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ THEMES (preset library) ============
CREATE TABLE public.themes (
  slug text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  typography jsonb NOT NULL DEFAULT '{}'::jsonb,
  layout_variant text NOT NULL DEFAULT 'classic',
  component_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_image text,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.themes TO anon, authenticated;
GRANT ALL ON public.themes TO service_role;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "themes readable" ON public.themes FOR SELECT USING (true);
CREATE POLICY "super admins manage themes" ON public.themes
  USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE TRIGGER trg_themes_updated_at BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TENANT_THEMES ============
CREATE TABLE public.tenant_themes (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  theme_slug text NOT NULL REFERENCES public.themes(slug) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, theme_slug)
);
GRANT SELECT ON public.tenant_themes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tenant_themes TO authenticated;
GRANT ALL ON public.tenant_themes TO service_role;
ALTER TABLE public.tenant_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_themes readable" ON public.tenant_themes FOR SELECT USING (true);
CREATE POLICY "owner manage tenant_themes" ON public.tenant_themes
  USING (tenant_user_has_permission(tenant_id, 'settings.theme'))
  WITH CHECK (tenant_user_has_permission(tenant_id, 'settings.theme'));
CREATE POLICY "super admins manage tenant_themes" ON public.tenant_themes
  USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ============ SEED FEATURES ============
INSERT INTO public.features (key, label, category, parent_key, default_enabled, sort_order) VALUES
  ('blog', 'Blog', 'module', NULL, true, 10),
  ('blog.comments', 'Blog Yorumları', 'sub', 'blog', false, 11),
  ('portfolio', 'Portfolyo', 'module', NULL, true, 20),
  ('quote', 'Teklif Sistemi', 'module', NULL, true, 30),
  ('quote.stl_upload', 'STL Yükleme', 'sub', 'quote', true, 31),
  ('career', 'Kariyer', 'module', NULL, true, 40),
  ('career.machine_ops', 'Makine Operatörü Talebi', 'sub', 'career', true, 41),
  ('newsletter', 'Bülten', 'module', NULL, true, 50),
  ('announcements', 'Duyuru Çubuğu', 'module', NULL, true, 60),
  ('testimonials', 'Referanslar', 'module', NULL, true, 70),
  ('faq', 'SSS', 'module', NULL, true, 80),
  ('legal', 'Yasal Belgeler', 'module', NULL, true, 90),
  ('multilang', 'Çoklu Dil', 'module', NULL, false, 100),
  ('seo_overrides', 'SEO Override', 'module', NULL, true, 110),
  ('audit_log', 'Audit Log', 'module', NULL, true, 120),
  ('redirects', 'URL Yönlendirme', 'module', NULL, true, 130),
  ('admin.blog', 'Admin: Blog Sayfası', 'admin_page', NULL, true, 200),
  ('admin.portfolio', 'Admin: Portfolyo', 'admin_page', NULL, true, 201),
  ('admin.requests', 'Admin: Teklif Talepleri', 'admin_page', NULL, true, 202),
  ('admin.messages', 'Admin: Mesajlar', 'admin_page', NULL, true, 203),
  ('admin.applications', 'Admin: Başvurular', 'admin_page', NULL, true, 204),
  ('admin.machine_ops', 'Admin: Makine Talepleri', 'admin_page', NULL, true, 205),
  ('admin.jobs', 'Admin: Pozisyonlar', 'admin_page', NULL, true, 206),
  ('admin.homepage', 'Admin: Ana Sayfa', 'admin_page', NULL, true, 207),
  ('admin.services_cards', 'Admin: Hizmet Kartları', 'admin_page', NULL, true, 208),
  ('admin.contact_info', 'Admin: İletişim Bilgisi', 'admin_page', NULL, true, 209),
  ('admin.navigation', 'Admin: Navigasyon', 'admin_page', NULL, true, 210),
  ('admin.announcements', 'Admin: Duyurular', 'admin_page', NULL, true, 211),
  ('admin.subscribers', 'Admin: Bülten Aboneleri', 'admin_page', NULL, true, 212),
  ('admin.redirects', 'Admin: Yönlendirmeler', 'admin_page', NULL, true, 213),
  ('admin.faq', 'Admin: SSS', 'admin_page', NULL, true, 214),
  ('admin.testimonials', 'Admin: Referanslar', 'admin_page', NULL, true, 215),
  ('admin.media', 'Admin: Medya', 'admin_page', NULL, true, 216),
  ('admin.users', 'Admin: Kullanıcılar', 'admin_page', NULL, true, 217),
  ('admin.seo', 'Admin: SEO', 'admin_page', NULL, true, 218),
  ('admin.legal', 'Admin: Yasal', 'admin_page', NULL, true, 219),
  ('admin.email_templates', 'Admin: E-posta Şablonları', 'admin_page', NULL, true, 220),
  ('admin.translations', 'Admin: Çeviriler', 'admin_page', NULL, true, 221),
  ('admin.pricing', 'Admin: Fiyatlandırma', 'admin_page', NULL, true, 222),
  ('admin.campaigns', 'Admin: Kampanyalar', 'admin_page', NULL, true, 223),
  ('admin.audit_log', 'Admin: Audit Log', 'admin_page', NULL, true, 224)
ON CONFLICT (key) DO NOTHING;

-- ============ SEED 5 THEMES (presets — full token sets filled in Phase 4) ============
INSERT INTO public.themes (slug, name, description, tokens, typography, layout_variant) VALUES
  ('premium-studio', 'Premium Studio', 'Cream/blue/gold — mevcut zarif tema', '{"background":"35 25% 96%","foreground":"220 15% 18%","primary":"215 65% 32%","accent":"42 65% 52%","radius":"0.5rem"}'::jsonb, '{"heading":"Playfair Display","body":"Inter"}'::jsonb, 'classic'),
  ('bold-industrial', 'Bold Industrial', 'Siyah/turuncu, brutalist, kalın tipo', '{"background":"0 0% 8%","foreground":"0 0% 96%","primary":"22 92% 55%","accent":"22 92% 55%","radius":"0rem"}'::jsonb, '{"heading":"Archivo Black","body":"Inter"}'::jsonb, 'brutalist'),
  ('soft-wellness', 'Soft Wellness', 'Sage/cream, yumuşak organik', '{"background":"40 30% 96%","foreground":"150 20% 20%","primary":"150 30% 40%","accent":"30 40% 70%","radius":"1rem"}'::jsonb, '{"heading":"Fraunces","body":"DM Sans"}'::jsonb, 'organic'),
  ('tech-minimal', 'Tech Minimal', 'Beyaz/electric blue, swiss, ince', '{"background":"0 0% 100%","foreground":"220 15% 12%","primary":"220 95% 55%","accent":"220 95% 55%","radius":"0.25rem"}'::jsonb, '{"heading":"Space Grotesk","body":"Inter"}'::jsonb, 'swiss'),
  ('luxury-noir', 'Luxury Noir', 'Siyah/altın, serif, magazine', '{"background":"0 0% 6%","foreground":"40 30% 92%","primary":"42 75% 58%","accent":"42 75% 58%","radius":"0rem"}'::jsonb, '{"heading":"Cormorant Garamond","body":"Inter"}'::jsonb, 'magazine')
ON CONFLICT (slug) DO NOTHING;

-- Assign all themes to demo tenant by default + premium-studio as active
INSERT INTO public.tenant_themes (tenant_id, theme_slug)
SELECT t.id, th.slug FROM public.tenants t CROSS JOIN public.themes th
WHERE t.slug = 'demo'
ON CONFLICT DO NOTHING;

UPDATE public.tenants SET active_theme_slug = 'premium-studio' WHERE slug = 'demo' AND active_theme_slug IS NULL;
