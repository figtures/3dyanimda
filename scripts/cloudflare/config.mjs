import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
export const brands = ['3dyanimda', '3dsanayi', 'maketyanimda', 'parcayanimda'];
const publicKeys = ['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY','VITE_SITE_THEME'];
const configKeys = [...publicKeys,'SITE_DOMAIN','WORKER_NAME','WORKER_CUSTOM_DOMAIN','CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN'];
export function loadBrandConfig(brand, environment=process.env, read=readFileSync, exists=existsSync) {
  if (!brands.includes(brand)) throw new Error('Select one of: '+brands.join(', '));
  const file=`deploy/${brand}/.env`;
  // A local brand file wins. CI may supply only this Worker's build environment.
  const values={...Object.fromEntries(configKeys.map(k=>[k,environment[k] || ''])),...(exists(file)?parseEnv(read(file,'utf8')):{})};
  for(const key of Object.keys(values)) if(key.startsWith('VITE_') && !publicKeys.includes(key))
    throw new Error('Unrecognized public build setting: '+key);
  const domain=values.SITE_DOMAIN;
  if(!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) throw new Error('SITE_DOMAIN must be a bare lowercase domain.');
  const name=values.WORKER_NAME;
  if(!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name)) throw new Error('WORKER_NAME is required (lowercase letters, numbers, hyphens).');
  if(!['industrial','editorial','studio'].includes(values.VITE_SITE_THEME)) throw new Error('Invalid VITE_SITE_THEME.');
  const url=new URL(values.VITE_SUPABASE_URL);
  if(url.protocol!=='https:' || url.username || url.password || url.pathname!=='/') throw new Error('Use an HTTPS Supabase project origin.');
  const key=values.VITE_SUPABASE_PUBLISHABLE_KEY;
  let anon=false;
  try{anon=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role==='anon';}catch{}
  if(!key.startsWith('sb_publishable_') && !anon) throw new Error('Only a Supabase publishable or legacy anon key may enter the browser build.');
  if(!['true','false',''].includes(values.WORKER_CUSTOM_DOMAIN)) throw new Error('WORKER_CUSTOM_DOMAIN must be true or false.');
  return {brand,domain,name,customDomain:values.WORKER_CUSTOM_DOMAIN==='true',
    publicEnv:Object.fromEntries(publicKeys.map(k=>[k,values[k]])),
    credentials:Object.fromEntries(['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN'].filter(k=>values[k]).map(k=>[k,values[k]]))};
}
