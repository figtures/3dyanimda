import { modelExtension, MAX_FILE_BYTES, MAX_TRIANGLES, type ModelPart } from './types';
import { measureModel } from './measure';
export async function parseModel(name:string,buffer:ArrayBuffer) {
  if(!buffer.byteLength || buffer.byteLength>MAX_FILE_BYTES)throw new Error('Dosya boş veya 20 MB sınırını aşıyor.');
  const ext=modelExtension(name);
  if(ext==='3mf')return (await import('./three-mf')).parse3mf(buffer);
  if(['step','stp','iges','igs'].includes(ext)) {
    const [{default:initialize},{default:wasmUrl},{cadModel}]=await Promise.all([import('occt-import-js'),import('occt-import-js/dist/occt-import-js.wasm?url'),import('./cad')]);
    const response=await fetch(wasmUrl);if(!response.ok)throw new Error('CAD okuyucusu yüklenemedi. Yeniden deneyin.');
    const occt=await initialize({wasmBinary:await response.arrayBuffer(),locateFile:()=>wasmUrl,print:()=>{},printErr:()=>{}});
    const params={linearUnit:'millimeter',linearDeflectionType:'bounding_box_ratio',linearDeflection:0.002,angularDeflection:0.4};
    const step=ext==='step'||ext==='stp';
    return cadModel(step?occt.ReadStepFile(new Uint8Array(buffer),params):occt.ReadIgesFile(new Uint8Array(buffer),params),step?'STEP':'IGES');
  }
  if(ext==='stl') {
    const {STLLoader}=await import('three/examples/jsm/loaders/STLLoader.js');
    // Reject unreasonable binary allocations before invoking the loader.
    if(buffer.byteLength>=84){const n=new DataView(buffer).getUint32(80,true);if(84+n*50===buffer.byteLength&&n>MAX_TRIANGLES)throw new Error('STL üçgen sınırını aşıyor.');}
    const geometry=new STLLoader().parse(buffer);
    try{return measureModel([{positions:new Float32Array(geometry.getAttribute('position').array),name}], 'STL',true);}finally{geometry.dispose();}
  }
  const {OBJLoader}=await import('three/examples/jsm/loaders/OBJLoader.js');
  const object=new OBJLoader().parse(new TextDecoder().decode(buffer));
  const parts:ModelPart[]=[];
  object.updateMatrixWorld(true);
  try {
    object.traverse((node:any)=>{
      if(!node.isMesh)return;
      const geometry=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();
      geometry.applyMatrix4(node.matrixWorld);
      parts.push({positions:new Float32Array(geometry.getAttribute('position').array),colors:geometry.getAttribute('color')?new Float32Array(geometry.getAttribute('color').array):undefined,name:node.name||name});geometry.dispose();
    });
    return measureModel(parts,'OBJ',true,(object as typeof object & {materialLibraries?:string[]}).materialLibraries?.length?['OBJ geometrisi gösteriliyor; ayrı MTL ve doku dosyaları yüklenmedi.']:[]);
  } finally {object.traverse((node:any)=>{node.geometry?.dispose();for(const material of Array.isArray(node.material)?node.material:[node.material])material?.dispose();});}
}
