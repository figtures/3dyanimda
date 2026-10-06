import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {changedUrls,canonicalOrigin} from './discovery.mjs';
const args=process.argv.slice(2),directory=args.find(a=>!a.startsWith('--'));
if(!directory)throw new Error('Usage: node scripts/search/submit-indexnow.mjs <export-directory> [--submit]');
const manifest=JSON.parse(await readFile(path.join(directory,'search-manifest.json'),'utf8'));
let previous;
if(process.env.PREVIOUS_SEARCH_MANIFEST)previous=JSON.parse(await readFile(process.env.PREVIOUS_SEARCH_MANIFEST,'utf8'));
const changes=changedUrls(manifest,previous);
if(!args.includes('--submit')) {
  console.log(JSON.stringify({mode:'dry-run',origin:manifest.origin,changed:changes.length,urls:changes}));
} else {
  const origin=canonicalOrigin(manifest.origin),key=process.env.INDEXNOW_KEY||'';
  if(!/^[a-zA-Z0-9-]{8,128}$/.test(key))throw new Error('INDEXNOW_KEY is required.');
  const fetchPublic=async url=>fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  const verify=await fetchPublic(origin+'/'+key+'.txt');
  if(verify.status!==200 || (await verify.text()).trim()!==key)throw new Error('Live ownership file does not match; no URLs submitted.');
  // Notification follows deployment. Reject preview pages, failed pages and cross-host redirects.
  for(const change of changes){
    const res=await fetchPublic(change.url);
    if(change.removed && [404,410].includes(res.status))continue;
    if(change.removed && [301,308].includes(res.status)){
      const target=new URL(res.headers.get('location'),origin);
      if(target.origin!==origin)throw new Error('Cross-host removal redirect: '+change.url);
      continue;
    }
    if(change.removed)throw new Error('Removed URL still resolves without a removal status: '+change.url);
    if(res.status!==200 || /noindex/i.test(res.headers.get('x-robots-tag')||''))throw new Error('Live URL is not index eligible: '+change.url);
    const html=await res.text();
    if(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) || /<meta[^>]+content=["'][^"']*noindex[^>]+name=["']robots/i.test(html))throw new Error('Live meta noindex: '+change.url);
    const canonical=html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i)?.[1];
    if(canonical!==change.url)throw new Error('Live canonical mismatch: '+change.url);
  }
  const receipts=[];
  for(let i=0;i<changes.length;i+=10000){
    const res=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({host:new URL(origin).host,key,keyLocation:origin+'/'+key+'.txt',urlList:changes.slice(i,i+10000).map(p=>p.url)})});
    receipts.push({status:res.status,count:Math.min(10000,changes.length-i)});
    if(![200,202].includes(res.status))throw new Error('IndexNow returned '+res.status+'. No automatic retry; respect Retry-After if rate limited.');
  }
  console.log(JSON.stringify({submitted:changes.length,receipts,note:'Receipt confirms URL notification, not indexing.'}));
  if(process.env.INDEXNOW_RECEIPT_PATH)await writeFile(process.env.INDEXNOW_RECEIPT_PATH,JSON.stringify({origin,submittedAt:new Date().toISOString(),receipts},null,2));
}
