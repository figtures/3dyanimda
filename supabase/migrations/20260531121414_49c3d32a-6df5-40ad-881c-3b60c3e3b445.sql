
-- ============ MEDIA LIBRARY ============
CREATE TABLE public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  public_url text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  width integer,
  height integer,
  size_bytes integer,
  alt_tr text DEFAULT '',
  alt_en text DEFAULT '',
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_library TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view media" ON public.media_library FOR SELECT USING (true);
CREATE POLICY "Admins manage media" ON public.media_library FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE INDEX idx_media_category ON public.media_library(category);
CREATE INDEX idx_media_created ON public.media_library(created_at DESC);

-- ============ FAQ ITEMS ============
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_tr text NOT NULL,
  answer_tr text NOT NULL,
  question_en text DEFAULT '',
  answer_en text DEFAULT '',
  category text DEFAULT 'general',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq_items TO authenticated;
GRANT ALL ON public.faq_items TO service_role;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active faq" ON public.faq_items FOR SELECT USING (active = true);
CREATE POLICY "Admins view all faq" ON public.faq_items FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage faq" ON public.faq_items FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER faq_updated_at BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TESTIMONIALS ============
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_title text DEFAULT '',
  company text DEFAULT '',
  quote_tr text NOT NULL,
  quote_en text DEFAULT '',
  avatar_url text,
  rating integer DEFAULT 5,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active testimonials" ON public.testimonials FOR SELECT USING (active = true);
CREATE POLICY "Admins view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STORAGE BUCKET site-images ============
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images','site-images', true)
  ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public read site-images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Admins upload site-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='site-images' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update site-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='site-images' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete site-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='site-images' AND has_role(auth.uid(),'admin'));
