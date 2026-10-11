import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {inspectEvidence} from './evidence-index.mjs';

test('evidence identifies exact bytes and rejects a changed report',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'search-evidence-'));
 try {
  await writeFile(path.join(root,'report.json'),'{}\n');
  const initial=await inspectEvidence({files:[{path:'report.json'}]},root);
  const index={files:initial.files};
  assert.equal((await inspectEvidence(index,root)).valid,true);
  await writeFile(path.join(root,'report.json'),'{}');
  assert.equal((await inspectEvidence(index,root)).valid,false);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('missing files, traversal, duplicate paths and empty evidence fail closed',async()=>{
 for(const files of [[],[{path:'../outside'}],[{path:'/outside'}],[{path:'missing'}],[{path:'x'},{path:'x'}]]) {
  assert.equal((await inspectEvidence({files})).valid,false);
 }
});
