
-- ============== theme_palettes ==============
CREATE TABLE public.theme_palettes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_image text,
  is_system boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.theme_palettes TO anon, authenticated;
GRANT ALL ON public.theme_palettes TO service_role;
ALTER TABLE public.theme_palettes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "palettes readable by all" ON public.theme_palettes FOR SELECT USING (true);
CREATE POLICY "palettes managed by super_admin" ON public.theme_palettes FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_theme_palettes_updated_at BEFORE UPDATE ON public.theme_palettes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== theme_typographies ==============
CREATE TABLE public.theme_typographies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  heading_font text NOT NULL,
  body_font text NOT NULL,
  mono_font text,
  google_fonts_url text,
  scale jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.theme_typographies TO anon, authenticated;
GRANT ALL ON public.theme_typographies TO service_role;
ALTER TABLE public.theme_typographies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "typo readable by all" ON public.theme_typographies FOR SELECT USING (true);
CREATE POLICY "typo managed by super_admin" ON public.theme_typographies FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_theme_typographies_updated_at BEFORE UPDATE ON public.theme_typographies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== theme_layouts ==============
CREATE TABLE public.theme_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  hero_variant text NOT NULL DEFAULT 'standard',
  nav_variant text NOT NULL DEFAULT 'standard',
  card_variant text NOT NULL DEFAULT 'standard',
  section_density text NOT NULL DEFAULT 'comfortable',
  motion_intensity text NOT NULL DEFAULT 'medium',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_image text,
  is_system boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.theme_layouts TO anon, authenticated;
