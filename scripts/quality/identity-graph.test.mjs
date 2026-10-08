import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mergeIdentityNodes} from './identity-graph.mjs';
const id='https://brand.example/#organization';
const block=node=>({'@graph':[node]});
test('complementary same-ID graph blocks merge while repeated fields agree',()=>{
 const nodes=mergeIdentityNodes([block({'@id':id,'@type':'Organization',name:'Brand'}),block({'@id':id,'@type':'Organization',name:'Brand',email:'info@brand.example'})]);
 assert.equal(nodes.size,1);assert.equal(nodes.get(id).email,'info@brand.example');assert.equal(nodes.get(id).name,'Brand');
});
test('conflicting contact values in any graph fail; first/last block never silently wins',()=>{
 assert.throws(()=>mergeIdentityNodes([block({'@id':id,email:'a@example.test'}),block({'@id':id,email:'b@example.test'})]),/Conflicting identity property/);
});
test('nested address conflicts and entity type conflicts also fail',()=>{
 assert.throws(()=>mergeIdentityNodes([block({'@id':id,address:{streetAddress:'One'}}),block({'@id':id,address:{streetAddress:'Two'}})]),/streetAddress/);
 assert.throws(()=>mergeIdentityNodes([block({'@id':id,'@type':'Organization'}),block({'@id':id,'@type':'WebSite'})]),/type/);
});
test('different workshop IDs remain separate and cannot hide multiple entities',()=>{
 const nodes=mergeIdentityNodes([block({'@id':'https://brand.example/#a','@type':'ProfessionalService'}),block({'@id':'https://brand.example/#b','@type':'ProfessionalService'})]);
 assert.equal([...nodes.values()].filter(n=>n['@type']==='ProfessionalService').length,2);
});
