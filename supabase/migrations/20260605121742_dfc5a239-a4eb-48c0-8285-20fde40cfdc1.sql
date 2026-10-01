
-- =====================================================================
-- FAZ 1 — Multi-Tenant Foundation (text-based role compare)
-- =====================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  domain text UNIQUE,
  custom_domain text UNIQUE,
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'starter',
  active_theme_slug text,
  logo_url text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tenants TO anon, authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tenant_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  permissions text[] NOT NULL DEFAULT '{}',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX tenant_roles_slug_uniq ON public.tenant_roles (coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);
GRANT SELECT ON public.tenant_roles TO authenticated;
GRANT ALL ON public.tenant_roles TO service_role;
ALTER TABLE public.tenant_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role_slug text NOT NULL DEFAULT 'owner',
  extra_permissions text[] NOT NULL DEFAULT '{}',
  invited_email text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
GRANT SELECT ON public.tenant_users TO authenticated;
GRANT ALL ON public.tenant_users TO service_role;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Helper functions (use text cast to avoid enum-in-same-tx issue)
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NULLIF(coalesce(current_setting('request.headers', true)::json->>'x-tenant-id', ''), '')::uuid
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'super_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _tenant_id IS NOT NULL AND (
    public.is_super_admin(_user_id)
    OR EXISTS (SELECT 1 FROM public.tenant_users WHERE tenant_id = _tenant_id AND user_id = _user_id AND status = 'active')
  )
$$;

CREATE OR REPLACE FUNCTION public.tenant_user_has_permission(_tenant_id uuid, _permission text, _user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.is_super_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.tenant_users tu
      LEFT JOIN public.tenant_roles tr
        ON tr.slug = tu.role_slug
       AND (tr.tenant_id = tu.tenant_id OR tr.tenant_id IS NULL)
      WHERE tu.tenant_id = _tenant_id
        AND tu.user_id = _user_id
        AND tu.status = 'active'
        AND (
          tu.role_slug = 'owner'
          OR _permission = ANY(tu.extra_permissions)
          OR _permission = ANY(coalesce(tr.permissions, '{}'))
          OR '*' = ANY(coalesce(tr.permissions, '{}'))
        )
    )
$$;

CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tenant_roles_updated_at BEFORE UPDATE ON public.tenant_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tenant_users_updated_at BEFORE UPDATE ON public.tenant_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS on new tables
CREATE POLICY "Anyone resolve tenants" ON public.tenants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Super admins manage tenants" ON public.tenants FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Owners update own tenant" ON public.tenants FOR UPDATE TO authenticated
  USING (public.tenant_user_has_permission(id, 'settings.tenant'))
  WITH CHECK (public.tenant_user_has_permission(id, 'settings.tenant'));

CREATE POLICY "Roles readable to members" ON public.tenant_roles FOR SELECT TO authenticated
  USING (tenant_id IS NULL OR public.is_tenant_member(tenant_id));
CREATE POLICY "Super admins manage roles" ON public.tenant_roles FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Owners manage tenant roles" ON public.tenant_roles FOR ALL TO authenticated
  USING (tenant_id IS NOT NULL AND public.tenant_user_has_permission(tenant_id, 'roles.manage'))
  WITH CHECK (tenant_id IS NOT NULL AND public.tenant_user_has_permission(tenant_id, 'roles.manage'));

CREATE POLICY "Members view tenant_users" ON public.tenant_users FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id) OR user_id = auth.uid());
CREATE POLICY "Super admins manage tenant_users" ON public.tenant_users FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Owners manage tenant_users" ON public.tenant_users FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'users.manage'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'users.manage'));

