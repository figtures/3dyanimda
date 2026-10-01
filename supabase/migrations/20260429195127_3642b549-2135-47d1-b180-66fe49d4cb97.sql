
-- Quote requests table
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  part_description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  material_pref TEXT,
  service_type TEXT,
  stl_file_path TEXT,
  stl_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert (form submissions); reads restricted (admin uses service-role via dashboard)
CREATE POLICY "Anyone can submit a quote"
  ON public.quote_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Storage bucket for STL files (private; edge function reads with service role)
INSERT INTO storage.buckets (id, name, public)
VALUES ('stl-uploads', 'stl-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads to stl-uploads (we only let them write, not read)
CREATE POLICY "Public can upload STL files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'stl-uploads');

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
