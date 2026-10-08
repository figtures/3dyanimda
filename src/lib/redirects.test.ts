import {describe,it,expect} from 'vitest';
import {compileRedirects} from './redirects.mjs';
describe('browser and admin redirect safety',()=>{
 it('resolves an entire chain before navigating',()=>expect(compileRedirects([{from_path:'/a',to_path:'/b'},{from_path:'/b',to_path:'/c'}])).toEqual({'/a':'/c','/b':'/c'}));
 it('rejects cycles instead of navigating indefinitely',()=>expect(()=>compileRedirects([{from_path:'/a',to_path:'/b'},{from_path:'/b',to_path:'/a'}])).toThrow(/cycle/));
 it.each(['//outside.example','/\\outside.example','/admin','/studio/edit','/api/data','/a?next=https://outside.example','/a#fragment'])('rejects unsafe destination %s',(target)=>expect(()=>compileRedirects([{from_path:'/old',to_path:target}])).toThrow());
 it('does not let inactive records create false conflicts',()=>expect(compileRedirects([{from_path:'/a',to_path:'/b',active:false},{from_path:'/a',to_path:'/c'}])).toEqual({'/a':'/c'}));
});
