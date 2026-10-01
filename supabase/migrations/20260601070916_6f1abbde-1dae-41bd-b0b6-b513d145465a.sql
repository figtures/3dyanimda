
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS title_en text DEFAULT '',
  ADD COLUMN IF NOT EXISTS excerpt_en text DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_en text DEFAULT '';

CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_tr text NOT NULL,
  title_en text DEFAULT '',
  excerpt_tr text DEFAULT '',
  excerpt_en text DEFAULT '',
  content_tr text DEFAULT '',
  content_en text DEFAULT '',
  cover_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  industry text DEFAULT '',
  materials text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portfolio_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT ALL ON public.portfolio_projects TO service_role;

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view published projects"
  ON public.portfolio_projects FOR SELECT
  USING (published = true);

CREATE POLICY "Admins view all projects"
  ON public.portfolio_projects FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage projects"
  ON public.portfolio_projects FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
