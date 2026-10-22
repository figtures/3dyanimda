import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import {expectedSocialImage,assertExportedSocialImage} from '../quality/audit-search-contracts.mjs';

const guide='/images/editorial/3dyanimda/3d-baski.png';
function fixture({brand='3dyanimda',route='/3d-baski',pageImage='',override,media,settings={},image,width=1200,height=630,mime='image/png',article=false}={}) {
 const origin='https://'+brand+'.com',tenant={id:'tenant-'+brand,slug:brand,status:'active',domain:brand+'.com'};
 const snapshot={version:1,host:brand+'.com',path:route,tenant,settings,seo:override?{og_image_url:override}:null,queries:{queries:[{queryKey:['landing-page',tenant.id,route],state:{status:'success',data:{tenant_id:tenant.id,path:route,status:'published',image:pageImage,editorial:{media}}}}]}};
 const url=new URL(image||'/brand/identity/'+brand+'/og-image.png',origin).href;
 const dom=new JSDOM('<!doctype html><html><head></head><body></body></html>',{url:origin+route}),document=dom.window.document;
 const meta=(name,content,attribute='property')=>{if(content===undefined)return;const node=document.createElement('meta');node.setAttribute(attribute,name);node.content=String(content);document.head.append(node);};
 for(const name of ['og:image','og:image:secure_url'])meta(name,url);
 meta('og:image:type',mime);meta('og:image:width',width);meta('og:image:height',height);meta('og:image:alt','Reviewed illustration');
 meta('twitter:image',url,'name');meta('twitter:card','summary_large_image','name');meta('twitter:image:alt','Reviewed illustration','name');
 const graph=[{'@id':origin+route+'#webpage','@type':'WebPage',primaryImageOfPage:{'@type':'ImageObject',url}}];
 if(article)graph.push({'@id':origin+route+'#article','@type':'Article',image:url});
 const script=document.createElement('script');script.type='application/ld+json';script.textContent=JSON.stringify({'@graph':graph});document.head.append(script);
 return {dom,document,snapshot,context:{origin,route,directory:path.resolve('public'),landingRoute:true,snapshot},set:(name,value)=>{document.querySelector(`meta[property="${name}"],meta[name="${name}"]`).content=value;}};
}
test('all four brands retain their exact known fallback and decoded 1200x630 PNG',async()=>{
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']){
  const f=fixture({brand});try{const result=await assertExportedSocialImage(f.document,f.context);assert.equal(result.source,'brand-fallback');assert.equal(result.url,`https://${brand}.com/brand/identity/${brand}/og-image.png`);assert.equal(result.actualWidth,1200);assert.equal(result.actualHeight,630);}finally{f.dom.window.close();}
 }
});
test('route image wins over fallback, with exact declared dimensions and Article parity',async()=>{
 const f=fixture({pageImage:guide,image:guide,media:{width:1200,height:630},article:true});
 try{assert.equal((await assertExportedSocialImage(f.document,f.context)).source,'page-image');f.set('og:image','https://3dyanimda.com/brand/identity/3dyanimda/og-image.png');await assert.rejects(()=>assertExportedSocialImage(f.document,f.context),/exact reviewed social image precedence/);}finally{f.dom.window.close();}
});
test('existing WebP page assets are decoded without invented brand-card dimensions',async()=>{
 const f=fixture({brand:'3dsanayi',pageImage:'/brand/services/3dsanayi-print.webp',image:'/brand/services/3dsanayi-print.webp',mime:'image/webp'});
 try{for(const key of ['width','height'])f.document.querySelector(`meta[property="og:image:${key}"]`).remove();const result=await assertExportedSocialImage(f.document,f.context);assert.equal(result.width,undefined);assert.equal(result.height,undefined);assert.ok(result.actualWidth>0&&result.actualHeight>0);}finally{f.dom.window.close();}
});
test('home hero image follows exact CMS or catalog source for each brand',async()=>{
 for(const [brand,hero] of [['3dyanimda','product-prototype'],['3dsanayi','fixture'],['maketyanimda','architecture'],['parcayanimda','parts']]){
  const f=fixture({brand,route:'/',image:'/brand/industrial/'+hero+'.webp',mime:'image/webp'});
  try{f.context.landingRoute=false;f.snapshot.queries.queries=[];for(const key of ['width','height'])f.document.querySelector(`meta[property="og:image:${key}"]`).remove();assert.equal((await assertExportedSocialImage(f.document,f.context)).source,'page-image');}finally{f.dom.window.close();}
 }
 const f=fixture({route:'/',settings:{hero_content:{image_url:guide}},image:guide});
 try{f.context.landingRoute=false;f.snapshot.queries.queries=[];for(const key of ['width','height'])f.document.querySelector(`meta[property="og:image:${key}"]`).remove();assert.equal((await assertExportedSocialImage(f.document,f.context)).url,'https://3dyanimda.com'+guide);}finally{f.dom.window.close();}
});
test('valid SEO override wins and cannot inherit another page image dimensions',async()=>{
 const f=fixture({override:guide,pageImage:'/brand/services/3dyanimda-print.webp',image:guide,media:{width:800,height:500}});
 try{for(const key of ['width','height'])f.document.querySelector(`meta[property="og:image:${key}"]`).remove();const result=await assertExportedSocialImage(f.document,f.context);assert.equal(result.source,'seo-override');assert.equal(result.width,undefined);assert.equal(result.height,undefined);}finally{f.dom.window.close();}
});
test('unsafe override candidates fall through in priority order, not to arbitrary paths',()=>{
 const f=fixture({pageImage:guide});
 try{for(const override of ['javascript:alert(1)','http://3dyanimda.com/a.png','//elsewhere.test/a.png','https://3dyanimda.com/a.svg',guide+'?token=private',guide+'#fragment','https://user:secret@3dyanimda.com/a.png']){f.snapshot.seo={og_image_url:override};assert.equal(expectedSocialImage(f.snapshot,f.context).url,'https://3dyanimda.com'+guide);}
 f.snapshot.queries.queries[0].state.data.image='invalid.svg';assert.equal(expectedSocialImage(f.snapshot,f.context).source,'brand-fallback');
 }finally{f.dom.window.close();}
});
test('tenant, route, draft and missing content evidence are rejected',()=>{
 for(const change of [f=>{f.snapshot.host='3dsanayi.com';},f=>{f.snapshot.path='/other';},f=>{f.snapshot.tenant.slug='3dsanayi';},f=>{f.snapshot.queries.queries[0].state.data.tenant_id='another';},f=>{f.snapshot.queries.queries[0].state.data.status='draft';},f=>{f.snapshot.queries.queries=[];},f=>{delete f.snapshot.seo;}]){
  const f=fixture();try{change(f);assert.throws(()=>expectedSocialImage(f.snapshot,f.context));}finally{f.dom.window.close();}
 }
});
test('MIME, declared dimensions, Twitter and Article regressions remain blocking',async()=>{
 for(const change of [f=>f.set('og:image:type','image/jpeg'),f=>f.set('og:image:width','900'),f=>f.set('twitter:image','https://3dyanimda.com/other.png'),f=>{const script=f.document.querySelector('script[type="application/ld+json"]'),data=JSON.parse(script.textContent);data['@graph'][1].image='https://3dyanimda.com/other.png';script.textContent=JSON.stringify(data);}]){
  const f=fixture({article:true});try{change(f);await assert.rejects(()=>assertExportedSocialImage(f.document,f.context));}finally{f.dom.window.close();}
 }
 const f=fixture({pageImage:guide,image:guide,media:{width:900,height:630},width:900});try{await assert.rejects(()=>assertExportedSocialImage(f.document,f.context),/actual image width/);}finally{f.dom.window.close();}
});
test('legacy public bootstrap binds fallback to the exact tenant and route',async()=>{
 const f=fixture();try{
  const {tenant}=f.snapshot,entries=[['tenants','id='+encodeURIComponent('eq.'+tenant.id),tenant],['site_settings','tenant_id='+encodeURIComponent('eq.'+tenant.id),[]],['seo_meta','tenant_id='+encodeURIComponent('eq.'+tenant.id)+'&path='+encodeURIComponent('eq.'+f.context.route),null]].map(([table,query,body])=>({key:JSON.stringify(['GET','/rest/v1/'+table+'?'+query,'application/json','']),body:JSON.stringify(body)}));
  const node=f.document.createElement('script');node.id='public-bootstrap';node.type='application/json';node.textContent=JSON.stringify({host:f.snapshot.host,path:f.context.route,apiOrigin:'https://example.supabase.co',entries});f.document.head.append(node);
  assert.equal((await assertExportedSocialImage(f.document,{...f.context,snapshot:undefined,landingRoute:false})).source,'brand-fallback');
 }finally{f.dom.window.close();}
});
