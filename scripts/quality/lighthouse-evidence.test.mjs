import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {saveHomeTrace,saveLabSourceMaps} from './lighthouse-evidence.mjs';

test('diagnostic artifacts preserve trace samples and map bundles without altering executable code', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'lh-evidence-'));
  t.after(() => rm(dir, {recursive:true,force:true}));
  const artifacts = {Trace:{traceEvents:[{name:'RunTask',ts:1},{name:'ProfileChunk',args:{data:{samples:[1]}}}]},DevtoolsLog:[{method:'Network.responseReceived',params:{}}]};
  const trace = await saveHomeTrace(artifacts,path.join(dir,'trace'));
  assert.equal(trace.cpuProfileAvailable,true);
  for (const [index,expected] of [artifacts.Trace,artifacts.DevtoolsLog].entries()) {
    const bytes = await readFile(trace.files[index].file);
    assert.equal(trace.files[index].sha256,createHash('sha256').update(bytes).digest('hex'));
    assert.deepEqual(JSON.parse(gunzipSync(bytes)),expected);
  }
  const root = path.join(dir,'build');
  await mkdir(path.join(root,'assets'),{recursive:true});
  const bundle = 'console.log("lab");';
  const map = {version:3,sources:['../../src/hero.ts'],sourcesContent:['console.log("lab");'],names:[],mappings:'AAAA'};
  await writeFile(path.join(root,'assets/hero-a.js'),bundle);
  await writeFile(path.join(root,'assets/hero-a.js.map'),JSON.stringify(map));
  const maps = await saveLabSourceMaps(root,path.join(dir,'maps'));
  assert.equal(maps[0].bundle,'assets/hero-a.js');
  assert.equal(maps[0].bundleSha256,createHash('sha256').update(bundle).digest('hex'));
  assert.deepEqual(JSON.parse(gunzipSync(await readFile(maps[0].file))),map);
  assert.equal(await readFile(path.join(root,'assets/hero-a.js'),'utf8'),bundle);
});

test('missing evidence fails explicitly and missing CPU samples cannot look like a complete profile', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'lh-evidence-missing-'));
  t.after(() => rm(dir,{recursive:true,force:true}));
  await assert.rejects(saveHomeTrace({traces:{defaultPass:{traceEvents:[]}}},dir),/missing Trace/);
  await assert.rejects(saveLabSourceMaps(dir,path.join(dir,'maps')),/No lab JavaScript/);
  const result = await saveHomeTrace({Trace:{traceEvents:[{name:'RunTask'}]},DevtoolsLog:[{method:'Network.requestWillBeSent'}]},dir);
  assert.equal(result.cpuProfileAvailable,false);
  assert.equal(result.cpuProfileEvents,0);
});
