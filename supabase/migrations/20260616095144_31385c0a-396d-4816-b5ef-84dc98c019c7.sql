
-- pages
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  template text NOT NULL DEFAULT 'generic',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  locale_default text NOT NULL DEFAULT 'tr',
  title text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages: public can read published"
  ON public.pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "pages: tenant members can read all"
  ON public.pages FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "pages: managers can insert"
  ON public.pages FOR INSERT TO authenticated
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'pages.manage', auth.uid()));

CREATE POLICY "pages: managers can update"
  ON public.pages FOR UPDATE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'pages.manage', auth.uid()))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'pages.manage', auth.uid()));

CREATE POLICY "pages: managers can delete"
  ON public.pages FOR DELETE TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'pages.manage', auth.uid()));

CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pages_tenant_slug ON public.pages(tenant_id, slug);
CREATE INDEX idx_pages_status ON public.pages(status);

-- page_blocks
CREATE TABLE public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_blocks TO authenticated;
GRANT ALL ON public.page_blocks TO service_role;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_blocks: public can read for published pages"
  ON public.page_blocks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND p.status = 'published'));

CREATE POLICY "page_blocks: tenant members can read all"
  ON public.page_blocks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.is_tenant_member(p.tenant_id, auth.uid())));

CREATE POLICY "page_blocks: managers can insert"
  ON public.page_blocks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())));

CREATE POLICY "page_blocks: managers can update"
  ON public.page_blocks FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())));

CREATE POLICY "page_blocks: managers can delete"
  ON public.page_blocks FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())));

CREATE TRIGGER trg_page_blocks_updated_at
  BEFORE UPDATE ON public.page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_page_blocks_page_position ON public.page_blocks(page_id, position);

-- page_translations
CREATE TABLE public.page_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  block_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page_id, locale)
);
GRANT SELECT ON public.page_translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_translations TO authenticated;
GRANT ALL ON public.page_translations TO service_role;
ALTER TABLE public.page_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_translations: public read for published"
  ON public.page_translations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND p.status = 'published'));

CREATE POLICY "page_translations: tenant members read all"
  ON public.page_translations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.is_tenant_member(p.tenant_id, auth.uid())));

CREATE POLICY "page_translations: managers insert"
  ON public.page_translations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())));

CREATE POLICY "page_translations: managers update"
  ON public.page_translations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())));

CREATE POLICY "page_translations: managers delete"
  ON public.page_translations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND public.tenant_user_has_permission(p.tenant_id, 'pages.manage', auth.uid())));

CREATE TRIGGER trg_page_translations_updated_at
  BEFORE UPDATE ON public.page_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
