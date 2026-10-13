-- Request catalogue, not stock or price commitments. Zero values disable auto-estimates.
-- Idempotent: preserve existing material names, prices, descriptions and visibility.
BEGIN;
LOCK TABLE public.materials IN SHARE ROW EXCLUSIVE MODE;
WITH catalogue(name, technology, description, sort_order) AS (VALUES
  ('PLA', 'FDM', 'Görsel prototip ve genel model talepleri için başlangıç seçeneği.', 1),
  ('PLA+', 'FDM', 'PLA bazlı özel karışım tercihi. Üretici ve ürün serisi birlikte belirlenir.', 2),
  ('PLA Mat', 'FDM', 'Mat yüzey görünümü istenen model ve dekoratif ürün talepleri.', 3),
  ('PLA Silk', 'FDM', 'Parlak yüzey görünümü istenen dekoratif ürün talepleri.', 4),
  ('PETG', 'FDM', 'Fonksiyonel prototip ve muhafaza talepleri için değerlendirilebilir.', 5),
  ('PETG Şeffaf', 'FDM', 'Işık geçirgenliği istenen projeler. Baskı katmanları optik berraklığı etkiler.', 6),
  ('ABS', 'FDM', 'Teknik parça talepleri için; ölçü ve kullanım koşulları birlikte değerlendirilir.', 7),
  ('ASA', 'FDM', 'Dış ortam kullanımını değerlendirmek isteyen projeler için malzeme tercihi.', 8),
  ('TPU 95A', 'FDM', 'Esnek parça talebi. Sertlik ve esneme beklentisi numune üzerinden netleştirilir.', 9),
  ('PA / Naylon', 'FDM', 'Teknik parça talepleri. Naylon türü ve üretici ürünü birlikte seçilir.', 10),
  ('PA-CF', 'FDM', 'Karbon elyaf katkılı naylon tercihi; geometri ve üretim uygunluğu incelenir.', 11),
  ('PETG-CF', 'FDM', 'Karbon elyaf katkılı PETG tercihi; görünüm ve işlev beklentisi birlikte değerlendirilir.', 12),
  ('PC / Polikarbonat', 'FDM', 'Mühendislik parçası talepleri için proje bazlı değerlendirme.', 13),
  ('Standart Reçine', 'SLA', 'Detaylı model ve görsel prototip talepleri için reçine tercihi.', 14),
  ('Tough Reçine', 'SLA', 'Fonksiyonel prototip beklentisi için üretici ürününe göre değerlendirme.', 15),
  ('Şeffaf Reçine', 'SLA', 'Şeffaf görünüm talebi; yüzey işlemi ve berraklık beklentisi ayrıca belirlenir.', 16),
  ('Esnek Reçine', 'SLA', 'Esnek model talebi; istenen sertlik ve temas koşulları birlikte değerlendirilir.', 17),
  ('Naylon PA12', 'SLS', 'Toz baskı yöntemiyle naylon parça talebi; tedarik ve üretim uygunluğu teyit edilir.', 18),
  ('Naylon PA11', 'SLS', 'PA11 toz baskı talebi; malzeme ve son işlem kapsamı ayrıca değerlendirilir.', 19),
  ('Naylon PA12', 'MJF', 'MJF yöntemiyle PA12 parça talebi; tedarik ve üretim uygunluğu teyit edilir.', 20)
)
INSERT INTO public.materials (tenant_id,name,technology,description,sort_order,density_g_cm3,price_per_gram,setup_fee,min_price,color,active)
SELECT t.id,c.name,c.technology,c.description,c.sort_order,0,0,0,0,'Talebe göre teyit edilir',true
FROM public.tenants t CROSS JOIN catalogue c
WHERE t.slug IN ('3dyanimda','3dsanayi','maketyanimda','parcayanimda')
AND NOT EXISTS (SELECT 1 FROM public.materials m WHERE m.tenant_id=t.id AND lower(m.name)=lower(c.name) AND upper(m.technology)=c.technology);
COMMIT;
