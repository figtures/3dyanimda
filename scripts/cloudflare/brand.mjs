import { build } from 'vite';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { loadBrandConfig } from './config.mjs';
const [action,brand]=process.argv.slice(2);
if(!['build','check','deploy'].includes(action)) throw new Error('Usage: node scripts/cloudflare/brand.mjs build|check|deploy <brand>');
const config=loadBrandConfig(brand);
const workspace=path.resolve('.cloudflare',brand);
const assets=path.join(workspace,'assets');
const configFile=path.join(workspace,'wrangler.json');
// Prevent root .env and inherited VITE_* variables from leaking into another brand.
for(const key of Object.keys(process.env)) if(key.startsWith('VITE_')) delete process.env[key];
const publicEnv={...config.publicEnv,VITE_TENANT_SLUG:brand,VITE_TENANT_HOST:config.domain};
const run=(file,args,env=process.env)=>{
 const result=spawnSync(process.execPath,[file,...args],{stdio:'inherit',env});
 if(result.status!==0) throw new Error('Command failed: '+path.basename(file));
};
if(action==='deploy') run('scripts/quality/release-preflight.mjs',[]);
await mkdir(workspace,{recursive:true});
await build({envDir:false,define:Object.fromEntries(Object.entries(publicEnv).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),build:{outDir:assets,emptyOutDir:true}});
let directory=assets;
if(action==='deploy') {
 // Render approved public pages for SEO; do not deploy only the SPA shell.
 const output=path.join(workspace,'release');
 run('scripts/export-sites.mjs',[],{...process.env,...publicEnv,SITE_HOSTS:config.domain,SITE_BUILD_DIR:assets,SITE_OUTPUT_DIR:output});
 directory=path.join(output,config.domain);
 // Cloudflare Worker handles these routes; Pages-style catch-all redirects would shadow HTML.
 await rm(path.join(directory,'_redirects'),{force:true});
}
const wrangler={name:config.name,main:path.resolve('deploy/worker.mjs'),compatibility_date:'2026-10-03',
 workers_dev:true,preview_urls:false,
 assets:{directory,binding:'ASSETS',run_worker_first:true,not_found_handling:'none'},
 vars:{SITE_DOMAIN:config.domain,BRAND_SLUG:brand,RELEASE_MODE:action==='deploy'?'approved':'preview'},
 ...(config.customDomain && action==='deploy'?{routes:[{pattern:config.domain,custom_domain:true}]}:{})};
await writeFile(configFile,JSON.stringify(wrangler,null,2)+'\n');
if(action==='build') console.log(`Built ${brand}; config: .cloudflare/${brand}/wrangler.json (not deployed)`);
else run('node_modules/wrangler/bin/wrangler.js',['deploy','--config',configFile,...(action==='check'?['--dry-run','--outdir',path.join(workspace,'dry-run')]:[])],{...process.env,...config.credentials,CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV:'false',WRANGLER_SEND_METRICS:'false'});
