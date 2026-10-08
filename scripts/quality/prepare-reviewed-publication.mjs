import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

// Prepare review-bound DML; no network, credentials, approval creation or execution.
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const review = read('content/release-review.json');
const content = read('docs/audits/publication-content-manifest.json');
const assetFile = 'docs/audits/reviewed-assets-2026-10-08.json';
const assets = read(assetFile);
const checks = ['allBrandsAllThemesAllRoutes','renderedText','imageProvenance','visualSimilarity','modelGeometry','localEvidence','seoGeoParity'];
assert.equal(review.result, 'pass');
assert.equal(review.policy, 'global-originality-v1');
for (const check of checks) assert.equal(review.checks[check], true, check);
assert.ok(review.reviewer && review.reviewedAt && review.evidence.length);
const files=[];
function walk(dir) {
  for (const entry of readdirSync(dir,{withFileTypes:true})) {
    const file=path.posix.join(dir,entry.name);
    if(entry.isDirectory()) walk(file);
    else if(entry.isFile() && file!=='content/release-review.json') files.push(file);
    else if(!entry.isFile()) throw new Error('Unsupported entry: '+file);
  }
}
for(const dir of ['src','public','content']) walk(dir);
const source=createHash('sha256');
for(const file of files.sort()) source.update(file+'\0').update(readFileSync(file)).update('\0');
assert.equal(source.digest('hex'), review.sourceHash, 'Stale review');
assert.equal(content.routes.length, 796);
assert.equal(new Set(content.routes.map(r=>r.tenant_id+r.path)).size, 796);
assert.equal(createHash('sha256').update(JSON.stringify(content.routes)).digest('hex'), content.manifestHash);
assert.equal(content.manifestHash, review.contentManifestHash);
assert.equal(assets.result, 'pass');
assert.equal(assets.assets.length, 28);
assert.equal(createHash('sha256').update(readFileSync(assetFile)).digest('hex'),review.assetManifestHash);
for(const asset of assets.assets) {
  assert.equal(createHash('sha256').update(readFileSync(path.join('public',asset.storage_path))).digest('hex'),asset.sha256,'Asset changed: '+asset.storage_path);
}
const manifestHash=createHash('sha256').update(review.sourceHash+'\n'+content.manifestHash+'\n'+review.assetManifestHash).digest('hex');
const literal=value=>"'"+String(value).replaceAll("'","''")+"'";
const rows=content.routes.map(({tenant_id,path,payload_hash})=>({tenant_id,path,payload_hash}));
const report={policy:review.policy,result:review.result,reviewer:review.reviewer,reviewerType:review.reviewerType,
  humanReviewPerformed:review.humanReviewPerformed,reviewedAt:review.reviewedAt,sourceHash:review.sourceHash,
  authorization:review.authorization,checks:review.checks,evidence:review.evidence,limitations:review.limitations};
