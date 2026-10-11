import type {LandingPage} from './types';
import places from './places.json';
import {sourceNote,contentModified} from './source-notes';
import {canonicalPath} from '@/lib/search';

export function contentParent(kind:string):[string,string] {
 return ({service:['/hizmetler','Hizmetler'],sector:['/sektorler','Sektörler'],solution:['/cozumler','Çözümler'],material:['/malzemeler','Malzemeler'],location:['/bolgeler','Hizmet bölgeleri']} as Record<string,[string,string]>)[kind]||['/rehber','Bilgi merkezi'];
}
const questionId=(value:string)=>{let hash=2166136261;for(const letter of value.normalize('NFC')){hash^=letter.codePointAt(0)!;hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);};
export function visibleContentSources(page:LandingPage){
 const note=sourceNote(page.path);
 return [...(note?.sources||[]),...(page.editorial?.sources||[]).filter(s=>!note||!s.url.includes('/category/material-guide_'))].filter((s,i,all)=>all.findIndex(other=>other.url===s.url)===i);
}
/** One source for visible content and its machine-readable relationships. */
export function contentStructuredData(page:LandingPage,origin:string):Record<string,unknown>[] {
 const url=origin+canonicalPath(page.path), [parent,label]=contentParent(page.kind);
 const modified=contentModified(page.updated_at,page.path);
 const nodes:Record<string,unknown>[]=[{'@type':'BreadcrumbList',itemListElement:[{name:'Anasayfa',item:origin+'/'},{name:label,item:origin+parent},{name:page.title,item:url}].map((item,i)=>({'@type':'ListItem',position:i+1,...item}))}];
 if(page.kind==='guide')nodes.push({'@type':'Article',headline:page.title,description:page.summary,url,inLanguage:'tr-TR',isAccessibleForFree:true,mainEntityOfPage:{'@id':url+'#webpage'},author:{'@id':origin+'/#organization'},publisher:{'@id':origin+'/#organization'},...(modified?{dateModified:modified}:{}),...(page.image?{image:new URL(page.image,origin).href}:{}),...(visibleContentSources(page).length?{citation:visibleContentSources(page).map(s=>({'@type':'CreativeWork',name:s.title,url:s.url}))}:{})});
 if(page.kind==='service'||page.kind==='location'){
  const district=places.find(p=>p.slug===page.district)?.name;
  const service=({'3d-baski':'3D Baskı','3d-tarama':'3D Tarama','3d-modelleme':'3D Modelleme'} as Record<string,string>)[page.service||page.path.slice(1)];
  nodes.push({'@type':'Service',name:page.title,description:page.summary,url,provider:{'@id':origin+'/#organization'},mainEntityOfPage:{'@id':url+'#webpage'},...(service?{serviceType:service}:{}),...(page.city?{areaServed:{'@type':district?'AdministrativeArea':'City',name:district?district+', İstanbul':page.city==='istanbul'?'İstanbul':page.city}}:{})});
 }
 if(page.faq.length)nodes.push({'@type':'FAQPage',inLanguage:'tr-TR',mainEntity:page.faq.map(f=>({'@type':'Question','@id':url+'#question-'+questionId(f.q),name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))});
 return nodes;
}
