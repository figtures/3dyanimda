
-- Seed "cms-presets" collection for the 3dyaninda tenant (idempotent)
INSERT INTO public.collections (tenant_id, slug, name, description, icon, schema)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  'cms-presets',
  'CMS Bölümleri',
  'Birden fazla sayfada tekrar kullanılan içerik bölümleri. preset_section bloğunda slug ile referans verilir.',
  'LayoutTemplate',
  jsonb_build_object(
    'fields', jsonb_build_array(
      jsonb_build_object('key','name','type','text','label','Ad'),
      jsonb_build_object('key','blocks','type','json','label','Bloklar (JSON)')
    )
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.collections
  WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid AND slug = 'cms-presets'
);

-- Seed 5 starter items mirroring the legacy hardcoded presets (idempotent)
WITH coll AS (
  SELECT id FROM public.collections
  WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid AND slug = 'cms-presets'
),
seed(slug, title) AS (
  VALUES
    ('about-body',        'Hakkımızda Gövdesi'),
    ('istanbul-hub-body', 'İstanbul Hub Gövdesi'),
    ('west-osb-body',     'Batı İstanbul OSB Gövdesi'),
    ('pillar-guide-body', 'Pillar Rehber Gövdesi'),
    ('career-hub-body',   'Kariyer Hub Gövdesi')
)
INSERT INTO public.collection_items (tenant_id, collection_id, slug, title, data, status, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  coll.id,
  seed.slug,
  seed.title,
  jsonb_build_object('name', seed.title, 'blocks', '[]'::jsonb),
  'published',
  0
FROM seed, coll
WHERE NOT EXISTS (
  SELECT 1 FROM public.collection_items ci
  WHERE ci.collection_id = coll.id AND ci.slug = seed.slug
);
