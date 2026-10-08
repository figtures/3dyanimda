-- Owner-confirmed contact settings only; does not publish content or issue reviews.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $guard$
BEGIN
 IF (SELECT count(*) FROM public.tenants WHERE slug IN ('3dyanimda','3dsanayi','maketyanimda','parcayanimda'))<>4 THEN
  RAISE EXCEPTION 'Expected exactly four brand tenants';
 END IF;
 IF EXISTS(SELECT 1 FROM public.site_settings s JOIN public.tenants t ON t.id=s.tenant_id WHERE t.slug IN ('3dyanimda','3dsanayi','maketyanimda','parcayanimda') AND s.key IN ('contact_info','verified_business_identity') AND jsonb_typeof(s.value)<>'object') THEN
  RAISE EXCEPTION 'Existing settings must be JSON objects';
 END IF;
END $guard$;
WITH patch AS (
 SELECT * FROM jsonb_to_recordset('[{"key":"contact_info","value":{"email":"info@3dyanimda.com","phone":"+905364488230","phone_display":"+90 536 448 82 30","address_tr":"Örnek Mahallesi, Bestekar Sokak No: 17, Ataşehir / İstanbul","address_en":"Örnek Mahallesi, Bestekar Sokak No: 17, Ataşehir / Istanbul, Türkiye","location_tr":"Örnek Mahallesi, Ataşehir · Diğer şehirlere kargo","location_en":"Örnek Mahallesi, Ataşehir · Shipping to other cities"}},{"key":"verified_business_identity","value":{"email":"info@3dyanimda.com","telephone":"+905364488230","address":{"streetAddress":"Örnek Mahallesi, Bestekar Sokak No: 17","addressLocality":"Ataşehir","addressRegion":"İstanbul","addressCountry":"TR"}}}]'::jsonb) AS x(key text,value jsonb)
)
INSERT INTO public.site_settings(tenant_id,key,value)
 SELECT t.id,p.key,p.value FROM public.tenants t CROSS JOIN patch p WHERE t.slug IN ('3dyanimda','3dsanayi','maketyanimda','parcayanimda')
ON CONFLICT(tenant_id,key) DO UPDATE
 SET value=public.site_settings.value || EXCLUDED.value,updated_at=now();
DO $verify$
BEGIN
 IF (SELECT count(*) FROM public.site_settings s JOIN public.tenants t ON t.id=s.tenant_id CROSS JOIN jsonb_to_recordset('[{"key":"contact_info","value":{"email":"info@3dyanimda.com","phone":"+905364488230","phone_display":"+90 536 448 82 30","address_tr":"Örnek Mahallesi, Bestekar Sokak No: 17, Ataşehir / İstanbul","address_en":"Örnek Mahallesi, Bestekar Sokak No: 17, Ataşehir / Istanbul, Türkiye","location_tr":"Örnek Mahallesi, Ataşehir · Diğer şehirlere kargo","location_en":"Örnek Mahallesi, Ataşehir · Shipping to other cities"}},{"key":"verified_business_identity","value":{"email":"info@3dyanimda.com","telephone":"+905364488230","address":{"streetAddress":"Örnek Mahallesi, Bestekar Sokak No: 17","addressLocality":"Ataşehir","addressRegion":"İstanbul","addressCountry":"TR"}}}]'::jsonb) AS x(key text,value jsonb) WHERE t.slug IN ('3dyanimda','3dsanayi','maketyanimda','parcayanimda') AND s.key=x.key AND s.value @> x.value)<>8 THEN
  RAISE EXCEPTION 'Expected eight matching contact/identity settings';
 END IF;
END $verify$;
COMMIT;
