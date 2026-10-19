import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
try {
  const original=readFileSync('supabase/migrations/20260603132921_f14c9349-b202-4748-a7a6-8756a29d469e.sql','utf8');
  const ddl=original.match(/CREATE TABLE public\.job_postings \([\s\S]*?\n\);/)[0];
  await db.exec(`CREATE TABLE tenants(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),slug text UNIQUE);${ddl}
    ALTER TABLE job_postings ADD COLUMN tenant_id uuid REFERENCES tenants(id);
    ALTER TABLE job_postings DROP CONSTRAINT job_postings_slug_key, ADD UNIQUE(tenant_id,slug);
    INSERT INTO tenants(slug) VALUES('3dyanimda'),('3dsanayi'),('maketyanimda'),('parcayanimda'),('unrelated');`);
  const seed=readFileSync('supabase/seeds/career-roles.sql','utf8');
  await db.exec(seed);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM job_postings')).rows[0].count,12);
  assert.deepEqual((await db.query('SELECT count(*)::int AS count FROM job_postings GROUP BY tenant_id')).rows.map(row=>row.count),[3,3,3,3]);
  await db.exec("UPDATE job_postings SET summary_tr='CMS edit',active=false WHERE slug='3d-baski-uretim-teknisyeni'");
  await db.exec(seed);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM job_postings')).rows[0].count,12);
  assert.deepEqual((await db.query("SELECT summary_tr,active FROM job_postings WHERE slug='3d-baski-uretim-teknisyeni'")).rows,[{summary_tr:'CMS edit',active:false}]);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM job_postings j JOIN tenants t ON t.id=j.tenant_id WHERE t.slug='unrelated'")).rows[0].count,0);
  console.log('PASS: 12 original roles, four tenants, idempotent seed, CMS edits preserved.');
} finally {await db.close();}
