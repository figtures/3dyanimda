import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {assertExportedBusinessProfile} from './exported-business-profile.mjs';

const context={origin:'https://3dyanimda.com',route:'/iletisim',brand:'3dyanimda',tenantId:'tenant-a'};
function fixture({clear=false,bootstrap=false}={}){
 const route=bootstrap?'/araclar':context.route;
 const tenant={id:'tenant-a',slug:'3dyanimda',name:'3D Yanımda',domain:'3dyanimda.com',status:'active'};
 const fields=clear?{business_name:'Yeni Marka',email:'',phone:'',address_tr:'',instagram:'',google_business_url:'',visit_note:'',delivery_note:'',onsite_note:''}:{business_name:'Yeni Marka',email:'new@example.com',phone:'+905551112233',phone_display:'+90 555 111 22 33',address_tr:'Yeni Sokak 1, Kadıköy, İstanbul, TR',address_street:'Yeni Sokak 1',address_district:'Kadıköy',address_city:'İstanbul',address_country:'TR',instagram:'https://instagram.com/new_brand',google_business_url:'https://www.google.com/maps?cid=123',visit_note:'Yeni randevu bilgisi.',delivery_note:'Yalnızca kargo.',onsite_note:''};
 const settings={contact_info:fields,verified_business_identity:{email:'old@example.com',telephone:'+905111111111',address:{streetAddress:'Eski adres'},sameAs:['https://instagram.com/old_brand']}};
 const graph=[{'@type':'Organization','@id':context.origin+'/#organization',url:context.origin,name:fields.business_name,...(!clear?{email:fields.email,telephone:fields.phone,sameAs:[fields.google_business_url,fields.instagram]}:{})},{'@type':'WebSite','@id':context.origin+'/#website',name:fields.business_name}];
 if(!clear)graph.push({'@type':'ProfessionalService','@id':context.origin+'/#localbusiness',url:context.origin,name:fields.business_name,address:{'@type':'PostalAddress',streetAddress:'Yeni Sokak 1',addressLocality:'Kadıköy',addressRegion:'İstanbul',addressCountry:'TR'},hasMap:fields.google_business_url});
 const contacts=clear?'':`<a href="mailto:${fields.email}">${fields.email}</a><a href="tel:${fields.phone}">${fields.phone_display}</a>`;
 const profiles=clear?'':`<nav class="business-profile-links"><a href="${fields.google_business_url}">Google Haritalar</a><a href="${fields.instagram}">Instagram</a></nav>`;
 const details=clear?'':`<div><h2>Atölye ziyareti ve randevu</h2><p>${fields.visit_note}</p><address>${fields.address_tr}</address></div><div><h2>Teslimat seçenekleri</h2><p>${fields.delivery_note}</p></div>`;
 const dom=new JSDOM(`<main><div class="contact-details">${contacts}${details}</div>${profiles}</main><footer class="brand-footer"><a class="brand-logo"><img alt="Yeni Marka"></a>${contacts}${profiles}${clear?'':`<span class="footer-address">${fields.address_tr}</span>`}</footer>`,{url:context.origin+route});
 const {document}=dom.window;
 const script=(id,type,data)=>{const node=document.createElement('script');node.id=id;node.type=type;node.textContent=JSON.stringify(data);document.head.append(node);};
 script('schema','application/ld+json',{'@context':'https://schema.org','@graph':graph});
 if(bootstrap){
  const response=(table,filter,body)=>({key:JSON.stringify(['GET',`/rest/v1/${table}?select=*&${filter}=eq.tenant-a`,'application/json','']),body:JSON.stringify(body)});
  script('public-bootstrap','application/json',{host:'3dyanimda.com',path:route,apiOrigin:'https://public-api.example.com',entries:[response('tenants','id',tenant),response('site_settings','tenant_id',Object.entries(settings).map(([key,value])=>({key,value})))]});
 }else script('public-render-state','application/json',{version:1,host:'3dyanimda.com',path:route,tenant,settings});
 return {dom,document,context:{...context,route}};
}
const change=(document,id,edit)=>{const node=document.getElementById(id),value=JSON.parse(node.textContent);edit(value);node.textContent=JSON.stringify(value);};

test('export accepts admin overrides and compares their schema and visible contact/profile facts',()=>{
 const f=fixture();try{assert.equal(assertExportedBusinessProfile(f.document,f.context).length,3);}finally{f.dom.window.close();}
});
test('export accepts intentionally cleared inherited facts without requiring an old workshop or default notes',()=>{
 const f=fixture({clear:true});try{assert.equal(assertExportedBusinessProfile(f.document,f.context).length,2);}finally{f.dom.window.close();}
});
test('non-hydrated routes resolve the exact tenant-bound anonymous API capture',()=>{
 const f=fixture({bootstrap:true});try{assert.equal(assertExportedBusinessProfile(f.document,f.context).length,3);}finally{f.dom.window.close();}
});
test('swapped host, route, tenant, brand and canonical domain snapshots fail',()=>{
 for(const edit of [s=>s.host='3dsanayi.com',s=>s.path='/hakkimizda',s=>s.tenant.id='tenant-b',s=>s.tenant.slug='3dsanayi',s=>s.tenant.domain='3dsanayi.com']){
  const f=fixture();try{change(f.document,'public-render-state',edit);assert.throws(()=>assertExportedBusinessProfile(f.document,f.context));}finally{f.dom.window.close();}
 }
});
test('missing settings evidence or a bootstrap query for another tenant fails closed',()=>{
 const a=fixture();try{a.document.getElementById('public-render-state').remove();assert.throws(()=>assertExportedBusinessProfile(a.document,a.context),/settings evidence/);}finally{a.dom.window.close();}
 const b=fixture({bootstrap:true});try{change(b.document,'public-bootstrap',s=>s.entries[1].key=s.entries[1].key.replace('eq.tenant-a','eq.tenant-b'));assert.throws(()=>assertExportedBusinessProfile(b.document,b.context),/tenant-bound site_settings/);}finally{b.dom.window.close();}
});
test('stale names, contacts, addresses and additional organizations fail schema parity',()=>{
 for(const edit of [g=>g[0].name='Old name',g=>g[0].telephone='+905111111111',g=>g[2].address.streetAddress='Old address',g=>g.push({'@type':'Organization','@id':context.origin+'/#other',name:'Extra business'})]){
  const f=fixture();try{change(f.document,'schema',s=>edit(s['@graph']));assert.throws(()=>assertExportedBusinessProfile(f.document,f.context));}finally{f.dom.window.close();}
 }
});
test('stale visible links fail even when the graph correctly omits cleared fields',()=>{
 const f=fixture({clear:true});try{const link=f.document.createElement('a');link.href='mailto:old@example.com';link.textContent='old@example.com';f.document.querySelector('footer').append(link);assert.throws(()=>assertExportedBusinessProfile(f.document,f.context),/mailto: link count/);}finally{f.dom.window.close();}
});
