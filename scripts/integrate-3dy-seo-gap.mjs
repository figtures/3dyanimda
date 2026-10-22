/** Prepare reviewable source/CMS delta. No database writes; apply guarded SQL separately. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {loadBrandConfig} from './cloudflare/config.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const tenant='10000000-0000-4000-8000-000000000001';
const cfg=loadBrandConfig('3dyanimda').publicEnv;
const response=await fetch(cfg.VITE_SUPABASE_URL+'/rest/v1/landing_pages?tenant_id=eq.'+tenant+'&select=*&order=path',{headers:{apikey:cfg.VITE_SUPABASE_PUBLISHABLE_KEY,'x-tenant-host':'3dyanimda.com'}});
assert.ok(response.ok,'CMS read failed: '+response.status);
const baseline=await response.json();assert.equal(baseline.length,199);
const authoring=await read('content/authoring/seo-gap-3dyanimda-2026-10-23.json');
const media=await read('src/content/3dy-guide-media.json');
const hashes=new Map((await read('docs/audits/seo-gap-cms-baseline-hashes-2026-10-23.json')).map(p=>[p.path,p.payload_hash]));
const changed=new Map();
const mergeBy=(a=[],b=[],key)=>[...new Map([...a,...b].map(x=>[typeof x==='string'?x:x[key],x])).values()];
for(const patch of authoring.patches){
 const current=baseline.find(p=>p.path===patch.path);assert.ok(current,'Missing '+patch.path);
 const e=current.editorial||{};const p=patch.editorial||{};
 changed.set(patch.path,{...current,sections:mergeBy(current.sections,patch.appendSections,'title'),editorial:{...e,...p,sources:mergeBy(e.sources,p.sources,'url'),relatedPaths:mergeBy(e.relatedPaths,p.relatedPaths),resources:mergeBy(e.resources,p.resources,'path')}});
}
for(const [route,asset] of Object.entries(media)){
 const p=changed.get(route)||baseline.find(p=>p.path===route);
 if(!p)continue;
 changed.set(route,{...p,image:asset.url,editorial:{...p.editorial,media:{alt:asset.alt,caption:asset.caption,width:asset.width,height:asset.height}}});
}
const publicationTime=new Date().toISOString();
for(const draft of authoring.newPages){
 assert.ok(!baseline.some(p=>p.path===draft.path),'New route already exists '+draft.path);
 const asset=media[draft.path];assert.ok(asset);
 const {brand,...p}=draft;
 changed.set(p.path,{...p,tenant_id:tenant,status:'published',reviewed_at:publicationTime,image:asset.url,editorial:{...p.editorial,...(p.kind==='guide'?{publishedAt:publicationTime}:{}),media:{alt:asset.alt,caption:asset.caption,width:asset.width,height:asset.height}}});
}
const files=['pages','editorial-pages','search-pages'];const records=Object.fromEntries(await Promise.all(files.map(async f=>[f,await read('src/content/'+f+'.json')])));
const updates=[];
for(const [route,target] of changed){
 const isNew=!hashes.has(route);const before=baseline.find(p=>p.path===route);
 assert.ok(isNew?!before:before,'Unreviewed baseline '+route);
 const fields=isNew?['tenant_id','path','kind','title','summary','image','sections','faq','city','district','neighborhood','service','local_context','logistics','evidence','reviewed_at','editorial']:['image','sections','editorial'];
 const patch=Object.fromEntries(fields.map(k=>[k,target[k]??null]));
 updates.push({path:route,expected_payload_hash:hashes.get(route)||null,isNew,patch});
 const source={...target,brand:'3dyanimda',updated_at:publicationTime};delete source.id;delete source.tenant_id;
 let owner=files.slice().reverse().find(f=>records[f].some(p=>p.brand==='3dyanimda'&&p.path===route));
 if(owner){const i=records[owner].findIndex(p=>p.brand==='3dyanimda'&&p.path===route);records[owner][i]=source;}
 else records['editorial-pages'].push(source);
}
for(const f of files)await writeFile('src/content/'+f+'.json',JSON.stringify(records[f],null,2)+'\n');
await mkdir('artifacts/seo-gap',{recursive:true});
await writeFile('artifacts/seo-gap/cms-baseline.json',JSON.stringify(baseline,null,2)+'\n');
await writeFile('content/authoring/seo-gap-cms-delta-2026-10-23.json',JSON.stringify({tenant,publicationTime,updates},null,2)+'\n');
console.log(JSON.stringify({existing:updates.filter(p=>!p.isNew).length,newPages:updates.filter(p=>p.isNew).length,publicationTime}));
