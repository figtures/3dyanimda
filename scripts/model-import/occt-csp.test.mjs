import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {cspSafeOcct} from './occt-csp.mjs';
const require=createRequire(import.meta.url);
test('real CAD readers work with JavaScript string generation disabled',async()=>{
  const source=readFileSync('node_modules/occt-import-js/dist/occt-import-js.js','utf8');
  const context=vm.createContext({module:{exports:{}},exports:{},require,process,console,Buffer,TextDecoder,TextEncoder,__dirname:process.cwd(),setTimeout,clearTimeout},{codeGeneration:{strings:false,wasm:true}});
  assert.throws(()=>vm.runInContext('Function("return 1")()',context),/Code generation/);
  new vm.Script(cspSafeOcct(source)).runInContext(context);
  const occt=await context.module.exports({wasmBinary:readFileSync('node_modules/occt-import-js/dist/occt-import-js.wasm'),print:()=>{},printErr:()=>{}});
  for(const [method,extension] of [['ReadStepFile','stp'],['ReadIgesFile','igs']]){
    const result=occt[method](readFileSync(`node_modules/occt-import-js/test/testfiles/cube-10x10mm/Cube 10x10.${extension}`),{linearUnit:'millimeter'});
    assert.equal(result.success,true);assert.ok(result.meshes.length);assert.ok(result.meshes[0].attributes.position.array.length);
  }
  assert.throws(()=>cspSafeOcct(source+' '),/requires review/);
});
