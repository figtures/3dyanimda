export const isAssetLoadError=(error:unknown)=>/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|Unable to preload CSS|error loading dynamically imported module/i.test(error instanceof Error?error.message:String(error));
/** One recovery per minute, only on empty admin screens: never discard a quote file or edited form. */
export function recoverStaleAdminAsset(error:unknown):boolean {
  if(!isAssetLoadError(error)||!/^\/(admin|studio)(\/|$)/.test(location.pathname)||navigator.onLine===false)return false;
  if([...document.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('input,textarea')].some(input=>input.value!==''))return false;
  try {
    const key='asset-recovery:'+location.pathname,last=Number(sessionStorage.getItem(key)||0);
    if(Date.now()-last<60_000)return false;
    sessionStorage.setItem(key,String(Date.now()));
    location.reload();return true;
  }catch{return false;}
}
export function installAssetRecovery(){
 window.addEventListener('vite:preloadError',((event:Event & {payload?:unknown})=>{
   if(recoverStaleAdminAsset(event.payload))event.preventDefault();
 }) as EventListener);
}
