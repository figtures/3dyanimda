import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import {afterEach,describe,it,expect,vi} from 'vitest';
const state=vi.hoisted(()=>({name:'3dyanimda',session:null as any,isAdmin:false,configured:true,signIn:vi.fn(),signOut:vi.fn()}));
vi.mock('@/lib/supabase',()=>({get backendConfigured(){return state.configured},supabase:{auth:{signInWithPassword:state.signIn,signOut:state.signOut}}}));
vi.mock('@/hooks/useAdminAuth',()=>({useAdminAuth:()=>({session:state.session,isAdmin:state.isAdmin,loading:false})}));
vi.mock('@/contexts/TenantContext',()=>({useTenant:()=>({tenant:{name:state.name,id:state.name}})}));
import AdminLogin from './AdminLogin';
const show=()=>render(<HelmetProvider><MemoryRouter><AdminLogin/></MemoryRouter></HelmetProvider>);
afterEach(()=>{cleanup();state.session=null;state.configured=true;vi.clearAllMocks();});
describe('brand admin entry',()=>{
 for(const name of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']) it(`identifies ${name} and labels credentials`,()=>{state.name=name;show();expect(screen.getByText(name+' çalışma alanı')).toBeInTheDocument();expect(screen.getByLabelText('E-posta adresi')).toHaveAttribute('autocomplete','username');expect(screen.getByLabelText('Şifre')).toHaveAttribute('autocomplete','current-password');});
 it('blocks login in offline preview',()=>{state.configured=false;show();expect(screen.getByRole('button',{name:/Yönetim paneline gir/})).toBeDisabled();});
 it('handles network failure without leaving a busy form',async()=>{state.signIn.mockRejectedValueOnce(new Error('network'));show();fireEvent.change(screen.getByLabelText('E-posta adresi'),{target:{value:'admin@example.com'}});fireEvent.change(screen.getByLabelText('Şifre'),{target:{value:'test-password'}});fireEvent.submit(screen.getByLabelText('Şifre').closest('form')!);await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Bağlantı kurulamadı'));expect(screen.getByRole('button',{name:/Yönetim paneline gir/})).toBeEnabled();});
 it('unauthorized session can sign out rather than entering another brand',()=>{state.session={user:{id:'test'}};show();expect(screen.getByRole('alert')).toHaveTextContent('erişim yetkisi yok');fireEvent.click(screen.getByRole('button',{name:'Farklı hesapla giriş yap'}));expect(state.signOut).toHaveBeenCalledOnce();});
});
