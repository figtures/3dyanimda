import {readFile,writeFile} from 'node:fs/promises';
import solutions from '../content/authoring/editorial/solutions.mjs';
import materials from '../content/authoring/editorial/materials.mjs';
import sectors from '../content/authoring/editorial/sectors.mjs';
import productGuides from '../content/authoring/editorial/guides-product-industry.mjs';
import otherGuides from '../content/authoring/editorial/guides-model-parts.mjs';
import locations from '../content/authoring/editorial/locations.mjs';
const baseline=JSON.parse(await readFile('src/content/pages.json','utf8'));
const pages=[];
const materialSources={pla:'https://help.prusa3d.com/article/pla_2062',petg:'https://help.prusa3d.com/article/petg_2059',asa:'https://help.prusa3d.com/article/asa_1809',tpu:'https://help.prusa3d.com/article/flexible-materials_2057',abs:'https://help.prusa3d.com/filament-material-guide',muhendislik_polimerleri:'https://help.prusa3d.com/filament-material-guide'};
function convert(brand,path,row){
 const old=baseline.find(p=>p.brand===brand&&p.path===path);
 if(!old || old.status!=='published')throw Error('Missing published baseline '+brand+path);
 const [title,summary,h1,p1,h2,p2,q,a,takeaways]=row;
 if(!Array.isArray(takeaways)||takeaways.length!==3)throw Error('Invalid editorial brief '+path);
 // Move the opening sentence into the answer block, instead of duplicating visible text.
 const sentence=p1.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
 if(!sentence)throw Error('Missing opening answer '+path);
 const sections=[{title:h1,body:p1.slice(sentence.length).trim()},{title:h2,body:p2}];
 const page={...old,title,summary,sections,faq:[{q,a}],image:'',updated_at:'2026-10-06',editorial:{answer:sentence,takeaways,relatedPaths:old.kind==='material'?['/3d-baski','/rehber/malzeme-secim-sorulari']:['/3d-modelleme','/3d-tarama','/3d-baski']}};
 if(old.kind==='material')page.editorial.sources=[{title:'Prusa teknik malzeme rehberi — ürün seçimine giriş',url:materialSources[path.split('/').at(-1)]||'https://help.prusa3d.com/filament-material-guide'}];
 if(old.kind==='location'){
  page.local_context=row[9];page.logistics=row[10];
  page.faq.push({q:brand==='3dyanimda'?'İlk prototip onayını kim vermeli?':brand==='3dsanayi'?'Üretim denemesi ne zaman planlanır?':brand==='maketyanimda'?'Yerinde kurulum gerekiyorsa ne paylaşmalıyım?':'Numune geri gönderilecekse bunu belirtmeli miyim?',a:brand==='3dyanimda'?'Form, montaj ve görünüş kararları için yetkili proje kişisini belirleyin. Farklı ekiplerin aynı revizyonu değerlendirmesi, tekrar üretim kapsamının netleşmesini sağlar.':brand==='3dsanayi'?'İş istasyonu, kontrol sorumlusu ve uygun iş parçası hazır olduğunda deneme aralığı belirlenir. Numunenin teslim edilmesi üretim kabulünün tamamlandığı anlamına gelmez.':brand==='maketyanimda'?'Kaidenin yerini, mekâna giriş ölçülerini ve kurulum için uygun zaman aralığını talebe ekleyin. Kurulum desteğinin teklif kapsamı ayrıca görüşülür.':'Evet. Fiziksel örneğin korunması ve iade ihtiyacı baştan kayda alınmalıdır; yeni üretilen numuneyle eski referans birbirine karıştırılmaz.'});
 }
 pages.push(page);
}
for(const [prefix,groups] of [['cozumler',solutions],['malzemeler',materials],['sektorler',sectors],['rehber',{...productGuides,...otherGuides}]])for(const [brand,rows] of Object.entries(groups))for(const [slug,...row] of rows)convert(brand,'/'+prefix+'/'+slug,row);
for(const [brand,row] of Object.entries(locations))convert(brand,'/bolgeler/istanbul',row);
if(pages.length!==124)throw Error('Expected 124 rewritten records, got '+pages.length);
if(new Set(pages.map(p=>p.brand+p.path)).size!==pages.length)throw Error('Duplicate authoring route');
await writeFile('src/content/editorial-pages.json',JSON.stringify(pages,null,2)+'\n');
const literal=v=>"'"+String(v).replaceAll("'","''")+"'";
const json=v=>literal(JSON.stringify(v))+'::jsonb';
const lines=['-- Rewrite inherited published-demo copy as production DRAFT updates.','-- Preserve administrator edits and all publication/certificate requirements.'];
for(const p of pages){
 const old=baseline.find(x=>x.brand===p.brand&&x.path===p.path);
 const keys=['title','summary','sections','faq','image','local_context','logistics'];
 const original=Object.fromEntries(keys.map(k=>[k,old[k]]));
 const assignments=keys.concat('editorial').map(k=>`${k}=${typeof p[k]==='string'?literal(p[k]):json(p[k])}`);
 lines.push(`UPDATE public.landing_pages AS p SET ${assignments.join(',')},updated_at=now() WHERE tenant_id IN (SELECT id FROM public.tenants WHERE slug=${literal(p.brand)}) AND path=${literal(p.path)} AND status='draft' AND editorial='{}'::jsonb AND to_jsonb(p) @> ${json(original)};`);
}
await writeFile('supabase/migrations/20261006170000_original_editorial_inventory.sql',lines.join('\n\n')+'\n');
console.log(`Rewrote ${pages.length} routes with original application-specific content; no routes removed; remote updates remain drafts.`);
