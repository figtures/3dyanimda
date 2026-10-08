/** Validate tenant-local redirects before building any public artifact. */
export const legacyRedirects = [
  {from_path:'/hizmetler/3d-baski',to_path:'/3d-baski'},
  {from_path:'/hizmetler/3d-tarama',to_path:'/3d-tarama'},
  {from_path:'/hizmetler/3d-modelleme',to_path:'/3d-modelleme'},
  {from_path:'/teklif',to_path:'/teklif-al'},
];
export function compileRedirects(rows, destinations) {
  const map=new Map();
  const valid=p=>typeof p==='string' && /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(p) && !/^\/(admin|studio|api)(\/|$)/.test(p);
  for(const row of rows){
    if(row.active===false)continue;
    const {from_path:from,to_path:to}=row;
    if(!valid(from)||!valid(to)||from===to)throw Error('Invalid local redirect: '+from);
    if(map.has(from)&&map.get(from)!==to)throw Error('Conflicting redirect: '+from);
    map.set(from,to);
  }
  const compiled={};
  for(const [from,initial] of map){
    let to=initial;const seen=new Set([from]);
    while(map.has(to)){
      if(seen.has(to))throw Error('Redirect cycle: '+from);
      seen.add(to);to=map.get(to);
    }
    if(!destinations.has(to))throw Error('Redirect target is not published: '+to);
    compiled[from]=to;
  }
  return compiled;
}
