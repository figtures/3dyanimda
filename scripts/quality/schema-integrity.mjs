/** Structural checks only; external vocabulary/eligibility and source truth are separate. */
export function schemaIntegrity(document,{origin,visibleText=''}) {
 const errors=[];const graph=document?.['@graph'];
 if(document?.['@context']!=='https://schema.org'||!Array.isArray(graph)||!graph.length)return ['Missing schema context/graph'];
 const ids=new Set();const refs=[];
 const text=value=>String(value||'').normalize('NFC').replace(/\s+/gu,' ').trim();
 const visible=text(visibleText);
 const visit=value=>{
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){value.forEach(visit);return;}
  if(value['@id']){
   if(value['@type'])ids.add(value['@id']);else refs.push(value['@id']);
  }
  for(const child of Object.values(value))visit(child);
 };
 const rootIds=graph.map(node=>node['@id']);
 if(rootIds.some(id=>typeof id!=='string')||new Set(rootIds).size!==rootIds.length)errors.push('Missing/duplicate graph ID');
 graph.forEach(visit);
 for(const ref of refs){
  try{const url=new URL(ref);if(url.origin===origin&&url.hash&&!ids.has(ref))errors.push('Dangling internal reference: '+ref);}catch{errors.push('Invalid reference: '+ref);}
 }
 for(const node of graph){
  if(node['@type']==='FAQPage')for(const item of node.mainEntity||[]){
   if(!text(item.name)||!text(item.acceptedAnswer?.text)||!visible.includes(text(item.name))||!visible.includes(text(item.acceptedAnswer?.text)))errors.push('FAQ differs from visible content');
  }
  if(node.dateModified&&!Number.isFinite(Date.parse(node.dateModified)))errors.push('Invalid modification date');
  if(node['@type']==='BreadcrumbList'&&(node.itemListElement||[]).some((item,i)=>item.position!==i+1||!item.name))errors.push('Invalid breadcrumb order');
 }
 return [...new Set(errors)];
}
