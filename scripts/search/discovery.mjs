export const escapeXml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const privatePath = /^\/(admin|studio|api|auth)(\/|$)/;
export function canonicalOrigin(value) {
  const u=new URL(value);
  if(u.protocol!=='https:' || u.username || u.password || u.port || u.pathname!=='/' || u.search || u.hash) throw new Error('Expected an HTTPS canonical origin.');
  return u.origin;
}
export function publicPath(value) {
  if(!/^\/[a-z0-9/-]*$/.test(value) || value.includes('//') || privatePath.test(value)) throw new Error('Invalid public URL path: '+value);
  return value.replace(/\/+$/,'') || '/';
}
export function discoveryFiles({origin,brand,pages,indexNowKey}) {
  origin=canonicalOrigin(origin);
  const seen=new Set();
  const records=pages.map(p=>{
    const path=publicPath(p.path);
    if(seen.has(path))throw new Error('Duplicate canonical path: '+path);seen.add(path);
    const lastmod=p.lastmod ? new Date(p.lastmod) : null;
    if(lastmod && (!Number.isFinite(+lastmod) || +lastmod>Date.now()+300000))throw new Error('Invalid content modification date: '+path);
    return {...p,path,url:origin+path,lastmod:lastmod?.toISOString() || null};
  }).sort((a,b)=>a.path.localeCompare(b.path));
  const groups=new Map();
  for(const p of records){
    const segment=p.path.split('/')[1];
    const group=['rehber','cozumler','malzemeler','sektorler','bolgeler','blog'].includes(segment)?segment:'sayfalar';
    const rows=groups.get(group)||[];rows.push(p);groups.set(group,rows);
  }
  const files={};const maps=[];
  for(const [group,rows] of groups)for(let i=0;i<rows.length;i+=45000){
    const file=`sitemaps/${group}-${i/45000+1}.xml`;maps.push(file);
    files[file]='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+rows.slice(i,i+45000).map(p=>`<url><loc>${escapeXml(p.url)}</loc>${p.lastmod?`<lastmod>${escapeXml(p.lastmod)}</lastmod>`:''}${(p.images||[]).filter(u=>{try{return new URL(u).origin===origin;}catch{return false;}}).slice(0,20).map(u=>`<image:image><image:loc>${escapeXml(u)}</image:loc></image:image>`).join('')}</url>`).join('\n')+'\n</urlset>\n';
  }
  files['sitemap.xml']='<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+maps.map(p=>`<sitemap><loc>${origin}/${p}</loc></sitemap>`).join('\n')+'\n</sitemapindex>\n';
  // No separate bot group: the same crawl permissions apply to search/AI crawlers.
  files['robots.txt']=`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /studio\nDisallow: /api/\nDisallow: /auth/\nSitemap: ${origin}/sitemap.xml\n`;
  const oneLine=s=>String(s||'').replace(/[\r\n\[\]]/g,' ').trim();
  files['llms.txt']=`# ${oneLine(brand)}\n\n> Resmî hizmet ve bilgi sayfaları. Güncel kapsam, ilgili sayfada açıklanır.\n\n## İçerik dizini\n\n`+records.map(p=>`- [${oneLine(p.title)}](${p.url}): ${oneLine(p.description)}`).join('\n')+'\n';
  files['search-manifest.json']=JSON.stringify({version:1,origin,brand,pages:records},null,2)+'\n';
  if(indexNowKey){
    if(!/^[a-zA-Z0-9-]{8,128}$/.test(indexNowKey))throw new Error('Invalid IndexNow verification key.');
    files[indexNowKey+'.txt']=indexNowKey;
  }
  return files;
}
export function changedUrls(current,previous){
  const origin=canonicalOrigin(current.origin);
  if(previous && previous.origin!==origin) throw new Error('Previous manifest belongs to another site.');
  const old=new Map((previous?.pages||[]).map(p=>[p.url,p.hash]));
  const changes=[];
  for(const p of current.pages){
    if(new URL(p.url).origin!==origin || origin+publicPath(new URL(p.url).pathname)!==p.url)throw new Error('Manifest contains a noncanonical URL.');
    if(!old.has(p.url)||old.get(p.url)!==p.hash)changes.push({url:p.url,removed:false});
    old.delete(p.url);
  }
  for(const url of old.keys()){
    const u=new URL(url);
    if(u.origin!==origin || origin+publicPath(u.pathname)!==url)throw new Error('Invalid previous URL.');
    changes.push({url,removed:true});
  }
  return changes;
}