-- Demo tenant + system roles
INSERT INTO public.tenants (id, slug, name, status, plan, active_theme_slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo', 'Demo Workspace', 'active', 'starter', 'premium-studio');

INSERT INTO public.tenant_roles (tenant_id, slug, name, description, permissions, is_system) VALUES
  (NULL, 'owner',   'Owner',   'İşletme sahibi — tüm yetkiler', ARRAY['*'], true),
  (NULL, 'manager', 'Manager', 'Yönetici — içerik + ekip yönetimi', ARRAY['blog.view','blog.edit','blog.delete','portfolio.view','portfolio.edit','portfolio.delete','quotes.view','quotes.edit','quotes.delete','messages.view','messages.edit','messages.delete','applications.view','applications.edit','applications.delete','machine_ops.view','machine_ops.edit','machine_ops.delete','faq.edit','testimonials.edit','jobs.edit','announcements.edit','newsletter.edit','navigation.edit','redirects.edit','users.invite','settings.theme','settings.features','seo.edit','media.upload','audit.view','pricing.edit','campaigns.edit','email_templates.edit','legal.edit','translations.edit','settings.edit'], true),
  (NULL, 'editor',  'Editor',  'İçerik editörü', ARRAY['blog.view','blog.edit','portfolio.view','portfolio.edit','faq.edit','testimonials.edit','media.upload','seo.edit'], true),
  (NULL, 'viewer',  'Viewer',  'Sadece okuma', ARRAY['blog.view','portfolio.view','quotes.view','messages.view','applications.view','machine_ops.view'], true);

-- Add tenant_id to all content tables and backfill to demo
DO $$
DECLARE
  t text;
  demo_id uuid := '00000000-0000-0000-0000-000000000001';
  tables text[] := ARRAY[
    'announcements','audit_log','blog_posts','contact_messages','discount_campaigns',
    'email_templates','faq_items','job_applications','job_postings','legal_documents',
    'machine_operation_requests','materials','media_library','nav_items',
    'newsletter_subscribers','portfolio_projects','pricing_settings','quote_requests',
    'seo_meta','site_settings','testimonials','translations','url_redirects'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id uuid', t);
    EXECUTE format('UPDATE public.%I SET tenant_id = %L WHERE tenant_id IS NULL', t, demo_id);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT %L', t, demo_id);
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE',
                   t, t || '_tenant_id_fkey');
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id)', 'idx_' || t || '_tenant_id', t);
  END LOOP;
END $$;

-- Rewrite all RLS policies as tenant-aware
-- blog_posts
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
CREATE POLICY "Public view published blog" ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all blog" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members write blog" ON public.blog_posts FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'blog.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'blog.edit'));

-- portfolio_projects
DROP POLICY IF EXISTS "Admins manage projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Admins view all projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Anyone view published projects" ON public.portfolio_projects;
CREATE POLICY "Public view published portfolio" ON public.portfolio_projects FOR SELECT TO anon, authenticated
  USING (published = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all portfolio" ON public.portfolio_projects FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members write portfolio" ON public.portfolio_projects FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'portfolio.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'portfolio.edit'));

-- announcements
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public view active announcements" ON public.announcements;
CREATE POLICY "Public view active announcements" ON public.announcements FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'announcements.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'announcements.edit'));

-- audit_log
DROP POLICY IF EXISTS "Admins view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated insert audit log" ON public.audit_log;
CREATE POLICY "Members view audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'audit.view'));
CREATE POLICY "Members insert audit" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id));

-- contact_messages
DROP POLICY IF EXISTS "Admins delete contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can send a valid contact message" ON public.contact_messages;
CREATE POLICY "Anyone send contact" ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    tenant_id = coalesce(public.current_tenant_id(), tenant_id)
    AND length(btrim(full_name)) BETWEEN 2 AND 200
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND length(btrim(message)) BETWEEN 1 AND 5000
  );
CREATE POLICY "Members view messages" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'messages.view'));
CREATE POLICY "Members update messages" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'messages.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'messages.edit'));
CREATE POLICY "Members delete messages" ON public.contact_messages FOR DELETE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'messages.delete'));

-- discount_campaigns
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.discount_campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.discount_campaigns;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.discount_campaigns;
CREATE POLICY "Public view active campaigns" ON public.discount_campaigns FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all campaigns" ON public.discount_campaigns FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members manage campaigns" ON public.discount_campaigns FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'campaigns.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'campaigns.edit'));

-- email_templates
DROP POLICY IF EXISTS "Admins manage email templates" ON public.email_templates;
CREATE POLICY "Members manage email templates" ON public.email_templates FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'email_templates.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'email_templates.edit'));

