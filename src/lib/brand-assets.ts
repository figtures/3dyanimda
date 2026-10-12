import defaults from '@/brands/assets.json';
export type BrandAsset = {url:string;width?:number;height?:number;mime?:string;alt?:string;path?:string};
export type BrandAssetKey = 'logo_icon'|'logo_icon_light'|'logo_wordmark'|'logo_wordmark_light'|'logo_text'|'logo_text_light'|'favicon'|'apple_touch_icon'|'og_image'|'organization_logo';
export const brandAssetKeys:BrandAssetKey[]=['logo_icon','logo_icon_light','logo_wordmark','logo_wordmark_light','logo_text','logo_text_light','favicon','apple_touch_icon','og_image','organization_logo'];
/** Public stable images only: no credentials, signed URLs or executable schemes. */
export function publicAssetUrl(value:unknown,origin:string,extensions='svg|png|jpe?g|webp|ico') {
 if(typeof value!=='string'||!value.trim()||value.startsWith('//'))return;
 try{const url=new URL(value,origin);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!new RegExp(`\\.(${extensions})$`,'i').test(url.pathname))return;return url.href;}catch{return;}
}
export function brandAsset(slug:string|undefined,key:BrandAssetKey,settings:Record<string,unknown>={}):BrandAsset {
 const selected=Object.prototype.hasOwnProperty.call(defaults,slug||'')?slug as keyof typeof defaults:'3dyanimda';
 const fallback=defaults[selected][key],raw=settings[key];
 if(raw&&typeof raw==='object'){
  const value=raw as BrandAsset;
  const extensions=['og_image','favicon','apple_touch_icon','organization_logo'].includes(key)?'png|jpe?g':'svg|png|jpe?g|webp';
  if(publicAssetUrl(value.url,`https://${selected}.com`,extensions))return {url:value.url,alt:typeof value.alt==='string'?value.alt:fallback.alt,mime:value.mime,width:Number.isFinite(value.width)&&value.width>0?value.width:undefined,height:Number.isFinite(value.height)&&value.height>0?value.height:undefined};
 }
 return fallback;
}
