-- Exclusive service illustrations; records remain drafts until review.
UPDATE public.landing_pages p SET image='/brand/services/3dyanimda-print.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='3dyanimda' AND p.path='/3d-baski';
UPDATE public.landing_pages p SET image='/brand/services/3dyanimda-scan.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='3dyanimda' AND p.path='/3d-tarama';
UPDATE public.landing_pages p SET image='/brand/services/3dyanimda-model.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='3dyanimda' AND p.path='/3d-modelleme';
UPDATE public.landing_pages p SET image='/brand/services/3dsanayi-print.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='3dsanayi' AND p.path='/3d-baski';
UPDATE public.landing_pages p SET image='/brand/services/3dsanayi-scan.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='3dsanayi' AND p.path='/3d-tarama';
UPDATE public.landing_pages p SET image='/brand/services/3dsanayi-model.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='3dsanayi' AND p.path='/3d-modelleme';
UPDATE public.landing_pages p SET image='/brand/services/maketyanimda-print.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='maketyanimda' AND p.path='/3d-baski';
UPDATE public.landing_pages p SET image='/brand/services/maketyanimda-scan.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='maketyanimda' AND p.path='/3d-tarama';
UPDATE public.landing_pages p SET image='/brand/services/maketyanimda-model.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='maketyanimda' AND p.path='/3d-modelleme';
UPDATE public.landing_pages p SET image='/brand/services/parcayanimda-print.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='parcayanimda' AND p.path='/3d-baski';
UPDATE public.landing_pages p SET image='/brand/services/parcayanimda-scan.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='parcayanimda' AND p.path='/3d-tarama';
UPDATE public.landing_pages p SET image='/brand/services/parcayanimda-model.webp', status='draft' FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug='parcayanimda' AND p.path='/3d-modelleme';
