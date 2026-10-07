import {readFile,writeFile} from 'node:fs/promises';
import copy from '../content/authoring/confirmed-service-copy.mjs';
const facts=JSON.parse(await readFile('content/authoring/business-service-facts.json','utf8'));
const marker='İşletme teyidi — 7 Ekim 2026:';
const evidence=marker+' Kargo, kurye ve elden teslim mevcuttur; diğer şehirlere kargo gönderilir. 3D tarama ve yerinde tarama hizmeti vardır. Örnek Mahallesi, Ataşehir atölyesine gelmeden randevu alınmalıdır. Bu kayıt hizmet koşullarının teyididir; özgünlük/yayın onayı değildir.';
const patches=[];
for(const source of ['src/content/pages.json','src/content/editorial-pages.json','src/content/search-pages.json']){
 const pages=JSON.parse(await readFile(source,'utf8'));
 for(const p of pages){
  if(p.kind==='location'){
   if(!p.evidence.includes(marker))p.evidence=[p.evidence,evidence].filter(Boolean).join('\n');
   p.reviewed_at=facts.recordedAt;
  }
  const entry=copy[p.brand]?.[p.path];
  if(entry){
   const [q,a]=entry;
   p.faq=p.faq.filter(f=>f.q!==q);p.faq.push({q,a});p.updated_at='2026-10-07';
  }
 }
 await writeFile(source,JSON.stringify(pages,null,2)+'\n');
}
for(const [brand,rows] of Object.entries(copy))for(const [path,[q,a]] of Object.entries(rows))patches.push({brand,path,q,a});
// Content DML, not a schema migration. Transaction rolls back if any expected target is missing.
const literal=x=>"'"+String(x).replaceAll("'","''")+"'";
const sql=`BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $guard$ BEGIN
 IF (SELECT count(*) FROM public.landing_pages p JOIN public.tenants t ON t.id=p.tenant_id WHERE t.slug IN ('3dyanimda','3dsanayi','maketyanimda','parcayanimda') AND p.kind='location' AND p.status='draft')<>656 THEN RAISE EXCEPTION 'Expected 656 draft location records; review changed inventory'; END IF;
 IF (SELECT count(*) FROM public.landing_pages p JOIN public.tenants t ON t.id=p.tenant_id JOIN jsonb_to_recordset(${literal(JSON.stringify(patches))}::jsonb) AS x(brand text,path text,q text,a text) ON x.brand=t.slug AND x.path=p.path WHERE p.status='draft')<>16 THEN RAISE EXCEPTION 'Expected 16 draft core routes'; END IF;
END $guard$;
UPDATE public.landing_pages p SET evidence=concat_ws(E'\\n',nullif(p.evidence,''),${literal(evidence)}),reviewed_at=${literal(facts.recordedAt)}::timestamptz,updated_at=now() FROM public.tenants t WHERE p.tenant_id=t.id AND t.slug IN ('3dyanimda','3dsanayi','maketyanimda','parcayanimda') AND p.kind='location' AND p.status='draft' AND position(${literal(marker)} in p.evidence)=0;
WITH patch AS (SELECT * FROM jsonb_to_recordset(${literal(JSON.stringify(patches))}::jsonb) AS x(brand text,path text,q text,a text))
UPDATE public.landing_pages p SET faq=(SELECT coalesce(jsonb_agg(f),'[]'::jsonb) FROM jsonb_array_elements(p.faq) f WHERE f->>'q'<>x.q)||jsonb_build_array(jsonb_build_object('q',x.q,'a',x.a)),updated_at=now() FROM patch x,public.tenants t WHERE p.tenant_id=t.id AND t.slug=x.brand AND p.path=x.path AND p.status='draft';
COMMIT;\n`;
await writeFile('content/authoring/confirmed-service-facts.sql',sql);
console.log('Recorded operational evidence for 656 source routes and FAQs for 16 unique core routes; publication status unchanged.');
