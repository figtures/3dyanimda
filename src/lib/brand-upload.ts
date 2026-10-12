import type {BrandAssetKey} from './brand-assets';
const vectorTags=new Set(['svg','g','path','rect','circle','ellipse','polygon','polyline','line','defs','clipPath','mask','linearGradient','radialGradient','stop','title','desc']);
const attributes=new Set(['xmlns','width','height','viewBox','version','id','role','aria-labelledby','aria-label','d','fill','fill-rule','fill-opacity','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','stroke-opacity','opacity','transform','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','points','clip-path','clip-rule','mask','maskUnits','maskContentUnits','gradientUnits','gradientTransform','spreadMethod','offset','stop-color','stop-opacity','preserveAspectRatio']);
export function validateBrandDimensions(key:BrandAssetKey,width:number,height:number){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>8192||height>8192)throw new Error('Görsel boyutları geçersiz (en fazla 8192 piksel).');
 if(['favicon','apple_touch_icon','organization_logo','logo_icon','logo_icon_light'].includes(key)&&Math.abs(width-height)>.01)throw new Error('Bu alan için kare (1:1) görsel yükleyin.');
 const minimum=key==='favicon'?96:key==='apple_touch_icon'?180:key==='organization_logo'?112:0;
 if(width<minimum)throw new Error(`Bu görsel en az ${minimum} × ${minimum} piksel olmalı.`);
 if(key==='og_image'&&(width!==1200||height!==630))throw new Error('Paylaşım görseli tam 1200 × 630 piksel olmalı.');
}
export function validateBrandSvg(text:string){
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw new Error('SVG içinde belge türü veya dış kaynak tanımı kullanılamaz.');
 const doc=new DOMParser().parseFromString(text,'image/svg+xml'),root=doc.documentElement;
 if(root.localName!=='svg'||doc.querySelector('parsererror')||Array.from(doc.childNodes).some(n=>n.nodeType===7))throw new Error('Geçerli bir SVG dosyası seçin.');
 for(const el of Array.from(root.querySelectorAll('*')).concat(root)){
  if(!vectorTags.has(el.tagName))throw new Error('SVG yalnızca vektör şekilleri içermeli; yazıları eğrilere dönüştürün.');
  for(const attr of Array.from(el.attributes)){
   if(!attributes.has(attr.name)||attr.value.includes('\\')||(/url\s*\(/i.test(attr.value)&&!/^url\(#[\w-]+\)$/.test(attr.value))||(/(?:javascript:|data:|https?:|\/\/)/i.test(attr.value)&&attr.name!=='xmlns'))throw new Error('SVG içinde kod veya dış kaynak kullanılamaz.');
  }
 }
 const box=(root.getAttribute('viewBox')||'').trim().split(/[ ,]+/).map(Number);
 const width=Number(root.getAttribute('width')?.replace(/px$/,''))||box[2],height=Number(root.getAttribute('height')?.replace(/px$/,''))||box[3];
 root.setAttribute('xmlns','http://www.w3.org/2000/svg');root.setAttribute('width',String(width));root.setAttribute('height',String(height));
 return {text:new XMLSerializer().serializeToString(root),width,height};
}
export async function prepareBrandUpload(file:File,key:BrandAssetKey){
 if(!file.size||file.size>2*1024*1024)throw new Error('En fazla 2 MB boyutunda bir dosya seçin.');
 if(/\.svg$/i.test(file.name)){
  if(!key.startsWith('logo_'))throw new Error('Bu alan için PNG veya JPEG kullanın.');
  const parsed=validateBrandSvg(await file.text());validateBrandDimensions(key,parsed.width,parsed.height);
  return {blob:new Blob([parsed.text],{type:'image/svg+xml'}),width:parsed.width,height:parsed.height,mime:'image/svg+xml',extension:'svg'};
 }
 const bytes=new Uint8Array(await file.arrayBuffer());
 const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71,jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 if(!png&&!jpeg&&!(webp&&key.startsWith('logo_')))throw new Error('Geçerli PNG, JPEG veya logo için WebP/SVG seçin.');
 const mime=png?'image/png':jpeg?'image/jpeg':'image/webp',extension=png?'png':jpeg?'jpg':'webp';
 const blob=new Blob([bytes],{type:mime}),url=URL.createObjectURL(blob);
 try{
  const dimensions=await new Promise<{width:number;height:number}>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve({width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>reject(new Error('Görsel okunamadı.'));img.src=url;});
  validateBrandDimensions(key,dimensions.width,dimensions.height);return {blob,...dimensions,mime,extension};
 }finally{URL.revokeObjectURL(url);}
}
