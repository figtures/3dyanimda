import {readFile, writeFile} from 'node:fs/promises';
import {guides,serviceUpdates} from '../content/authoring/search-content-2026.mjs';
const path='src/content/pages.json';
const pages=JSON.parse(await readFile(path,'utf8'));
const previous=new Map(pages.map(p=>[p.brand+p.path,structuredClone(p)]));
const updated=[];
for(const [brand, services] of Object.entries(serviceUpdates)) for(const [route,{extra,...editorial}] of Object.entries(services)) {
  const page=pages.find(p=>p.brand===brand&&p.path===route);
  if(!page) throw new Error('Missing service: '+brand+route);
  page.sections=page.sections.filter(s=>s.title!==extra.title).concat(extra);
  page.editorial=editorial;page.updated_at='2026-10-06T15:00:00Z';updated.push(page);
}
for(const g of guides) {
  const {answer,takeaways,comparison,relatedPaths,sections,faq,...identity}=g;
  const p={...identity,kind:'guide',image:'',status:'published',sections,faq,editorial:{answer,takeaways,comparison,relatedPaths},
    city:'',district:'',neighborhood:'',service:'',local_context:'',logistics:'',evidence:'',reviewed_at:null,updated_at:'2026-10-06T15:00:00Z'};
  const i=pages.findIndex(x=>x.brand===g.brand&&x.path===g.path);
  if(i<0)pages.push(p);else pages[i]=p;
  updated.push(p);
}
await writeFile('src/content/search-pages.json',JSON.stringify(updated,null,2)+'\n');
// Draft-only migration. Does not issue review certificates or overwrite edited/published rows.
const sql=v=>"'"+String(v).replaceAll("'","''")+"'";
const json=v=>sql(JSON.stringify(v))+'::jsonb';
const lines=[`-- Answer-first content. Existing editorial approvals remain required.
ALTER TABLE public.landing_pages ADD COLUMN IF NOT EXISTS editorial jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.landing_pages ADD CONSTRAINT landing_editorial_object CHECK (jsonb_typeof(editorial)='object');`];
for(const p of updated){
  const old=previous.get(p.brand+p.path);
  if(serviceUpdates[p.brand]?.[p.path]) {
    // The prior service draft body comes from the committed, immutable source migration.
    const baseline=JSON.parse(await readFile('content/authoring/service-drafts.json','utf8'));
    const rows=Array.isArray(baseline)?baseline:baseline.pages||baseline.records||[];
    const original=rows.find(x=>x.brand===p.brand&&x.path===p.path)||old;
    const baseSections=(original.sections||[]).filter(s=>s.title!==serviceUpdates[p.brand][p.path].extra.title);
    lines.push(`UPDATE public.landing_pages SET sections=${json(p.sections)},editorial=${json(p.editorial)},updated_at=${sql(p.updated_at)} WHERE tenant_id IN (SELECT id FROM public.tenants WHERE slug=${sql(p.brand)}) AND path=${sql(p.path)} AND status='draft' AND sections=${json(baseSections)};`);
  } else {
    lines.push(`INSERT INTO public.landing_pages(tenant_id,path,title,summary,kind,image,status,sections,faq,editorial) SELECT id,${sql(p.path)},${sql(p.title)},${sql(p.summary)},'guide','','draft',${json(p.sections)},${json(p.faq)},${json(p.editorial)} FROM public.tenants WHERE slug=${sql(p.brand)} ON CONFLICT (tenant_id,path) DO NOTHING;`);
  }
}
await writeFile('supabase/migrations/20261006150000_search_editorial.sql',lines.join('\n\n')+'\n');
console.log(`${updated.length} pages: 12 service upgrades and 8 decision guides. Remote records remain drafts until reviewed.`);
