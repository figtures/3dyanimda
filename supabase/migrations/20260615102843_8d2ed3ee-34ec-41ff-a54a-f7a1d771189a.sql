
-- 1) Extend quote_requests
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_reply_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_quote_requests_archived
  ON public.quote_requests (tenant_id, archived, created_at DESC);

-- 2) Replies table
CREATE TABLE IF NOT EXISTS public.quote_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'email',
  subject text,
  body text NOT NULL,
  to_email text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quote_replies_quote ON public.quote_replies (quote_id, created_at DESC);

GRANT SELECT, INSERT ON public.quote_replies TO authenticated;
GRANT ALL ON public.quote_replies TO service_role;

ALTER TABLE public.quote_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view quote replies"
  ON public.quote_replies FOR SELECT TO authenticated
  USING (public.tenant_user_has_permission(tenant_id, 'quotes.view'));

CREATE POLICY "Members create quote replies"
  ON public.quote_replies FOR INSERT TO authenticated
  WITH CHECK (public.tenant_user_has_permission(tenant_id, 'quotes.edit'));

-- 3) Storage policy: tenant members can read attachments
CREATE POLICY "Tenant members read stl-uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'stl-uploads'
    AND EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.user_id = auth.uid() AND tu.status = 'active'
    )
  );

CREATE POLICY "Tenant members read career-uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'career-uploads'
    AND EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.user_id = auth.uid() AND tu.status = 'active'
    )
  );
