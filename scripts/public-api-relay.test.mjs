import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicApiRelay } from './public-api-relay.mjs';
const origin='https://api.example';
function route({method='GET',path='/rest/v1/site_settings?select=key,value',headers={},body=null}={}){
 const record={};
 return {record,request:()=>({url:()=>origin+path,method:()=>method,allHeaders:async()=>({'x-tenant-host':'one.example',apikey:'test-public-key',authorization:'Bearer test-anon',accept:'application/json',origin:'https://one.example',referer:'https://one.example/',...headers}),postDataBuffer:()=>body===null?null:Buffer.from(body)}),fulfill:async value=>{record.response=value;}};
}
const text=route=>route.record.response.body.toString();
test('same public read reuses exact bytes across page Referers; response copies cannot mutate snapshot',async()=>{
 let calls=0; const relay=createPublicApiRelay({fetchImpl:async()=>{calls++;return new Response('actual JSON',{status:200,headers:{'content-type':'application/json'}});}});
 const first=route(),second=route({headers:{referer:'https://one.example/iletisim'}});
 await relay(first); first.record.response.body.fill(0);await relay(second);
 assert.equal(calls,1);assert.equal(text(second),'actual JSON');assert.equal(second.record.response.headers['content-type'],'application/json');assert.equal(second.record.response.status,200);
});
test('tenant, authorization, API key, origin, accept, URL query and separate export scopes remain isolated',async()=>{
 let calls=0;const fetchImpl=async()=>new Response(String(++calls));const relay=createPublicApiRelay({fetchImpl});
 await relay(route());
 for(const headers of [{'x-tenant-host':'two.example'},{authorization:'Bearer different-anon'},{apikey:'different-public-key'},{origin:'https://two.example'},{accept:'application/vnd.pgrst.object+json'}])await relay(route({headers}));
 await relay(route({path:'/rest/v1/site_settings?select=key'}));
 await createPublicApiRelay({fetchImpl})(route());
 assert.equal(calls,8);
});
test('only GET and exact current_tenant_id POST are cacheable; RPC bodies stay distinct',async()=>{
 let calls=0;const relay=createPublicApiRelay({fetchImpl:async()=>new Response(String(++calls))});
 for(const specification of [{method:'POST',path:'/rest/v1/rpc/current_tenant_id',body:'{}'},{method:'POST',path:'/rest/v1/rpc/current_tenant_id',body:'{"probe":true}'}]){await relay(route(specification));await relay(route(specification));}
 assert.equal(calls,2);
 for(const method of ['POST','PATCH','PUT','DELETE'])for(let i=0;i<2;i++)await relay(route({method,path:'/rest/v1/rpc/another_function',body:'{}'}));
 assert.equal(calls,10);
});
test('HTTP failures and network failures are not cached or changed into successful responses',async()=>{
 let calls=0;const relay=createPublicApiRelay({fetchImpl:async()=>{calls++;if(calls===1)throw new TypeError('do not expose auth token');return new Response('denied',{status:403,headers:{'content-type':'application/json'}});}});
 await assert.rejects(relay(route()),error=>!error.message.includes('auth token')&&error.message.includes('TypeError'));
 for(let i=0;i<2;i++){const item=route();await relay(item);assert.equal(item.record.response.status,403);assert.equal(text(item),'denied');}
 assert.equal(calls,3);
});
test('Vary wildcard and Referer prevent reuse, including identical pending readers',async()=>{
 for(const vary of ['*','Origin, Referer']){
  let calls=0;const relay=createPublicApiRelay({fetchImpl:async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,5));return new Response('actual',{headers:{vary}});}});
  await Promise.all([relay(route()),relay(route())]);await relay(route());
  assert.equal(calls,3,vary);
 }
});
test('identical concurrent successful requests share a single actual read',async()=>{
 let calls=0;const relay=createPublicApiRelay({fetchImpl:async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,5));return new Response('upstream');}});
 const a=route(),b=route();await Promise.all([relay(a),relay(b)]);assert.equal(calls,1);assert.equal(text(a),text(b));
});
test('forwards method/body/identity with timeout and preserves status/content type while removing decoded transport headers',async()=>{
 let observed;const relay=createPublicApiRelay({timeoutMs:1000,fetchImpl:async(url,init)=>{observed={url,init};return new Response('{"id":"real"}',{status:201,headers:{'content-type':'application/json','content-encoding':'gzip','content-length':'999','x-request-id':'upstream-id'}});}});
 const item=route({method:'POST',path:'/rest/v1/rpc/current_tenant_id',body:'{}'});await relay(item);
 assert.equal(observed.init.method,'POST');assert.equal(observed.init.body.toString(),'{}');assert.equal(observed.init.headers['x-tenant-host'],'one.example');assert.ok(observed.init.signal instanceof AbortSignal);assert.equal(observed.init.redirect,'manual');
 assert.equal(item.record.response.status,201);assert.equal(item.record.response.headers['content-type'],'application/json');assert.equal(item.record.response.headers['x-request-id'],'upstream-id');assert.equal(item.record.response.headers['content-encoding'],undefined);assert.equal(item.record.response.headers['content-length'],undefined);assert.equal(text(item),'{"id":"real"}');
});
