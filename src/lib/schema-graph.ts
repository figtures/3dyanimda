type Node = Record<string, unknown>;
export const SCHEMA_CONTRACT_VERSION = 1;
export const DATA_CONTRACT_VERSION = '1.0.0';
export const SCHEMA_TEMPLATE_VERSION = '1.1.0';
export const SCHEMA_TYPE_IDS: Readonly<Record<string,string>> = Object.freeze({Organization:'organization',WebSite:'website',ProfessionalService:'localbusiness',WebPage:'webpage',CollectionPage:'webpage',AboutPage:'webpage',ContactPage:'webpage',Article:'article',Service:'service',FAQPage:'faq',BreadcrumbList:'breadcrumb',ItemList:'itemlist',Blog:'blog',WebApplication:'application'});
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
const stable = (value: unknown): string => JSON.stringify(value, (_key, val) => val && typeof val === 'object' && !Array.isArray(val) ? Object.fromEntries(Object.entries(val).sort(([a],[b])=>compare(a,b))) : val);
const schemaOrder:Record<string,number>={WebSite:0,Organization:1,WebPage:2,CollectionPage:2,AboutPage:2,ContactPage:2,BreadcrumbList:4};
const nodeOrder=(node:Node)=>schemaOrder[String(node['@type'])]??3;
function merge(a: Node, b: Node, id: string): Node {
  const result = {...a};
  for (const [key,value] of Object.entries(b)) {
    if (value === undefined) continue;
    if (result[key] === undefined) result[key]=value;
    else if (stable(result[key]) !== stable(value)) {
      if (result[key] && value && typeof result[key] === 'object' && typeof value === 'object' && !Array.isArray(result[key]) && !Array.isArray(value)) result[key]=merge(result[key] as Node,value as Node,id+'.'+key);
      else throw new Error(`Conflicting structured fact: ${id}.${key}`);
    }
  }
  return result;
}
/** One deterministic dataset; complementary same-ID definitions merge, conflicting facts fail. */
export function composeSchemaGraph(documents: Node[], origin: string, pageUrl: string) {
  const graph = new Map<string,Node>();
  for (const document of documents) {
    const nodes=Array.isArray(document['@graph']) ? document['@graph'] as Node[] : [document];
    for (const source of nodes) {
      const {'@context':_context, ...node}=source;
      const type=String(node['@type']||'');
      if (!Object.prototype.hasOwnProperty.call(SCHEMA_TYPE_IDS,type)) throw new Error('Unregistered schema node type: '+type);
      const root=['Organization','WebSite','ProfessionalService'].includes(type)?origin+'/':pageUrl;
      const id=String(node['@id'] || root+'#'+SCHEMA_TYPE_IDS[type]);
      node['@id']=id;
      graph.set(id,graph.has(id)?merge(graph.get(id)!,node,id):node);
    }
  }
  const page=[...graph.values()].find(n=>['WebPage','CollectionPage','AboutPage','ContactPage'].includes(String(n['@type'])));
  if(page){
    const ref=(node:Node)=>({'@id':node['@id']});
    const byType=(type:string)=>[...graph.values()].find(n=>n['@type']===type);
    const primary=byType('Article')||byType('Service')||byType('ItemList')||byType('FAQPage');
    if(primary){page.mainEntity??=ref(primary);if(primary['@type']!=='ItemList')primary.mainEntityOfPage??=ref(page);}
    const breadcrumb=byType('BreadcrumbList');if(breadcrumb)page.breadcrumb??=ref(breadcrumb);
    const faq=byType('FAQPage');if(faq&&primary!==faq){page.hasPart??=ref(faq);faq.isPartOf??=ref(page);if(primary)faq.about??=ref(primary);}
    const list=byType('ItemList');if(list&&Array.isArray(list.itemListElement))list.numberOfItems=list.itemListElement.length;
    const article=byType('Article');if(article)article.isPartOf??={'@id':origin+'/#website'};
  }
  const ordered=[...graph.values()].sort((a,b)=>nodeOrder(a)-nodeOrder(b)||compare(String(a['@id']),String(b['@id'])));
  // Canonicalize object keys recursively; ordered FAQ/breadcrumb arrays retain their meaning.
  return {'@context':'https://schema.org','@graph':JSON.parse(stable(ordered)) as Node[]};
}
