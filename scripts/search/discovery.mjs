import { llmsDirectory } from './llms-directory.mjs';
import {chunkSitemapEntries,validateSitemapIndex,SITEMAP_MAX_URL_LENGTH} from './sitemap.mjs';
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
    if((origin+path).length>=SITEMAP_MAX_URL_LENGTH)throw new Error('Sitemap URL must be shorter than 2048 characters: '+path.slice(0,80));
    if(p.noindex || p.indexable===false || (p.status!==undefined && p.status!==200) || (p.canonical!==undefined && p.canonical!==origin+path)) throw new Error('Discovery requires an indexable 200 self-canonical page: '+path);
    if(seen.has(path))throw new Error('Duplicate canonical path: '+path);seen.add(path);
    const lastmod=p.lastmod ? new Date(p.lastmod) : null;
    if(lastmod && (!Number.isFinite(+lastmod) || +lastmod>Date.now()+300000))throw new Error('Invalid content modification date: '+path);
    const images=[...new Set((p.images||[]).filter(value=>{
      try{const u=new URL(value);return u.origin===origin&&!u.username&&!u.password&&!u.search&&!u.hash&&!privatePath.test(u.pathname)&&u.href.length<SITEMAP_MAX_URL_LENGTH&&!/[\u0000-\u0020]/.test(value);}catch{return false;}
    }))].slice(0,20);
    return {...p,path,url:origin+path,images,lastmod:lastmod?.toISOString() || null};
  }).sort((a,b)=>a.path.localeCompare(b.path));
  const groups=new Map();
  for(const p of records){
    const segment=p.path.split('/')[1];
    const group=['rehber','cozumler','malzemeler','sektorler','bolgeler','blog'].includes(segment)?segment:'sayfalar';
    const rows=groups.get(group)||[];rows.push(p);groups.set(group,rows);
  }
  const files={};const maps=[];
  for(const [group,rows] of groups){
    const entries=rows.map(p=>`<url><loc>${escapeXml(p.url)}</loc>${p.lastmod?`<lastmod>${escapeXml(p.lastmod)}</lastmod>`:''}${p.images.map(u=>`<image:image><image:loc>${escapeXml(u)}</image:loc></image:image>`).join('')}</url>`);
    chunkSitemapEntries(entries).forEach((xml,index)=>{const file=`sitemaps/${group}-${index+1}.xml`;maps.push(file);files[file]=xml;});
  }
  files['sitemap.xml']=validateSitemapIndex('<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+maps.map(p=>`<sitemap><loc>${origin}/${p}</loc></sitemap>`).join('\n')+'\n</sitemapindex>\n',maps.length);
  // No separate bot group: the same crawl permissions apply to search/AI crawlers.
  files['robots.txt']=`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /studio\nDisallow: /api/\nDisallow: /auth/\nSitemap: ${origin}/sitemap.xml\n`;
  files['llms.txt']=llmsDirectory({brand,records});
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

