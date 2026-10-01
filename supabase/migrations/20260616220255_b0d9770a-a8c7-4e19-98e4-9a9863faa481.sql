
-- Collections: tenant-scoped generic content types
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  schema jsonb NOT NULL DEFAULT '{"fields":[]}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections readable by anyone"
  ON public.collections FOR SELECT
  USING (true);

CREATE POLICY "Collections manageable by tenant members with cms permission"
  ON public.collections FOR ALL
  USING (public.tenant_user_has_permission(tenant_id, 'cms.manage'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'cms.manage'));

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Collection items: records within a collection
CREATE TABLE public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  seo jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, slug)
);

GRANT SELECT ON public.collection_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_items TO authenticated;
GRANT ALL ON public.collection_items TO service_role;

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection items readable by anyone if published"
  ON public.collection_items FOR SELECT
  USING (status = 'published' OR public.tenant_user_has_permission(tenant_id, 'cms.manage'));

CREATE POLICY "Collection items manageable by tenant members with cms permission"
  ON public.collection_items FOR ALL
  USING (public.tenant_user_has_permission(tenant_id, 'cms.manage'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'cms.manage'));

CREATE INDEX collection_items_collection_idx ON public.collection_items(collection_id);
CREATE INDEX collection_items_tenant_idx ON public.collection_items(tenant_id);
CREATE INDEX collection_items_data_idx ON public.collection_items USING gin(data);

CREATE TRIGGER collection_items_updated_at
  BEFORE UPDATE ON public.collection_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Route templates: dynamic URL patterns bound to a template page + optional collection
CREATE TABLE public.route_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  pattern text NOT NULL,
  template_page_id uuid REFERENCES public.pages(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  param_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, pattern)
);

GRANT SELECT ON public.route_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_templates TO authenticated;
GRANT ALL ON public.route_templates TO service_role;

ALTER TABLE public.route_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Route templates readable by anyone"
  ON public.route_templates FOR SELECT
  USING (true);

CREATE POLICY "Route templates manageable by tenant members with cms permission"
  ON public.route_templates FOR ALL
  USING (public.tenant_user_has_permission(tenant_id, 'cms.manage'))
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'cms.manage'));

CREATE TRIGGER route_templates_updated_at
  BEFORE UPDATE ON public.route_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
