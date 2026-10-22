/** Generate a tenant-scoped, optimistic-concurrency seed after the actual review. */
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {sourceSnapshot,verifyCertificate} from './quality/release-certificate.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const delta=await read('content/authoring/seo-gap-cms-delta-2026-10-23.json');
const certificate=await read('content/release-review.json');
verifyCertificate(certificate,sourceSnapshot());
const review=await read('docs/audits/seo-gap-release-review-2026-10-23.json');
assert.equal(review.result,'pass');
for(const file of ['content/authoring/seo-gap-cms-delta-2026-10-23.json','docs/audits/seo-gap-release-review-2026-10-23.json'])assert.ok(certificate.evidence.some(item=>item.file===file),'Exact reviewed evidence missing: '+file);
const meta=await read('content/authoring/seo-gap-meta-3dyanimda-2026-10-23.json');
const entries=Array.isArray(meta)?meta:meta.records;
assert.equal(entries.length,103);assert.equal(new Set(entries.map(p=>p.path)).size,103);
const literal=data=>"'"+JSON.stringify(data).replaceAll("'","''")+"'::jsonb";
const report={policy:'global-originality-v1',result:'pass',reviewer:'Codex (AI, owner-requested implementation)',reviewerType:'ai_agent',humanReviewPerformed:false,reviewedAt:review.reviewedAt,sourceHash:certificate.sourceHash,scope:'17 existing landing pages + 5 new pages, 3dyanimda only',evidence:'docs/audits/seo-gap-release-review-2026-10-23.json',limitations:review.limitations};
const sql=`-- Prepared from reviewed payloads; no publication guard is removed or disabled.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='60s';
DO $scope$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id='${delta.tenant}' AND slug='3dyanimda' AND domain='3dyanimda.com' AND status='active') THEN RAISE EXCEPTION 'Tenant identity mismatch'; END IF;
 IF (SELECT md5(string_agg(tenant_id::text||path||public.publication_payload_hash(to_jsonb(p)),'' ORDER BY tenant_id,path)) FROM public.landing_pages p WHERE tenant_id<>'${delta.tenant}')<>'04c6c7a91f2a78ae5a6b9bfd62411c16' THEN RAISE EXCEPTION 'Other-brand baseline moved; review before applying'; END IF;
END $scope$;
DO $reviewed_delta$
DECLARE entry jsonb; current_row public.landing_pages%ROWTYPE; target_row public.landing_pages%ROWTYPE; current_hash text; target_hash text; target_doc jsonb; review_doc jsonb:=${literal(report)};
BEGIN
 FOR entry IN SELECT value FROM jsonb_array_elements(${literal(delta.updates)}) ORDER BY value->>'path' LOOP
  SELECT * INTO current_row FROM public.landing_pages WHERE tenant_id='${delta.tenant}' AND path=entry->>'path' FOR UPDATE;
  IF entry->>'isNew'='true' THEN
   IF FOUND THEN RAISE EXCEPTION 'New route already exists; re-read before retry: %',entry->>'path'; END IF;
   target_doc:=to_jsonb(jsonb_populate_record(NULL::public.landing_pages,(entry->'patch') || jsonb_build_object('id',gen_random_uuid(),'status','published','updated_at',now())));
  ELSE
   IF NOT FOUND OR current_row.status<>'published' THEN RAISE EXCEPTION 'Published baseline missing: %',entry->>'path'; END IF;
   target_doc:=to_jsonb(current_row) || (entry->'patch');
   current_hash:=public.publication_payload_hash(to_jsonb(current_row));
   IF current_hash<>entry->>'expected_payload_hash' THEN RAISE EXCEPTION 'Reviewed payload changed; re-read before retry: %',entry->>'path'; END IF;
  END IF;
  target_row:=jsonb_populate_record(NULL::public.landing_pages,target_doc);
  target_hash:=public.publication_payload_hash(to_jsonb(target_row));
  INSERT INTO public.publication_reviews(tenant_id,path,collection,payload_hash,manifest_hash,report)
   VALUES('${delta.tenant}',entry->>'path','landing_pages',target_hash,review_doc->>'sourceHash',review_doc)
   ON CONFLICT(tenant_id,collection,path) DO UPDATE SET payload_hash=EXCLUDED.payload_hash,manifest_hash=EXCLUDED.manifest_hash,report=EXCLUDED.report,approved_at=now()
   WHERE publication_reviews.tenant_id='${delta.tenant}' AND publication_reviews.path=EXCLUDED.path AND publication_reviews.collection=EXCLUDED.collection;
  IF current_row.id IS NULL THEN
   INSERT INTO public.landing_pages SELECT target_row.*;
  ELSIF public.publication_payload_hash(to_jsonb(current_row))<>target_hash THEN
   UPDATE public.landing_pages SET image=target_row.image,sections=target_row.sections,editorial=target_row.editorial WHERE id=current_row.id AND tenant_id='${delta.tenant}';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.landing_pages p JOIN public.publication_reviews r ON r.tenant_id=p.tenant_id AND r.path=p.path AND r.collection='landing_pages' WHERE p.tenant_id='${delta.tenant}' AND p.path=entry->>'path' AND p.status='published' AND public.publication_payload_hash(to_jsonb(p))=target_hash AND r.payload_hash=target_hash) THEN RAISE EXCEPTION 'Payload verification failed: %',entry->>'path'; END IF;
 END LOOP;
END $reviewed_delta$;
DO $metadata_delta$
DECLARE item jsonb; previous text;
BEGIN
 FOR item IN SELECT value FROM jsonb_array_elements(${literal(entries)}) LOOP
  SELECT description_tr INTO previous FROM public.seo_meta WHERE tenant_id='${delta.tenant}' AND path=item->>'path' FOR UPDATE;
  IF FOUND AND previous IS DISTINCT FROM item->>'description_tr' THEN RAISE EXCEPTION 'Metadata baseline changed: %',item->>'path'; END IF;
  INSERT INTO public.seo_meta(tenant_id,path,description_tr,noindex) VALUES('${delta.tenant}',item->>'path',item->>'description_tr',false) ON CONFLICT(tenant_id,path) DO NOTHING;
  IF NOT EXISTS(SELECT 1 FROM public.seo_meta WHERE tenant_id='${delta.tenant}' AND path=item->>'path' AND description_tr=item->>'description_tr') THEN RAISE EXCEPTION 'Metadata verification failed: %',item->>'path'; END IF;
 END LOOP;
END $metadata_delta$;
DO $verify_scope$ BEGIN
 IF (SELECT md5(string_agg(tenant_id::text||path||public.publication_payload_hash(to_jsonb(p)),'' ORDER BY tenant_id,path)) FROM public.landing_pages p WHERE tenant_id<>'${delta.tenant}')<>'04c6c7a91f2a78ae5a6b9bfd62411c16' THEN RAISE EXCEPTION 'Other-brand contents changed'; END IF;
END $verify_scope$;
COMMIT;
`;
await writeFile('supabase/seeds/3dyanimda-seo-gap-2026-10-23.sql',sql);
console.log(JSON.stringify({landing:delta.updates.length,metadata:entries.length,seedBytes:Buffer.byteLength(sql)}));
