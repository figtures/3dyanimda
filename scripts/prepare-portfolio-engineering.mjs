import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sourceSnapshot, verifyCertificate } from './quality/release-certificate.mjs';

const read = file => JSON.parse(readFileSync(file, 'utf8'));
const literal = value => `'${String(value).replaceAll("'", "''")}'`;
const json = value => `${literal(JSON.stringify(value))}::jsonb`;
export const portfolioTenants = ['3dyanimda', '3dsanayi', 'maketyanimda', 'parcayanimda'].map((slug, index) => ({
  slug, id: `10000000-0000-4000-8000-00000000000${index + 1}`, domain: `${slug}.com`,
}));
const tenantId = portfolioTenants[0].id;
const subset = (value, keys) => Object.fromEntries(keys.map(key => [key, value[key] ?? null]));

export function loadInputs() {
  return {
    config: read('content/authoring/3dyanimda-engineering-positioning.json'),
    baseline: read('docs/audits/portfolio-cms-baseline-confirmed-2026-10-22.json'),
    landing: read('scripts/fixtures/engineering-positioning-baseline.json'),
    projects: read('content/authoring/portfolio/projects.json'),
  };
}

/** Pure SQL renderer for tests. The executable entry point verifies the source-bound certificate first. */
export function renderSeed({ config, baseline, landing, projects, review }) {
  assert.equal(config.brand, '3dyanimda');
  assert.equal(review.policy, 'global-originality-v1');
  assert.equal(review.result, 'pass');
  assert.match(review.sourceHash, /^[a-f0-9]{64}$/);
  assert.equal(projects.length, 28, 'Exactly 28 reviewed concepts required');
  assert.equal(new Set(projects.map(p => `${p.brand}/${p.slug}`)).size, 28);
  assert.equal(baseline.portfolio.length, 0, 'This seed was reviewed against an empty portfolio baseline');
  for (const tenant of portfolioTenants) assert.equal(projects.filter(p => p.brand === tenant.slug).length, 7);
  const portfolio = projects.map(project => {
    const tenant = portfolioTenants.find(t => t.slug === project.brand);
    assert.ok(tenant, `Unexpected portfolio tenant: ${project.brand}`);
    assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(project.cover_image_url, `/images/portfolio/${project.brand}/${project.slug}.webp`);
    assert.ok(Array.isArray(project.tags) && project.tags.includes('concept'), 'Concept tag is mandatory');
    assert.ok(/konsept/i.test(project.excerpt_tr), 'Excerpt must identify illustrative concept');
    assert.ok(/tamamlanmış müşteri projesi değildir/i.test(project.content_tr), 'Concept disclosure is mandatory');
    assert.ok(Number.isInteger(project.sort_order));
    assert.ok(Array.isArray(project.materials));
    return {
      tenant_id: tenant.id, slug: project.slug, title_tr: project.title_tr, excerpt_tr: project.excerpt_tr,
      content_tr: project.content_tr, cover_image_url: project.cover_image_url, industry: project.industry,
      materials: project.materials, tags: project.tags, sort_order: project.sort_order,
    };
  });
  const settings = Object.entries(config.site_settings).map(([key, patch]) => {
    const observed = baseline.settings.find(row => row.tenant_id === tenantId && row.key === key);
    assert.ok(observed, `Missing settings baseline: ${key}`);
    const array = Array.isArray(patch);
    return { key, patch, array, expected: array ? observed.value : subset(observed.value, Object.keys(patch)) };
  });
  const seo = config.seo_meta.map(patch => {
    const observed = baseline.seo.find(row => row.tenant_id === tenantId && row.path === patch.path);
    assert.ok(observed, `Missing SEO baseline: ${patch.path}`);
    assert.deepEqual(Object.keys(patch).sort(), ['description_tr', 'path']);
    return { path: patch.path, id: observed.id, expected: observed.description_tr, desired: patch.description_tr };
  });
  const oldFaq = baseline.faq.find(row => row.tenant_id === tenantId && row.question_tr === config.faq_replacement.match_question_tr);
  assert.ok(oldFaq, 'Missing FAQ baseline');
  const faq = { id: oldFaq.id, expected: subset(oldFaq, ['question_tr', 'answer_tr']), desired: subset(config.faq_replacement, ['question_tr', 'answer_tr']) };
  assert.equal(config.landing_patches.length, 4);
  assert.equal(new Set(config.landing_patches.map(row => row.path)).size, 4);
  const pages = config.landing_patches.map(patch => {
    const observed = landing.landing.find(row => row.tenant_id === tenantId && row.path === patch.path);
    assert.ok(observed, `Missing landing baseline: ${patch.path}`);
    assert.equal(observed.status, 'published');
    assert.equal(patch.expected_payload_hash, observed.expected_payload_hash);
    assert.ok(Object.keys(patch.patch).every(key => ['title', 'summary', 'editorial'].includes(key)), 'Unexpected landing patch column');
    const { expected_payload_hash, ...observedPayload } = observed;
    return { ...patch, id: observed.id, status: observed.status, target: { ...observedPayload, ...patch.patch } };
  });
  const report = {
    policy: review.policy, result: review.result, sourceHash: review.sourceHash,
    reviewer: review.reviewer, reviewerType: review.reviewerType, reviewedAt: review.reviewedAt,
    humanReviewPerformed: review.humanReviewPerformed ?? false, checks: review.checks, evidence: review.evidence,
    scope: 'Four 3D Yanımda landing-page patches and corporate positioning; 28 illustrative portfolio concepts inserted as drafts pending asset deployment.',
    limitations: review.limitations,
  };
  return `-- Generated by scripts/prepare-portfolio-engineering.mjs after source-bound review.
-- Existing publication/content/date guards remain enabled. No permissions or schema changes.
-- Portfolio entries remain drafts; publishing them is a separate reviewed operation after assets deploy.
-- Source snapshot: ${review.sourceHash}
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='90s';
DO $portfolio_engineering$
DECLARE
  tenants jsonb := ${json(portfolioTenants)};
  setting_patches jsonb := ${json(settings)};
  seo_patches jsonb := ${json(seo)};
  faq_patch jsonb := ${json(faq)};
  page_patches jsonb := ${json(pages)};
  projects jsonb := ${json(portfolio)};
  report jsonb := ${json(report)};
  entry jsonb; current_doc jsonb; current_value jsonb; current_fields jsonb; target_doc jsonb;
  current_hash text; target_hash text; project_count integer;
  current_page public.landing_pages%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(610031601);
  IF (SELECT count(*) FROM public.tenants t JOIN jsonb_to_recordset(tenants) x(id uuid,slug text,domain text)
      ON t.id=x.id AND t.slug=x.slug AND t.domain=x.domain WHERE t.status='active') <> 4 THEN
    RAISE EXCEPTION 'Reviewed tenant identity mismatch';
  END IF;

  FOR entry IN SELECT value FROM jsonb_array_elements(setting_patches) ORDER BY value->>'key' LOOP
    SELECT value INTO STRICT current_value FROM public.site_settings
      WHERE tenant_id='${tenantId}' AND key=entry->>'key' FOR UPDATE;
    IF (entry->>'array')::boolean THEN
      current_fields := current_value;
      target_doc := entry->'patch';
    ELSE
      SELECT jsonb_object_agg(k,current_value->k) INTO current_fields FROM jsonb_object_keys(entry->'patch') k;
      target_doc := current_value || (entry->'patch');
    END IF;
    IF current_fields IS DISTINCT FROM entry->'expected' AND current_fields IS DISTINCT FROM entry->'patch' THEN
      RAISE EXCEPTION 'Reviewed settings baseline changed for %',entry->>'key';
    END IF;
    IF current_value IS DISTINCT FROM target_doc THEN
      UPDATE public.site_settings SET value=target_doc,updated_at=now()
        WHERE tenant_id='${tenantId}' AND key=entry->>'key';
    END IF;
  END LOOP;

  FOR entry IN SELECT value FROM jsonb_array_elements(seo_patches) ORDER BY value->>'path' LOOP
    SELECT to_jsonb(s) INTO STRICT current_doc FROM public.seo_meta s
      WHERE s.tenant_id='${tenantId}' AND s.id=(entry->>'id')::uuid AND s.path=entry->>'path' FOR UPDATE;
    IF current_doc->'description_tr' IS DISTINCT FROM entry->'expected'
        AND current_doc->'description_tr' IS DISTINCT FROM entry->'desired' THEN
      RAISE EXCEPTION 'Reviewed SEO baseline changed for %',entry->>'path';
    END IF;
    IF current_doc->'description_tr' IS DISTINCT FROM entry->'desired' THEN
      UPDATE public.seo_meta SET description_tr=entry->>'desired',updated_at=now()
        WHERE tenant_id='${tenantId}' AND id=(entry->>'id')::uuid AND path=entry->>'path';
    END IF;
  END LOOP;

  SELECT jsonb_build_object('question_tr',question_tr,'answer_tr',answer_tr) INTO STRICT current_fields
    FROM public.faq_items WHERE tenant_id='${tenantId}' AND id=(faq_patch->>'id')::uuid FOR UPDATE;
  IF current_fields IS DISTINCT FROM faq_patch->'expected' AND current_fields IS DISTINCT FROM faq_patch->'desired' THEN
    RAISE EXCEPTION 'Reviewed FAQ baseline changed';
  END IF;
  IF current_fields IS DISTINCT FROM faq_patch->'desired' THEN
    UPDATE public.faq_items SET question_tr=faq_patch->'desired'->>'question_tr',
      answer_tr=faq_patch->'desired'->>'answer_tr',updated_at=now()
      WHERE tenant_id='${tenantId}' AND id=(faq_patch->>'id')::uuid;
  END IF;

  FOR entry IN SELECT value FROM jsonb_array_elements(page_patches) ORDER BY value->>'path' LOOP
    SELECT * INTO STRICT current_page FROM public.landing_pages
      WHERE tenant_id='${tenantId}' AND id=(entry->>'id')::uuid AND path=entry->>'path' FOR UPDATE;
    -- Derive the approved target from the frozen reviewed baseline, never from unreviewed current fields.
    target_doc := to_jsonb(jsonb_populate_record(NULL::public.landing_pages,entry->'target'));
    current_hash := public.publication_payload_hash(to_jsonb(current_page));
    target_hash := public.publication_payload_hash(target_doc);
    IF current_page.status IS DISTINCT FROM entry->>'status'
        OR (current_hash <> entry->>'expected_payload_hash' AND current_hash <> target_hash) THEN
      RAISE EXCEPTION 'Reviewed landing baseline changed for %',entry->>'path';
    END IF;
    INSERT INTO public.publication_reviews(tenant_id,path,collection,payload_hash,manifest_hash,report)
      VALUES(current_page.tenant_id,current_page.path,'landing_pages',target_hash,report->>'sourceHash',report)
      ON CONFLICT(tenant_id,collection,path) DO UPDATE SET
        payload_hash=EXCLUDED.payload_hash,manifest_hash=EXCLUDED.manifest_hash,report=EXCLUDED.report,approved_at=now()
      WHERE publication_reviews.tenant_id='${tenantId}'
        AND publication_reviews.tenant_id=EXCLUDED.tenant_id AND publication_reviews.path=EXCLUDED.path
        AND publication_reviews.collection=EXCLUDED.collection
        AND (publication_reviews.payload_hash IS DISTINCT FROM EXCLUDED.payload_hash
          OR publication_reviews.manifest_hash IS DISTINCT FROM EXCLUDED.manifest_hash);
    IF current_hash <> target_hash THEN
      UPDATE public.landing_pages SET title=target_doc->>'title',summary=target_doc->>'summary',
        editorial=target_doc->'editorial',updated_at=now()
        WHERE id=current_page.id AND tenant_id='${tenantId}' AND path=current_page.path;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.landing_pages p JOIN public.publication_reviews r
        ON r.tenant_id=p.tenant_id AND r.path=p.path AND r.collection='landing_pages'
        WHERE p.id=current_page.id AND p.tenant_id='${tenantId}' AND p.status=current_page.status
          AND public.publication_payload_hash(to_jsonb(p))=target_hash AND r.payload_hash=target_hash) THEN
      RAISE EXCEPTION 'Landing approval verification failed for %',entry->>'path';
    END IF;
  END LOOP;

  FOR entry IN SELECT value FROM jsonb_array_elements(projects) ORDER BY value->>'tenant_id',value->>'slug' LOOP
    SELECT to_jsonb(p) INTO current_doc FROM public.portfolio_projects p
      WHERE p.tenant_id=(entry->>'tenant_id')::uuid AND p.slug=entry->>'slug' FOR UPDATE;
    IF FOUND THEN
      SELECT jsonb_object_agg(k,current_doc->k) INTO current_fields FROM jsonb_object_keys(entry) k;
      IF current_fields IS DISTINCT FROM entry THEN
        RAISE EXCEPTION 'Reviewed portfolio baseline changed for %/%',entry->>'tenant_id',entry->>'slug';
      END IF;
      -- Never overwrite a later publication, translations, gallery, or modification date.
    ELSE
      INSERT INTO public.portfolio_projects(tenant_id,slug,title_tr,excerpt_tr,content_tr,cover_image_url,
        industry,materials,tags,sort_order,published,published_at)
      VALUES((entry->>'tenant_id')::uuid,entry->>'slug',entry->>'title_tr',entry->>'excerpt_tr',
        entry->>'content_tr',entry->>'cover_image_url',entry->>'industry',
        ARRAY(SELECT jsonb_array_elements_text(entry->'materials')),ARRAY(SELECT jsonb_array_elements_text(entry->'tags')),
        (entry->>'sort_order')::integer,false,NULL);
    END IF;
  END LOOP;
  SELECT count(*) INTO project_count FROM public.portfolio_projects p
    JOIN jsonb_to_recordset(projects) x(tenant_id uuid,slug text) ON p.tenant_id=x.tenant_id AND p.slug=x.slug;
  IF project_count<>28 THEN RAISE EXCEPTION 'Portfolio draft verification failed: %/28',project_count; END IF;
END $portfolio_engineering$;
COMMIT;
`;
}

export function prepareSeed() {
  const inputs = loadInputs();
  const review = read('content/release-review.json');
  verifyCertificate(review, sourceSnapshot());
  const sql = renderSeed({ ...inputs, review });
  writeFileSync('supabase/seeds/portfolio-engineering.sql', sql);
  console.log('Prepared guarded 28-draft portfolio + four-page engineering seed for reviewed source ' + review.sourceHash);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) prepareSeed();
