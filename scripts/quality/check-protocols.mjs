import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
export function validateProtocolInventory(data) {
 const errors=[];
 if(data.schemaVersion!==1 || data.kind!=='compliance-discovery-not-release-certificate') errors.push('Unsupported inventory kind/version');
 const expected=['SEO','GEO'].flatMap(prefix=>Array.from({length:10},(_,i)=>prefix+'-'+String(i+1).padStart(2,'0')));
 const ids=new Set(); const controls=new Set();
 for(const gate of data.gates||[]){
  if(ids.has(gate.id)||!expected.includes(gate.id)) errors.push('Duplicate/unknown gate '+gate.id); ids.add(gate.id);
  if(!['PASS','FAIL','BLOCKED'].includes(gate.status)) errors.push('Invalid gate status '+gate.id);
  if(!gate.controls?.length || !gate.source?.startsWith('https://app.notion.com/p/')) errors.push('Missing source/control '+gate.id);
  for(const control of gate.controls||[]){
   if(controls.has(control.id)||!control.id.startsWith(gate.id+'-')) errors.push('Invalid control ID '+control.id);
   controls.add(control.id);
  }
  // This is a discovery inventory, never a substitute for a signed release manifest.
  if(gate.status==='PASS') errors.push('PASS requires a separate verified release evidence manifest: '+gate.id);
 }
 for(const id of expected) if(!ids.has(id)) errors.push('Missing gate '+id);
 if(data.programStatus!=='BLOCKED'||data.decision!=='NO-GO') errors.push('Discovery inventory cannot approve release');
 return {valid:errors.length===0,errors,gates:ids.size,groupedControls:controls.size,releaseReady:false};
}
export function parseProtocolArguments(args) {
 const files=args.filter(arg=>!arg.startsWith('--'));
 if(args.some(arg=>arg.startsWith('--')&&arg!=='--release')||files.length>1) throw new Error('Usage: check-protocols.mjs [inventory.json] [--release]');
 return {file:files[0]||'docs/search-program/requirements.json',release:args.includes('--release')};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 const {file,release}=parseProtocolArguments(process.argv.slice(2));
 const data=JSON.parse(await readFile(file,'utf8'));
 const result=validateProtocolInventory(data); console.log(JSON.stringify(result,null,2));
 process.exitCode=result.valid?(release?2:0):1;
}
