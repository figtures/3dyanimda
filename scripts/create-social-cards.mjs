import sharp from 'sharp';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(await readFile('src/brands/catalog.json','utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
await mkdir('public/brand/social',{recursive:true});
const manifest=[];
for(const [i,brand] of catalog.entries()){
 const lines=brand.focus.split(' & ');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#101c1b"/><path d="M810 0H1200V630H1030Z" fill="#19352d"/><g fill="none" stroke="#d6f28f" stroke-width="2" opacity=".55"><path d="M965 150l120 70v140l-120 70-120-70V220Z M845 220l120 70 120-70 M965 290v140"/><path d="M${880+i*12} 160v275M820 ${210+i*18}l280 160" opacity=".3"/></g><rect x="64" y="65" width="44" height="4" fill="#d6f28f"/><text x="64" y="135" fill="#d6f28f" font-family="DejaVu Sans,sans-serif" font-size="22" letter-spacing="3">3D ÜRETİM / İSTANBUL</text><text x="60" y="268" fill="#fafbf5" font-family="DejaVu Sans,sans-serif" font-weight="bold" font-size="${brand.slug.length>11?73:86}">${escape(brand.name)}</text><text x="64" y="355" fill="#e1e8dc" font-family="DejaVu Sans,sans-serif" font-size="34">${escape(lines[0])}</text>${lines[1]?`<text x="64" y="405" fill="#e1e8dc" font-family="DejaVu Sans,sans-serif" font-size="34">${escape(lines[1])}</text>`:''}<path d="M64 486H1136" stroke="#53635b"/><text x="64" y="548" fill="#c4d1c0" font-family="DejaVu Sans,sans-serif" font-size="22">Baskı · Tarama · Modelleme</text><text x="1136" y="548" text-anchor="end" fill="#d6f28f" font-family="DejaVu Sans,sans-serif" font-size="22">${brand.slug}.com</text></svg>`;
 const bytes=await sharp(Buffer.from(svg)).png({compressionLevel:9}).toBuffer();
 const file=`public/brand/social/${brand.slug}-v1.png`;
 await writeFile(file,bytes);manifest.push({brand:brand.slug,file,width:1200,height:630,mime:'image/png',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),provenance:'Original code-rendered brand typography and geometry; no customer testimonial, logo endorsement or stock photo.'});
}
await writeFile('docs/audits/social-card-assets-2026-10-11.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest.map(({brand,bytes,width,height})=>({brand,bytes,width,height}))));
