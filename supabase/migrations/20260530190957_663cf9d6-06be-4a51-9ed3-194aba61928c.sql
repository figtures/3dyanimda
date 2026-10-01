-- Discount campaigns
CREATE TABLE public.discount_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  badge text,
  message text NOT NULL DEFAULT 'Sınırlı süreli indirim!',
  discount_type text NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_quote_amount numeric NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 1,
  countdown_seconds integer NOT NULL DEFAULT 600,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.discount_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_campaigns TO authenticated;
GRANT ALL ON public.discount_campaigns TO service_role;

ALTER TABLE public.discount_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active campaigns"
  ON public.discount_campaigns FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can view all campaigns"
  ON public.discount_campaigns FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage campaigns"
  ON public.discount_campaigns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER discount_campaigns_updated_at
  BEFORE UPDATE ON public.discount_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Track applied discount on quote requests
ALTER TABLE public.quote_requests
  ADD COLUMN applied_campaign_name text,
  ADD COLUMN applied_discount_amount numeric;