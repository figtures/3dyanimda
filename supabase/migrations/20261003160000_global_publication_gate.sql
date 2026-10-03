-- Global, fail-closed publication approvals. Browser roles cannot issue or alter certificates.
CREATE TABLE public.publication_reviews (
 tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
 path text NOT NULL,
 collection text NOT NULL CHECK(collection IN ('landing_pages','pages','blog_posts')),
 payload_hash text NOT NULL CHECK(length(payload_hash)=32),
 manifest_hash text NOT NULL CHECK(length(manifest_hash)=64),
 report jsonb NOT NULL CHECK(jsonb_typeof(report)='object'),
 approved_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,collection,path),
 CHECK(report->>'result'='pass'),
 CHECK(report->>'policy'='global-originality-v1')
);
ALTER TABLE public.publication_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.publication_reviews FROM anon,authenticated;
GRANT SELECT ON public.publication_reviews TO authenticated;
GRANT ALL ON public.publication_reviews TO service_role;
CREATE POLICY "Selected tenant review status" ON public.publication_reviews FOR SELECT TO authenticated USING(tenant_id=public.current_tenant_id() AND public.tenant_user_has_permission(tenant_id,'seo.edit'));
CREATE TABLE public.original_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
 path text NOT NULL,
 kind text NOT NULL CHECK(kind IN ('image','model')),
 storage_path text NOT NULL UNIQUE,
 sha256 text NOT NULL UNIQUE CHECK(length(sha256)=64),
 perceptual_hash bit(64),
 geometry_hash text UNIQUE,
 provenance jsonb NOT NULL CHECK(jsonb_typeof(provenance)='object'),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.original_assets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.original_assets FROM anon,authenticated;
GRANT SELECT ON public.original_assets TO authenticated;
GRANT ALL ON public.original_assets TO service_role;
CREATE POLICY "Selected tenant assets" ON public.original_assets FOR SELECT TO authenticated USING(tenant_id=public.current_tenant_id() AND public.tenant_user_has_permission(tenant_id,'seo.edit'));
CREATE FUNCTION public.enforce_asset_originality() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(610031600);
 IF NEW.kind='image' AND NEW.perceptual_hash IS NULL THEN RAISE EXCEPTION 'Image perceptual fingerprint required'; END IF;
 IF NEW.kind='model' AND NEW.geometry_hash IS NULL THEN RAISE EXCEPTION 'Model geometry fingerprint required'; END IF;
 IF NEW.perceptual_hash IS NOT NULL AND EXISTS(SELECT 1 FROM original_assets a WHERE a.id<>NEW.id AND a.perceptual_hash IS NOT NULL AND length(replace((a.perceptual_hash # NEW.perceptual_hash)::text,'0',''))<=8)
 THEN RAISE EXCEPTION 'Image resembles an existing asset across the brand network'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.enforce_asset_originality() FROM PUBLIC;
CREATE TRIGGER original_asset_guard BEFORE INSERT OR UPDATE ON public.original_assets FOR EACH ROW EXECUTE FUNCTION public.enforce_asset_originality();
CREATE FUNCTION public.publication_payload_hash(payload jsonb) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT md5((payload - ARRAY['id','updated_at','created_at','status','published'])::text)
$$;
CREATE FUNCTION public.enforce_global_publication_review() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE doc jsonb; route text; live boolean;
BEGIN
 doc=to_jsonb(NEW);
 live=CASE WHEN TG_TABLE_NAME='blog_posts' THEN coalesce((doc->>'published')::boolean,false) ELSE doc->>'status'='published' END;
 IF NOT live THEN RETURN NEW; END IF;
 route=CASE WHEN TG_TABLE_NAME='landing_pages' THEN doc->>'path' WHEN TG_TABLE_NAME='blog_posts' THEN '/blog/'||(doc->>'slug') ELSE '/'||ltrim(doc->>'slug','/') END;
 PERFORM pg_advisory_xact_lock(610031601);
 IF NOT EXISTS(SELECT 1 FROM public.publication_reviews r WHERE r.tenant_id=NEW.tenant_id AND r.collection=TG_TABLE_NAME AND r.path=route AND r.payload_hash=public.publication_payload_hash(doc))
 THEN RAISE EXCEPTION 'Global originality review required. Save as draft; text, images, models and SEO must pass the cross-brand gate before publication.'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.enforce_global_publication_review() FROM PUBLIC;
CREATE TRIGGER global_landing_review BEFORE INSERT OR UPDATE ON public.landing_pages FOR EACH ROW EXECUTE FUNCTION public.enforce_global_publication_review();
CREATE TRIGGER global_page_review BEFORE INSERT OR UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.enforce_global_publication_review();
CREATE TRIGGER global_blog_review BEFORE INSERT OR UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.enforce_global_publication_review();
-- Previously seeded demonstration prose has not passed a network-wide review.
UPDATE public.landing_pages SET status='draft' WHERE status='published';
UPDATE public.pages SET status='draft' WHERE status='published';
UPDATE public.blog_posts SET published=false WHERE published=true;
-- Changes to CMS blocks revoke the parent page's approval in the same transaction.
CREATE FUNCTION public.revoke_page_block_review() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE parent_id uuid;
BEGIN
 parent_id=CASE WHEN TG_OP='DELETE' THEN OLD.page_id ELSE NEW.page_id END;
 DELETE FROM publication_reviews r USING pages p WHERE p.id=parent_id AND r.tenant_id=p.tenant_id AND r.collection='pages' AND r.path='/'||ltrim(p.slug,'/');
 UPDATE pages SET status='draft' WHERE id=parent_id;
 IF TG_OP='UPDATE' AND OLD.page_id IS DISTINCT FROM NEW.page_id THEN
  DELETE FROM publication_reviews r USING pages p WHERE p.id=OLD.page_id AND r.tenant_id=p.tenant_id AND r.collection='pages' AND r.path='/'||ltrim(p.slug,'/');
  UPDATE pages SET status='draft' WHERE id=OLD.page_id;
 END IF;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.revoke_page_block_review() FROM PUBLIC;
CREATE TRIGGER page_blocks_revoke_review AFTER INSERT OR UPDATE OR DELETE ON public.page_blocks FOR EACH ROW EXECUTE FUNCTION public.revoke_page_block_review();
-- Collection-driven routes are held until their rendered expansions are individually audited.
UPDATE public.route_templates SET is_active=false WHERE is_active=true;
NOTIFY pgrst,'reload schema';
