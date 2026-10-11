import {describe,it,expect,vi} from 'vitest';
import {createPublicBootstrapFetch} from './public-bootstrap';
const url='https://api.example/rest/v1/landing_pages?select=title';
const headers={apikey:'sb_publishable_example',authorization:'Bearer sb_publishable_example'};
const snapshot={host:'3dyanimda.com',path:'/3d-baski',apiOrigin:'https://api.example',entries:[{key:JSON.stringify(['GET','/rest/v1/landing_pages?select=title','*/*','']),body:'[{"title":"Reviewed public page"}]',contentType:'application/json'}]};
describe('public export bootstrap isolation',()=>{
 it('consumes an anonymous response once, then refreshes from the real API',async()=>{
  const next=vi.fn(async()=>new Response('live'));const fetcher=createPublicBootstrapFetch(snapshot,next,'3dyanimda.com',()=>'/3d-baski');
  expect(await (await fetcher(url,{headers})).json()).toEqual([{title:'Reviewed public page'}]);
  expect(await (await fetcher(url,{headers})).text()).toBe('live');expect(next).toHaveBeenCalledTimes(1);
 });
 for(const [name,host,path,requestUrl,init] of [
  ['other tenant','3dsanayi.com','/3d-baski',url,{headers}],
  ['later navigation','3dyanimda.com','/malzemeler',url,{headers}],
  ['other API','3dyanimda.com','/3d-baski',url.replace('api.example','other.example'),{headers}],
  ['authenticated session','3dyanimda.com','/3d-baski',url,{headers:{...headers,authorization:'Bearer user-session'}}],
  ['write','3dyanimda.com','/3d-baski',url,{method:'POST',headers,body:'{}'}],
 ] as const)it('does not intercept '+name,async()=>{
  const next=vi.fn(async()=>new Response('live'));const fetcher=createPublicBootstrapFetch(snapshot,next,host,()=>path);
  expect(await (await fetcher(requestUrl,init)).text()).toBe('live');expect(next).toHaveBeenCalledTimes(1);
 });
 it('expires after the initial startup window',async()=>{
  let time=0;const next=vi.fn(async()=>new Response('live'));const fetcher=createPublicBootstrapFetch(snapshot,next,'3dyanimda.com',()=>'/3d-baski',()=>time);time=30001;
  expect(await (await fetcher(url,{headers})).text()).toBe('live');
 });
});
