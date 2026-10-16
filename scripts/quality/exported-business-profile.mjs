import assert from 'node:assert/strict';
import {resolveBusinessProfile} from '../../src/lib/business-profile.ts';
import {mergeIdentityNodes} from './identity-graph.mjs';

const normalize=value=>String(value||'').replace(/\s+/g,' ').trim();
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const json=(document,id)=>{const node=document.getElementById(id);return node?JSON.parse(node.textContent):null;};

/** Bind exported facts to this route's actual anonymous tenant snapshot. */
export function exportedBusinessProfile(document,{origin,route,brand,tenantId}) {
 const host=new URL(origin).hostname;
 const state=json(document,'public-render-state');
 let tenant,settings;
 if(state){
  assert.equal(state.version,1,'Public render state version');
  assert.equal(state.host,host,'Public render state host');
  assert.equal(state.path,route,'Public render state route');
  assert.equal(state.search||'','','Exported public state must have no preview query');
  ({tenant,settings}=state);
 }else{
  // Non-hydrated tool/legacy routes retain anonymous API responses instead.
  const bootstrap=json(document,'public-bootstrap');
  assert.ok(bootstrap,'Export requires public settings evidence');
  assert.equal(bootstrap.host,host,'Public bootstrap host');
  assert.equal(bootstrap.path,route,'Public bootstrap route');
  const readRows=(table,filter)=>{
   const matches=(bootstrap.entries||[]).filter(entry=>{
    const [method,path]=JSON.parse(entry.key);
    const url=new URL(path,bootstrap.apiOrigin);
    return method==='GET'&&url.pathname===`/rest/v1/${table}`&&url.searchParams.get(filter)===`eq.${tenantId}`;
   });
   assert.equal(matches.length,1,`One tenant-bound ${table} response is required`);
   const value=JSON.parse(matches[0].body);
   return Array.isArray(value)?value:[value];
  };
  const tenants=readRows('tenants','id');
  assert.equal(tenants.length,1,'One exported tenant is required');
  tenant=tenants[0];
  const rows=readRows('site_settings','tenant_id');
  assert.ok(rows.every(row=>object(row)&&typeof row.key==='string'&&Object.hasOwn(row,'value')),'Valid settings rows');
  assert.equal(new Set(rows.map(row=>row.key)).size,rows.length,'Unique settings keys');
  settings=Object.fromEntries(rows.map(row=>[row.key,row.value]));
 }
 assert.ok(object(tenant)&&object(settings),'Exported tenant and settings are required');
 assert.equal(tenant.id,tenantId,'Exported tenant id');
 assert.equal(tenant.slug,brand,'Exported brand');
 assert.equal(tenant.custom_domain||tenant.domain,host,'Exported canonical tenant domain');
 assert.equal(tenant.status,'active','Exported active tenant');
 return resolveBusinessProfile(settings,{name:tenant.name,origin});
}

/** Verify UI/schema parity without requiring historical contact values after an edit. */
export function assertExportedBusinessProfile(document,context) {
 const {origin,route}=context;
 const profile=exportedBusinessProfile(document,context);
 const schemas=[...document.querySelectorAll('script[type="application/ld+json"]')].map(el=>JSON.parse(el.textContent));
 assert.equal(schemas.length,1,'Exactly one owned JSON-LD graph');
 const nodes=mergeIdentityNodes(schemas,origin+route);
 const byType=type=>[...nodes.values()].filter(node=>node['@type']===type);
 const organizations=byType('Organization');
 assert.equal(organizations.length,1,'One organization');
 const organization=organizations[0];
 assert.equal(organization['@id'],origin+'/#organization');
 assert.equal(organization.url,origin);
 assert.equal(organization.name,profile.name);
 assert.equal(organization.description,profile.description||undefined);
 assert.equal(organization.email,profile.email);
 assert.equal(organization.telephone,profile.phone);
 assert.deepEqual(organization.sameAs,profile.sameAs.length?profile.sameAs:undefined);
 const websites=byType('WebSite');
 assert.equal(websites.length,1,'One website');
 assert.equal(websites[0].name,profile.name);
 assert.equal(websites[0]['@id'],origin+'/#website');
 const offices=byType('ProfessionalService');
 assert.equal(offices.length,profile.address?1:0,'Only an explicitly resolved workshop address creates a local business');
 if(profile.address){
  const office=offices[0];
  assert.equal(office['@id'],origin+'/#localbusiness');
  assert.equal(office.url,origin);
  assert.equal(office.name,profile.name);
  assert.deepEqual(office.address,{'@type':'PostalAddress',...profile.address});
  assert.deepEqual(office.geo,profile.geo?{'@type':'GeoCoordinates',...profile.geo}:undefined);
  assert.equal(office.hasMap,profile.googleBusinessUrl);
 }
 assert.ok(!JSON.stringify(schemas).includes('https://3dyaninda.com'),'No inherited source-brand schema');
 const footer=document.querySelector('.brand-footer');
 assert.ok(footer,'Shared public footer');
 assert.equal(footer.querySelector('.brand-logo img')?.getAttribute('alt'),profile.name);
 const assertContacts=scope=>{
  for(const [prefix,value,label] of [['mailto:',profile.email,profile.email],['tel:',profile.phone,profile.phoneDisplay]]){
   const links=[...scope.querySelectorAll(`a[href^="${prefix}"]`)];
   assert.equal(links.length,value?1:0,`${prefix} link count`);
   if(value){assert.equal(links[0].getAttribute('href'),prefix+value);assert.equal(normalize(links[0].textContent),normalize(label));}
  }
 };
 const assertProfiles=scope=>assert.deepEqual([...scope.querySelectorAll('.business-profile-links a')].map(link=>link.getAttribute('href')),profile.sameAs,'Visible profile links match schema');
 assertContacts(footer);
 assertProfiles(footer);
 assert.equal(normalize(footer.querySelector('.footer-address')?.textContent),normalize(profile.addressText),'Footer address');
 if(route==='/iletisim'){
  const details=document.querySelector('.contact-details');
  assert.ok(details,'Visible contact details');
  assertContacts(details);
  assert.equal(normalize(details.querySelector('address')?.textContent),normalize(profile.addressText),'Visible contact address');
  for(const [heading,note] of [['Atölye ziyareti ve randevu',profile.visitNote],['Teslimat seçenekleri',profile.deliveryNote],['3D tarama ve yerinde hizmet',profile.onsiteNote]]){
   const section=[...details.children].find(child=>child.querySelector('h2')?.textContent===heading);
   assert.equal(normalize(section?.querySelector('p')?.textContent),normalize(note),`Visible ${heading}`);
  }
  const main=document.querySelector('main');
  assert.ok(main);
  assertProfiles(main);
  assert.equal(main.querySelector('iframe.business-map')?.getAttribute('src'),profile.mapEmbedUrl);
 }
 return schemas.flatMap(schema=>schema['@graph']||[schema]);
}
