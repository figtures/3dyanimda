import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
const api=vi.hoisted(()=>({upload:vi.fn(),insert:vi.fn(),track:vi.fn(),saved:vi.fn()}));
vi.mock('@/brands/config',()=>({useBrand:()=>({slug:'3dyanimda',name:'3D Yanımda'})}));
vi.mock('@/contexts/TenantContext',()=>({useTenant:()=>({tenant:{id:'brand-a'}})}));
vi.mock('@/components/site/Seo',()=>({Seo:()=>null}));
vi.mock('@/lib/growth-analytics',()=>({trackGrowth:api.track,trackQuoteSaved:api.saved}));
vi.mock('@/lib/backend-config',()=>({demoMode:false,getSupabase:async()=>({storage:{from:()=>({upload:api.upload})},from:()=>({insert:api.insert})})}));
vi.mock('@/components/quote/QuoteStudio',()=>({default:({renderWorkspace}:{renderWorkspace:(preview:React.ReactNode,options:React.ReactNode)=>React.ReactNode})=>renderWorkspace(null,null)}));
import QuoteRequest from './QuoteRequest';
afterEach(cleanup);
beforeEach(()=>{vi.clearAllMocks();api.upload.mockResolvedValue({error:null});api.insert.mockResolvedValue({error:null});});
async function start(file?:File){
 const view=render(<MemoryRouter initialEntries={[{pathname:'/teklif-al',state:{studioFile:file}}]}><QuoteRequest/></MemoryRouter>);
 const input=await screen.findByLabelText('Ad soyad *');
 fireEvent.click(screen.getByRole('button',{name:/İletişim & gönderim/}));
 fireEvent.change(input,{target:{value:'Örnek Kullanıcı'}});
 fireEvent.change(screen.getByLabelText('E-posta *'),{target:{value:'private@example.com'}});
 fireEvent.change(screen.getByLabelText('Teknik ihtiyaç / proje açıklaması *'),{target:{value:'Confidential prototype description'}});
 fireEvent.submit(view.container.querySelector('form')!);
 return view;
}
describe('quote persistence analytics',()=>{
 it('emits saved success only after the database accepts a request',async()=>{
  await start(); await screen.findByText('Talebiniz kaydedildi.');
  expect(api.insert).toHaveBeenCalledOnce();
  expect(api.saved).toHaveBeenCalledExactlyOnceWith('3dyanimda','3D Baskı');
  expect(api.track).not.toHaveBeenCalledWith('3dyanimda','file_upload_success',expect.anything());
 });
 it('does not count a rejected request as a lead',async()=>{
  api.insert.mockResolvedValue({error:new Error('rejected')});
  await start(); await screen.findByRole('alert');
  expect(api.saved).not.toHaveBeenCalled();
  expect(api.track).toHaveBeenCalledWith('3dyanimda','quote_submit_error',{service:'3D Baskı'});
 });
 it('records a successful upload separately when saving the request fails',async()=>{
  api.insert.mockResolvedValue({error:new Error('rejected')});
  await start(new File(['mesh'],'secret-customer-file.stl')); await screen.findByRole('alert');
  expect(api.track).toHaveBeenCalledWith('3dyanimda','file_upload_success',{service:'3D Baskı',file_type:'stl'});
  expect(api.saved).not.toHaveBeenCalled();
  expect(JSON.stringify(api.track.mock.calls)).not.toContain('secret-customer-file');
 });
 it('does not count a failed upload or attempt database insert',async()=>{
  api.upload.mockResolvedValue({error:new Error('upload failed')});
  await start(new File(['mesh'],'private.stl')); await screen.findByRole('alert');
  expect(api.insert).not.toHaveBeenCalled(); expect(api.saved).not.toHaveBeenCalled();
  expect(api.track).not.toHaveBeenCalledWith('3dyanimda','file_upload_success',expect.anything());
 });
 it('does not count invalid form input',async()=>{
  const view=render(<MemoryRouter><QuoteRequest/></MemoryRouter>);
  await screen.findByLabelText('Ad soyad *');
  fireEvent.click(screen.getByRole('button',{name:/İletişim & gönderim/}));
  fireEvent.submit(view.container.querySelector('form')!);
  await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Lütfen ad'));
  expect(api.upload).not.toHaveBeenCalled(); expect(api.insert).not.toHaveBeenCalled();expect(api.saved).not.toHaveBeenCalled();
 });
});
