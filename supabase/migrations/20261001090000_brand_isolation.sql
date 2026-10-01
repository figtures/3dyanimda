-- Registered hosts are public content selectors, never authorization credentials.
CREATE TABLE public.tenant_domains (
 hostname text PRIMARY KEY CHECK (hostname = lower(hostname) AND hostname !~ '[/ :]' AND length(hostname) < 254),
 tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_domains ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tenant_domains TO anon, authenticated;
GRANT ALL ON public.tenant_domains TO service_role;
CREATE POLICY "Domain mapping read" ON public.tenant_domains FOR SELECT USING (true);
CREATE POLICY "Domain mapping admin" ON public.tenant_domains FOR ALL TO authenticated
 USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
GRANT INSERT, UPDATE, DELETE ON public.tenant_domains TO authenticated;

CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE headers jsonb; request_hostname text; resolved uuid; requested text;
BEGIN
 headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
 request_hostname := lower(rtrim(regexp_replace(coalesce(headers->>'x-tenant-host', ''), ':\d+$', ''), '.'));
 IF request_hostname = '' OR request_hostname !~ '^[a-z0-9.-]+$' THEN RETURN NULL; END IF;
 SELECT d.tenant_id INTO resolved FROM public.tenant_domains d
 JOIN public.tenants t ON t.id = d.tenant_id AND t.status = 'active'
 WHERE d.hostname = request_hostname;
 requested := nullif(headers->>'x-tenant-id', '');
 IF requested IS NOT NULL AND requested <> resolved::text THEN RETURN NULL; END IF;
 RETURN resolved;
EXCEPTION WHEN invalid_text_representation THEN RETURN NULL;
END $$;

-- AND these restrictions with existing publication/role/field validation policies.
-- Includes super admins: content queries must be in the selected brand context.
DO $$ DECLARE tab text; BEGIN
 FOREACH tab IN ARRAY ARRAY['announcements','audit_log','blog_posts','contact_messages',
 'discount_campaigns','email_templates','faq_items','job_applications','job_postings',
 'legal_documents','machine_operation_requests','materials','media_library','nav_items',
 'quote_replies','newsletter_subscribers','portfolio_projects','pricing_settings','quote_requests','seo_meta',
 'site_settings','testimonials','translations','url_redirects','pages','collections','collection_items','route_templates']
 LOOP
  EXECUTE format('CREATE POLICY "Require selected brand" ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id())', tab);
  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id()', tab);
 END LOOP;
 FOREACH tab IN ARRAY ARRAY['tenant_features','tenant_themes','tenant_theme_config'] LOOP
  EXECUTE format('CREATE POLICY "Scope brand configuration" ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (tenant_id = public.current_tenant_id() OR public.is_super_admin()) WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_super_admin())', tab);
 END LOOP;
END $$;

-- Prevent cross-brand parent references even for a user managing both brands.
ALTER TABLE public.collections ADD CONSTRAINT collections_tenant_id_id_key UNIQUE (tenant_id, id);
ALTER TABLE public.pages ADD CONSTRAINT pages_tenant_id_id_key UNIQUE (tenant_id, id);
ALTER TABLE public.collection_items ADD CONSTRAINT collection_items_brand_parent
 FOREIGN KEY (tenant_id, collection_id) REFERENCES public.collections(tenant_id, id) ON DELETE CASCADE;
ALTER TABLE public.route_templates ADD CONSTRAINT route_templates_brand_collection
 FOREIGN KEY (tenant_id, collection_id) REFERENCES public.collections(tenant_id, id) ON DELETE CASCADE;
ALTER TABLE public.route_templates ADD CONSTRAINT route_templates_brand_page
 FOREIGN KEY (tenant_id, template_page_id) REFERENCES public.pages(tenant_id, id) ON DELETE CASCADE;

-- Storage metadata and downloads must be scoped too; old permissive policies cannot bypass this.
CREATE POLICY "Storage brand boundary" ON storage.objects AS RESTRICTIVE FOR ALL TO anon, authenticated
 USING (bucket_id NOT IN ('stl-uploads','career-uploads','media') OR
  ((storage.foldername(name))[1] = public.current_tenant_id()::text AND (
   (bucket_id='stl-uploads' AND public.tenant_user_has_permission(public.current_tenant_id(),'quotes.view')) OR
   (bucket_id='career-uploads' AND (storage.foldername(name))[2]='applications' AND public.tenant_user_has_permission(public.current_tenant_id(),'applications.view')) OR
   (bucket_id='career-uploads' AND (storage.foldername(name))[2]='machines' AND public.tenant_user_has_permission(public.current_tenant_id(),'machine_ops.view'))
  )))
 WITH CHECK (bucket_id NOT IN ('stl-uploads','career-uploads','media') OR
  (storage.foldername(name))[1] = public.current_tenant_id()::text);
DROP POLICY IF EXISTS "Public can upload STL files" ON storage.objects;
CREATE POLICY "Public can upload STL files" ON storage.objects FOR INSERT TO anon, authenticated
 WITH CHECK (bucket_id = 'stl-uploads' AND length(name) BETWEEN 40 AND 255
 AND (storage.foldername(name))[1] = public.current_tenant_id()::text
 AND name ~* '\.(stl|obj|3mf|step|stp|igs|iges)$');
DROP POLICY IF EXISTS "Public can upload career files" ON storage.objects;
CREATE POLICY "Public can upload career files" ON storage.objects FOR INSERT TO anon, authenticated
 WITH CHECK (bucket_id = 'career-uploads' AND length(name) BETWEEN 40 AND 255
 AND (storage.foldername(name))[1] = public.current_tenant_id()::text
 AND (storage.foldername(name))[2] IN ('applications','machines')
 AND name ~* '\.(pdf|doc|docx|jpg|jpeg|png|webp|stl|obj|3mf|step|stp)$');

CREATE POLICY "Images brand boundary" ON storage.objects AS RESTRICTIVE FOR ALL TO anon, authenticated
 USING (bucket_id NOT IN ('site-images','site-assets','blog-images') OR (storage.foldername(name))[1] = public.current_tenant_id()::text)
 WITH CHECK (bucket_id NOT IN ('site-images','site-assets','blog-images') OR ((storage.foldername(name))[1] = public.current_tenant_id()::text
 AND public.tenant_user_has_permission(public.current_tenant_id(), 'media.upload')));
CREATE POLICY "Brand media upload" ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id IN ('site-images','site-assets','blog-images') AND public.tenant_user_has_permission(public.current_tenant_id(), 'media.upload'));
CREATE POLICY "Brand media update" ON storage.objects FOR UPDATE TO authenticated
 USING (bucket_id IN ('site-images','site-assets','blog-images') AND public.tenant_user_has_permission(public.current_tenant_id(), 'media.upload'));
