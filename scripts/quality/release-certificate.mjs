import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
export function sourceSnapshot(root=process.cwd()){
 const files=[];
 function walk(dir){for(const entry of readdirSync(path.join(root,dir),{withFileTypes:true})){
  const file=path.posix.join(dir,entry.name);
  if(entry.isDirectory())walk(file);
  else if(entry.isFile()&&file!=='content/release-review.json')files.push(file);
  else if(!entry.isFile())throw Error('Unsupported release entry: '+file);
 }}
 for(const dir of ['src','public','content'])walk(dir);
 const hash=createHash('sha256'),records=[];
 for(const file of files.sort()){const bytes=readFileSync(path.join(root,file));hash.update(file+'\0').update(bytes).update('\0');records.push({path:file,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});}
 return {sourceHash:hash.digest('hex'),sourceFileCount:files.length,files:records};
}
export function verifyCertificate(review,snapshot,root=process.cwd()){
 if(review.policy!=='global-originality-v1'||review.sourceHash!==snapshot.sourceHash||review.result!=='pass')throw Error('Release blocked: missing or stale final review.');
 for(const check of ['allBrandsAllThemesAllRoutes','renderedText','imageProvenance','visualSimilarity','modelGeometry','localEvidence','seoGeoParity'])if(review.checks?.[check]!==true)throw Error('Release blocked: '+check+' review incomplete.');
 if(!review.reviewer||!review.reviewedAt||!Array.isArray(review.evidence)||!review.evidence.length)throw Error('Release blocked: review evidence is required.');
 for(const item of review.evidence){
  if(typeof item.file!=='string'||path.isAbsolute(item.file)||item.file.split(/[\\/]/).includes('..'))throw Error('Release blocked: invalid evidence path.');
  const actual=createHash('sha256').update(readFileSync(path.join(root,item.file))).digest('hex');
  if(actual!==item.sha256)throw Error('Release blocked: changed review evidence: '+item.file);
 }
 return true;
}
