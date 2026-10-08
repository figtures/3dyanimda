import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Editorial data only. No status changes, publication certificates, redirects or schema changes.
// SQL uses a captured row hash to reject concurrent CMS changes and is safe to retry.
const brands = ['3dyanimda', '3dsanayi', 'maketyanimda', 'parcayanimda'];
const read = async file => JSON.parse(await readFile(file, 'utf8'));
const key = p => p.brand + p.path;
const literal = value => "'" + String(value).replaceAll("'", "''") + "'";
const sources = await Promise.all(brands.map(brand => read(`content/authoring/local/${brand}.json`)));
const records = sources.flat();
const baseline = await read('src/content/pages.json');
const snapshot = await read('content/authoring/local-remote-baseline.json');
const expected = new Map(snapshot.records.map(p => [key(p), p]));
assert.equal(expected.size, 652);
assert.equal(records.length, 652);
assert.deepEqual(new Set(records.map(key)), new Set(expected.keys()));
const check = spawnSync(process.execPath, ['scripts/test-local-content.mjs', '--static'], { stdio: 'inherit' });
assert.equal(check.status, 0, 'Local authoring completeness failed.');
const patches = new Map(records.map(p => [key(p), p]));
let mergedCount = 0;
const merged = baseline.map(previous => {
  const authored = patches.get(key(previous));
  if (!authored) return previous;
  for (const field of ['brand', 'path', 'status', 'kind', 'city', 'district', 'neighborhood', 'service']) {
    assert.equal(authored[field], previous[field], `${key(previous)}: cannot change ${field}`);
  }
  assert.equal(authored.status, 'draft');
  mergedCount++;
  return authored;
});
assert.equal(mergedCount, 652);
await writeFile('src/content/pages.json', JSON.stringify(merged, null, 2) + '\n');

const sqlIndex = process.argv.indexOf('--sql-dir');
if (sqlIndex !== -1) {
  const sqlDir = process.argv[sqlIndex + 1];
  assert.ok(sqlDir, '--sql-dir needs an output directory');
  await mkdir(sqlDir, { recursive: true });
  const fields = ['title', 'summary', 'sections', 'faq', 'local_context', 'logistics', 'evidence', 'reviewed_at', 'editorial'];
  const definition = 'brand text,path text,expected_hash text,title text,summary text,sections jsonb,faq jsonb,local_context text,logistics text,evidence text,reviewed_at timestamptz,editorial jsonb';
  const same = fields.map(field => `p.${field} IS NOT DISTINCT FROM x.${field}`).join(' AND ');
  const manifest = [];
  for (const brand of brands) {
    const rows = records.filter(p => p.brand === brand).map(p => ({
      brand, path: p.path, expected_hash: expected.get(key(p)).expected_hash,
      ...Object.fromEntries(fields.map(field => [field, p[field]])),
    }));
    for (let offset = 0; offset < rows.length; offset += 20) {
      const batch = rows.slice(offset, offset + 20);
      const data = literal(JSON.stringify(batch));
      const sql = `BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $local_editorial$
DECLARE payload jsonb := ${data}::jsonb; matched integer;
BEGIN
 PERFORM p.id FROM public.landing_pages p JOIN public.tenants t ON t.id=p.tenant_id
 JOIN jsonb_to_recordset(payload) AS x(${definition}) ON x.brand=t.slug AND x.path=p.path
 WHERE p.status='draft' AND p.kind='location' FOR UPDATE OF p;
 SELECT count(*) INTO matched FROM public.landing_pages p JOIN public.tenants t ON t.id=p.tenant_id
 JOIN jsonb_to_recordset(payload) AS x(${definition}) ON x.brand=t.slug AND x.path=p.path
 WHERE p.status='draft' AND p.kind='location' AND (md5(to_jsonb(p)::text)=x.expected_hash OR (${same}));
 IF matched<>${batch.length} THEN RAISE EXCEPTION 'Local content changed or target missing; inspect CMS before retrying'; END IF;
 UPDATE public.landing_pages p SET ${fields.map(field => `${field}=x.${field}`).join(',')}
 FROM public.tenants t,jsonb_to_recordset(payload) AS x(${definition})
 WHERE p.tenant_id=t.id AND t.slug=x.brand AND p.path=x.path AND p.status='draft' AND NOT (${same});
 SELECT count(*) INTO matched FROM public.landing_pages p JOIN public.tenants t ON t.id=p.tenant_id
 JOIN jsonb_to_recordset(payload) AS x(${definition}) ON x.brand=t.slug AND x.path=p.path
 WHERE p.status='draft' AND p.kind='location' AND (${same});
 IF matched<>${batch.length} THEN RAISE EXCEPTION 'Local editorial readback mismatch'; END IF;
END $local_editorial$;
COMMIT;
SELECT ${literal(brand)} AS brand, ${batch.length} AS verified_routes, ${offset} AS batch_offset, 'draft' AS publication_status;
`;
      const filename = `${brand}-${String(offset).padStart(3, '0')}.sql`;
      await writeFile(path.join(sqlDir, filename), sql);
      manifest.push({ filename, brand, offset, routes: batch.length, sha256: createHash('sha256').update(sql).digest('hex') });
    }
  }
  await writeFile(path.join(sqlDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Prepared ${manifest.length} guarded SQL batches in ${sqlDir}; no SQL executed.`);
}
console.log(`Merged ${mergedCount} authored local records; publication status unchanged.`);
