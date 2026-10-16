import { unzipSync, strFromU8 } from 'fflate';
import { DOMParser, type Element } from '@xmldom/xmldom';
import { Matrix4, Vector3, Color } from 'three';
import { MAX_PARTS, MAX_TRIANGLES, type ModelPart } from './types';
import { measureModel } from './measure';
const units:Record<string,number>={micron:0.001,millimeter:1,centimeter:10,inch:25.4,foot:304.8,meter:1000};
const children=(node:Element,name:string):Element[]=>Array.from(node.childNodes).filter(n=>n.nodeType===1&&(n as Element).localName===name) as Element[];
const child=(node:Element,name:string)=>children(node,name)[0];
const attr=(node:Element,name:string)=>node.getAttribute(name)||'';
function numeric(value:string) { if (!value.trim()) throw new Error('3MF sayısal alanı eksik.');const n=Number(value);if(!Number.isFinite(n))throw new Error('3MF sayısal alanı geçersiz.');return n; }
function xml(bytes:Uint8Array) {
  const text=strFromU8(bytes);
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error('3MF içinde DTD veya harici varlık kullanılamaz.');
  return new DOMParser({onError:()=>{throw new Error('3MF XML verisi okunamadı.');}}).parseFromString(text,'application/xml').documentElement;
}
function partPath(base:string, target:string) {
  if (!target || /[:\\?#]/.test(target)) throw new Error('3MF parça yolu geçersiz.');
  const out:string[]=target.startsWith('/')?[]:base.split('/').slice(0,-1);
  for (const segment of decodeURIComponent(target).split('/')) {
    if (!segment||segment==='.') continue;
    if(segment==='..') {if(!out.length)throw new Error('3MF arşiv dışına çıkamaz.');out.pop();} else out.push(segment);
  }
  return out.join('/');
}
function transform(value:string, unit:number) {
  if(!value)return new Matrix4();
  const v=value.trim().split(/\s+/).map(numeric);
  if(v.length!==12)throw new Error('3MF dönüşümü geçersiz.');
  return new Matrix4().set(v[0],v[3],v[6],v[9]*unit,v[1],v[4],v[7],v[10]*unit,v[2],v[5],v[8],v[11]*unit,0,0,0,1);
}
/** Core meshes, material colors, build instances and production-extension part paths. */
export function parse3mf(buffer:ArrayBuffer) {
  let expanded=0, entries=0;
  const files=unzipSync(new Uint8Array(buffer),{filter:file=>{
    if(++entries>512 || file.originalSize>32*1024*1024 || (expanded+=file.originalSize)>64*1024*1024) throw new Error('3MF arşivi önizleme için çok büyük.');
    return /\.model$|\.rels$/i.test(file.name);
  }});
  const rels=files['_rels/.rels'];
  if(!rels)throw new Error('3MF paket ilişkileri eksik.');
  const relationship=children(xml(rels),'Relationship').find(n=>attr(n,'Type').endsWith('/3dmodel'));
  if(!relationship || attr(relationship,'TargetMode')==='External')throw new Error('3MF kök modeli bulunamadı.');
  const rootPath=partPath('',attr(relationship,'Target'));
  const models=new Map<string,{root:Element;unit:number;objects:Map<string,Element>;resources:Element}>();
  function getModel(path:string) {
    if(models.has(path))return models.get(path)!;
    const bytes=files[path];if(!bytes)throw new Error('3MF içinde başvurulan parça eksik.');
    const root=xml(bytes), unit=units[attr(root,'unit')||'millimeter'], resources=child(root,'resources');
    if(root.localName!=='model'||!unit||!resources)throw new Error('3MF model yapısı veya ölçü birimi geçersiz.');
    const objects=new Map<string,Element>();
    for(const object of children(resources,'object')) {const id=attr(object,'id');if(!id||objects.has(id))throw new Error('3MF nesne kimliği geçersiz.');objects.set(id,object);}
    const model={root,unit,resources,objects};models.set(path,model);return model;
  }
  const parts:ModelPart[]=[], warnings=new Set<string>();let triangleCount=0,instances=0;
  const point=new Vector3();
  function build(path:string,id:string,matrix:Matrix4,ancestors:Set<string>) {
    if(++instances>MAX_PARTS || ancestors.size>=32)throw new Error('3MF parça veya iç içe bileşen sınırı aşıldı.');
    const key=path+'#'+id;
    if(ancestors.has(key))throw new Error('3MF döngüsel parça başvurusu içeriyor.');
    const stack=new Set(ancestors).add(key), model=getModel(path), object=model.objects.get(id);
    if(!object)throw new Error('3MF parça başvurusu bulunamadı.');
    const mesh=child(object,'mesh'), components=child(object,'components');
    if(components)for(const component of children(components,'component')) {
      const location=Array.from(component.attributes).find(a=>a.localName==='path')?.value;
      build(location?partPath(path,location):path,attr(component,'objectid'),matrix.clone().multiply(transform(attr(component,'transform'),model.unit)),stack);
    }
    if(!mesh)return;
    const vertexRoot=child(mesh,'vertices'), triangleRoot=child(mesh,'triangles');
    if(!vertexRoot||!triangleRoot)throw new Error('3MF yüzey verisi eksik.');
    const vertices=children(vertexRoot,'vertex'), triangles=children(triangleRoot,'triangle');
    if(!triangles.length || (triangleCount+=triangles.length)>MAX_TRIANGLES || vertices.length>MAX_TRIANGLES*3)throw new Error('3MF üçgen sınırı aşıldı veya model boş.');
    const positions=new Float32Array(triangles.length*9),colors=new Float32Array(positions.length);let hasColor=false;
    const resourceColors=new Map<string,Color[]>();
    for(const resource of Array.from(model.resources.childNodes).filter(n=>n.nodeType===1) as Element[]) {
      const list=resource.localName==='basematerials'?children(resource,'base'):resource.localName==='colorgroup'?children(resource,'color'):[];
      if(list.length)resourceColors.set(attr(resource,'id'),list.map(n=>{
        const hex=attr(n,'displaycolor')||attr(n,'color');
        if(!/^#[\da-f]{6}([\da-f]{2})?$/i.test(hex))throw new Error('3MF renk tanımı geçersiz.');
        return new Color(hex.slice(0,7));
      }));
      if(resource.localName==='texture2dgroup')warnings.add('Doku görselleri yerine modelin geometrisi ve temel renkleri gösteriliyor.');
    }
    triangles.forEach((triangle,i)=>{
      const pid=attr(triangle,'pid')||attr(object,'pid'),palette=resourceColors.get(pid);
      for(let v=0;v<3;v++) {
        const index=numeric(attr(triangle,`v${v+1}`));
        if(!Number.isInteger(index)||index<0||index>=vertices.length)throw new Error('3MF üçgen başvurusu geçersiz.');
        const vertex=vertices[index];point.set(numeric(attr(vertex,'x'))*model.unit,numeric(attr(vertex,'y'))*model.unit,numeric(attr(vertex,'z'))*model.unit).applyMatrix4(matrix);
        positions.set([point.x,point.y,point.z],i*9+v*3);
        const colorIndex=Number(attr(triangle,`p${v+1}`)||attr(triangle,'p1')||attr(object,'pindex')||0),color=palette?.[colorIndex];
        if(palette&&!color)throw new Error('3MF malzeme başvurusu geçersiz.');
        if(color){hasColor=true;colors.set([color.r,color.g,color.b],i*9+v*3);}else colors.set([1,1,1],i*9+v*3);
      }
      // Mirrored instances reverse winding; their visible front faces remain correct.
      if(matrix.determinant()<0)for(const array of [positions,colors])for(let k=0;k<3;k++) {const at=i*9+3+k, other=i*9+6+k;[array[at],array[other]]=[array[other],array[at]];}
    });
    parts.push({positions,colors:hasColor?colors:undefined,name:attr(object,'name')||`Parça ${parts.length+1}`});
  }
  const root=getModel(rootPath),buildRoot=child(root.root,'build');
  if(!buildRoot)throw new Error('3MF üretim yerleşimi eksik.');
  for(const item of children(buildRoot,'item')) {
    const location=Array.from(item.attributes).find(a=>a.localName==='path')?.value;
    build(location?partPath(rootPath,location):rootPath,attr(item,'objectid'),transform(attr(item,'transform'),root.unit),new Set());
  }
  return measureModel(parts,'3MF',false,[...warnings]);
}
