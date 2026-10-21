WITH other_state AS (SELECT md5(jsonb_agg(row ORDER BY row::text)::text) AS other_tenants_fingerprint FROM (SELECT to_jsonb(t) AS row FROM tenants t WHERE id<>'10000000-0000-4000-8000-000000000001' UNION ALL SELECT to_jsonb(s) FROM site_settings s WHERE tenant_id<>'10000000-0000-4000-8000-000000000001' UNION ALL SELECT to_jsonb(s) FROM seo_meta s WHERE tenant_id<>'10000000-0000-4000-8000-000000000001' UNION ALL SELECT to_jsonb(s) FROM landing_pages s WHERE tenant_id<>'10000000-0000-4000-8000-000000000001' UNION ALL SELECT to_jsonb(s) FROM publication_reviews s WHERE tenant_id<>'10000000-0000-4000-8000-000000000001') x), page_checks AS (
 SELECT p.path,p.title,p.status,r.payload_hash,public.publication_payload_hash(to_jsonb(p)) AS actual_hash,r.manifest_hash
 FROM public.landing_pages p JOIN public.publication_reviews r ON r.tenant_id=p.tenant_id AND r.path=p.path AND r.collection='landing_pages'
 WHERE p.tenant_id='10000000-0000-4000-8000-000000000001' AND p.path IN('/3d-baski','/3d-tarama','/3d-modelleme','/bolgeler/istanbul/atasehir/3d-baski','/bolgeler/istanbul/kadikoy/3d-baski')
)
SELECT 'business_name' AS check_name,value->>'business_name' AS actual,CASE WHEN value->>'business_name'='3D Yanımda' THEN 'PASS' ELSE 'FAIL' END AS result FROM public.site_settings WHERE tenant_id='10000000-0000-4000-8000-000000000001' AND key='contact_info'
UNION ALL SELECT 'homepage_title',title_tr,CASE WHEN title_tr='3D Yanımda | Ataşehir’de 3D Baskı, Tarama ve Modelleme' THEN 'PASS' ELSE 'FAIL' END FROM public.seo_meta WHERE tenant_id='10000000-0000-4000-8000-000000000001' AND path='/'
UNION ALL SELECT 'reviewed_page_count',count(*)::text,CASE WHEN count(*)=5 THEN 'PASS' ELSE 'FAIL' END FROM page_checks
UNION ALL SELECT path,title,CASE WHEN status='published' AND payload_hash=actual_hash AND manifest_hash='5703c39af22d462a85c5bac8016f7ca545e29c99791f965da98833a7f9f345d0' THEN 'PASS' ELSE 'FAIL' END FROM page_checks
UNION ALL SELECT 'other_tenants_fingerprint',other_tenants_fingerprint,CASE WHEN other_tenants_fingerprint='626b914d1f7ee6b35a6de238ab59d64b' THEN 'PASS' ELSE 'FAIL' END FROM other_state
ORDER BY check_name;
