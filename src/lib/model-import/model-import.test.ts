// @vitest-environment node
import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import initialize from 'occt-import-js';
import {zipSync,strToU8} from 'fflate';
import {parseModel} from './parse';
import {parse3mf} from './three-mf';
import {cadModel} from './cad';
import {measureModel} from './measure';
import {threeMf,obj,stl} from '../../../scripts/fixtures/model-formats.mjs';
const buffer=(bytes:Uint8Array)=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer;
const text=(value:string)=>buffer(new TextEncoder().encode(value));
describe('multi-format geometry import',()=>{
 for(const [name,data] of [['cube.stl',stl],['cube.obj',obj]])it(`measures ${name} in assumed millimetres`,async()=>{
   const {metrics}=await parseModel(name,text(data));expect(metrics.closed).toBe(true);expect(metrics.unitAssumed).toBe(true);expect(metrics.bboxCm).toEqual({x:1,y:1,z:1});expect(metrics.volumeCm3).toBeCloseTo(1);expect(metrics.triangles).toBe(12);
 });
 it('opens binary STL as well as ASCII',async()=>{
   const {STLLoader}=await import('three/examples/jsm/loaders/STLLoader.js');
   const geometry=new STLLoader().parse(stl),p=geometry.getAttribute('position').array;
   const bytes=new ArrayBuffer(84+12*50),view=new DataView(bytes);view.setUint32(80,12,true);
   for(let t=0;t<12;t++)for(let v=0;v<9;v++)view.setFloat32(84+t*50+12+v*4,p[t*9+v],true);
   expect((await parseModel('binary.STL',bytes)).metrics.volumeCm3).toBeCloseTo(1);geometry.dispose();
 });
 it('preserves 3MF units, colors, component paths and instance transforms',()=>{
   const result=parse3mf(buffer(threeMf({unit:'centimeter',scale:.1,assembly:true})));
   expect(result.parts).toHaveLength(2);expect(result.parts[0].colors?.[0]).toBe(1);
   expect(result.metrics.closed).toBe(true);expect(result.metrics.unitAssumed).toBe(false);
   expect(result.metrics.bboxCm).toEqual({x:4,y:1,z:1});expect(result.metrics.volumeCm3).toBeCloseTo(2);
 });
 it('normalizes inch-based 3MF geometry',()=>{
   const result=parse3mf(buffer(threeMf({unit:'inch',scale:1/25.4})));
   expect(result.metrics.bboxCm.x).toBeCloseTo(1);expect(result.metrics.volumeCm3).toBeCloseTo(1);
 });
 for(const format of ['STEP','IGES'])it(`imports real ${format} solid geometry with OCCT`,async()=>{
   const wasm=buffer(readFileSync('node_modules/occt-import-js/dist/occt-import-js.wasm'));
   const occt=await initialize({wasmBinary:wasm,print:()=>{},printErr:()=>{}});
   const data=readFileSync(`node_modules/occt-import-js/test/testfiles/cube-10x10mm/Cube 10x10.${format==='STEP'?'stp':'igs'}`);
   const result=cadModel(format==='STEP'?occt.ReadStepFile(data,{linearUnit:'millimeter'}):occt.ReadIgesFile(data,{linearUnit:'millimeter'}),format);
   expect(result.metrics.bboxCm).toEqual({x:1,y:1,z:1});expect(result.metrics.volumeCm3).toBeCloseTo(1);expect(result.metrics.closed).toBe(true);
 },20000);
 it('keeps open and planar meshes viewable without treating them as closed volumes',async()=>{
   const result=await parseModel('surface.obj',text('v 0 0 0\nv 10 0 0\nv 0 10 0\nf 1 2 3'));
   expect(result.metrics.closed).toBe(false);expect(result.metrics.surfaceCm2).toBeCloseTo(.5);expect(result.metrics.bboxCm.z).toBe(0);
 });
 it('rejects corrupt archives, cyclic components and external part references',()=>{
   expect(()=>parse3mf(text('not a zip'))).toThrow();
   expect(()=>parse3mf(buffer(threeMf({assembly:true,cycle:true})))).toThrow(/döngüsel/);
   expect(()=>parse3mf(buffer(threeMf({assembly:true,external:true})))).toThrow(/yolu/);
 });
 it('rejects DTDs and inflated archive limits before model construction',()=>{
   expect(()=>parse3mf(buffer(zipSync({'_rels/.rels':strToU8('<!DOCTYPE r [<!ENTITY x "abc">]><r/>')})))).toThrow(/DTD/);
   expect(()=>parse3mf(buffer(zipSync({'3D/model.model':new Uint8Array(33*1024*1024)})))).toThrow(/büyük/);
 });
 it('rejects invalid coordinates and unsupported extensions',async()=>{
   expect(()=>measureModel([{positions:new Float32Array([NaN,0,0,1,0,0,0,1,0]),name:'bad'}],'OBJ',true)).toThrow(/koordinat/);
   await expect(parseModel('model.exe',text(stl))).rejects.toThrow(/STL/);
   await expect(parseModel('empty.stl',new ArrayBuffer(0))).rejects.toThrow(/boş/);
 });
});
