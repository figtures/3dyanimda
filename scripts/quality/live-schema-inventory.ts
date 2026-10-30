import {createClient} from '@supabase/supabase-js';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {contentStructuredData} from '../../src/content/structured-content';
import {publicLocalContent} from '../../src/lib/local-urls.mjs';
import {visibleServiceFaq} from '../../src/content/service-experience.mjs';
import {brandAsset} from '../../src/lib/brand-assets';
import {businessGraph} from '../../src/lib/structured-data';
import {resolveBusinessProfile} from '../../src/lib/business-profile';
import {composeSchemaGraph} from '../../src/lib/schema-graph';
import {pageGraph} from '../../src/lib/search';
import {contentMetaTitle,contentMetaDescription} from '../../src/content/metadata';
import {readEditorial} from '../../src/content/editorial';
import {schemaIntegrity} from './schema-integrity.mjs';
import {validateVocabulary} from './schema-vocabulary.mjs';
const report:{[key:string]:any}={kind:'live-public-content-to-schema-contract',checkedAt:new Date().toISOString(),sourceCommit:process.env.GITHUB_SHA,workflowRun:process.env.GITHUB_RUN_ID,productionHtmlVerified:false,brands:[],errors:[]};
for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']){
 const origin='https://'+brand+'.com';
 const api=createClient(process.env.VITE_SUPABASE_URL!,process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,{global:{headers:{'x-tenant-host':brand+'.com'}},auth:{persistSession:false,autoRefreshToken:false}});
 const tenantId=await api.rpc('current_tenant_id');if(tenantId.error||!tenantId.data)throw new Error('Tenant unavailable: '+brand);
 const [tenant,content,settings,overrides]=await Promise.all([api.from('tenants').select('name,domain,custom_domain').eq('id',tenantId.data).single(),api.from('landing_pages').select('*').eq('tenant_id',tenantId.data).eq('status','published'),api.from('site_settings').select('key,value').eq('tenant_id',tenantId.data).in('key',['contact_info','verified_business_identity','organization_logo']),api.from('seo_meta').select('*').eq('tenant_id',tenantId.data)]);
 for(const r of [tenant,content,settings,overrides])if(r.error)throw r.error;
 if((tenant.data!.custom_domain||tenant.data!.domain)!==brand+'.com')throw new Error('Canonical host mismatch: '+brand);
 const values=Object.fromEntries((settings.data||[]).map(row=>[row.key,row.value]));const business=resolveBusinessProfile(values,{name:tenant.data!.name,origin});const records=[];const titles=new Map(),descriptions=new Map();
 for(const raw of content.data||[]){
  const p=publicLocalContent({...raw,brand,editorial:readEditorial(raw.editorial)},brand);const meta=overrides.data?.find(s=>s.path===raw.path);const title=meta?.title_tr||contentMetaTitle(p);const description=meta?.description_tr||contentMetaDescription(p.summary,tenant.data!.name);
  const graph=composeSchemaGraph([businessGraph({name:business.name,origin,description:business.description||undefined,email:business.email,telephone:business.phone,address:business.address,geo:business.geo,sameAs:business.sameAs,hasMap:business.googleBusinessUrl,openingHoursSpecification:business.openingHoursSpecification,logo:brandAsset(brand,'organization_logo',values).url}),pageGraph({origin,path:p.path,title,description,image:p.image||undefined}),...contentStructuredData(p,origin)],origin,origin+p.path);
  const errors=[...schemaIntegrity(graph,{origin,visibleText:visibleServiceFaq(p,brand).map(f=>f.q+' '+f.a).join(' ')}),...validateVocabulary(graph)];
  if(!meta?.noindex){for(const [map,value,label] of [[titles,title,'title'],[descriptions,description,'description']] as const){if(map.has(value))errors.push('Duplicate '+label+': '+map.get(value));map.set(value,p.path);}}
  records.push({path:p.path,indexable:!meta?.noindex,types:graph['@graph'].map(n=>n['@type']),sha256:createHash('sha256').update(JSON.stringify(graph)).digest('hex'),errors});
  report.errors.push(...errors.map(e=>brand+p.path+': '+e));
 }
 report.brands.push({brand,publishedRecords:records.length,records});
}
report.status=report.errors.length?'FAIL':'PASS';await mkdir('artifacts/live-schema',{recursive:true});await writeFile('artifacts/live-schema/report.json',JSON.stringify(report,null,2)+'\n');console.log('LIVE_SCHEMA_SUMMARY '+JSON.stringify(report));if(report.errors.length)process.exitCode=1;
