
-- Seed 3D Yanında brand palette/typography/layout and assign to tenant
INSERT INTO public.theme_palettes (slug, name, description, category, tokens, sort_order)
VALUES (
  '3dyaninda-brand',
  '3D Yanında Marka',
  'Lacivert + krem + altın, mevcut marka kombinasyonu.',
  'brand',
  '{
    "background": "210 40% 99%",
    "foreground": "222 47% 11%",
    "primary": "222 65% 18%",
    "primary-foreground": "38 38% 94%",
    "accent": "217 78% 48%",
    "accent-foreground": "0 0% 100%",
    "muted": "210 30% 96%",
    "muted-foreground": "215 16% 38%",
    "border": "220 20% 88%",
    "card": "0 0% 100%",
    "card-foreground": "222 47% 11%"
  }'::jsonb,
  -10
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  tokens = EXCLUDED.tokens, sort_order = EXCLUDED.sort_order;

INSERT INTO public.theme_typographies (slug, name, description, heading_font, body_font, google_fonts_url, sort_order)
VALUES (
  '3dyaninda-display',
  '3D Yanında Display',
  'Playfair başlıklar + Inter gövde.',
  'Playfair Display',
  'Inter',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap',
  -10
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, heading_font = EXCLUDED.heading_font,
  body_font = EXCLUDED.body_font, google_fonts_url = EXCLUDED.google_fonts_url,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.theme_layouts (slug, name, description, hero_variant, card_variant, section_density, motion_intensity, sort_order)
VALUES (
  '3dyaninda-editorial',
  '3D Yanında Editorial',
  'Klasik editöryel düzen, dengeli boşluklar.',
  'standard',
  'classic',
  'comfortable',
  'subtle',
  -10
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, hero_variant = EXCLUDED.hero_variant,
  card_variant = EXCLUDED.card_variant, section_density = EXCLUDED.section_density,
  motion_intensity = EXCLUDED.motion_intensity, sort_order = EXCLUDED.sort_order;

-- Attach as default selection for the tenant if not already set
INSERT INTO public.tenant_theme_config (tenant_id, palette_slug, typography_slug, layout_slug)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '3dyaninda-brand',
  '3dyaninda-display',
  '3dyaninda-editorial'
)
ON CONFLICT (tenant_id) DO NOTHING;
