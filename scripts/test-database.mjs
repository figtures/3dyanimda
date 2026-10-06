process.on("unhandledRejection", (e) => {
  console.error(e.message);
  process.exit(1);
});
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
// Minimal Supabase platform harness. Real PostgreSQL RLS runs; Auth/Storage APIs do not.
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE SCHEMA storage;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text,owner uuid,created_at timestamptz DEFAULT now());
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated,service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon,authenticated,service_role;`);
for (const file of readdirSync("supabase/migrations")
  .filter((f) => f.endsWith(".sql") && f < "20261003160000")
  .sort()) {
  try {
    await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  } catch (e) {
    console.error("Migration failed:", file, e.message);
    process.exit(1);
  }
}
console.log("Baseline migrations applied to fresh PostgreSQL harness.");
const corporateHero = (
  await db.query(
    "SELECT value FROM site_settings s JOIN tenants t ON t.id=s.tenant_id WHERE t.slug='3dsanayi' AND key='hero_content'",
  )
).rows[0].value;
assert.equal(corporateHero.cta_primary_tr, "Hemen teklif al");
console.log("PASS corporate content upgrade");
const a = "10000000-0000-4000-8000-000000000001",
  b = "10000000-0000-4000-8000-000000000002";
const user = "20000000-0000-4000-8000-000000000001";
await db.exec(
  `INSERT INTO auth.users VALUES('${user}','owner@example.test'); INSERT INTO public.tenant_users(tenant_id,user_id,role_slug) VALUES('${a}','${user}','owner');`,
);
async function context(role, host, id = null, uid = "") {
  await db.exec("RESET ROLE");
  await db.query(
    "SELECT set_config('request.headers',$1,false),set_config('request.jwt.claim.sub',$2,false)",
    [
      JSON.stringify({
        "x-tenant-host": host,
        ...(id ? { "x-tenant-id": id } : {}),
      }),
      uid,
    ],
  );
  await db.exec(`SET ROLE ${role}`);
}
async function rows(sql) {
  return (await db.query(sql)).rows;
}
async function rejected(sql, label) {
  try {
    await db.exec(sql);
  } catch {
    console.log("PASS", label);
    return;
  }
  throw new Error("Expected rejection: " + label);
}
await context("anon", "3dyanimda.localhost");
assert.equal((await rows("select public.current_tenant_id() id"))[0].id, a);
assert.equal(
  (await rows("select distinct tenant_id from public.site_settings")).length,
  1,
);
assert.equal(
  (await rows("select distinct tenant_id from public.site_settings"))[0]
    .tenant_id,
  a,
);
await rejected(
  `INSERT INTO quote_requests(tenant_id,full_name,email,part_description,quantity) VALUES('${b}','Example User','quote@example.test','Project description',1)`,
  "cross-brand public write",
);
await db.exec(
  `INSERT INTO quote_requests(full_name,email,part_description,quantity) VALUES('Example User','quote@example.test','Project description',1)`,
);
assert.equal((await rows("select * from quote_requests")).length, 0);
console.log("PASS public quote saves with resolved tenant and remains private");
await context("anon", "unknown.test");
assert.equal((await rows("select * from site_settings")).length, 0);
assert.equal((await rows("select public.current_tenant_id() id"))[0].id, null);
await rejected(
  `INSERT INTO quote_requests(full_name,email,part_description,quantity) VALUES('Example User','quote@example.test','Project description',1)`,
  "unknown host rejects writes",
);
await context("anon", "3dyanimda.localhost", b);
assert.equal((await rows("select * from site_settings")).length, 0);
console.log("PASS mismatched host and tenant fails closed");
await context("authenticated", "3dsanayi.localhost", null, user);
assert.equal((await rows("select * from quote_requests")).length, 0);
const before = (
  await rows("select value from site_settings where key='hero_content'")
)[0].value;
await db.exec("UPDATE site_settings SET value='{}' WHERE key='hero_content'");
assert.deepEqual(
  (await rows("select value from site_settings where key='hero_content'"))[0]
    .value,
  before,
);
console.log("PASS brand A owner cannot modify brand B");
await context("authenticated", "3dyanimda.localhost", null, user);
assert.equal((await rows("select * from quote_requests")).length, 1);
await db.exec(
  "UPDATE site_settings SET value='{\"title_tr\":\"Updated\"}' WHERE key='hero_content'",
);
assert.equal(
  (await rows("select value from site_settings where key='hero_content'"))[0]
    .value.title_tr,
  "Updated",
);
console.log("PASS owner can read own quote and edit own content");
await db.exec("RESET ROLE");
await db.exec(
  readFileSync(
    "supabase/migrations/20261001100000_corporate_brand_content.sql",
    "utf8",
  ),
);
assert.equal(
  (
    await rows(
      `select value from site_settings where tenant_id='${a}' and key='hero_content'`,
    )
  )[0].value.title_tr,
  "Updated",
);
console.log("PASS corporate refresh preserves edited content");
await context("anon", "3dyanimda.localhost");
await db.exec(
  `INSERT INTO storage.objects(bucket_id,name) VALUES('stl-uploads','${a}/model.stl')`,
);
await rejected(
  `INSERT INTO storage.objects(bucket_id,name) VALUES('stl-uploads','${b}/model.stl')`,
  "cross-brand upload",
);
assert.equal(
  (await rows("select * from storage.objects where bucket_id='stl-uploads'"))
    .length,
  0,
);
await context("authenticated", "3dyanimda.localhost", null, user);
assert.equal(
  (await rows("select * from storage.objects where bucket_id='stl-uploads'"))
    .length,
  1,
);
console.log("PASS private file visibility");
await db.exec("RESET ROLE");
assert.equal(
  (await rows("select count(*)::int n from quote_notifications"))[0].n,
  1,
);
console.log("PASS transactional notification outbox");
// Shared paths are independently editable per brand.
await db.exec(
  `INSERT INTO legal_documents(tenant_id,slug,title_tr) VALUES('${a}','same-policy','A'),('${b}','same-policy','B')`,
);
console.log("PASS duplicate content slug across brands");
await db.exec(`UPDATE tenants SET domain='brand-a.example' WHERE id='${a}'`);
await context("anon", "www.brand-a.example");
assert.equal((await rows("select current_tenant_id() id"))[0].id, a);
await db.exec("RESET ROLE");
await rejected(
  `UPDATE tenants SET custom_domain='brand-a.example' WHERE id='${b}'`,
  "domain cannot be reassigned to a second brand",
);
await db.exec(`UPDATE tenants SET domain='renamed.example' WHERE id='${a}'`);
await context("anon", "brand-a.example");
assert.equal((await rows("select current_tenant_id() id"))[0].id, null);
console.log("PASS domain update removes stale alias");
await db.exec("RESET ROLE");
await db.exec(
  `INSERT INTO user_roles(user_id,role) VALUES('${user}','super_admin')`,
);
await context("authenticated", "3dsanayi.localhost", null, user);
assert.equal((await rows("select * from quote_requests")).length, 0);
console.log("PASS super admin content queries still use selected brand");

// Content publication must be enforced by PostgreSQL, not only by the editor UI.
await context("anon", "3dyanimda.localhost");
assert.equal((await rows("select * from landing_pages")).length, 34);
assert.equal(
  (await rows("select * from landing_pages where status='draft'")).length,
  0,
);
await rejected(
  `INSERT INTO landing_pages(tenant_id,path,title,kind) VALUES('${a}','/forbidden','Unauthorized','guide')`,
  "anonymous content writes rejected",
);
await context("authenticated", "3dyanimda.localhost", null, user);
assert.equal((await rows("select * from landing_pages")).length, 197);
await rejected(
  `UPDATE landing_pages SET status='published' WHERE path='/bolgeler/istanbul/atasehir'`,
  "thin geographic page cannot be published",
);
await rejected(
  `INSERT INTO landing_pages(tenant_id,path,title,kind) VALUES('${b}','/cross-brand','Cross brand','guide')`,
  "content owner cannot write another brand",
);
await db.exec("RESET ROLE");
const localCopy =
  "Örnek Mahallesi Ataşehir atölyemize gönderilecek numuneler için ölçü ve fotoğraf üzerinden başlangıç değerlendirmesi yapılır. Parçanın montaj konumu ve bağlantı elemanları birlikte tarif edilmelidir. Kırık bölgenin tamamlanması için karşılıklı yüzlerin ölçülerini içeren bir çizim istenir. Bu bilgi ile tarama kapsamı ve modelin hangi alanlarının yeniden tasarlanacağı belirlenir.";
const logistics =
  "Numunenin gönderim yöntemi teklif görüşmesinde kararlaştırılır. Ambalaj ve parça kimliği bilgisiyle birlikte kritik yüzeyler belirtilir; üretim ve taşıma için sabit süre taahhüdü verilmez.";
const sections = JSON.stringify([
  {
    title: "Yerel süreç",
    body: "Mevcut örnek parçanın fotoğrafları üzerinden ön değerlendirme yapılır.",
  },
  {
    title: "Dosya hazırlığı",
    body: "Ölçü ve dosya biçimi teknik ihtiyaca göre birlikte belirlenir.",
  },
]);
const faq = JSON.stringify([
  {
    q: "Numuneyi nasıl gönderebilirim?",
    a: "Ön görüşmede ambalaj ve teslim yöntemi belirlenir.",
  },
  {
    q: "Teslim tarihi nasıl belirlenir?",
    a: "Üretim kapsamı ve taşıma planı değerlendirilerek bildirilir.",
  },
]);
await db.query(
  "UPDATE landing_pages SET sections=$1::jsonb,local_context=$2,logistics=$3,faq=$4::jsonb,evidence='İşletme tarafından kontrol edilen teslim süreci',reviewed_at=now(),status='published' WHERE tenant_id=$5 AND path='/bolgeler/istanbul/atasehir'",
  [sections, localCopy, logistics, faq, a],
);
await db.query(
  "UPDATE landing_pages SET sections=$1::jsonb,local_context=$2,logistics=$3,faq=$4::jsonb,evidence='İşletme tarafından kontrol edilen teslim süreci',reviewed_at=now() WHERE tenant_id=$5 AND path='/bolgeler/istanbul/kadikoy'",
  [sections, localCopy.replaceAll("Ataşehir", "Kadıköy"), logistics, faq, b],
);
await rejected(
  `UPDATE landing_pages SET status='published' WHERE tenant_id='${b}' AND path='/bolgeler/istanbul/kadikoy'`,
  "cross-brand place-name substitution cannot bypass publication",
);
await context("anon", "3dyanimda.localhost");
assert.equal(
  (await rows("select * from landing_pages where kind='location'")).length,
  2,
);
console.log("PASS reviewed local publication and public visibility");



// Apply the new fail-closed policy after the legacy migration/RLS regression suite.
await db.exec("RESET ROLE");
await db.exec(readFileSync("supabase/migrations/20261003160000_global_publication_gate.sql", "utf8"));
await context("anon", "3dyanimda.localhost");
assert.equal((await rows("select * from landing_pages")).length,0);
await context("authenticated", "3dyanimda.localhost", null, user);
await rejected("UPDATE landing_pages SET status='published' WHERE path='/3d-baski'", "publication without network-wide certificate blocked");
await rejected("INSERT INTO publication_reviews(tenant_id,path,collection,payload_hash,manifest_hash,report) VALUES('"+a+"','/3d-baski','landing_pages',repeat('a',32),repeat('b',64),'{\"result\":\"pass\",\"policy\":\"global-originality-v1\"}')", "browser editor cannot self-approve");
await db.exec("RESET ROLE");
await db.exec("INSERT INTO publication_reviews(tenant_id,path,collection,payload_hash,manifest_hash,report) SELECT tenant_id,path,'landing_pages',publication_payload_hash(to_jsonb(p)),repeat('a',64),'{\"result\":\"pass\",\"policy\":\"global-originality-v1\"}' FROM landing_pages p WHERE tenant_id='"+a+"' AND path='/3d-baski'");
await db.exec("UPDATE landing_pages SET status='published' WHERE tenant_id='"+a+"' AND path='/3d-baski'");
await rejected("UPDATE landing_pages SET summary=summary||' changed' WHERE tenant_id='"+a+"' AND path='/3d-baski'", "editing approved content invalidates snapshot");
console.log("PASS global certificate gate, quarantine, authorization and stale-approval rejection");

await db.exec("RESET ROLE");
await db.exec(readFileSync("supabase/migrations/20261003161000_original_service_drafts.sql", "utf8"));
assert.equal((await rows("select * from landing_pages where status='published'")).length,0);
console.log("PASS original service drafts remain quarantined");
await db.exec(readFileSync("supabase/migrations/20261004200000_exclusive_service_artwork.sql", "utf8"));
assert.equal((await rows("select * from landing_pages where image like '/brand/services/%' and status='draft'")).length,12);
console.log("PASS exclusive service artwork stays draft");
await db.exec(`UPDATE landing_pages SET sections='[{"title":"Owner edit","body":"Preserve this change"}]' WHERE tenant_id='${a}' AND path='/3d-baski'`);
await db.exec(readFileSync("supabase/migrations/20261006150000_search_editorial.sql", "utf8"));
assert.equal((await rows("SELECT count(*)::int n FROM landing_pages WHERE kind='guide' AND editorial<>'{}'::jsonb AND status='draft'"))[0].n,8);
assert.equal((await rows("SELECT count(*)::int n FROM landing_pages WHERE kind='service' AND editorial<>'{}'::jsonb AND status='draft'"))[0].n,11);
assert.equal((await rows(`SELECT sections->0->>'title' title FROM landing_pages WHERE tenant_id='${a}' AND path='/3d-baski'`))[0].title,'Owner edit');
assert.equal((await rows("SELECT count(*)::int n FROM landing_pages WHERE status='published'"))[0].n,0);
await rejected("UPDATE landing_pages SET editorial='[]'::jsonb WHERE path='/3d-baski'", "editorial must be a JSON object");
assert.notEqual((await rows(`SELECT publication_payload_hash('{"editorial":{"answer":"A"}}') a,publication_payload_hash('{"editorial":{"answer":"B"}}') b`))[0].a,(await rows(`SELECT publication_payload_hash('{"editorial":{"answer":"B"}}') b`))[0].b);
await context("anon", "3dyanimda.localhost");
assert.equal((await rows("SELECT * FROM landing_pages")).length,0);
console.log("PASS search editorial migration: 8 new draft guides, 11 service upgrades, owner edit preserved, review hash and quarantine intact");
await db.close();
