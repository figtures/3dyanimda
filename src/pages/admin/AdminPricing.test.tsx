import { render,screen,fireEvent,waitFor,cleanup } from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {afterEach,describe,it,expect,vi} from 'vitest';
const api=vi.hoisted(()=>({write:vi.fn(),error:vi.fn()}));
vi.mock('sonner',()=>({toast:{error:api.error,success:vi.fn()}}));
vi.mock('@/contexts/TenantContext',()=>({useTenant:()=>({tenant:{id:'brand-a'}})}));
vi.mock('@/lib/tenant',()=>({getTenantId:()=> 'brand-a'}));
vi.mock('@/lib/supabase',()=>({supabase:{from:(table:string)=>{
 const query={select:()=>query,eq:()=>query,order:()=>Promise.resolve({data:[]}),upsert:(payload:unknown)=>{api.write(table,payload);return Promise.resolve({error:null});}};return query;
}}}));
import AdminPricing from './AdminPricing';
afterEach(()=>{cleanup();vi.clearAllMocks();});
describe('pricing editor saving',()=>{
 it('rejects a cleared setting before any write and saves the replacement as a number',async()=>{
  render(<MemoryRouter><AdminPricing/></MemoryRouter>);
  const field=await screen.findByLabelText('KDV (%)');fireEvent.change(field,{target:{value:''}});expect(field).toHaveValue('');
  fireEvent.click(screen.getByRole('button',{name:'Tümünü Kaydet'}));await waitFor(()=>expect(api.error).toHaveBeenCalled());expect(api.write).not.toHaveBeenCalled();
  fireEvent.change(field,{target:{value:'20,5'}});fireEvent.click(screen.getByRole('button',{name:'Tümünü Kaydet'}));
  await waitFor(()=>expect(api.write).toHaveBeenCalledWith('pricing_settings',expect.objectContaining({tenant_id:'brand-a',key:'vat_percent',value:20.5})));
 });
});