-- faq_items
DROP POLICY IF EXISTS "Admins manage faq" ON public.faq_items;
DROP POLICY IF EXISTS "Admins view all faq" ON public.faq_items;
DROP POLICY IF EXISTS "Anyone view active faq" ON public.faq_items;
CREATE POLICY "Public view active faq" ON public.faq_items FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all faq" ON public.faq_items FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members manage faq" ON public.faq_items FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'faq.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'faq.edit'));

-- job_applications
DROP POLICY IF EXISTS "Admins delete job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins update job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins view job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Anyone can submit job application" ON public.job_applications;
CREATE POLICY "Anyone submit job app" ON public.job_applications FOR INSERT TO anon, authenticated
  WITH CHECK (kvkk_consent = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view job apps" ON public.job_applications FOR SELECT TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'applications.view'));
CREATE POLICY "Members update job apps" ON public.job_applications FOR UPDATE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'applications.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'applications.edit'));
CREATE POLICY "Members delete job apps" ON public.job_applications FOR DELETE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'applications.delete'));

-- job_postings
DROP POLICY IF EXISTS "Admins manage job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Admins view all job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Anyone view active job postings" ON public.job_postings;
CREATE POLICY "Public view active jobs" ON public.job_postings FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all jobs" ON public.job_postings FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members manage jobs" ON public.job_postings FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'jobs.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'jobs.edit'));

-- legal_documents
DROP POLICY IF EXISTS "Admins manage legal_documents" ON public.legal_documents;
DROP POLICY IF EXISTS "Anyone view legal_documents" ON public.legal_documents;
CREATE POLICY "Public view legal" ON public.legal_documents FOR SELECT TO anon, authenticated
  USING (tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage legal" ON public.legal_documents FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'legal.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'legal.edit'));

-- machine_operation_requests
DROP POLICY IF EXISTS "Admins delete machine ops" ON public.machine_operation_requests;
DROP POLICY IF EXISTS "Admins update machine ops" ON public.machine_operation_requests;
DROP POLICY IF EXISTS "Admins view machine ops" ON public.machine_operation_requests;
DROP POLICY IF EXISTS "Anyone can submit machine operation request" ON public.machine_operation_requests;
CREATE POLICY "Anyone submit machine op" ON public.machine_operation_requests FOR INSERT TO anon, authenticated
  WITH CHECK (kvkk_consent = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view machine ops" ON public.machine_operation_requests FOR SELECT TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'machine_ops.view'));
CREATE POLICY "Members update machine ops" ON public.machine_operation_requests FOR UPDATE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'machine_ops.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'machine_ops.edit'));
CREATE POLICY "Members delete machine ops" ON public.machine_operation_requests FOR DELETE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'machine_ops.delete'));

-- materials
DROP POLICY IF EXISTS "Admins can manage materials" ON public.materials;
DROP POLICY IF EXISTS "Admins can view all materials" ON public.materials;
DROP POLICY IF EXISTS "Anyone can view active materials" ON public.materials;
CREATE POLICY "Public view active materials" ON public.materials FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all materials" ON public.materials FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members manage materials" ON public.materials FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'pricing.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'pricing.edit'));

-- media_library
DROP POLICY IF EXISTS "Admins manage media" ON public.media_library;
DROP POLICY IF EXISTS "Anyone can view media" ON public.media_library;
CREATE POLICY "Public view media" ON public.media_library FOR SELECT TO anon, authenticated
  USING (tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage media" ON public.media_library FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'media.upload'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'media.upload'));

-- nav_items
DROP POLICY IF EXISTS "Admins manage nav items" ON public.nav_items;
DROP POLICY IF EXISTS "Admins view all nav items" ON public.nav_items;
DROP POLICY IF EXISTS "Anyone view active nav items" ON public.nav_items;
CREATE POLICY "Public view active nav" ON public.nav_items FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all nav" ON public.nav_items FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members manage nav" ON public.nav_items FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'navigation.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'navigation.edit'));

-- newsletter_subscribers
DROP POLICY IF EXISTS "Admins manage subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (
    tenant_id = coalesce(public.current_tenant_id(), tenant_id)
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );
CREATE POLICY "Members manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'newsletter.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'newsletter.edit'));

