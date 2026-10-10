import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateProtocolInventory } from './check-protocols.mjs';
const source=JSON.parse(await readFile(new URL('../../docs/search-program/requirements.json',import.meta.url),'utf8'));
test('complete discovery inventory stays explicitly non-release',()=>{
 const result=validateProtocolInventory(source); assert.equal(result.valid,true);assert.equal(result.gates,20);assert.equal(result.releaseReady,false);
});
test('missing and duplicate gates are rejected',()=>{
 const missing=structuredClone(source);missing.gates.pop();assert.equal(validateProtocolInventory(missing).valid,false);
 const duplicate=structuredClone(source);duplicate.gates.push(duplicate.gates[0]);assert.equal(validateProtocolInventory(duplicate).valid,false);
});
test('historical evidence and preparation cannot be converted into release PASS',()=>{
 const fake=structuredClone(source);fake.gates[0].status='PASS';assert.equal(validateProtocolInventory(fake).valid,false);
 const fakeDecision=structuredClone(source);fakeDecision.decision='GO';assert.equal(validateProtocolInventory(fakeDecision).valid,false);
});
