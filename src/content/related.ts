import type {LandingPage} from './types';
export function selectRelatedContent(rows:LandingPage[],page:LandingPage) {
 const unique=[...new Map(rows.map(row=>[row.path,row])).values()].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 return unique.filter(row=>row.path!==page.path&&(page.editorial?.relatedPaths?.includes(row.path)||row.kind===page.kind))
  .sort((a,b)=>Number(page.editorial?.relatedPaths?.includes(b.path))-Number(page.editorial?.relatedPaths?.includes(a.path))).slice(0,4);
}
