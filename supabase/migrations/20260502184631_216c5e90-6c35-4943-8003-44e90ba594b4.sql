DROP POLICY IF EXISTS "Anyone can submit a quote" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can send contact message" ON public.contact_messages;

CREATE POLICY "Anyone can submit a valid quote"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 2 AND 200
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND length(trim(part_description)) BETWEEN 1 AND 5000
  AND quantity BETWEEN 1 AND 1000
  AND status = 'new'
);

CREATE POLICY "Anyone can send a valid contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 2 AND 200
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND length(trim(message)) BETWEEN 1 AND 5000
);