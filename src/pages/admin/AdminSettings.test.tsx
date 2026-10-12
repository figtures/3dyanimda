import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
const mocks=vi.hoisted(()=>({upload:vi.fn(),remove:vi.fn(),save:vi.fn(),prepare:vi.fn(),permission:vi.fn(()=>true),tenant:'tenant-a'}));
vi.mock('@/lib/supabase',()=>({supabase:{storage:{from:()=>({upload:mocks.upload,remove:mocks.remove,getPublicUrl:(path:string)=>({data:{publicUrl:'https://cdn.example/'+path}})})}}}));
vi.mock('@/lib/tenant',()=>({getTenantId:()=>mocks.tenant}));
vi.mock('@/brands/config',()=>({useBrand:()=>({slug:'3dyanimda',name:'3dyanımda',settings:{}})}));
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>({hasPermission:mocks.permission})}));
vi.mock('@/hooks/useSiteSettings',()=>({setSiteSetting:mocks.save,refreshSiteSettings:async()=>{}}));
vi.mock('@/lib/brand-upload',()=>({prepareBrandUpload:mocks.prepare}));
vi.mock('@/hooks/use-toast',()=>({toast:vi.fn()}));
import AdminSettings from './AdminSettings';
beforeEach(()=>{vi.clearAllMocks();mocks.tenant='tenant-a';mocks.permission.mockReturnValue(true);mocks.upload.mockResolvedValue({error:null});mocks.remove.mockResolvedValue({error:null});mocks.save.mockResolvedValue(undefined);mocks.prepare.mockResolvedValue({blob:new Blob(['svg']),width:600,height:100,mime:'image/svg+xml',extension:'svg'});});
afterEach(cleanup);
describe('brand asset admin',()=>{
 it('uploads original SVG with tenant prefix and saves dimensions and MIME to the selected setting',async()=>{
  const {container}=render(<AdminSettings/>);fireEvent.change(container.querySelector('input[type=file]')!,{target:{files:[new File(['svg'],'logo.svg')]}});
  await waitFor(()=>expect(mocks.save).toHaveBeenCalled());
  expect(mocks.upload.mock.calls[0][0]).toMatch(/^tenant-a\/branding\/logo_wordmark-.+\.svg$/);
  expect(mocks.upload.mock.calls[0][2]).toMatchObject({contentType:'image/svg+xml',upsert:false});
  expect(mocks.save.mock.calls[0]).toEqual(['logo_wordmark',expect.objectContaining({width:600,height:100,mime:'image/svg+xml'}),'tenant-a']);
 });
 it('cleans only the new upload when saving fails',async()=>{
  mocks.save.mockRejectedValueOnce(new Error('Denied'));const {container}=render(<AdminSettings/>);
  fireEvent.change(container.querySelector('input[type=file]')!,{target:{files:[new File(['svg'],'logo.svg')]}});
  await waitFor(()=>expect(mocks.remove).toHaveBeenCalledWith([mocks.upload.mock.calls[0][0]]));
 });
 it('does not upload after a brand switch during file preparation',async()=>{
  mocks.prepare.mockImplementationOnce(async()=>{mocks.tenant='tenant-b';return {blob:new Blob(['svg']),extension:'svg'};});
  const {container}=render(<AdminSettings/>);fireEvent.change(container.querySelector('input[type=file]')!,{target:{files:[new File(['svg'],'logo.svg')]}});
  await waitFor(()=>expect(screen.getAllByRole('button',{name:'Görsel yükle'})[0]).toBeEnabled());expect(mocks.upload).not.toHaveBeenCalled();expect(mocks.save).not.toHaveBeenCalled();
 });
 it('resets the DB value without deleting files potentially referenced by other pages',async()=>{
  render(<AdminSettings/>);fireEvent.click(screen.getAllByRole('button',{name:'Varsayılana dön'})[0]);await waitFor(()=>expect(mocks.save).toHaveBeenCalledWith('logo_wordmark',{}));expect(mocks.remove).not.toHaveBeenCalled();
 });
 it('disables uploads without permissions',()=>{mocks.permission.mockReturnValue(false);render(<AdminSettings/>);for(const button of screen.getAllByRole('button',{name:'Görsel yükle'}))expect(button).toBeDisabled();});
});
