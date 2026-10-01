
-- 1) Server-side tenant resolution (host-based), with single-tenant fallback.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  hdrs json;
  candidate text;
  tid uuid;
  active_count int;
BEGIN
  BEGIN
    hdrs := current_setting('request.headers', true)::json;
  EXCEPTION WHEN OTHERS THEN
    hdrs := NULL;
  END;

  IF hdrs IS NOT NULL THEN
    candidate := NULLIF(hdrs->>'x-forwarded-host', '');
    IF candidate IS NULL THEN candidate := NULLIF(hdrs->>'host', ''); END IF;
    IF candidate IS NULL THEN
      candidate := NULLIF(regexp_replace(coalesce(hdrs->>'origin',''), '^https?://([^/:]+).*$', '\1'), '');
    END IF;
    IF candidate IS NULL THEN
      candidate := NULLIF(regexp_replace(coalesce(hdrs->>'referer',''), '^https?://([^/:]+).*$', '\1'), '');
    END IF;

    IF candidate IS NOT NULL THEN
      candidate := lower(candidate);

      SELECT id INTO tid
        FROM public.tenants
       WHERE status = 'active'
         AND (lower(custom_domain) = candidate OR lower(domain) = candidate)
       LIMIT 1;
      IF tid IS NOT NULL THEN RETURN tid; END IF;

      SELECT id INTO tid
        FROM public.tenants
       WHERE status = 'active'
         AND slug = split_part(candidate, '.', 1)
       LIMIT 1;
      IF tid IS NOT NULL THEN RETURN tid; END IF;
    END IF;
  END IF;

  -- Single-tenant deployment fallback (preserves preview/lovable.app domains).
  SELECT count(*) INTO active_count FROM public.tenants WHERE status = 'active';
  IF active_count = 1 THEN
    SELECT id INTO tid FROM public.tenants WHERE status = 'active' LIMIT 1;
    RETURN tid;
  END IF;

  RETURN NULL;
END;
$$;

-- 2) Tighten public tenants SELECT — only own/member tenant is visible.
DROP POLICY IF EXISTS "Anyone resolve tenants" ON public.tenants;
CREATE POLICY "Resolve own tenant"
  ON public.tenants FOR SELECT
  TO anon, authenticated
  USING (
    id = public.current_tenant_id()
    OR public.is_super_admin()
    OR public.is_tenant_member(id)
  );

-- 3) Testimonials: require a known tenant context.
DROP POLICY IF EXISTS "Public view active testimonials" ON public.testimonials;
CREATE POLICY "Public view active testimonials"
  ON public.testimonials FOR SELECT
  TO anon, authenticated
  USING (
    active = true
    AND public.current_tenant_id() IS NOT NULL
    AND tenant_id = public.current_tenant_id()
  );

-- 4) Audit log: remove direct member INSERT; add SECURITY DEFINER writer.
DROP POLICY IF EXISTS "Members insert audit" ON public.audit_log;
REVOKE INSERT ON public.audit_log FROM authenticated;

CREATE OR REPLACE FUNCTION public.log_audit_event(
  _tenant_id uuid,
  _action text,
  _table_name text,
  _record_id text DEFAULT NULL,
  _details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _id uuid;
  _uid uuid := auth.uid();
  _email text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF NOT public.is_tenant_member(_tenant_id, _uid) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  INSERT INTO public.audit_log (tenant_id, user_id, user_email, action, table_name, record_id, details)
  VALUES (_tenant_id, _uid, _email, _action, _table_name, _record_id, coalesce(_details, '{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(uuid, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_event(uuid, text, text, text, jsonb) TO authenticated;

-- 5) Storage upload constraints: path prefix, name length, extension whitelist.
DROP POLICY IF EXISTS "Public can upload STL files" ON storage.objects;
CREATE POLICY "Public can upload STL files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'stl-uploads'
    AND length(name) BETWEEN 5 AND 255
    AND name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-.+\.(stl|obj|3mf|step|stp|igs|iges)$'
  );

DROP POLICY IF EXISTS "Public can upload career files" ON storage.objects;
CREATE POLICY "Public can upload career files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'career-uploads'
    AND length(name) BETWEEN 5 AND 255
    AND (storage.foldername(name))[1] IN ('applications', 'machines')
    AND name ~* '\.(pdf|doc|docx|jpg|jpeg|png|webp|stl|obj|3mf|step|stp)$'
  );
