import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
export const brands = ['3dyanimda', '3dsanayi', 'maketyanimda', 'parcayanimda'];
export function productionDomainRoutes(config, release) {
  if (!config.customDomain || !release) return {};
  const domains = [config.domain];
  // The Worker already redirects www to the canonical host. Bind the alias so
  // requests can reach that code; Custom Domains also provision DNS and TLS.
  if (config.brand === '3dyanimda') domains.push('www.' + config.domain);
  return {routes: domains.map(pattern => ({pattern, custom_domain: true}))};
}
const publicKeys = ['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY','VITE_SITE_THEME','VITE_GA4_MEASUREMENT_ID','VITE_GOOGLE_SITE_VERIFICATION','VITE_BING_SITE_VERIFICATION'];
const configKeys = [...publicKeys,'SITE_DOMAIN','WORKER_NAME','WORKER_CUSTOM_DOMAIN','CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN','INDEXNOW_KEY'];
// Public values already recorded in the four deploy/.env.example files. Secrets
// never have defaults. This also works in Builds when only the deploy command is set.
const sharedPublicDefaults={VITE_SITE_THEME:'industrial',VITE_SUPABASE_URL:'https://zdxjmhhjuomcpdtllnuq.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_cb-5Z_xQf-Z19whnlsrG-A_Id5ewC6H'};
export function normalizeSiteDomain(value,brand) {
  let domain=String(value||'').trim().toLowerCase();
  if(/^https?:\/\//.test(domain)) {
    let url;try{url=new URL(domain);}catch{throw new Error('SITE_DOMAIN is invalid; use '+brand+'.com.');}
    if(url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash)throw new Error('SITE_DOMAIN must contain only the domain, without a path, port or credentials.');
    domain=url.hostname;
  }
  if(domain!==brand+'.com')throw new Error('SITE_DOMAIN for '+brand+' must be '+brand+'.com.');
  return domain;
}
export function loadBrandConfig(brand, environment=process.env, read=readFileSync, exists=existsSync) {
  if (!brands.includes(brand)) throw new Error('Select one of: '+brands.join(', '));
  const file=`deploy/${brand}/.env`;
  // A local brand file wins. CI may supply only this Worker's build environment.
  const values={...Object.fromEntries(configKeys.map(k=>[k,''])),...sharedPublicDefaults,SITE_DOMAIN:brand+'.com',WORKER_NAME:brand,WORKER_CUSTOM_DOMAIN:brand==='3dyanimda'?'true':'false',...(brand==='3dyanimda'?{VITE_GA4_MEASUREMENT_ID:'G-HBTDHJ45M7'}:{}),...Object.fromEntries(configKeys.filter(k=>environment[k]).map(k=>[k,environment[k]])),...(exists(file)?parseEnv(read(file,'utf8')):{})};
  for(const key of Object.keys(values)) if(key.startsWith('VITE_') && !publicKeys.includes(key))
    throw new Error('Unrecognized public build setting: '+key);
  const domain=normalizeSiteDomain(values.SITE_DOMAIN,brand);
  const name=values.WORKER_NAME;
  if(!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name)) throw new Error('WORKER_NAME is required (lowercase letters, numbers, hyphens).');
  if(!['industrial','industrialtwo','editorial','studio'].includes(values.VITE_SITE_THEME)) throw new Error('Invalid VITE_SITE_THEME.');
  const url=new URL(values.VITE_SUPABASE_URL);
  if(url.protocol!=='https:' || url.username || url.password || url.pathname!=='/') throw new Error('Use an HTTPS Supabase project origin.');
  const key=values.VITE_SUPABASE_PUBLISHABLE_KEY;
  let anon=false;
  try{anon=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role==='anon';}catch{}
  if(!key.startsWith('sb_publishable_') && !anon) throw new Error('Only a Supabase publishable or legacy anon key may enter the browser build.');
  if(!['true','false',''].includes(values.WORKER_CUSTOM_DOMAIN)) throw new Error('WORKER_CUSTOM_DOMAIN must be true or false.');
  return {brand,domain,name,customDomain:values.WORKER_CUSTOM_DOMAIN==='true',
    indexNowKey:values.INDEXNOW_KEY,
    publicEnv:Object.fromEntries(publicKeys.map(k=>[k,values[k]])),
    credentials:Object.fromEntries(['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN'].filter(k=>values[k]).map(k=>[k,values[k]]))};
}
