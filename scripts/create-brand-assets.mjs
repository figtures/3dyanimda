/** Reproducible web assets from the owner's original outlined SVGs. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {JSDOM} from 'jsdom';
const brands=JSON.parse(await readFile('src/brands/catalog.json','utf8'));
const manifest={};
const svg=(body,w,h)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
async function isolate(root,group){
 const doc=new JSDOM(root,{contentType:'image/svg+xml'}).window.document;
 [...doc.documentElement.children].filter(x=>x.tagName!=='g'||x!==[...doc.querySelectorAll('svg > g')][group]).forEach(x=>x.remove());
 const raw=await sharp(Buffer.from(doc.documentElement.outerHTML)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let l=raw.info.width,t=raw.info.height,r=0,b=0;
 for(let y=0;y<raw.info.height;y++)for(let x=0;x<raw.info.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>4){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 l=Math.max(0,l-1);t=Math.max(0,t-1);const w=r-l+2,h=b-t+2;
 return {body:`<g transform="translate(${-l} ${-t})">${doc.querySelector('g').outerHTML}</g>`,w,h};
}
for(const brand of brands){
 const root=await readFile(`assets/brand-sources/${brand.slug}.svg`,'utf8');
 const symbol=await isolate(root,0),letters=await isolate(root,1);
 const scale=70/letters.h,sw=100*symbol.w/symbol.h,gap=22,w=sw+gap+letters.w*scale,h=100;
 const lockup=`<g transform="scale(${100/symbol.h})">${symbol.body}</g><g transform="translate(${sw+gap} 15) scale(${scale})">${letters.body}</g>`;
 const icon=svg(`<g transform="translate(${(512-392*symbol.w/symbol.h)/2} 60) scale(${392/symbol.h})">${symbol.body}</g>`,512,512);
 // Wide symbols must fit both axes with the same clear space.
 const iconScale=392/Math.max(symbol.w,symbol.h);
 const square=svg(`<g transform="translate(${(512-symbol.w*iconScale)/2} ${(512-symbol.h*iconScale)/2}) scale(${iconScale})">${symbol.body}</g>`,512,512);
 const dir=`public/brand/identity/${brand.slug}`;await mkdir(dir,{recursive:true});
 const assets={};
 async function save(key,file,bytes,width,height,mime){
  bytes=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);await writeFile(`${dir}/${file}`,bytes);
  assets[key]={url:`/brand/identity/${brand.slug}/${file}`,width,height,mime,alt:brand.name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
 }
 for(const [name,content,width,height] of [['logo_wordmark',svg(lockup,w,h),w,h],['logo_icon',square,512,512],['logo_text',svg(letters.body,letters.w,letters.h),letters.w,letters.h]]){
  await save(name,`${name}.svg`,content,width,height,'image/svg+xml');
  await save(name+'_light',`${name}_light.svg`,content.replace(/fill="#[0-9a-fA-F]+"/g,'fill="#ffffff"'),width,height,'image/svg+xml');
  await save(name+'_png',`${name}.png`,await sharp(Buffer.from(content)).resize({width:name==='logo_icon'?512:1200}).png().toBuffer(),name==='logo_icon'?512:1200,Math.round(height*(name==='logo_icon'?512:1200)/width),'image/png');
 }
 const favicon=square.replace('>','><rect width="512" height="512" rx="100" fill="#ffffff"/>');
 await save('favicon_svg','favicon.svg',favicon,512,512,'image/svg+xml');
 for(const size of [16,32,48,96,180,192,512]) await save(size===180?'apple_touch_icon':size===96?'favicon':`icon_${size}`,`icon-${size}.png`,await sharp(Buffer.from(favicon)).resize(size,size).png().toBuffer(),size,size,'image/png');
 // PNG-compressed ICO directory, supported by modern Windows/browser engines.
 const entries=await Promise.all([16,32,48].map(size=>sharp(Buffer.from(favicon)).resize(size,size).png().toBuffer()));
 const head=Buffer.alloc(6+16*entries.length);head.writeUInt16LE(1,2);head.writeUInt16LE(entries.length,4);let offset=head.length;
 entries.forEach((entry,i)=>{const p=6+i*16;head[p]=head[p+1]=[16,32,48][i];head.writeUInt16LE(1,p+4);head.writeUInt16LE(32,p+6);head.writeUInt32LE(entry.length,p+8);head.writeUInt32LE(offset,p+12);offset+=entry.length;});
 await save('favicon_ico','favicon.ico',Buffer.concat([head,...entries]),48,48,'image/x-icon');
 const cardScale=Math.min(1000/w,180/h),cardW=w*cardScale;
 const card=svg(`<rect width="1200" height="630" fill="#f6f7f4"/><rect x="64" y="62" width="44" height="6" rx="3" fill="${/fill="(#[0-9a-fA-F]+)"/.exec(symbol.body)?.[1]||brand.accent}"/><g transform="translate(${(1200-cardW)/2} ${290-h*cardScale/2}) scale(${cardScale})">${lockup}</g><path d="M64 478H1136" stroke="#cdd4d0"/><text x="64" y="538" font-family="Arial,sans-serif" font-size="25" fill="#394641">3D baskı · 3D tarama · 3D modelleme</text><text x="1136" y="538" text-anchor="end" font-family="Arial,sans-serif" font-size="23" fill="#394641">${brand.slug}.com</text>`,1200,630);
 await save('og_image','og-image.png',await sharp(Buffer.from(card)).png().toBuffer(),1200,630,'image/png');
 // Schema uses the square, high resolution raster logo on a light background.
 await save('organization_logo','organization-logo.png',await sharp(Buffer.from(favicon)).png().toBuffer(),512,512,'image/png');
 manifest[brand.slug]=assets;
}
await writeFile('docs/audits/brand-assets-2026-10-12.json',JSON.stringify(manifest,null,2)+'\n');
const keys=['logo_icon','logo_icon_light','logo_wordmark','logo_wordmark_light','logo_text','logo_text_light','favicon','apple_touch_icon','og_image','organization_logo'];
const runtime=Object.fromEntries(Object.entries(manifest).map(([slug,assets])=>[slug,Object.fromEntries(keys.map(key=>{const {url,width,height,mime,alt}=assets[key];return [key,{url,width,height,mime,alt}]}))]));
await writeFile('src/brands/assets.json',JSON.stringify(runtime,null,2)+'\n');
console.log('Generated '+Object.values(manifest).reduce((n,v)=>n+Object.keys(v).length,0)+' assets for four brands.');
