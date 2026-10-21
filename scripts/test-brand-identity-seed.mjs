import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const db = new PGlite();
const fixture = JSON.parse(readFileSync('scripts/fixtures/brand-identity-baseline.json', 'utf8'));
const tenant = fixture.tenantId;
const other = '10000000-0000-4000-8000-000000000002';
const seed = readFileSync('supabase/seeds/3dyanimda-brand-identity.sql', 'utf8');
try {
  await db.exec(`
    SET TIME ZONE 'UTC';
    CREATE TABLE tenants(id uuid PRIMARY KEY,slug text UNIQUE,name text,domain text,status text);
    CREATE TABLE site_settings(tenant_id uuid,key text,value jsonb,updated_at timestamptz,UNIQUE(tenant_id,key));
    CREATE TABLE seo_meta(tenant_id uuid,path text,title_tr text,description_tr text,noindex boolean,updated_at timestamptz,UNIQUE(tenant_id,path));
    CREATE TABLE landing_pages(
      id uuid PRIMARY KEY,tenant_id uuid,path text,title text,summary text,sections jsonb,faq jsonb,
      editorial jsonb,local_context text,updated_at timestamptz,city text,kind text,image text,
      status text,service text,district text,evidence text,logistics text,reviewed_at timestamptz,neighborhood text,
      UNIQUE(tenant_id,path)
    );
    CREATE TABLE publication_reviews(tenant_id uuid,path text,collection text,payload_hash text,manifest_hash text,
      report jsonb,approved_at timestamptz DEFAULT now(),PRIMARY KEY(tenant_id,collection,path));
    INSERT INTO tenants VALUES
      ('${tenant}','3dyanimda','3dyanımda','3dyanimda.com','active'),
      ('${other}','3dsanayi','3dsanayi','3dsanayi.com','active');
    INSERT INTO site_settings SELECT id,'contact_info','{"email":"keep@example.test","future_setting":true}',null FROM tenants;
    INSERT INTO site_settings SELECT id,'hero_content','{"title_tr":"Keep slogan"}',null FROM tenants;
    INSERT INTO seo_meta SELECT id,'/3d-baski','Old title','Old description',true,null FROM tenants;
  `);
  const migration = readFileSync('supabase/migrations/20261003160000_global_publication_gate.sql', 'utf8');
  await db.exec(migration.slice(migration.indexOf('CREATE FUNCTION public.publication_payload_hash'), migration.indexOf('REVOKE ALL ON FUNCTION public.enforce_global_publication_review')));
  for (const row of fixture.baseline) {
    const {expected_payload_hash, ...payload} = row;
    await db.query('INSERT INTO landing_pages SELECT * FROM jsonb_populate_record(NULL::landing_pages,$1::jsonb)', [JSON.stringify(payload)]);
    const hash = (await db.query('SELECT publication_payload_hash(to_jsonb(p)) AS hash FROM landing_pages p WHERE id=$1', [row.id])).rows[0].hash;
    assert.equal(hash, expected_payload_hash, 'Fixture must match the observed production payload');
  }
  await db.exec(`
    INSERT INTO landing_pages SELECT gen_random_uuid(),'${other}',path,title,summary,sections,faq,editorial,
      local_context,updated_at,city,kind,image,status,service,district,evidence,logistics,reviewed_at,neighborhood
      FROM landing_pages WHERE tenant_id='${tenant}' AND kind='service';
    INSERT INTO publication_reviews(tenant_id,path,collection,payload_hash,manifest_hash,report)
      SELECT tenant_id,path,'landing_pages',publication_payload_hash(to_jsonb(p)),repeat('a',64),'{"result":"pass"}' FROM landing_pages p;
    CREATE TRIGGER global_landing_review BEFORE INSERT OR UPDATE ON landing_pages
      FOR EACH ROW EXECUTE FUNCTION enforce_global_publication_review();
  `);
  const contentMigration = readFileSync('supabase/migrations/20261002120000_content_platform.sql', 'utf8');
  await db.exec(contentMigration.slice(contentMigration.indexOf('CREATE FUNCTION public.local_content_tokens'), contentMigration.indexOf('REVOKE ALL ON FUNCTION public.validate_landing_publication')));
  await db.exec('CREATE TRIGGER landing_publication_guard BEFORE INSERT OR UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION validate_landing_publication()');
  await db.exec(readFileSync('supabase/migrations/20261011001000_semantic_content_date.sql', 'utf8'));
  await assert.rejects(db.exec("UPDATE landing_pages SET title='Unreviewed edit' WHERE tenant_id='" + tenant + "' AND path='/3d-baski'"), /Global originality review required/);
  const otherState = async () => JSON.stringify((await db.query(`
    SELECT row_to_json(s) AS row FROM site_settings s WHERE tenant_id='${other}'
    UNION ALL SELECT row_to_json(s) FROM seo_meta s WHERE tenant_id='${other}'
    UNION ALL SELECT row_to_json(s) FROM landing_pages s WHERE tenant_id='${other}'
    UNION ALL SELECT row_to_json(s) FROM publication_reviews s WHERE tenant_id='${other}'
  `)).rows);
  const untouched = await otherState();
  await db.exec(seed);
  assert.equal(await otherState(), untouched, 'Other tenants and their approvals must remain untouched');
  const contact = (await db.query("SELECT value FROM site_settings WHERE tenant_id=$1 AND key='contact_info'", [tenant])).rows[0].value;
  assert.equal(contact.business_name, '3D Yanımda');
  assert.equal(contact.email, 'keep@example.test');
  assert.equal(contact.future_setting, true);
  assert.equal(contact.instagram, undefined);
  assert.equal((await db.query("SELECT noindex FROM seo_meta WHERE tenant_id=$1 AND path='/3d-baski'", [tenant])).rows[0].noindex, true);
  const verification = (await db.query(`SELECT count(*)::int AS count, bool_and(p.status='published' AND
    r.payload_hash=publication_payload_hash(to_jsonb(p))) AS matched FROM landing_pages p
    JOIN publication_reviews r USING(tenant_id,path) WHERE p.tenant_id=$1`, [tenant])).rows[0];
  assert.deepEqual(verification, {count:5, matched:true});
  const pageState = async () => JSON.stringify((await db.query('SELECT to_jsonb(p) AS row FROM landing_pages p WHERE tenant_id=$1 ORDER BY path', [tenant])).rows);
  const first = await pageState();
  await db.exec(seed);
  assert.equal(await pageState(), first, 'Repeat execution must not change pages or their modification dates');
  assert.equal((await db.query('SELECT count(*)::int AS count FROM seo_meta WHERE tenant_id=$1', [tenant])).rows[0].count, 6);
  await db.query("UPDATE landing_pages SET status='draft', title='New owner edit' WHERE tenant_id=$1 AND path='/3d-baski'", [tenant]);
  await assert.rejects(db.exec(seed), /Reviewed baseline changed/);
  await db.exec('ROLLBACK');
  assert.equal((await db.query("SELECT title FROM landing_pages WHERE tenant_id=$1 AND path='/3d-baski'", [tenant])).rows[0].title, 'New owner edit');
  console.log('PASS brand seed: real publication/content/date guards, five matching approvals, tenant isolation, preserved fields/noindex, repeatability and concurrent-edit rejection.');
} finally {
  await db.close();
}