const sql=`-- Execute only this reviewed snapshot. Any content/asset mismatch rolls back.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='300s';
DO $reviewed_release$
DECLARE routes jsonb := ${literal(JSON.stringify(rows))}::jsonb;
        assets jsonb := ${literal(JSON.stringify(assets.assets))}::jsonb;
        certificate jsonb := ${literal(JSON.stringify(report))}::jsonb;
        matched integer;
BEGIN
 PERFORM pg_advisory_xact_lock(610031600);
 PERFORM pg_advisory_xact_lock(610031601);
 PERFORM p.id FROM public.landing_pages p
 JOIN jsonb_to_recordset(routes) x(tenant_id uuid,path text,payload_hash text)
 ON p.tenant_id=x.tenant_id AND p.path=x.path ORDER BY p.tenant_id,p.path FOR UPDATE OF p;
 SELECT count(*) INTO matched FROM public.landing_pages p
 JOIN jsonb_to_recordset(routes) x(tenant_id uuid,path text,payload_hash text)
 ON p.tenant_id=x.tenant_id AND p.path=x.path
 WHERE public.publication_payload_hash(to_jsonb(p))=x.payload_hash;
 IF matched<>796 THEN RAISE EXCEPTION 'Reviewed content changed or missing: %/796',matched; END IF;
 IF (SELECT count(*) FROM public.landing_pages WHERE tenant_id IN(SELECT DISTINCT (x->>'tenant_id')::uuid FROM jsonb_array_elements(routes) x))<>796 THEN
  RAISE EXCEPTION 'Reviewed inventory changed';
 END IF;
 INSERT INTO public.original_assets(tenant_id,path,kind,storage_path,sha256,perceptual_hash,geometry_hash,provenance)
 SELECT t.id,a.path,a.kind,a.storage_path,a.sha256,a.perceptual_hash::bit(64),a.geometry_hash,a.provenance
 FROM jsonb_to_recordset(assets) a(tenant_slug text,path text,kind text,storage_path text,sha256 text,perceptual_hash text,geometry_hash text,provenance jsonb)
 JOIN public.tenants t ON t.slug=a.tenant_slug
 WHERE NOT EXISTS(SELECT 1 FROM public.original_assets existing WHERE existing.storage_path=a.storage_path)
 ON CONFLICT(storage_path) DO NOTHING;
 SELECT count(*) INTO matched FROM public.original_assets o
 JOIN jsonb_to_recordset(assets) a(tenant_slug text,path text,kind text,storage_path text,sha256 text,perceptual_hash text,geometry_hash text,provenance jsonb)
 ON o.storage_path=a.storage_path JOIN public.tenants t ON t.id=o.tenant_id AND t.slug=a.tenant_slug
 WHERE o.sha256=a.sha256 AND o.path=a.path AND o.kind=a.kind
 AND o.geometry_hash IS NOT DISTINCT FROM a.geometry_hash
 AND o.perceptual_hash IS NOT DISTINCT FROM a.perceptual_hash::bit(64);
 IF matched<>28 THEN RAISE EXCEPTION 'Reviewed asset mismatch: %/28',matched; END IF;
 INSERT INTO public.publication_reviews(tenant_id,path,collection,payload_hash,manifest_hash,report)
 SELECT x.tenant_id,x.path,'landing_pages',x.payload_hash,${literal(manifestHash)},certificate
 FROM jsonb_to_recordset(routes) x(tenant_id uuid,path text,payload_hash text)
 ON CONFLICT(tenant_id,collection,path) DO UPDATE SET payload_hash=EXCLUDED.payload_hash,manifest_hash=EXCLUDED.manifest_hash,report=EXCLUDED.report,approved_at=now();
 UPDATE public.landing_pages p SET status='published'
 FROM jsonb_to_recordset(routes) x(tenant_id uuid,path text,payload_hash text)
 WHERE p.tenant_id=x.tenant_id AND p.path=x.path AND p.status<>'published';
 SELECT count(*) INTO matched FROM public.landing_pages p
 JOIN jsonb_to_recordset(routes) x(tenant_id uuid,path text,payload_hash text)
 ON p.tenant_id=x.tenant_id AND p.path=x.path
 JOIN public.publication_reviews r ON r.tenant_id=p.tenant_id AND r.path=p.path AND r.collection='landing_pages'
 WHERE p.status='published' AND public.publication_payload_hash(to_jsonb(p))=x.payload_hash AND r.payload_hash=x.payload_hash AND r.manifest_hash=${literal(manifestHash)};
 IF matched<>796 THEN RAISE EXCEPTION 'Publication readback mismatch: %/796',matched; END IF;
END $reviewed_release$;
COMMIT;
SELECT t.slug,count(*) FILTER(WHERE p.status='published') published,count(*) FILTER(WHERE p.status='draft') drafts
FROM public.landing_pages p JOIN public.tenants t ON p.tenant_id=t.id
WHERE t.slug IN('3dyanimda','3dsanayi','maketyanimda','parcayanimda') GROUP BY t.slug ORDER BY t.slug;
`;
const output=process.argv[2];
assert.ok(output,'Supply output SQL path; this command never executes SQL.');
writeFileSync(output,sql);
console.log(JSON.stringify({output,rows:rows.length,assets:assets.assets.length,manifestHash,executed:false}));
