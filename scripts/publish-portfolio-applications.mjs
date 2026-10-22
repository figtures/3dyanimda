import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { portfolioTenants, validatePortfolioApplication } from './prepare-portfolio-engineering.mjs';
import { sourceSnapshot, verifyCertificate } from './quality/release-certificate.mjs';

const read = file => JSON.parse(readFileSync(file, 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const literal = value => `'${String(value).replaceAll("'", "''")}'`;
const json = value => `${literal(JSON.stringify(value))}::jsonb`;
const key = entry => `${entry.brand}/${entry.slug}`;
const fields = ['title_tr', 'excerpt_tr', 'content_tr', 'cover_image_url', 'industry', 'materials', 'tags', 'sort_order'];

function reviewedProjects(projects) {
  assert.equal(projects.length, 28, 'Exactly 28 reviewed applications required');
  assert.equal(new Set(projects.map(key)).size, 28, 'Duplicate application key');
  for (const tenant of portfolioTenants) assert.equal(projects.filter(p => p.brand === tenant.slug).length, 7, `Exactly seven applications required for ${tenant.slug}`);
  return projects.map(project => {
    const tenant = portfolioTenants.find(t => t.slug === project.brand);
    assert.ok(tenant, `Unexpected portfolio brand: ${project.brand}`);
    assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(project.cover_image_url, `/images/portfolio/${project.brand}/${project.slug}.webp`);
    for (const field of ['title_tr', 'excerpt_tr', 'content_tr', 'industry']) assert.equal(typeof project[field], 'string', `Missing reviewed ${field}`);
    assert.ok(Array.isArray(project.materials) && project.materials.every(value => typeof value === 'string'));
    assert.ok(Array.isArray(project.tags), 'Application tags are required');
    validatePortfolioApplication(project);
    assert.ok(Number.isInteger(project.sort_order));
    return { tenant_id: tenant.id, slug: project.slug, ...Object.fromEntries(fields.map(field => [field, project[field]])) };
  });
}

/** Evidence must be recorded from actual deployed GET response bodies, never HEAD/ETag/local-file guesses.
 * Schema: {schemaVersion:1,kind:'portfolio-asset-deployment',sourceHash,checkedAt,
 * assets:[{brand,slug,url,finalUrl,status:200,contentType:'image/webp',sha256,bytes,checkedAt}]}.
 * The publisher validates this record; it does not create deployment evidence or claim a fresh HTTP probe.
 */
export function validateDeploymentEvidence({ projects, assets, evidence, sourceHash, now = Date.now() }) {
  reviewedProjects(projects);
  assert.ok(evidence && typeof evidence === 'object', 'Actual asset deployment evidence is required');
  assert.equal(evidence.schemaVersion, 1, 'Unsupported asset evidence schema');
  assert.equal(evidence.kind, 'portfolio-asset-deployment', 'Wrong deployment evidence kind');
  assert.match(sourceHash, /^[a-f0-9]{64}$/);
  assert.equal(evidence.sourceHash, sourceHash, 'Deployment evidence source hash mismatch');
  const checkTime = (value, name) => {
    assert.equal(typeof value, 'string', `Missing ${name}`);
    assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, `Invalid ${name}`);
    assert.ok(Number.isFinite(Date.parse(value)) && Date.parse(value) <= now + 300000, `Invalid or future ${name}`);
  };
  checkTime(evidence.checkedAt, 'deployment check time');
  assert.ok(Array.isArray(assets) && assets.length === 28, 'Exactly 28 reviewed asset entries required');
  assert.equal(new Set(assets.map(key)).size, 28, 'Duplicate reviewed asset key');
  assert.ok(Array.isArray(evidence.assets) && evidence.assets.length === 28, 'Exactly 28 deployed image checks required');
  assert.equal(new Set(evidence.assets.map(key)).size, 28, 'Duplicate deployment asset key');
  for (const project of projects) {
    const asset = assets.find(entry => key(entry) === key(project));
    const observed = evidence.assets.find(entry => key(entry) === key(project));
    assert.ok(asset && observed, `Missing reviewed/deployed asset: ${key(project)}`);
    assert.equal(asset.path, project.cover_image_url, `Asset path mismatch: ${key(project)}`);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isInteger(asset.bytes) && asset.bytes > 12, 'Invalid reviewed asset byte count');
    const url = `https://${project.brand}.com${project.cover_image_url}`;
    assert.equal(observed.url, url, `Wrong deployed URL: ${key(project)}`);
    assert.equal(observed.finalUrl, url, `Unexpected deployment redirect: ${key(project)}`);
    assert.equal(observed.status, 200, `Deployed image HTTP status: ${key(project)}`);
    assert.equal(observed.contentType, 'image/webp', `Deployed response is not image/webp: ${key(project)}`);
    assert.equal(observed.sha256, asset.sha256, `Deployed body SHA256 mismatch: ${key(project)}`);
    assert.equal(observed.bytes, asset.bytes, `Deployed body byte count mismatch: ${key(project)}`);
    checkTime(observed.checkedAt, `image check time for ${key(project)}`);
  }
  return true;
}

