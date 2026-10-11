-- Preserve content freshness when only approval, status or internal evidence changes.
-- Runs alphabetically after landing_publication_guard; all publication guards remain intact.
CREATE OR REPLACE FUNCTION public.preserve_landing_content_date()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $function$
BEGIN
  IF (to_jsonb(NEW) - ARRAY['id','tenant_id','created_at','updated_at','status','reviewed_at','evidence'])
     IS NOT DISTINCT FROM
     (to_jsonb(OLD) - ARRAY['id','tenant_id','created_at','updated_at','status','reviewed_at','evidence']) THEN
    NEW.updated_at := OLD.updated_at;
  ELSE
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE TRIGGER zz_landing_content_modified
BEFORE UPDATE ON public.landing_pages FOR EACH ROW
EXECUTE FUNCTION public.preserve_landing_content_date();
