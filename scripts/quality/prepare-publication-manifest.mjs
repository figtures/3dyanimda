import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

// Read-only preparation: reproduce the database's exact JSONB payload hashes.
// This does not approve content, connect to Supabase or change publication state.
const brands = ['3dyanimda', '3dsanayi', 'maketyanimda', 'parcayanimda'];
const tenants = Object.fromEntries(brands.map((brand, i) => [brand, `10000000-0000-4000-8000-00000000000${i + 1}`]));
const merged = new Map();
for (const file of ['src/content/pages.json', 'src/content/editorial-pages.json', 'src/content/search-pages.json']) {
  for (const row of JSON.parse(await readFile(file, 'utf8'))) merged.set(row.brand + row.path, row);
}
assert.equal(merged.size, 796, 'Unexpected reviewed inventory; review scope before proceeding.');
const db = new PGlite();
await db.exec(`SET TIME ZONE 'UTC'; CREATE TABLE reviewed_landing (
 tenant_id uuid, path text, kind text, title text, summary text, image text,
 sections jsonb, faq jsonb, city text, district text, neighborhood text, service text,
 local_context text, logistics text, evidence text, reviewed_at timestamptz, editorial jsonb
);`);
const records = [];
for (const row of [...merged.values()].sort((a,b)=>(a.brand+a.path).localeCompare(b.brand+b.path))) {
  assert.ok(tenants[row.brand], 'Unexpected tenant');
  const payload = { ...row, tenant_id: tenants[row.brand], editorial: row.editorial || {} };
  const { rows } = await db.query(`SELECT md5(to_jsonb(p)::text) AS payload_hash
    FROM jsonb_populate_record(NULL::reviewed_landing, $1::jsonb) p`, [JSON.stringify(payload)]);
  records.push({brand:row.brand,tenant_id:tenants[row.brand],path:row.path,payload_hash:rows[0].payload_hash});
}
await db.close();
for (const brand of brands) assert.equal(records.filter(r=>r.brand===brand).length, 199);
const manifestHash=createHash('sha256').update(JSON.stringify(records)).digest('hex');
const report={policy:'global-originality-v1',result:'prepared_not_approved',records:records.length,
  manifestHash,hashMethod:'PostgreSQL JSONB md5 of all landing payload fields excluding id, status and updated_at; timestamps normalized in UTC',routes:records};
const output=process.argv[2] || 'docs/audits/publication-content-manifest.json';
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output,records:records.length,manifestHash}));
