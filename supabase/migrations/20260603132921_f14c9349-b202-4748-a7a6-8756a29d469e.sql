-- 1. contact_messages: admin access + status fields
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE POLICY "Admins view contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. quote_requests: admin view/update/delete (badge count + Requests admin page reads)
CREATE POLICY "Admins view quote requests" ON public.quote_requests
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update quote requests" ON public.quote_requests
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete quote requests" ON public.quote_requests
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. job_postings
CREATE TABLE public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_tr text NOT NULL,
  title_en text DEFAULT '',
  department text DEFAULT '',
  location text DEFAULT 'Beylikdüzü / İstanbul',
  employment_type text DEFAULT 'Tam Zamanlı',
  level text DEFAULT '',
  icon text DEFAULT 'Briefcase',
  summary_tr text DEFAULT '',
  summary_en text DEFAULT '',
  description_tr text DEFAULT '',
  description_en text DEFAULT '',
  requirements_tr text DEFAULT '',
  requirements_en text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.job_postings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_postings TO authenticated;
GRANT ALL ON public.job_postings TO service_role;

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active job postings" ON public.job_postings
  FOR SELECT USING (active = true);
CREATE POLICY "Admins view all job postings" ON public.job_postings
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage job postings" ON public.job_postings
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. nav_items (header/footer links)
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,           -- 'header' | 'footer_services' | 'footer_solutions' | 'footer_districts' | 'footer_company'
  label_tr text NOT NULL,
  label_en text DEFAULT '',
  url text NOT NULL,
  parent text DEFAULT '',           -- for header mega menu group (e.g. 'Hizmetler', 'Sektörler') or empty for top-level
  badge text DEFAULT '',
  description_tr text DEFAULT '',
  description_en text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nav_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_items TO authenticated;
GRANT ALL ON public.nav_items TO service_role;

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active nav items" ON public.nav_items
  FOR SELECT USING (active = true);
CREATE POLICY "Admins view all nav items" ON public.nav_items
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage nav items" ON public.nav_items
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_nav_items_updated_at
  BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
