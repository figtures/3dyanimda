type Node = Record<string, unknown>;
export const SCHEMA_CONTRACT_VERSION = 1;
export const SCHEMA_TYPE_IDS: Readonly<Record<string,string>> = Object.freeze({Organization:'organization',WebSite:'website',ProfessionalService:'localbusiness',WebPage:'webpage',CollectionPage:'webpage',AboutPage:'webpage',ContactPage:'webpage',Article:'article',Service:'service',FAQPage:'faq',BreadcrumbList:'breadcrumb',ItemList:'itemlist',Blog:'blog',WebApplication:'application'});
const stable = (value: unknown): string => JSON.stringify(value, (_key, val) => val && typeof val === 'object' && !Array.isArray(val) ? Object.fromEntries(Object.entries(val).sort(([a],[b])=>a.localeCompare(b))) : val);
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
  return {'@context':'https://schema.org','@graph':[...graph.values()].sort((a,b)=>String(a['@id']).localeCompare(String(b['@id'])))};
}
