import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { loadInputs, portfolioTenants, renderSeed, validatePortfolioApplication } from './prepare-portfolio-engineering.mjs';
import { renderPublicationSql, validateDeploymentEvidence, preparePublication } from './publish-portfolio-applications.mjs';

// In-memory integration harness. The synthetic report never leaves this test process.
// Production SQL generation requires the real source-bound certificate through prepareSeed().
const inputs = loadInputs();
const tenant = portfolioTenants[0].id;
const other = portfolioTenants[1].id;
const unrelated = '10000000-0000-4000-8000-000000000009';
const review = {
  policy: 'global-originality-v1', result: 'pass', sourceHash: 'a'.repeat(64),
  reviewer: 'Synthetic in-memory test fixture only', reviewedAt: '2026-10-22T00:00:00Z',
  humanReviewPerformed: false, checks: {}, evidence: [], limitations: ['Not a release certificate'],
};
const seed = renderSeed({ ...inputs, review });
assert.throws(() => validatePortfolioApplication({ ...inputs.projects[0], tags: ['application'] }), /illustrative-image tags/);
assert.throws(() => validatePortfolioApplication({ ...inputs.projects[0], content_tr: '<p>Placeholder application.</p>' }), /Substantive application prose/);
const assets = JSON.parse(readFileSync('content/authoring/portfolio/assets.json', 'utf8'));
// Synthetic in-memory evidence exercises validation only. It is never written as actual deployment evidence.
const evidence = {
  schemaVersion: 1, kind: 'portfolio-asset-deployment', sourceHash: review.sourceHash, checkedAt: review.reviewedAt,
  assets: assets.map(asset => ({ brand: asset.brand, slug: asset.slug,
    url: `https://${asset.brand}.com${asset.path}`, finalUrl: `https://${asset.brand}.com${asset.path}`,
    status: 200, contentType: 'image/webp', sha256: asset.sha256, bytes: asset.bytes, checkedAt: review.reviewedAt })),
};
const evidenceInputs = { projects: inputs.projects, assets, evidence, sourceHash: review.sourceHash };
assert.equal(validateDeploymentEvidence(evidenceInputs), true);
assert.throws(() => preparePublication(), /actual-deployment-evidence/);
assert.throws(() => validateDeploymentEvidence({ ...evidenceInputs, evidence: undefined }), /evidence is required/);
for (const [mutate, pattern] of [
  [value => { value.sourceHash = 'b'.repeat(64); }, /source hash mismatch/],
  [value => { value.assets[0].sha256 = '0'.repeat(64); }, /SHA256 mismatch/],
  [value => { value.assets[0].url = value.assets[0].url.replace('3dyanimda.com', '3dsanayi.com'); }, /Wrong deployed URL/],
  [value => { value.assets[0].finalUrl += '?cached=1'; }, /Unexpected deployment redirect/],
  [value => { value.assets[0].status = 404; }, /HTTP status/],
  [value => { value.assets[0].contentType = 'text/html'; }, /not image\/webp/],
  [value => { value.assets[0].brand = 'wrong-brand'; }, /Missing reviewed\/deployed asset/],
  [value => { value.assets[0] = value.assets[1]; }, /Duplicate deployment asset/],
  [value => { value.assets.pop(); }, /Exactly 28 deployed image checks/],
]) {
  const invalid = structuredClone(evidence);
  mutate(invalid);
  assert.throws(() => validateDeploymentEvidence({ ...evidenceInputs, evidence: invalid }), pattern);
}
const publish = renderPublicationSql({ ...evidenceInputs, review });
assert.doesNotMatch(seed, /(?:DISABLE TRIGGER|session_replication_role|ALTER TABLE|CREATE FUNCTION|GRANT |SECURITY DEFINER)/i);
assert.doesNotMatch(publish, /(?:DISABLE TRIGGER|session_replication_role|ALTER TABLE|CREATE FUNCTION|GRANT |SECURITY DEFINER)/i);
const db = new PGlite();
const rows = async (sql, params = []) => (await db.query(sql, params)).rows;
const insert = (table, value) => db.query(`INSERT INTO ${table} SELECT * FROM jsonb_populate_record(NULL::${table},$1::jsonb)`, [JSON.stringify(value)]);
const state = async () => JSON.stringify(await rows(`
  SELECT 'settings' AS kind,to_jsonb(s) AS row FROM site_settings s
  UNION ALL SELECT 'seo',to_jsonb(s) FROM seo_meta s
  UNION ALL SELECT 'faq',to_jsonb(s) FROM faq_items s
  UNION ALL SELECT 'landing',to_jsonb(s) FROM landing_pages s
  UNION ALL SELECT 'reviews',to_jsonb(s) FROM publication_reviews s
  UNION ALL SELECT 'portfolio',to_jsonb(s) FROM portfolio_projects s
  ORDER BY kind,row
`));
const otherState = async () => JSON.stringify(await rows(`
  SELECT 'settings' AS kind,to_jsonb(s) AS row FROM site_settings s WHERE tenant_id<>'${tenant}'
  UNION ALL SELECT 'seo',to_jsonb(s) FROM seo_meta s WHERE tenant_id<>'${tenant}'
  UNION ALL SELECT 'faq',to_jsonb(s) FROM faq_items s WHERE tenant_id<>'${tenant}'
  UNION ALL SELECT 'landing',to_jsonb(s) FROM landing_pages s WHERE tenant_id<>'${tenant}'
  UNION ALL SELECT 'reviews',to_jsonb(s) FROM publication_reviews s WHERE tenant_id<>'${tenant}'
  UNION ALL SELECT 'portfolio',to_jsonb(s) FROM portfolio_projects s WHERE tenant_id='${unrelated}'
  ORDER BY kind,row
`));
async function rejectUnchanged(pattern, sql = seed) {
  const before = await state();
  await assert.rejects(db.exec(sql), pattern);
  await db.exec('ROLLBACK');
  assert.equal(await state(), before, 'Rejected transaction must leave every observed row unchanged');
}
try {
  await db.exec(`
    SET TIME ZONE 'UTC';
    CREATE TABLE tenants(id uuid PRIMARY KEY,slug text UNIQUE,name text,domain text,status text);
    CREATE TABLE site_settings(tenant_id uuid,key text,value jsonb,updated_at timestamptz,UNIQUE(tenant_id,key));
    CREATE TABLE seo_meta(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid,path text,title_tr text,title_en text,
      description_tr text,description_en text,keywords_tr text,keywords_en text,og_image_url text,noindex boolean,
      created_at timestamptz,updated_at timestamptz,UNIQUE(tenant_id,path));
    CREATE TABLE faq_items(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid,question_tr text,answer_tr text,
      question_en text,answer_en text,category text,sort_order int,active boolean,created_at timestamptz,updated_at timestamptz);
    CREATE TABLE landing_pages(id uuid PRIMARY KEY,tenant_id uuid,path text,title text,summary text,sections jsonb,faq jsonb,
      editorial jsonb,local_context text,updated_at timestamptz,city text,kind text,image text,status text,service text,
      district text,evidence text,logistics text,reviewed_at timestamptz,neighborhood text,UNIQUE(tenant_id,path));
    CREATE TABLE publication_reviews(tenant_id uuid,path text,collection text,payload_hash text,manifest_hash text,
      report jsonb,approved_at timestamptz DEFAULT now(),PRIMARY KEY(tenant_id,collection,path));
    CREATE TABLE portfolio_projects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,slug text NOT NULL,
      title_tr text NOT NULL,title_en text DEFAULT '',excerpt_tr text DEFAULT '',excerpt_en text DEFAULT '',
      content_tr text DEFAULT '',content_en text DEFAULT '',cover_image_url text,gallery jsonb NOT NULL DEFAULT '[]',
      industry text DEFAULT '',materials text[] DEFAULT '{}',tags text[] DEFAULT '{}',sort_order int NOT NULL DEFAULT 0,
      published boolean NOT NULL DEFAULT false,published_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(tenant_id,slug));
  `);
  for (const value of portfolioTenants) await insert('tenants', { ...value, name: value.slug, status: 'active' });
  await insert('tenants', { id: unrelated, slug: 'unrelated-brand', name: 'Unrelated owner', domain: 'unrelated.example', status: 'active' });
  for (const value of inputs.baseline.settings) await insert('site_settings', value);
  for (const value of inputs.baseline.seo) await insert('seo_meta', value);
  for (const value of inputs.baseline.faq) await insert('faq_items', value);
  for (const value of inputs.landing.landing) {
    const { expected_payload_hash, ...payload } = value;
    await insert('landing_pages', payload);
  }
  for (const value of inputs.landing.reviews) await insert('publication_reviews', value);
  const publication = readFileSync('supabase/migrations/20261003160000_global_publication_gate.sql', 'utf8');
  await db.exec(publication.slice(publication.indexOf('CREATE FUNCTION public.publication_payload_hash'), publication.indexOf('REVOKE ALL ON FUNCTION public.enforce_global_publication_review')));
  for (const value of inputs.landing.landing) {
    const hash = (await rows('SELECT publication_payload_hash(to_jsonb(p)) AS hash FROM landing_pages p WHERE id=$1', [value.id]))[0].hash;
    assert.equal(hash, value.expected_payload_hash, `Observed PostgreSQL payload fixture: ${value.path}`);
  }
  await db.exec(`
    INSERT INTO site_settings SELECT '${other}',key,value,updated_at FROM site_settings WHERE tenant_id='${tenant}';
    INSERT INTO seo_meta SELECT gen_random_uuid(),'${other}',path,title_tr,title_en,description_tr,description_en,
      keywords_tr,keywords_en,og_image_url,noindex,created_at,updated_at FROM seo_meta WHERE tenant_id='${tenant}';
    INSERT INTO faq_items SELECT gen_random_uuid(),'${other}',question_tr,answer_tr,question_en,answer_en,
      category,sort_order,active,created_at,updated_at FROM faq_items WHERE tenant_id='${tenant}';
    INSERT INTO landing_pages SELECT gen_random_uuid(),'${other}',path,title,summary,sections,faq,editorial,
      local_context,updated_at,city,kind,image,status,service,district,evidence,logistics,reviewed_at,neighborhood
      FROM landing_pages WHERE tenant_id='${tenant}';
    INSERT INTO publication_reviews(tenant_id,path,collection,payload_hash,manifest_hash,report)
      SELECT tenant_id,path,'landing_pages',publication_payload_hash(to_jsonb(p)),repeat('b',64),'{"result":"pass"}'
      FROM landing_pages p WHERE tenant_id='${other}';
    INSERT INTO portfolio_projects(tenant_id,slug,title_tr,published) VALUES('${unrelated}','preserve-me','Untouched real project',true);
    UPDATE site_settings SET value=value || '{"future_contact_field":"preserve","phone":"+900000000000"}'
      WHERE tenant_id='${tenant}' AND key='contact_info';
    UPDATE seo_meta SET noindex=true WHERE tenant_id='${tenant}' AND path='/3d-baski';
    CREATE TRIGGER global_landing_review BEFORE INSERT OR UPDATE ON landing_pages
      FOR EACH ROW EXECUTE FUNCTION enforce_global_publication_review();
  `);
  const content = readFileSync('supabase/migrations/20261002120000_content_platform.sql', 'utf8');
  await db.exec(content.slice(content.indexOf('CREATE FUNCTION public.local_content_tokens'), content.indexOf('REVOKE ALL ON FUNCTION public.validate_landing_publication')));
  await db.exec('CREATE TRIGGER landing_publication_guard BEFORE INSERT OR UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION validate_landing_publication()');
  await db.exec(readFileSync('supabase/migrations/20261011001000_semantic_content_date.sql', 'utf8'));
  await assert.rejects(db.exec(`UPDATE landing_pages SET title='Unreviewed production edit' WHERE tenant_id='${tenant}' AND path='/3d-baski'`), /Global originality review required/);

  // A late conflict must roll back earlier settings, metadata, approvals and page edits.
  const last = inputs.landing.landing.find(row => row.path === '/sektorler/drone-hobi');
  await db.query("UPDATE landing_pages SET title='Owner changed the brief',status='draft' WHERE id=$1", [last.id]);
  await rejectUnchanged(/Reviewed landing baseline changed/);
  await db.query("UPDATE landing_pages SET title=$1,status='published' WHERE id=$2", [last.title, last.id]);
  const untouched = await otherState();
  await db.exec(seed);
  assert.equal(await otherState(), untouched, 'Other brands’ settings/pages/reviews and the unrelated portfolio stay untouched');
  assert.deepEqual(await rows(`SELECT t.slug,count(*)::int AS count,bool_and(NOT p.published AND p.published_at IS NULL) AS drafts
    FROM portfolio_projects p JOIN tenants t ON t.id=p.tenant_id WHERE t.id<>'${unrelated}' GROUP BY t.slug ORDER BY t.slug`),
  portfolioTenants.map(t => ({ slug: t.slug, count: 7, drafts: true })).sort((a, b) => a.slug.localeCompare(b.slug)));
  assert.deepEqual((await rows(`SELECT count(*)::int AS count,bool_and(p.status='published' AND
    r.payload_hash=publication_payload_hash(to_jsonb(p))) AS matched FROM landing_pages p
    JOIN publication_reviews r USING(tenant_id,path) WHERE p.tenant_id=$1`, [tenant]))[0], { count: 4, matched: true });
  const contact = (await rows("SELECT value FROM site_settings WHERE tenant_id=$1 AND key='contact_info'", [tenant]))[0].value;
  assert.equal(contact.future_contact_field, 'preserve');
  assert.equal(contact.phone, '+900000000000');
  assert.equal(contact.email, 'info@3dyanimda.com');
  assert.equal((await rows("SELECT noindex FROM seo_meta WHERE tenant_id=$1 AND path='/3d-baski'", [tenant]))[0].noindex, true);
  const first = await state();
  await db.exec(seed);
  assert.equal(await state(), first, 'Repeat execution preserves all rows, approvals and semantic modification dates');

  await db.exec(`UPDATE site_settings SET value=jsonb_set(value,'{lead_tr}','"Owner new wording"') WHERE tenant_id='${tenant}' AND key='hero_content'`);
  await rejectUnchanged(/Reviewed settings baseline changed/);
  await db.query("UPDATE site_settings SET value=jsonb_set(value,'{lead_tr}',$1::jsonb) WHERE tenant_id=$2 AND key='hero_content'", [JSON.stringify(inputs.config.site_settings.hero_content.lead_tr), tenant]);
  const project = inputs.projects[0];
  await db.query("UPDATE portfolio_projects SET title_tr='Owner portfolio edit' WHERE tenant_id=$1 AND slug=$2", [tenant, project.slug]);
  await rejectUnchanged(/Reviewed portfolio baseline changed/);
  await db.query('UPDATE portfolio_projects SET title_tr=$1,published=true,published_at=now(),title_en=$2,gallery=$3::jsonb WHERE tenant_id=$4 AND slug=$5',
    [project.title_tr, 'Owner English translation', '["/owner-gallery.webp"]', tenant, project.slug]);
  const later = await state();
  await db.exec(seed);
  assert.equal(await state(), later, 'Repeat after separate publishing preserves publication state, translations and gallery');

  // Exercise publication against the actual always-on portfolio modification-date trigger.
  const core = readFileSync('supabase/migrations/20260503174920_0816abb4-dbe4-45ab-b03d-29cb0cc36379.sql', 'utf8');
  const timestampFunction = core.match(/CREATE OR REPLACE FUNCTION public\.update_updated_at_column\(\)[\s\S]*?\$\$;/)?.[0];
  assert.ok(timestampFunction, 'Expected production update_updated_at_column function');
  await db.exec(timestampFunction);
  await db.exec('CREATE TRIGGER trg_portfolio_projects_updated_at BEFORE UPDATE ON portfolio_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  const lastProject = [...inputs.projects].sort((a, b) => a.brand.localeCompare(b.brand) || a.slug.localeCompare(b.slug)).at(-1);
  const lastTenant = portfolioTenants.find(value => value.slug === lastProject.brand).id;
  // Last tenant and slug cause a late conflict after other draft updates; everything must roll back.
  await db.query("UPDATE portfolio_projects SET content_tr='Owner changed reviewed text' WHERE tenant_id=$1 AND slug=$2", [lastTenant, lastProject.slug]);
  await rejectUnchanged(/Reviewed portfolio fields changed/, publish);
  await db.query('UPDATE portfolio_projects SET content_tr=$1 WHERE tenant_id=$2 AND slug=$3', [lastProject.content_tr, lastTenant, lastProject.slug]);
  await db.query("UPDATE tenants SET status='suspended' WHERE id=$1", [lastTenant]);
  await rejectUnchanged(/Reviewed tenant identity mismatch/, publish);
  await db.query("UPDATE tenants SET status='active' WHERE id=$1", [lastTenant]);
  await db.exec('BEGIN');
  await db.query('DELETE FROM portfolio_projects WHERE tenant_id=$1 AND slug=$2', [lastTenant, lastProject.slug]);
  const removedProject = await state();
  // Use the transaction body here so the test can restore its deliberately deleted fixture.
  await assert.rejects(db.exec(publish.replace(/^BEGIN;$/m, '').replace(/^COMMIT;$/m, '')), /Reviewed portfolio count mismatch/);
  await db.exec('ROLLBACK');
  assert.notEqual(await state(), removedProject, 'Missing-row test restores its deleted fixture');
  await db.query('UPDATE portfolio_projects SET title_en=$1,excerpt_en=$2,gallery=$3::jsonb WHERE tenant_id=$4 AND slug=$5',
    ['Owner draft translation', 'Owner draft description', '["/owner-draft-gallery.webp"]', lastTenant, lastProject.slug]);
  await db.query("INSERT INTO portfolio_projects(tenant_id,slug,title_tr,published) VALUES($1,'owner-added-project','Owner added project',false)", [tenant]);
  const ownerAdded = (await rows("SELECT to_jsonb(p) AS row FROM portfolio_projects p WHERE tenant_id=$1 AND slug='owner-added-project'", [tenant]))[0].row;
  const alreadyPublished = (await rows('SELECT to_jsonb(p) AS row FROM portfolio_projects p WHERE tenant_id=$1 AND slug=$2', [tenant, project.slug]))[0].row;
  const preservedColumns = await rows(`SELECT id,to_jsonb(p)-'published'-'published_at'-'updated_at' AS row
    FROM portfolio_projects p ORDER BY id`);
  const unrelatedBeforePublish = await otherState();
  await db.exec(publish);
  assert.deepEqual(await rows(`SELECT t.slug,count(*)::int AS count,bool_and(p.published AND p.published_at IS NOT NULL) AS published
    FROM portfolio_projects p JOIN tenants t ON t.id=p.tenant_id WHERE t.id<>'${unrelated}' AND p.slug<>'owner-added-project' GROUP BY t.slug ORDER BY t.slug`),
  portfolioTenants.map(value => ({ slug: value.slug, count: 7, published: true })).sort((a, b) => a.slug.localeCompare(b.slug)));
  assert.deepEqual(await rows(`SELECT id,to_jsonb(p)-'published'-'published_at'-'updated_at' AS row
    FROM portfolio_projects p ORDER BY id`), preservedColumns, 'Publication preserves content, translations, gallery and other fields');
  assert.deepEqual((await rows('SELECT to_jsonb(p) AS row FROM portfolio_projects p WHERE tenant_id=$1 AND slug=$2', [tenant, project.slug]))[0].row,
    alreadyPublished, 'Already published exact application is completely untouched');
  assert.deepEqual((await rows("SELECT to_jsonb(p) AS row FROM portfolio_projects p WHERE tenant_id=$1 AND slug='owner-added-project'", [tenant]))[0].row,
    ownerAdded, 'Unreviewed owner addition in a scoped tenant stays untouched');
  assert.equal(await otherState(), unrelatedBeforePublish, 'Publishing leaves unrelated tenant content and projects unchanged');
  const publishedState = await state();
  await db.exec(publish);
  assert.equal(await state(), publishedState, 'Repeated publication performs no updates, including timestamp trigger changes');
  // Even a separately approved owner edit must not be silently certified by a repeated old seed.
  // This targets a field outside this page's patch after its patched summary is already applied.
  await db.exec(`BEGIN;
    UPDATE publication_reviews r SET payload_hash=publication_payload_hash(to_jsonb(p)||'{"title":"Owner independently reviewed title"}'::jsonb)
      FROM landing_pages p WHERE p.tenant_id='${tenant}' AND p.path='/cozumler/montaj-yardimcilari'
      AND r.tenant_id=p.tenant_id AND r.path=p.path AND r.collection='landing_pages';
    UPDATE landing_pages SET title='Owner independently reviewed title'
      WHERE tenant_id='${tenant}' AND path='/cozumler/montaj-yardimcilari';
    COMMIT;`);
  await rejectUnchanged(/Reviewed landing baseline changed/);
  console.log('PASS portfolio seed + publication: 28 drafts then guarded publication, four exact landing approvals, rejected invalid asset evidence, preserved fields/tenants, real timestamp trigger, idempotence and conflict rollback.');
} catch (error) {
  console.error(error.message);
  if (error.where) console.error(error.where);
  process.exitCode = 1;
} finally {
  await db.close();
}
