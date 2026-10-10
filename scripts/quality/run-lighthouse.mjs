import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const [directory, destination = 'docs/audits/lighthouse-latest.json'] = process.argv.slice(2);
if (!directory) throw new Error('Usage: node scripts/quality/run-lighthouse.mjs <approved-export-directory> [output.json]');
const domains=['3dyanimda.com','3dsanayi.com','maketyanimda.com','parcayanimda.com'];
const report={schemaVersion:1,status:'BLOCKED',startedAt:new Date().toISOString(),kind:'production-lab',fieldData:false,runs:[],blockers:[],thresholds:{lcpMs:2500,cls:0.1,tbtMs:200},limitations:['Lighthouse lab data is not CrUX p75 field data. TBT is not INP. No indexing or GEO visibility claim is inferred.']};
const output=path.resolve(destination);
await mkdir(path.dirname(output),{recursive:true});
try {
 const manifest=JSON.parse(await readFile(path.join(directory,'search-manifest.json'),'utf8'));
 const origin=new URL(manifest.origin);
 if(origin.protocol!=='https:' || !domains.includes(origin.hostname) || origin.origin!==manifest.origin) throw Error('Approved production origin required');
 report.origin=origin.origin;
 const requested=['/','/3d-baski','/3d-tarama','/3d-modelleme','/teklif-al','/iletisim','/cozumler','/malzemeler','/rehber','/bolgeler'];
 const pages=new Map(manifest.pages.map(p=>[p.path,p]));
 if(requested.some(p=>!pages.has(p))) throw Error('Required template missing from approved inventory');
 const cli=path.resolve('node_modules/lighthouse/cli/index.js');
 await access(cli);
 if(!process.env.CHROME_PATH) throw Error('CHROME_PATH must point to the installed Chrome executable');
 await access(process.env.CHROME_PATH);
 // Do not score a login screen, network error or another release as this site.
 const live=await fetch(origin.origin+'/search-manifest.json',{redirect:'error',signal:AbortSignal.timeout(15000)});
 if(live.status!==200) throw Error('Live manifest HTTP '+live.status);
 const current=await live.json();
 if(current.origin!==manifest.origin || JSON.stringify(current.pages.map(p=>[p.path,p.hash]).sort())!==JSON.stringify(manifest.pages.map(p=>[p.path,p.hash]).sort())) throw Error('Live manifest differs from approved artifact; deploy/verify before measuring this release');
 report.liveArtifactMatched=true;
 for(const route of requested) {
  const response=await fetch(origin.origin+route,{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(response.status!==200 || !response.headers.get('content-type')?.includes('text/html')) throw Error('Template preflight failed: '+route);
 }
 const rawDir=output.replace(/\.json$/,'')+'-raw'; await mkdir(rawDir,{recursive:true});
 for(const route of requested) for(const device of ['mobile','desktop']) for(let repeat=1;repeat<=3;repeat++){
  const basename=(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'-'+device+'-'+repeat;
  const prefix=path.join(rawDir,basename);
  const args=[cli,origin.origin+route,'--only-categories=performance,accessibility,best-practices,seo','--output=json','--output=html','--output-path='+prefix,'--quiet',...(device==='desktop'?['--preset=desktop']:[])];
  const run=spawnSync(process.execPath,args,{env:process.env,encoding:'utf8',timeout:120000});
  if(run.status!==0) throw Error('Lighthouse failed: '+basename+'; exit='+run.status+'; '+(run.error?.message||'inspect local runner environment'));
  const lhr=JSON.parse(await readFile(prefix+'.report.json','utf8'));
  if(lhr.runtimeError || lhr.finalDisplayedUrl!==origin.origin+route) throw Error('Invalid audit target/runtime: '+basename);
  const lcp=lhr.audits['largest-contentful-paint']?.numericValue;
  const cls=lhr.audits['cumulative-layout-shift']?.numericValue;
  const tbt=lhr.audits['total-blocking-time']?.numericValue;
  if(![lcp,cls,tbt].every(Number.isFinite)) throw Error('Missing lab metrics: '+basename);
  report.runs.push({route,device,repeat,version:lhr.lighthouseVersion,fetchTime:lhr.fetchTime,json:path.relative(path.dirname(output),prefix+'.report.json'),html:path.relative(path.dirname(output),prefix+'.report.html'),scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),lcpMs:lcp,cls,tbtMs:tbt});
 }
 const median=values=>values.sort((a,b)=>a-b)[1];
 report.templates=requested.flatMap(route=>['mobile','desktop'].map(device=>{
  const rows=report.runs.filter(r=>r.route===route&&r.device===device);
  const metrics={lcpMs:median(rows.map(r=>r.lcpMs)),cls:median(rows.map(r=>r.cls)),tbtMs:median(rows.map(r=>r.tbtMs))};
  return {route,device,...metrics,status:metrics.lcpMs<=2500&&metrics.cls<=0.1&&metrics.tbtMs<=200?'PASS':'FAIL'};
 }));
 report.status=report.templates.every(r=>r.status==='PASS')?'PASS':'FAIL';
} catch(error) { report.blockers.push(error.message); }
report.finishedAt=new Date().toISOString();
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,runs:report.runs.length,blockers:report.blockers,report:output}));
if(report.status!=='PASS') process.exitCode=2;