/** Pure renderer for isolated SQL tests; the CLI always verifies the actual release certificate first. */
export function renderPublicationSql({ projects, assets, evidence, review }) {
  assert.equal(review.policy, 'global-originality-v1');
  assert.equal(review.result, 'pass');
  validateDeploymentEvidence({ projects, assets, evidence, sourceHash: review.sourceHash });
  const portfolio = reviewedProjects(projects);
  return `-- Generated by scripts/publish-portfolio-applications.mjs after source-bound review and deployed asset evidence.
-- Exact reviewed application records only; all existing triggers and permissions remain enabled.
-- Source snapshot: ${review.sourceHash}
-- Deployment evidence SHA256 (canonical parsed JSON): ${sha256(JSON.stringify(evidence))}
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='90s';
DO $publish_portfolio_applications$
DECLARE
  tenants jsonb := ${json(portfolioTenants)};
  projects jsonb := ${json(portfolio)};
  entry jsonb; current_doc jsonb; current_fields jsonb;
  project_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(610031601);
  -- Hold tenant identity/status stable for the entire publication transaction.
  FOR entry IN SELECT value FROM jsonb_array_elements(tenants) ORDER BY value->>'id' LOOP
    SELECT to_jsonb(t) INTO current_doc FROM public.tenants t WHERE t.id=(entry->>'id')::uuid FOR SHARE;
    IF NOT FOUND OR current_doc->>'slug' IS DISTINCT FROM entry->>'slug'
        OR current_doc->>'domain' IS DISTINCT FROM entry->>'domain' OR current_doc->>'status' IS DISTINCT FROM 'active' THEN
      RAISE EXCEPTION 'Reviewed tenant identity mismatch for %',entry->>'slug';
    END IF;
    SELECT count(*) INTO project_count FROM public.portfolio_projects p
      JOIN jsonb_to_recordset(projects) x(tenant_id uuid,slug text) ON p.tenant_id=x.tenant_id AND p.slug=x.slug
      WHERE p.tenant_id=(entry->>'id')::uuid;
    IF project_count<>7 THEN RAISE EXCEPTION 'Reviewed portfolio count mismatch for %: %/7',entry->>'slug',project_count; END IF;
  END LOOP;
  FOR entry IN SELECT value FROM jsonb_array_elements(projects) ORDER BY value->>'tenant_id',value->>'slug' LOOP
    SELECT to_jsonb(p) INTO current_doc FROM public.portfolio_projects p
      WHERE p.tenant_id=(entry->>'tenant_id')::uuid AND p.slug=entry->>'slug' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Reviewed portfolio row missing for %/%',entry->>'tenant_id',entry->>'slug'; END IF;
    SELECT jsonb_object_agg(k,current_doc->k) INTO current_fields FROM jsonb_object_keys(entry) k;
    IF current_fields IS DISTINCT FROM entry THEN
      RAISE EXCEPTION 'Reviewed portfolio fields changed for %/%',entry->>'tenant_id',entry->>'slug';
    END IF;
    IF current_doc->'published' = 'false'::jsonb THEN
      UPDATE public.portfolio_projects SET published=true,published_at=now()
        WHERE tenant_id=(entry->>'tenant_id')::uuid AND slug=entry->>'slug' AND published=false;
    ELSIF current_doc->'published' IS DISTINCT FROM 'true'::jsonb THEN
      RAISE EXCEPTION 'Unexpected portfolio publication state for %/%',entry->>'tenant_id',entry->>'slug';
    END IF;
    -- Published exact rows are untouched, including dates, translations and gallery.
  END LOOP;
  SELECT count(*) INTO project_count FROM public.portfolio_projects p
    JOIN jsonb_to_recordset(projects) x(tenant_id uuid,slug text) ON p.tenant_id=x.tenant_id AND p.slug=x.slug
    WHERE p.published=true;
  IF project_count<>28 THEN RAISE EXCEPTION 'Portfolio publication verification failed: %/28',project_count; END IF;
END $publish_portfolio_applications$;
COMMIT;
`;
}

export function preparePublication(evidenceFile, outputFile = 'supabase/seeds/publish-portfolio-applications.sql') {
  assert.ok(evidenceFile, 'Usage: node scripts/publish-portfolio-applications.mjs <actual-deployment-evidence.json> [output.sql]');
  const review = read('content/release-review.json');
  const snapshot = sourceSnapshot();
  verifyCertificate(review, snapshot);
  const projects = read('content/authoring/portfolio/projects.json');
  const assets = read('content/authoring/portfolio/assets.json');
  const evidence = read(evidenceFile);
  validateDeploymentEvidence({ projects, assets, evidence, sourceHash: snapshot.sourceHash });
  for (const asset of assets) {
    const bytes = readFileSync(`public${asset.path}`);
    assert.equal(bytes.length, asset.bytes, `Local asset byte count mismatch: ${asset.path}`);
    assert.equal(sha256(bytes), asset.sha256, `Local asset SHA256 mismatch: ${asset.path}`);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `Invalid WebP RIFF signature: ${asset.path}`);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `Invalid WebP signature: ${asset.path}`);
  }
  const sql = renderPublicationSql({ projects, assets, evidence, review });
  writeFileSync(outputFile, sql);
  console.log(`Prepared guarded publication SQL for 28 applications: ${outputFile}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) preparePublication(...process.argv.slice(2));
