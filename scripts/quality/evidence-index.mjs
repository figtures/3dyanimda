import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

/** Hashes prove file identity only; they never promote a control or release status. */
export async function inspectEvidence(index,root=process.cwd()) {
 const files=[],errors=[],seen=new Set();
 for(const record of index.files||[]) {
  const name=record.path;
  if(typeof name!=='string'||path.isAbsolute(name)||name.split(/[\\/]/).includes('..')||seen.has(name)) {
   errors.push({path:name,error:'Invalid or duplicate evidence path'});continue;
  }
  seen.add(name);
  try {
   const data=await readFile(path.join(root,name));
   const current={path:name,sha256:createHash('sha256').update(data).digest('hex'),bytes:data.length};
   files.push(current);
   if(record.sha256!==current.sha256||record.bytes!==current.bytes) errors.push({path:name,error:'Evidence changed since index snapshot'});
  } catch {errors.push({path:name,error:'Evidence file unavailable'});}
 }
 if(!seen.size) errors.push({error:'Empty evidence index'});
 return {valid:errors.length===0,files,errors};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const args=process.argv.slice(2);
 if(args.some(arg=>arg!=='--refresh')) throw new Error('Usage: evidence-index.mjs [--refresh]');
 const file='docs/search-program/evidence-index.json';
 const index=JSON.parse(await readFile(file,'utf8'));
 const result=await inspectEvidence(index);
 if(args.includes('--refresh')) {
  if(result.errors.some(error=>error.error!=='Evidence changed since index snapshot')) throw new Error('Cannot refresh missing, invalid or empty evidence');
  index.files=result.files;
  index.checksumsRefreshedAt=new Date().toISOString();
  index.checksumScope='Current file identity only; historical run dates, results, coverage and release approval are unchanged.';
  await writeFile(file,JSON.stringify(index,null,2)+'\n');
  console.log(JSON.stringify({refreshed:true,files:result.files.length,releaseApproved:false}));
 } else {
  console.log(JSON.stringify({valid:result.valid,files:result.files.length,errors:result.errors,releaseApproved:false},null,2));
  process.exitCode=result.valid?0:1;
 }
}
