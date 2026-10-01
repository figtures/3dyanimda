
-- Storage bucket: career uploads (CV, makine fotoğrafı, dosyalar)
INSERT INTO storage.buckets (id, name, public)
VALUES ('career-uploads', 'career-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Job applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  experience_years INTEGER,
  cover_letter TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  cv_file_path TEXT,
  cv_file_name TEXT,
  kvkk_consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit job application"
  ON public.job_applications FOR INSERT
  WITH CHECK (kvkk_consent = true);

-- Machine operation requests (makinemi getirin işletin)
CREATE TABLE public.machine_operation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  machine_brand TEXT NOT NULL,
  machine_model TEXT NOT NULL,
  machine_type TEXT NOT NULL,
  build_volume TEXT,
  current_location TEXT,
  expected_volume TEXT,
  service_scope TEXT[],
  details TEXT,
  attachment_path TEXT,
  attachment_name TEXT,
  kvkk_consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.machine_operation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit machine operation request"
  ON public.machine_operation_requests FOR INSERT
  WITH CHECK (kvkk_consent = true);

-- Storage policies: anyone can upload to career-uploads (path-scoped); no public read
CREATE POLICY "Public can upload career files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'career-uploads');
