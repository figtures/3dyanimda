import type { ModelPart } from './types';
import { MAX_PARTS, MAX_TRIANGLES } from './types';
import { measureModel } from './measure';
export type CadResult = { success: boolean; meshes: {name?: string; color?: [number,number,number]; attributes: {position:{array:number[]}}; index:{array:number[]}}[] };
export function cadModel(result: CadResult, format: string) {
  if (!result.success || !result.meshes?.length || result.meshes.length > MAX_PARTS) throw new Error(`${format} dosyasında okunabilir katı veya yüzey bulunamadı.`);
  let count=0;
  const parts:ModelPart[]=result.meshes.map(mesh=>{
    const vertices=mesh.attributes?.position?.array, indices=mesh.index?.array;
    if (!vertices?.length || vertices.length%3 || !indices?.length || indices.length%3 || (count+=indices.length/3)>MAX_TRIANGLES) throw new Error('CAD modeli önizleme sınırını aşıyor veya geçersiz.');
    const positions=new Float32Array(indices.length*3);
    indices.forEach((index,i)=>{
      if (!Number.isInteger(index)||index<0||index*3+2>=vertices.length) throw new Error('CAD yüzey verisi geçersiz.');
      positions.set(vertices.slice(index*3,index*3+3),i*3);
    });
    return {positions,name:mesh.name||format,color:mesh.color};
  });
  return measureModel(parts,format,false);
}
