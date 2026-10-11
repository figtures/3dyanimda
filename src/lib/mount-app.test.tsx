import {afterEach,expect,it,vi} from 'vitest';
import {mountApp} from './mount-app';
vi.mock('react-dom/client',()=>({hydrateRoot:vi.fn(),createRoot:(element:HTMLElement)=>({render:()=>{
 element.innerHTML='<div class="brand-site"><main><h1>Current heading</h1><p data-content-loading>Loading</p></main><span data-pending-queries="0"></span></div>';
}})}));
afterEach(()=>{document.body.innerHTML='';vi.unstubAllGlobals();});
it('does not replace a complete export with a heading whose content query is still loading',async()=>{
 vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>setTimeout(()=>callback(0),0));
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>clearTimeout(id));
 document.body.innerHTML='<div id="root" data-prerendered="true"><main><h1>Complete export</h1><p>Existing content</p></main></div>';
 const original=document.getElementById('root')!;mountApp(original,null);
 await new Promise(resolve=>setTimeout(resolve,10));
 expect(original.isConnected).toBe(true);expect(document.getElementById('root')?.hidden).toBe(true);
 document.querySelector('[data-content-loading]')!.remove();
 await vi.waitFor(()=>expect(original.isConnected).toBe(false));
 expect(document.getElementById('root')?.hidden).toBe(false);
});

it('hydrates versioned React exports without deleting existing content',async()=>{
 const {hydrateRoot}=await import('react-dom/client');document.body.innerHTML='<div id="root" data-hydration="react-ssg-v1"><h1>Existing heading</h1></div>';const root=document.getElementById('root')!;const heading=root.firstChild;mountApp(root,null,true);expect(hydrateRoot).toHaveBeenCalled();expect(root.firstChild).toBe(heading);expect(root.isConnected).toBe(true);
});
