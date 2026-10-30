import type {LandingPage} from './types';
import places from './places.json';
import {sourceNote,contentModified} from './source-notes';
import {canonicalPath} from '@/lib/search';
import {contentPublished} from './publication-date';
import {publicLocalPath} from '@/lib/local-urls.mjs';
import {serviceExperience, serviceContentModified, visibleServiceFaq} from './service-experience.mjs';

export function contentParent(kind:string):[string,string] {
 return ({service:['/hizmetler','Hizmetler'],sector:['/sektorler','Sektörler'],solution:['/cozumler','Çözümler'],material:['/malzemeler','Malzemeler'],location:['/bolgeler','Hizmet bölgeleri']} as Record<string,[string,string]>)[kind]||['/rehber','Bilgi merkezi'];
}
export function contentBreadcrumbs(page:LandingPage, brand = page.brand) {
 const currentPath = publicLocalPath(canonicalPath(page.path), brand);
 const [parent, label] = contentParent(page.kind);
 let parents = [{path:'/', name:'Anasayfa'}, {path:parent, name:label}];
 if (brand === '3dyanimda' && page.kind === 'location' && page.city === 'istanbul') {
  parents = [{path:'/', name:'Anasayfa'}, {path:'/istanbul', name:'İstanbul'}];
  const district = places.find(p => p.slug === page.district);
  if (district) parents.push({path:'/'+district.slug, name:district.name});
  if (district && page.neighborhood === 'ornek') parents.push({path:'/atasehir-ornek', name:'Örnek Mahallesi'});
 }
 return [...parents.filter(item => item.path !== currentPath), {path:currentPath, name:page.title}];
}
const questionId=(value:string)=>{let hash=2166136261;for(const letter of value.normalize('NFC')){hash^=letter.codePointAt(0)!;hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);};
export function visibleContentSources(page:LandingPage){
 const note=sourceNote(page.path);
 return [...(note?.sources||[]),...(page.editorial?.sources||[]).filter(s=>!note||!s.url.includes('/category/material-guide_'))].filter((s,i,all)=>all.findIndex(other=>other.url===s.url)===i);
}
/** One source for visible content and its machine-readable relationships. */
export function contentStructuredData(page:LandingPage,origin:string,brand = page.brand || (new URL(origin).hostname === '3dyanimda.com' ? '3dyanimda' : '')):Record<string,unknown>[] {
 const url=origin+publicLocalPath(canonicalPath(page.path),brand);
 const experience=serviceExperience(page,brand);
 const faq=visibleServiceFaq(page,brand);
 const modified=serviceContentModified(page,brand,contentModified(page.updated_at,page.path));
 const published=contentPublished(page.editorial?.publishedAt);
 const nodes:Record<string,unknown>[]=[{'@type':'BreadcrumbList',itemListElement:contentBreadcrumbs(page,brand).map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:origin+item.path}))}];
 if(page.kind==='guide')nodes.push({'@type':'Article',headline:page.title,description:page.summary,url,inLanguage:'tr-TR',isAccessibleForFree:true,mainEntityOfPage:{'@id':url+'#webpage'},author:{'@id':origin+'/#organization'},publisher:{'@id':origin+'/#organization'},...(published?{datePublished:published}:{}),...(modified?{dateModified:modified}:{}),...(page.image?{image:new URL(page.image,origin).href}:{}),...(visibleContentSources(page).length?{citation:visibleContentSources(page).map(s=>({'@type':'CreativeWork',name:s.title,url:s.url}))}:{})});
 if(page.kind==='service'||page.kind==='location'||experience){
  const district=places.find(p=>p.slug===page.district)?.name;
  const service=({'3d-baski':'3D Baskı','3d-tarama':'3D Tarama','3d-modelleme':'3D Modelleme','3d-yedek-parca':'Yedek Parça Üretimi'} as Record<string,string>)[experience?.key||page.service||page.path.slice(1)];
  const related=experience?.links.filter(s=>origin+s.path!==url)||[];
  nodes.push({'@type':'Service','@id':url+'#service',name:page.title,description:page.summary,url,provider:{'@id':origin+'/#organization'},mainEntityOfPage:{'@id':url+'#webpage'},...(service?{serviceType:service}:{}),...(brand==='3dyanimda'&&page.path==='/3d-tarama'?{areaServed:{'@type':'Country',name:'Türkiye'}}:page.city||experience?{areaServed:{'@type':district?'AdministrativeArea':'City',name:district?district+', İstanbul':page.city==='istanbul'||experience?'İstanbul':page.city}}:{}),...(related.length?{isRelatedTo:related.map(s=>({'@id':origin+s.path+'#service'}))}:{})});
  for(const relatedService of related)nodes.push({'@type':'Service','@id':origin+relatedService.path+'#service',url:origin+relatedService.path,name:relatedService.name,serviceType:relatedService.name,description:relatedService.description,provider:{'@id':origin+'/#organization'}});
 }
 if(experience)nodes.push({'@type':'ItemList',name:experience.heading,itemListElement:experience.links.map((service,i)=>({'@type':'ListItem',position:i+1,name:service.name,url:origin+service.path,item:{'@id':origin+service.path+'#service'}}))});
 if(faq.length)nodes.push({'@type':'FAQPage','@id':url+'#faq',url:url+'#sorular',name:page.title+' — Sık sorulan sorular',inLanguage:'tr-TR',mainEntity:faq.map(f=>({'@type':'Question','@id':url+'#question-'+questionId(f.q),name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))});
 return nodes;
}
