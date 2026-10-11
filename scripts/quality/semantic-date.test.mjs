import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
test('status/review/no-op saves preserve date; real edits replace arbitrary caller date',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`CREATE TABLE landing_pages(id int,title text,status text,reviewed_at timestamptz,evidence text,updated_at timestamptz); INSERT INTO landing_pages VALUES(1,'Title','draft',null,'source','2026-10-01T00:00:00Z'); CREATE FUNCTION touch_date() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$; CREATE TRIGGER landing_publication_guard BEFORE UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION touch_date();`);
  await db.exec(readFileSync('supabase/migrations/20261011001000_semantic_content_date.sql','utf8'));
  await db.exec(`UPDATE landing_pages SET status='published',reviewed_at=now(),evidence='reviewed',updated_at='2099-01-01' WHERE id=1`);
  assert.equal((await db.query('SELECT updated_at FROM landing_pages')).rows[0].updated_at.toISOString(),'2026-10-01T00:00:00.000Z');
  await db.exec(`UPDATE landing_pages SET title='Meaningful revision',updated_at='2099-01-01' WHERE id=1`);
  const date=(await db.query('SELECT updated_at FROM landing_pages')).rows[0].updated_at;
  assert.ok(Math.abs(Date.now()-date.getTime())<10000);
 } finally {await db.close();}
});
