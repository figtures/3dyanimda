-- Storage validates upload size and declared MIME on the server. Existing objects
-- remain available. RLS path/extension rules and quotas also apply to direct API calls.
UPDATE storage.buckets SET file_size_limit=20971520,
 allowed_mime_types=ARRAY['application/octet-stream','text/plain','model/stl','model/x.stl','application/x-stl','application/vnd.ms-pki.stl','application/sla','model/obj','model/3mf','application/zip','application/vnd.ms-package.3dmanufacturing-3dmodel+xml','model/step','application/step','model/iges','application/iges']
 WHERE id='stl-uploads';
UPDATE storage.buckets SET file_size_limit=15728640,
 allowed_mime_types=ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png','image/webp','image/heic','image/heif','application/octet-stream','text/plain','model/stl','model/x.stl','application/x-stl','application/vnd.ms-pki.stl','application/sla','model/obj','model/3mf','application/zip','model/step','application/step']
 WHERE id='career-uploads';
UPDATE storage.buckets SET file_size_limit=10485760,
 allowed_mime_types=ARRAY['image/png','image/jpeg','image/webp','image/avif','image/gif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon']
 WHERE id IN ('site-images','site-assets','blog-images');

CREATE SCHEMA IF NOT EXISTS security_private;
REVOKE ALL ON SCHEMA security_private FROM PUBLIC;
GRANT USAGE ON SCHEMA security_private TO anon, authenticated;

-- Storage owns its indexes; use the existing bucket/name index and leave
-- the managed table's structural ownership untouched.

CREATE OR REPLACE FUNCTION security_private.upload_within_quota(_bucket text, _name text)
RETURNS boolean LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=''
AS $$
DECLARE tid uuid := public.current_tenant_id(); hourly bigint; daily bigint; hourly_bytes numeric; daily_bytes numeric;
BEGIN
 IF tid IS NULL OR split_part(_name,'/',1) <> tid::text THEN RETURN false; END IF;
 -- Serialize reservations for a brand/bucket, including callers rotating IPs or
 -- creating new anonymous accounts. No client-supplied IP is trusted.
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('upload:'||tid::text||':'||_bucket,0));
 SELECT count(*) FILTER(WHERE created_at > now()-interval '1 hour'), count(*),
   coalesce(sum(coalesce((metadata->>'size')::numeric,0)) FILTER(WHERE created_at > now()-interval '1 hour'),0),
   coalesce(sum(coalesce((metadata->>'size')::numeric,0)),0)
 INTO hourly,daily,hourly_bytes,daily_bytes FROM storage.objects
 WHERE bucket_id=_bucket AND split_part(name,'/',1)=tid::text AND created_at > now()-interval '1 day';
 RETURN hourly < 60 AND daily < 300 AND hourly_bytes <= 104857600 AND daily_bytes <= 1052770304;
END $$;
REVOKE ALL ON FUNCTION security_private.upload_within_quota(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION security_private.upload_within_quota(text,text) TO anon, authenticated;

CREATE POLICY "Upload quota and safe image extensions" ON storage.objects
 AS RESTRICTIVE FOR INSERT TO anon, authenticated
 WITH CHECK (
   bucket_id NOT IN ('stl-uploads','career-uploads','site-images','site-assets','blog-images') OR
   (security_private.upload_within_quota(bucket_id,name) AND
    (bucket_id NOT IN ('site-images','site-assets','blog-images') OR name ~* '\.(png|jpe?g|webp|avif|gif|svg|ico)$'))
 );

-- The machine form already accepts HEIC/HEIF; match the server allow list.
ALTER POLICY "Public can upload career files" ON storage.objects
 WITH CHECK (bucket_id='career-uploads' AND length(name) BETWEEN 40 AND 255
 AND (storage.foldername(name))[1]=public.current_tenant_id()::text
 AND (storage.foldername(name))[2] IN ('applications','machines')
 AND name ~* '\.(pdf|docx?|jpe?g|png|webp|heic|heif|stl|obj|3mf|step|stp)$');

CREATE OR REPLACE FUNCTION security_private.guard_public_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE payload jsonb := to_jsonb(NEW); tid uuid := (payload->>'tenant_id')::uuid;
 address text := lower(btrim(payload->>'email')); hourly bigint; daily bigint; same_email bigint;
BEGIN
 -- Trusted maintenance imports are not browser submissions.
 IF current_setting('role',true) IN ('none','postgres','service_role') THEN RETURN NEW; END IF;
 NEW.created_at := clock_timestamp();
 NEW.email := address;
 IF payload ? 'admin_notes' THEN NEW := jsonb_populate_record(NEW,jsonb_build_object('admin_notes',NULL)); END IF;
 IF tid IS NULL OR tid IS DISTINCT FROM public.current_tenant_id() THEN
   RAISE EXCEPTION 'Invalid brand context' USING ERRCODE='42501'; END IF;
 IF address IS NULL OR length(address)>254 OR address !~ '^[^[:space:]@<>]+@[^[:space:]@<>]+\.[^[:space:]@<>]+$'
 OR octet_length(payload::text)>32768 THEN RAISE EXCEPTION 'Invalid submission'; END IF;
 IF payload ? 'full_name' AND length(btrim(payload->>'full_name')) NOT BETWEEN 2 AND 200 THEN
   RAISE EXCEPTION 'Invalid name'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('form:'||tid::text||':'||TG_TABLE_NAME,0));
 EXECUTE format('SELECT count(*) FILTER(WHERE created_at>now()-interval ''1 hour''), count(*), count(*) FILTER(WHERE created_at>now()-interval ''1 hour'' AND lower(btrim(email))=$2) FROM public.%I WHERE tenant_id=$1 AND created_at>now()-interval ''1 day''',TG_TABLE_NAME)
 INTO hourly,daily,same_email USING tid,address;
 IF hourly>=100 OR daily>=500 OR same_email>=5 THEN
   RAISE EXCEPTION 'Gönderim sınırına ulaşıldı. Lütfen daha sonra tekrar deneyin.' USING ERRCODE='P0001'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION security_private.guard_public_submission() FROM PUBLIC,anon,authenticated;

DO $$ DECLARE tbl text; BEGIN
 FOREACH tbl IN ARRAY ARRAY['quote_requests','contact_messages','job_applications','machine_operation_requests','newsletter_subscribers'] LOOP
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(tenant_id,created_at DESC)',tbl||'_submission_quota_idx',tbl);
  EXECUTE format('CREATE TRIGGER guard_public_submission BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION security_private.guard_public_submission()',tbl);
 END LOOP;
END $$;
