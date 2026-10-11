import sharp from 'sharp';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await mkdir('public/brand/optimized',{recursive:true});const images=[];
for(const name of (await readdir('public/brand/services')).filter(name=>name.endsWith('.webp')).sort()){
 const source='public/brand/services/'+name;const original=await readFile(source);
 for(const width of [640,1024]){
  const file=`public/brand/optimized/service-${name.replace('.webp','')}-${width}.avif`;
  await sharp(original).resize({width,withoutEnlargement:true}).avif({quality:60,effort:5}).toFile(file);
  const data=await readFile(file);const meta=await sharp(data).metadata();
  images.push({source,file,width:meta.width,height:meta.height,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
 }
}
await writeFile('docs/audits/service-image-encoding-2026-10-11.json',JSON.stringify({kind:'Responsive encodings of existing illustrative assets; original fallback retained',images},null,2)+'\n');
console.log(JSON.stringify({images:images.length,bytes:images.reduce((sum,row)=>sum+row.bytes,0)}));
