import {publicLocalPath} from "@/lib/local-urls.mjs";
import type {LandingPage} from './types';
export function selectRelatedContent(rows:LandingPage[],page:LandingPage,brand=page.brand) {
 const unique=[...new Map(rows.map(row=>[row.path,row])).values()].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 if(brand==='3dyanimda'&&page.kind==='location'&&page.district){
  const hub=publicLocalPath('/bolgeler/istanbul/'+page.district,brand);
  const localPath=(path:string)=>publicLocalPath(path,brand);
  const localScore=(row:LandingPage)=>localPath(row.path)===hub?100:row.kind==='location'&&row.district===page.district&&!row.neighborhood?90:page.editorial?.relatedPaths?.includes(row.path)?50:0;
  return unique.filter(row=>row.path!==page.path&&localScore(row)>0).sort((a,b)=>localScore(b)-localScore(a)).slice(0,4);
 }
 return unique.filter(row=>row.path!==page.path&&(page.editorial?.relatedPaths?.includes(row.path)||row.kind===page.kind))
  .sort((a,b)=>Number(page.editorial?.relatedPaths?.includes(b.path))-Number(page.editorial?.relatedPaths?.includes(a.path))).slice(0,4);
}