CREATE POLICY "Brand media delete" ON storage.objects FOR DELETE TO authenticated
 USING (bucket_id IN ('site-images','site-assets','blog-images') AND public.tenant_user_has_permission(public.current_tenant_id(), 'media.upload'));
CREATE POLICY "Brand files read" ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id IN ('stl-uploads','career-uploads') AND public.is_tenant_member(public.current_tenant_id()));
UPDATE storage.buckets SET file_size_limit = 20971520 WHERE id = 'stl-uploads';

-- A quote cannot point to a file from another brand.
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_file_brand CHECK (
 stl_file_path IS NULL OR split_part(stl_file_path, '/', 1) = tenant_id::text
) NOT VALID;

-- Keep host mappings synchronized with the existing Studio domain editor.
CREATE FUNCTION public.sync_tenant_domains() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE domain_name text;
BEGIN
 IF TG_OP = 'UPDATE' THEN
  DELETE FROM public.tenant_domains WHERE tenant_id = NEW.id AND hostname IN
   (OLD.domain, OLD.custom_domain, 'www.' || OLD.domain, 'www.' || OLD.custom_domain);
 END IF;
 FOREACH domain_name IN ARRAY ARRAY[NEW.domain, NEW.custom_domain] LOOP
  IF domain_name IS NOT NULL AND domain_name <> '' THEN
   IF domain_name <> lower(domain_name) OR domain_name !~ '^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$' THEN
    RAISE EXCEPTION 'Use a lowercase hostname without protocol or path';
   END IF;
   INSERT INTO public.tenant_domains(hostname,tenant_id) VALUES(domain_name,NEW.id)
    ON CONFLICT(hostname) DO UPDATE SET tenant_id=EXCLUDED.tenant_id WHERE tenant_domains.tenant_id=EXCLUDED.tenant_id;
   IF NOT FOUND THEN RAISE EXCEPTION 'Domain belongs to another brand'; END IF;
   IF domain_name NOT LIKE 'www.%' THEN
    INSERT INTO public.tenant_domains(hostname,tenant_id) VALUES('www.' || domain_name,NEW.id)
     ON CONFLICT(hostname) DO UPDATE SET tenant_id=EXCLUDED.tenant_id WHERE tenant_domains.tenant_id=EXCLUDED.tenant_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Domain belongs to another brand'; END IF;
   END IF;
  END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER sync_tenant_domains AFTER INSERT OR UPDATE OF domain, custom_domain ON public.tenants
 FOR EACH ROW EXECUTE FUNCTION public.sync_tenant_domains();

-- Transactional outbox: submission success means saved; email failure never loses a quote.
CREATE TABLE public.quote_notifications (
 quote_id uuid PRIMARY KEY REFERENCES public.quote_requests(id) ON DELETE CASCADE,
 tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, attempts integer NOT NULL DEFAULT 0
);
ALTER TABLE public.quote_notifications ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.quote_notifications TO service_role;
CREATE FUNCTION public.queue_quote_notification() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.quote_notifications(quote_id,tenant_id) VALUES(NEW.id,NEW.tenant_id);
 RETURN NEW;
END $$;
CREATE TRIGGER queue_quote_notification AFTER INSERT ON public.quote_requests
 FOR EACH ROW EXECUTE FUNCTION public.queue_quote_notification();

-- Shared slugs, email subscribers and template keys must be unique inside a brand only.
ALTER TABLE public.blog_posts DROP CONSTRAINT blog_posts_slug_key, ADD UNIQUE (tenant_id,slug);
ALTER TABLE public.portfolio_projects DROP CONSTRAINT portfolio_projects_slug_key, ADD UNIQUE (tenant_id,slug);
ALTER TABLE public.legal_documents DROP CONSTRAINT legal_documents_slug_key, ADD UNIQUE (tenant_id,slug);
ALTER TABLE public.email_templates DROP CONSTRAINT email_templates_key_key, ADD UNIQUE (tenant_id,key);
ALTER TABLE public.job_postings DROP CONSTRAINT job_postings_slug_key, ADD UNIQUE (tenant_id,slug);
ALTER TABLE public.newsletter_subscribers DROP CONSTRAINT newsletter_subscribers_email_key, ADD UNIQUE (tenant_id,email);
ALTER TABLE public.url_redirects DROP CONSTRAINT url_redirects_from_path_key, ADD UNIQUE (tenant_id,from_path);
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_tenant_id_id_key UNIQUE (tenant_id,id);
ALTER TABLE public.quote_replies ADD CONSTRAINT quote_replies_brand_parent
 FOREIGN KEY (tenant_id,quote_id) REFERENCES public.quote_requests(tenant_id,id) ON DELETE CASCADE;
