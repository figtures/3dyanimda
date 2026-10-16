import { MAX_PARTS, MAX_TRIANGLES, type ImportedModel, type ModelPart } from './types';

/** Measures transformed, millimetre-space triangles; open surfaces remain viewable. */
export function measureModel(parts: ModelPart[], format: string, unitAssumed: boolean, warnings: string[] = []): ImportedModel {
  if (!parts.length || parts.length > MAX_PARTS) throw new Error('Modelde görüntülenebilir yüzey bulunamadı veya parça sınırı aşıldı.');
  let triangles = 0, surface = 0, volume = 0, closed = true;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const part of parts) {
    const p = part.positions;
    if (!p.length || p.length % 9 || (triangles += p.length / 9) > MAX_TRIANGLES) throw new Error('Model önizleme sınırını aşıyor (500.000 üçgen). Daha düşük çözünürlüklü bir kopya deneyin.');
    const edges = new Map<string, {count: number; direction: number}>();
    let signedVolume = 0;
    // A local origin avoids cancellation in files with large assembly coordinates.
    const ox=p[0], oy=p[1], oz=p[2];
    for (let i = 0; i < p.length; i += 9) {
      const keys: string[] = [];
      for (let j = 0; j < 3; j++) {
        const at = i + j * 3;
        for (let k = 0; k < 3; k++) {
          const v = p[at+k];
          if (!Number.isFinite(v) || Math.abs(v) > 1e9) throw new Error('Model koordinatları geçersiz veya önizleme sınırının dışında.');
          min[k] = Math.min(min[k], v); max[k] = Math.max(max[k], v);
        }
        keys.push([p[at],p[at+1],p[at+2]].map(v=>Math.round(v*1e5)).join(','));
      }
      const ax=p[i]-ox, ay=p[i+1]-oy, az=p[i+2]-oz;
      const bx=p[i+3]-ox, by=p[i+4]-oy, bz=p[i+5]-oz;
      const cx=p[i+6]-ox, cy=p[i+7]-oy, cz=p[i+8]-oz;
      const ux=bx-ax, uy=by-ay, uz=bz-az, vx=cx-ax, vy=cy-ay, vz=cz-az;
      const area = Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)/2;
      if (area < 1e-10) { closed=false; continue; }
      surface += area;
      signedVolume += (ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx))/6;
      for (let k=0;k<3;k++) {
        const a=keys[k], b=keys[(k+1)%3], forward=a<b;
        const key=forward?`${a}|${b}`:`${b}|${a}`;
        const edge=edges.get(key)||{count:0,direction:0};edge.count++;edge.direction+=forward?1:-1;edges.set(key,edge);
      }
    }
    if ([...edges.values()].some(e=>e.count!==2||e.direction!==0)) closed=false;
    volume += Math.abs(signedVolume);
  }
  if (!(surface > 0) || !Number.isFinite(volume)) throw new Error('Dosyada geçerli üçgen yüzey bulunamadı.');
  return {parts,warnings,metrics:{volumeCm3:volume/1000,surfaceCm2:surface/100,bboxCm:{x:(max[0]-min[0])/10,y:(max[1]-min[1])/10,z:(max[2]-min[2])/10},triangles,parts:parts.length,format,unitAssumed,closed:closed&&volume>0}};
}
