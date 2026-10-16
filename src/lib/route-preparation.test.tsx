import {QueryClient,QueryClientProvider,useQuery} from '@tanstack/react-query';
import {createMemoryRouter,RouterProvider,Link,useLocation} from 'react-router-dom';
import {render,screen,fireEvent,waitFor,act,cleanup} from '@testing-library/react';
import {afterEach,describe,it,expect,vi} from 'vitest';
const api=vi.hoisted(()=>({resolve:null as null|((value:unknown)=>void),calls:[] as string[]}));
vi.mock('@/content/queries',()=>({
 contentQuery:()=>({queryKey:['unused'],queryFn:async()=>[]}),
 contentPageQuery:(tenant:{id:string},path:string)=>({queryKey:['landing-page',tenant.id,path],staleTime:60000,queryFn:()=>{api.calls.push(tenant.id);return new Promise(resolve=>{api.resolve=resolve;});}}),
 relatedContentQuery:(tenant:{id:string},page:{path:string})=>({queryKey:['related',tenant.id,page.path],queryFn:async()=>[]}),
}));
vi.mock('@/content/public-page-query',()=>({hasPublicPageQuery:()=>false,publicPageQuery:()=>({})}));
import {prepareContentDestination} from './route-preparation';
import {contentPageQuery} from '@/content/queries';
import type {Tenant} from '@/contexts/TenantContext';
afterEach(()=>{cleanup();api.resolve=null;api.calls=[];});
describe('atomic content navigation',()=>{
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])it(`keeps ${brand} current content until destination data is available, with no loading flash`,async()=>{
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}}),tenant={id:brand,slug:brand} as Tenant;
  function Destination(){const {pathname}=useLocation();const {data,isLoading}=useQuery(contentPageQuery(tenant,pathname));return isLoading?<p>İçerik yükleniyor</p>:<h1>{data?.title}</h1>;}
  const router=createMemoryRouter([{path:'/',element:<><h1>Current page</h1><Link to="/3d-modelleme">Continue</Link></>},{path:'/3d-modelleme',loader:()=>prepareContentDestination(client,tenant,'/3d-modelleme').then(()=>null),element:<Destination/>}],{initialEntries:['/']});
  const view=render(<QueryClientProvider client={client}><RouterProvider router={router}/></QueryClientProvider>);
  const flashes:string[]=[];const observer=new MutationObserver(()=>{if(view.container.textContent?.includes('İçerik yükleniyor'))flashes.push('loading');});observer.observe(view.container,{childList:true,subtree:true,characterData:true});
  fireEvent.click(screen.getByText('Continue'));await waitFor(()=>expect(api.resolve).not.toBeNull());
  expect(screen.getByRole('heading')).toHaveTextContent('Current page');expect(router.state.location.pathname).toBe('/');
  await act(async()=>api.resolve!({path:'/3d-modelleme',title:'Ready destination',kind:'service'}));
  expect(await screen.findByText('Ready destination')).toBeVisible();expect(flashes).toEqual([]);expect(api.calls).toEqual([brand]);
  observer.disconnect();router.dispose();client.clear();
 });
});