-- pricing_settings (composite PK now)
DROP POLICY IF EXISTS "Admins can manage pricing settings" ON public.pricing_settings;
DROP POLICY IF EXISTS "Anyone can view pricing settings" ON public.pricing_settings;
ALTER TABLE public.pricing_settings DROP CONSTRAINT IF EXISTS pricing_settings_pkey;
ALTER TABLE public.pricing_settings ADD PRIMARY KEY (tenant_id, key);
CREATE POLICY "Public view pricing" ON public.pricing_settings FOR SELECT TO anon, authenticated
  USING (tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage pricing" ON public.pricing_settings FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'pricing.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'pricing.edit'));

-- quote_requests
DROP POLICY IF EXISTS "Admins delete quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins view quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can submit a valid quote" ON public.quote_requests;
CREATE POLICY "Anyone submit quote" ON public.quote_requests FOR INSERT TO anon, authenticated
  WITH CHECK (
    tenant_id = coalesce(public.current_tenant_id(), tenant_id)
    AND length(btrim(full_name)) BETWEEN 2 AND 200
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND length(btrim(part_description)) BETWEEN 1 AND 5000
    AND quantity BETWEEN 1 AND 1000
    AND status = 'new'
  );
CREATE POLICY "Members view quotes" ON public.quote_requests FOR SELECT TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'quotes.view'));
CREATE POLICY "Members update quotes" ON public.quote_requests FOR UPDATE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'quotes.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'quotes.edit'));
CREATE POLICY "Members delete quotes" ON public.quote_requests FOR DELETE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'quotes.delete'));

-- seo_meta
DROP POLICY IF EXISTS "Admins manage seo_meta" ON public.seo_meta;
DROP POLICY IF EXISTS "Anyone view seo_meta" ON public.seo_meta;
ALTER TABLE public.seo_meta DROP CONSTRAINT IF EXISTS seo_meta_path_key;
CREATE UNIQUE INDEX IF NOT EXISTS seo_meta_tenant_path_key ON public.seo_meta (tenant_id, path);
CREATE POLICY "Public view seo" ON public.seo_meta FOR SELECT TO anon, authenticated
  USING (tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage seo" ON public.seo_meta FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'seo.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'seo.edit'));

-- site_settings (composite PK)
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE public.site_settings ADD PRIMARY KEY (tenant_id, key);
CREATE POLICY "Public view site settings" ON public.site_settings FOR SELECT TO anon, authenticated
  USING (tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'settings.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'settings.edit'));

-- testimonials
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone view active testimonials" ON public.testimonials;
CREATE POLICY "Public view active testimonials" ON public.testimonials FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members view all testimonials" ON public.testimonials FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "Members manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'testimonials.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'testimonials.edit'));

-- translations (composite PK)
DROP POLICY IF EXISTS "Admins can delete translations" ON public.translations;
DROP POLICY IF EXISTS "Admins can insert translations" ON public.translations;
DROP POLICY IF EXISTS "Admins can update translations" ON public.translations;
DROP POLICY IF EXISTS "Anyone can read translations" ON public.translations;
ALTER TABLE public.translations DROP CONSTRAINT IF EXISTS translations_pkey;
ALTER TABLE public.translations ADD PRIMARY KEY (tenant_id, namespace, key);
CREATE POLICY "Public read translations" ON public.translations FOR SELECT TO anon, authenticated
  USING (tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage translations" ON public.translations FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'translations.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'translations.edit'));

-- url_redirects
DROP POLICY IF EXISTS "Admins manage redirects" ON public.url_redirects;
DROP POLICY IF EXISTS "Public view redirects" ON public.url_redirects;
CREATE POLICY "Public view active redirects" ON public.url_redirects FOR SELECT TO anon, authenticated
  USING (active = true AND tenant_id = coalesce(public.current_tenant_id(), tenant_id));
CREATE POLICY "Members manage redirects" ON public.url_redirects FOR ALL TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'redirects.edit'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'redirects.edit'));
