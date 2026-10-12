/** Install and verify release dependencies. Never changes a release certificate. */
import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export async function prepareRelease(){
 if(process.env.SITES_MANAGED_LINUX_CONTAINER==='1')throw Error('Release browser preparation must run in Cloudflare Builds, GitHub Actions or a local development machine, not the managed Sites workspace.');
 const [major,minor]=process.versions.node.split('.').map(Number);
 if(major<22||(major===22&&minor<12))throw Error('Node >=22.12 is required.');
 const run=(cmd,args,options={})=>{const r=spawnSync(cmd,args,{stdio:'inherit',...options});if(r.error||r.status!==0)throw Error(`Release dependency command failed: ${cmd} ${args.join(' ')}. ${r.error?.message||''}`);return r;};
 const dir=path.resolve('.cloudflare/python'),python=path.join(dir,process.platform==='win32'?'Scripts/python.exe':'bin/python');
 const requirements=path.resolve('scripts/cloudflare/requirements.txt');
 const expected=createHash('sha256').update(readFileSync(requirements)).digest('hex'),stamp=path.join(dir,'requirements.sha256');
 if(!existsSync(python)){
  const base=process.env.PYTHON_EXECUTABLE||(process.platform==='win32'?'python':'python3');
  run(base,['-c','import sys; assert sys.version_info >= (3,11), "Python >=3.11 is required"']);
  run(base,['-m','venv',dir]);
 }
 if(!existsSync(stamp)||readFileSync(stamp,'utf8')!==expected){
  run(python,['-m','pip','install','--disable-pip-version-check','--only-binary=:all:','-r',requirements]);
  writeFileSync(stamp,expected);
 }
 run(python,['-c','import PIL,numpy,scipy; from scipy.fft import dctn; print("Release Python dependencies verified")']);
 process.env.RELEASE_PYTHON=python;
 if(!process.env.CHROMIUM_EXECUTABLE)process.env.PLAYWRIGHT_BROWSERS_PATH=path.resolve('.cloudflare/browsers');
 const {chromium}=await import('@playwright/test');
 if(!process.env.CHROMIUM_EXECUTABLE){
  // Workers Builds cannot elevate to root. Download into the project cache only;
  // system-library provisioning belongs to the runner, never the deploy command.
  run(process.execPath,['node_modules/playwright/cli.js','install','chromium']);
 }
 let browser;
 try{browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});}
 catch(cause){throw new Error('Chromium could not start. Browser installation uses no root privileges. If the error below lists missing Linux libraries, provision those in the runner image or use CHROMIUM_EXECUTABLE with a provisioned browser. Release checks have not been skipped.',{cause});}
 try{const page=await browser.newPage();await page.setContent('<h1>Release dependency check</h1>');if(await page.locator('h1').textContent()!=='Release dependency check')throw Error('Chromium smoke check failed');}finally{await browser.close();}
 mkdirSync('.cloudflare',{recursive:true});
 console.log('Release dependencies ready: Python audit, Chromium and browser libraries.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await prepareRelease();
