import {lookup} from 'node:dns/promises';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const brands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda'];
const paths=['/','/3d-baski','/robots.txt','/sitemap.xml','/llms.txt','/__audit_missing_page_20261012'];
const report={kind:'public-domain-read-only-probe',checkedAt:new Date().toISOString(),sourceCommit:process.env.GITHUB_SHA,workflowRun:process.env.GITHUB_RUN_ID,authentication:false,writes:false,brands:[]};
for(const brand of brands){
 const hostname=brand+'.com';const entry={hostname,dns:[],requests:[]};
 try{entry.dns=await lookup(hostname,{all:true});}catch(error){entry.dnsError=error.code||error.message;}
 entry.requests=await Promise.all(paths.map(async path=>{
  try{
   const response=await fetch('https://'+hostname+path,{signal:AbortSignal.timeout(15000),redirect:'follow',headers:{'user-agent':'Figtures-ReadOnly-Site-Audit/1.0'}});const body=await response.text();
   return {path,status:response.status,finalUrl:response.url,tlsVerified:true,contentType:response.headers.get('content-type'),robotsHeader:response.headers.get('x-robots-tag'),cacheControl:response.headers.get('cache-control'),bytes:Buffer.byteLength(body),sha256:createHash('sha256').update(body).digest('hex'),...(path==='/'||path==='/3d-baski'?{title:body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],h1Count:(body.match(/<h1\b/gi)||[]).length,jsonLdCount:(body.match(/application\/ld\+json/gi)||[]).length,canonicalTag:body.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0],robotsTags:body.match(/<meta\b[^>]*name=["']robots["'][^>]*>/gi)||[]}:{}),...(path.endsWith('.txt')?{sample:body.slice(0,1500)}:{})};
  }catch(error){return {path,error:error.cause?.code||error.code||error.message,tlsVerified:false};}
 }));report.brands.push(entry);
}
await mkdir('artifacts/public-domain',{recursive:true});await writeFile('artifacts/public-domain/report.json',JSON.stringify(report,null,2)+'\n');
console.log('PUBLIC_DOMAIN_SUMMARY '+JSON.stringify(report));
