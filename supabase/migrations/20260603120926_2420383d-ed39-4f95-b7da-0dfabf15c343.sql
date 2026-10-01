
-- Add admin fields to job_applications
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE POLICY "Admins view job applications"
  ON public.job_applications FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update job applications"
  ON public.job_applications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete job applications"
  ON public.job_applications FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;

-- Add admin fields to machine_operation_requests
ALTER TABLE public.machine_operation_requests
  ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE POLICY "Admins view machine ops"
  ON public.machine_operation_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update machine ops"
  ON public.machine_operation_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete machine ops"
  ON public.machine_operation_requests FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT, UPDATE, DELETE ON public.machine_operation_requests TO authenticated;
GRANT ALL ON public.machine_operation_requests TO service_role;

-- updated_at triggers
CREATE TRIGGER trg_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_machine_ops_updated_at
  BEFORE UPDATE ON public.machine_operation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for career-uploads (admins can read/delete)
CREATE POLICY "Admins read career uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'career-uploads' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete career uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'career-uploads' AND has_role(auth.uid(), 'admin'::app_role));

-- Email templates
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text DEFAULT '',
  subject_tr text NOT NULL DEFAULT '',
  subject_en text NOT NULL DEFAULT '',
  body_tr text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  variables text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage email templates"
  ON public.email_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default templates
INSERT INTO public.email_templates (key, description, subject_tr, subject_en, body_tr, body_en, variables) VALUES
  ('quote_received', 'Teklif talebi alındığında müşteriye gönderilir', 'Teklif talebiniz alındı', 'We received your quote request', E'Merhaba {{name}},\n\nTeklif talebinizi aldık. En kısa sürede dönüş yapacağız.\n\n3D Yanında', E'Hi {{name}},\n\nWe received your quote request and will get back to you shortly.\n\n3D Yanında', ARRAY['name','email']),
  ('application_received', 'İş başvurusu alındığında adaya gönderilir', 'Başvurunuzu aldık', 'We received your application', E'Merhaba {{name}},\n\n{{position}} pozisyonu için başvurunuzu aldık. 5 iş günü içinde dönüş yapacağız.\n\n3D Yanında İK', E'Hi {{name}},\n\nWe received your application for {{position}}. We''ll respond within 5 business days.\n\n3D Yanında HR', ARRAY['name','position']),
  ('contact_reply', 'İletişim formuna yanıt için şablon', 'Mesajınız için teşekkürler', 'Thank you for reaching out', E'Merhaba {{name}},\n\nMesajınız için teşekkürler. {{reply}}\n\n3D Yanında', E'Hi {{name}},\n\nThank you for your message. {{reply}}\n\n3D Yanında', ARRAY['name','reply'])
ON CONFLICT (key) DO NOTHING;
