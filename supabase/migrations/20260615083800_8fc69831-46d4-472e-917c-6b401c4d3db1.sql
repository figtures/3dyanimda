
-- ============================================================
-- 1) Tighten public-facing SELECT/INSERT policies so requests
--    without x-tenant-id header can no longer read or seed
--    arbitrary tenant data.
-- ============================================================

-- announcements
DROP POLICY IF EXISTS "Public view active announcements" ON public.announcements;
CREATE POLICY "Public view active announcements" ON public.announcements
  FOR SELECT USING (active = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- blog_posts
DROP POLICY IF EXISTS "Public view published blog" ON public.blog_posts;
CREATE POLICY "Public view published blog" ON public.blog_posts
  FOR SELECT USING (published = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- contact_messages (INSERT)
DROP POLICY IF EXISTS "Anyone send contact" ON public.contact_messages;
CREATE POLICY "Anyone send contact" ON public.contact_messages
  FOR INSERT WITH CHECK (
    current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id()
    AND length(btrim(full_name)) BETWEEN 2 AND 200
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND length(btrim(message)) BETWEEN 1 AND 5000
  );

-- discount_campaigns
DROP POLICY IF EXISTS "Public view active campaigns" ON public.discount_campaigns;
CREATE POLICY "Public view active campaigns" ON public.discount_campaigns
  FOR SELECT USING (active = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- faq_items
DROP POLICY IF EXISTS "Public view active faq" ON public.faq_items;
CREATE POLICY "Public view active faq" ON public.faq_items
  FOR SELECT USING (active = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- job_applications (INSERT)
DROP POLICY IF EXISTS "Anyone submit job app" ON public.job_applications;
CREATE POLICY "Anyone submit job app" ON public.job_applications
  FOR INSERT WITH CHECK (kvkk_consent = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- job_postings
DROP POLICY IF EXISTS "Public view active jobs" ON public.job_postings;
CREATE POLICY "Public view active jobs" ON public.job_postings
  FOR SELECT USING (active = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- legal_documents
DROP POLICY IF EXISTS "Public view legal" ON public.legal_documents;
CREATE POLICY "Public view legal" ON public.legal_documents
  FOR SELECT USING (current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- machine_operation_requests (INSERT)
DROP POLICY IF EXISTS "Anyone submit machine op" ON public.machine_operation_requests;
CREATE POLICY "Anyone submit machine op" ON public.machine_operation_requests
  FOR INSERT WITH CHECK (kvkk_consent = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- materials
DROP POLICY IF EXISTS "Public view active materials" ON public.materials;
CREATE POLICY "Public view active materials" ON public.materials
  FOR SELECT USING (active = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- media_library
DROP POLICY IF EXISTS "Public view media" ON public.media_library;
CREATE POLICY "Public view media" ON public.media_library
  FOR SELECT USING (current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- nav_items
DROP POLICY IF EXISTS "Public view active nav" ON public.nav_items;
CREATE POLICY "Public view active nav" ON public.nav_items
  FOR SELECT USING (active = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- newsletter_subscribers (INSERT)
DROP POLICY IF EXISTS "Anyone subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (
    current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id()
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );

-- portfolio_projects
DROP POLICY IF EXISTS "Public view published portfolio" ON public.portfolio_projects;
CREATE POLICY "Public view published portfolio" ON public.portfolio_projects
  FOR SELECT USING (published = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- pricing_settings
DROP POLICY IF EXISTS "Public view pricing" ON public.pricing_settings;
CREATE POLICY "Public view pricing" ON public.pricing_settings
  FOR SELECT USING (current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- quote_requests (INSERT)
DROP POLICY IF EXISTS "Anyone submit quote" ON public.quote_requests;
CREATE POLICY "Anyone submit quote" ON public.quote_requests
  FOR INSERT WITH CHECK (
    current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id()
    AND length(btrim(full_name)) BETWEEN 2 AND 200
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND length(btrim(part_description)) BETWEEN 1 AND 5000
    AND quantity BETWEEN 1 AND 1000
    AND status = 'new'
  );

-- seo_meta
DROP POLICY IF EXISTS "Public view seo" ON public.seo_meta;
CREATE POLICY "Public view seo" ON public.seo_meta
  FOR SELECT USING (current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- site_settings
DROP POLICY IF EXISTS "Public view site settings" ON public.site_settings;
CREATE POLICY "Public view site settings" ON public.site_settings
  FOR SELECT USING (current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- translations
DROP POLICY IF EXISTS "Public read translations" ON public.translations;
CREATE POLICY "Public read translations" ON public.translations
  FOR SELECT USING (current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- url_redirects
DROP POLICY IF EXISTS "Public view active redirects" ON public.url_redirects;
CREATE POLICY "Public view active redirects" ON public.url_redirects
  FOR SELECT USING (active = true AND current_tenant_id() IS NOT NULL AND tenant_id = current_tenant_id());

-- ============================================================
-- 2) Drop hardcoded tenant_id defaults — every insert must
--    now carry an explicit tenant_id (RLS + app code enforce it).
-- ============================================================

ALTER TABLE public.announcements              ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.audit_log                  ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.blog_posts                 ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.contact_messages           ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.discount_campaigns         ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.email_templates            ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.faq_items                  ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.job_applications           ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.job_postings               ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.legal_documents            ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.machine_operation_requests ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.materials                  ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.media_library              ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.nav_items                  ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.newsletter_subscribers     ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.portfolio_projects         ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.pricing_settings           ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.quote_requests             ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.seo_meta                   ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.site_settings              ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.testimonials               ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.translations               ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.url_redirects              ALTER COLUMN tenant_id DROP DEFAULT;
