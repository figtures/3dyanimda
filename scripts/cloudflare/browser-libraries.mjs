/** User-space Chromium libraries for the Ubuntu 24.04 Workers Builds image.
 * APT verifies signed repository metadata and package hashes. No package is
 * installed into the OS and no package maintainer script is executed.
 */
import {spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';

const packages=[
 'libasound2t64','libatk-bridge2.0-0t64','libatk1.0-0t64','libatspi2.0-0t64',
 'libcairo2','libcups2t64','libdbus-1-3','libdrm2','libgbm1','libglib2.0-0t64',
 'libnspr4','libnss3','libpango-1.0-0','libx11-6','libxcb1','libxcomposite1',
 'libxdamage1','libxext6','libxfixes3','libxkbcommon0','libxrandr2',
 'libfontconfig1','libfreetype6','fonts-liberation',
];
const quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
const xml=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function run(command,args,env=process.env){
 const result=spawnSync(command,args,{env,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:16*1024*1024});
 if(result.error||result.status!==0)throw new Error(`${command} failed: ${result.error?.message||result.stderr||result.stdout}`);
 return result.stdout;
}
function missingLibraries(executable,env){
 return run('ldd',[executable],env).split('\n').filter(line=>line.includes('not found')).map(line=>line.trim().split(/\s+/)[0]);
}

export function prepareBrowserLibraries(executable){
 if(process.platform!=='linux')return executable;
 const missing=missingLibraries(executable,process.env);
 if(!missing.length)return executable;
 console.log('Chromium requires user-space libraries: '+missing.join(', '));
 const os=Object.fromEntries(readFileSync('/etc/os-release','utf8').split('\n').filter(line=>line.includes('=')).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1).replace(/^"|"$/g,'')];}));
 if(os.ID!=='ubuntu'||os.VERSION_ID!=='24.04'||!['x64','arm64'].includes(process.arch))throw Error('Automatic user-space browser libraries require Ubuntu 24.04 x64/arm64. Supply a provisioned CHROMIUM_EXECUTABLE on other runners.');
 const triplet=process.arch==='x64'?'x86_64-linux-gnu':'aarch64-linux-gnu';
 const base=path.resolve('.cloudflare/browser-libraries',`ubuntu24.04-${process.arch}`),root=path.join(base,'root');
 const libraryPath=['usr/lib/'+triplet,'lib/'+triplet,'usr/lib','lib'].map(dir=>path.join(root,dir)).join(':');
 const env={...process.env,LD_LIBRARY_PATH:libraryPath+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'')};
 if(missingLibraries(executable,env).length){
  for(const dir of ['empty','state/lists/partial','cache/archives/partial','log','root'])mkdirSync(path.join(base,dir),{recursive:true});
  // Empty private status makes APT resolve the full transitive dependency set.
  // The host's dpkg database, APT configuration and filesystem stay untouched.
  writeFileSync(path.join(base,'status'),'');
  const mirror=process.arch==='x64'?'https://archive.ubuntu.com/ubuntu':'https://ports.ubuntu.com/ubuntu-ports';
  const security=process.arch==='x64'?'https://security.ubuntu.com/ubuntu':mirror;
  const keyring='/usr/share/keyrings/ubuntu-archive-keyring.gpg';
  if(!existsSync(keyring))throw Error('Ubuntu archive keyring is required; unsigned packages are not accepted.');
  writeFileSync(path.join(base,'sources.list'),[`deb [signed-by=${keyring}] ${mirror} noble main universe`,`deb [signed-by=${keyring}] ${mirror} noble-updates main universe`,`deb [signed-by=${keyring}] ${security} noble-security main universe`].join('\n')+'\n');
  const config={
   'Dir::Etc::main':'/dev/null','Dir::Etc::parts':path.join(base,'empty'),
   'Dir::Etc::sourcelist':path.join(base,'sources.list'),'Dir::Etc::sourceparts':path.join(base,'empty'),
   'Dir::State':path.join(base,'state'),'Dir::State::status':path.join(base,'status'),
   'Dir::Cache':path.join(base,'cache'),'Dir::Log':path.join(base,'log'),
   'APT::Sandbox::User':'','Acquire::Retries':'3','Acquire::http::Timeout':'60','Acquire::https::Timeout':'60',
  };
  const configFile=path.join(base,'apt.conf');
  writeFileSync(configFile,Object.entries(config).map(([key,value])=>`${key} ${JSON.stringify(value)};`).join('\n')+'\n');
  const aptEnv={...process.env,APT_CONFIG:configFile};
  console.log('Downloading signed Ubuntu browser dependencies into '+base);
  run('apt-get',['update','-o','APT::Update::Error-Mode=any'],aptEnv);
  run('apt-get',['--download-only','--assume-yes','--no-install-recommends','install',...packages],aptEnv);
  const archives=path.join(base,'cache/archives');
  const downloaded=readdirSync(archives).filter(file=>file.endsWith('.deb'));
  if(!downloaded.length)throw Error('APT did not download browser dependency packages.');
  for(const file of downloaded){
   // Keep the OS loader and glibc together. Ubuntu's additional libraries use
   // the host's same-release glibc; never shadow it with an extracted copy.
   if(/^(libc6|libc-bin)_/.test(file))continue;
   run('dpkg-deb',['--extract',path.join(archives,file),root]);
  }
  writeFileSync(path.join(base,'packages.json'),JSON.stringify({os:'ubuntu24.04',architecture:process.arch,packages:downloaded,systemPackagesInstalled:false},null,2)+'\n');
 }
 const remaining=missingLibraries(executable,env);
 if(remaining.length)throw Error('Chromium libraries remain unresolved: '+remaining.join(', '));
 const fontConfig=path.join(base,'fonts.conf');
 mkdirSync(path.join(base,'font-cache'),{recursive:true});
 writeFileSync(fontConfig,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>${xml(path.join(root,'usr/share/fonts'))}</dir><dir>/usr/share/fonts</dir><cachedir>${xml(path.join(base,'font-cache'))}</cachedir></fontconfig>\n`);
 const wrapper=path.join(base,'chromium');
 writeFileSync(wrapper,`#!/bin/sh\nexport LD_LIBRARY_PATH=${quote(env.LD_LIBRARY_PATH)}\nexport FONTCONFIG_FILE=${quote(fontConfig)}\nexec ${quote(executable)} "$@"\n`,{mode:0o700});
 console.log('Chromium user-space libraries resolved; system package installation was not used.');
 return wrapper;
}
