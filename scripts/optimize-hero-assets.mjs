import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const rows=[];await mkdir('public/brand/optimized',{recursive:true});
for(const name of ['product-prototype','fixture','architecture','parts']){
 const source='public/brand/industrial/'+name+'.webp';const original=await readFile(source);
 for(const width of [768,1536]){
  const file=`public/brand/optimized/${name}-${width}.avif`;
  await sharp(original).resize({width,withoutEnlargement:true}).avif({quality:55,effort:5}).toFile(file);
  const bytes=await readFile(file),meta=await sharp(bytes).metadata();
  rows.push({source,sourceHash:createHash('sha256').update(original).digest('hex'),file,width:meta.width,height:meta.height,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
}
await writeFile('docs/audits/hero-encoding-2026-10-11.json',JSON.stringify({kind:'responsive encodings of previously reviewed illustrative assets; originals retained',images:rows},null,2)+'\n');console.log(rows.map(r=>({file:r.file,bytes:r.bytes})));