GRANT ALL ON public.theme_layouts TO service_role;
ALTER TABLE public.theme_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "layouts readable by all" ON public.theme_layouts FOR SELECT USING (true);
CREATE POLICY "layouts managed by super_admin" ON public.theme_layouts FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_theme_layouts_updated_at BEFORE UPDATE ON public.theme_layouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== tenant_theme_config ==============
CREATE TABLE public.tenant_theme_config (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  palette_slug text REFERENCES public.theme_palettes(slug) ON DELETE SET NULL,
  typography_slug text REFERENCES public.theme_typographies(slug) ON DELETE SET NULL,
  layout_slug text REFERENCES public.theme_layouts(slug) ON DELETE SET NULL,
  custom_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tenant_theme_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tenant_theme_config TO authenticated;
GRANT ALL ON public.tenant_theme_config TO service_role;
ALTER TABLE public.tenant_theme_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant theme config readable by all" ON public.tenant_theme_config FOR SELECT USING (true);
CREATE POLICY "tenant theme config write by tenant admin" ON public.tenant_theme_config FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.tenant_user_has_permission(tenant_id, 'settings.theme'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.tenant_user_has_permission(tenant_id, 'settings.theme'));
CREATE TRIGGER trg_tenant_theme_config_updated_at BEFORE UPDATE ON public.tenant_theme_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== Seed: 5 palettes ==============
INSERT INTO public.theme_palettes (slug, name, description, category, sort_order, tokens) VALUES
('noir-gold', 'Noir & Gold', 'Siyah arka plan üzerinde altın vurgular. Lüks otel ve butik konaklama için.', 'luxury', 1,
 '{"background":"30 10% 6%","foreground":"40 30% 92%","primary":"42 65% 52%","primary-foreground":"30 10% 6%","accent":"42 80% 60%","muted":"30 8% 14%","muted-foreground":"35 10% 65%","border":"35 15% 22%","card":"30 10% 9%","card-foreground":"40 30% 92%"}'::jsonb),
('editorial-light', 'Editorial Light', 'Krem zemin, koyu zeytin metin. Yayın evi / butik atölye estetiği.', 'editorial', 2,
 '{"background":"36 30% 96%","foreground":"80 18% 14%","primary":"80 22% 22%","primary-foreground":"36 30% 96%","accent":"18 60% 45%","muted":"36 18% 90%","muted-foreground":"80 10% 38%","border":"36 12% 82%","card":"36 30% 98%","card-foreground":"80 18% 14%"}'::jsonb),
('ocean-deep', 'Ocean Deep', 'Derin lacivert ve cyan vurgular. Kurumsal teknoloji (Baykar tarzı).', 'corporate', 3,
 '{"background":"215 50% 8%","foreground":"210 25% 96%","primary":"195 90% 55%","primary-foreground":"215 50% 8%","accent":"195 100% 65%","muted":"215 30% 16%","muted-foreground":"210 20% 70%","border":"215 30% 22%","card":"215 45% 11%","card-foreground":"210 25% 96%"}'::jsonb),
('terracotta-warm', 'Terracotta Warm', 'Toprak tonu ve sage yeşili. Butik konaklama (Nirvana tarzı).', 'hospitality', 4,
 '{"background":"30 25% 96%","foreground":"18 35% 18%","primary":"15 55% 45%","primary-foreground":"30 25% 96%","accent":"95 22% 42%","muted":"30 18% 90%","muted-foreground":"18 15% 40%","border":"30 18% 82%","card":"30 25% 98%","card-foreground":"18 35% 18%"}'::jsonb),
('midnight-indigo', 'Midnight Indigo', 'Derin lacivert / elektrik mor. Modern SaaS, fintech.', 'tech', 5,
 '{"background":"240 35% 8%","foreground":"230 25% 96%","primary":"250 85% 65%","primary-foreground":"240 35% 8%","accent":"260 100% 75%","muted":"240 25% 16%","muted-foreground":"230 18% 70%","border":"240 25% 22%","card":"240 35% 11%","card-foreground":"230 25% 96%"}'::jsonb);

-- ============== Seed: 5 typographies ==============
INSERT INTO public.theme_typographies (slug, name, description, heading_font, body_font, mono_font, google_fonts_url, sort_order, scale) VALUES
('classic-serif', 'Classic Serif', 'Klasik serif başlık + temiz sans gövde. Zarif ve kurumsal.', 'Cormorant Garamond', 'Inter', 'JetBrains Mono',
 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap', 1,
 '{"h1":"3.5rem","h2":"2.5rem","h3":"1.75rem","body":"1rem"}'::jsonb),
('modern-sans', 'Modern Sans', 'Geometrik sans çift; teknoloji ve startuplara uygun.', 'Space Grotesk', 'DM Sans', 'JetBrains Mono',
 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono&display=swap', 2,
 '{"h1":"3.25rem","h2":"2.25rem","h3":"1.5rem","body":"1rem"}'::jsonb),
('editorial-mix', 'Editorial Mix', 'Fraunces (yumuşak serif) + Manrope. Modern dergi.', 'Fraunces', 'Manrope', 'JetBrains Mono',
 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono&display=swap', 3,
 '{"h1":"3.75rem","h2":"2.5rem","h3":"1.75rem","body":"1.0625rem"}'::jsonb),
('industrial-display', 'Industrial Display', 'Archivo Black + IBM Plex Sans. Endüstriyel, güçlü.', 'Archivo Black', 'IBM Plex Sans', 'IBM Plex Mono',
 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono&display=swap', 4,
 '{"h1":"4rem","h2":"2.75rem","h3":"1.875rem","body":"1rem"}'::jsonb),
('luxury-display', 'Luxury Display', 'Playfair Display + Lato. Lüks otel ve mücevher markaları.', 'Playfair Display', 'Lato', 'JetBrains Mono',
 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Lato:wght@300;400;700&family=JetBrains+Mono&display=swap', 5,
 '{"h1":"4rem","h2":"2.75rem","h3":"1.875rem","body":"1.0625rem"}'::jsonb);

-- ============== Seed: 5 layouts ==============
INSERT INTO public.theme_layouts (slug, name, description, hero_variant, nav_variant, card_variant, section_density, motion_intensity, sort_order, config) VALUES
('editorial', 'Editorial', 'Dergi tarzı zigzag bölümler, büyük hero, geniş boşluk.', 'split', 'serif-centered', 'bordered', 'spacious', 'medium', 1,
 '{"sectionGap":"py-28","containerMax":"max-w-6xl"}'::jsonb),
('magazine', 'Magazine', 'Masonry vitrin, yapışkan sidebar, yoğun kart düzeni.', 'standard', 'standard', 'overlap', 'dense', 'medium', 2,
 '{"sectionGap":"py-20","containerMax":"max-w-7xl"}'::jsonb),
('corporate', 'Corporate', 'Tam genişlik bant bölümler, koyu nav, güçlü CTA. Baykar tarzı.', 'corporate', 'dark-solid', 'flat', 'comfortable', 'high', 3,
 '{"sectionGap":"py-24","containerMax":"max-w-7xl","navDark":true}'::jsonb),
('immersive', 'Immersive', 'Full-screen video hero, scroll-pinned bölümler, parallax. Nirvana tarzı.', 'immersive', 'transparent-overlay', 'soft', 'spacious', 'high', 4,
 '{"sectionGap":"py-32","containerMax":"max-w-7xl","heroFull":true,"parallax":true}'::jsonb),
('minimal', 'Minimal', 'Swiss tipografi, çok beyaz alan, az renk vurgusu.', 'minimal', 'minimal', 'borderless', 'spacious', 'low', 5,
 '{"sectionGap":"py-32","containerMax":"max-w-5xl"}'::jsonb);
