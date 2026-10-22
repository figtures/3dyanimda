import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPost from './BlogPost';

const fixtures=vi.hoisted(()=>({post:null as null|Record<string,unknown>,error:false}));
vi.mock('@/content/public-page-query',()=>({usePublicPage:()=>({data:fixtures.post,isError:fixtures.error})}));
vi.mock('@/lib/i18n',()=>({}));
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'tr'}})}));
vi.mock('@/contexts/TenantContext',()=>({useTenant:()=>({tenant:{slug:'3dyanimda',name:'3D Yanımda',domain:'3dyanimda.com'}})}));
vi.mock('@/hooks/useSiteSettings',()=>({useSiteSettings:()=>({})}));
vi.mock('@/hooks/useSeoOverride',()=>({useSeoOverride:()=>undefined}));
vi.mock('@/lib/tenant',()=>({getTenantIdentity:()=>({name:'3D Yanımda',origin:'https://3dyanimda.com'})}));
vi.mock('@/components/site/PageHero',()=>({PageHero:()=>null}));
vi.mock('@/components/site/Prose',()=>({Prose:({children}:{children:React.ReactNode})=><div>{children}</div>}));
const show=()=>render(<HelmetProvider><MemoryRouter initialEntries={['/blog/uretim']}><Routes><Route path="/blog/:slug" element={<BlogPost/>}/><Route path="/blog" element={<div>Blog index redirect</div>}/></Routes></MemoryRouter></HelmetProvider>);
beforeEach(()=>{fixtures.error=false;fixtures.post={slug:'uretim',title:'Üretim',excerpt:'Üretim notu',content:'<p>Yazı.</p>',tags:[],cover_image_url:'/photo.jpg',published_at:null,updated_at:'2026-10-01T10:00:00Z'};});
afterEach(cleanup);
describe('blog detail metadata',()=>{
  it('omits unavailable publication date and uses the actual modification date and image',async()=>{
    show();
    await waitFor(()=>expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute('content','https://3dyanimda.com/photo.jpg'));
    const graph=JSON.parse(document.getElementById('site-structured-data')!.textContent!)['@graph'];
    const article=graph.find((node:Record<string,unknown>)=>node['@type']==='Article');
    expect(article).not.toHaveProperty('datePublished');
    expect(article).toMatchObject({dateModified:'2026-10-01T10:00:00.000Z',image:'https://3dyanimda.com/photo.jpg'});
    expect(screen.getByText('01.10.2026')).toHaveAttribute('dateTime','2026-10-01T10:00:00.000Z');
  });
  it('keeps missing article routes as a noindex 404 view instead of redirecting to the blog index',async()=>{
    fixtures.post=null;show();
    expect(screen.getByRole('heading',{name:'Sayfa bulunamadı.'})).toBeInTheDocument();
    expect(screen.queryByText('Blog index redirect')).not.toBeInTheDocument();
    await waitFor(()=>expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content','noindex,follow'));
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href','https://3dyanimda.com/blog/uretim');
  });
  it('distinguishes an unavailable API response from an absent article',()=>{
    fixtures.error=true;fixtures.post=null;show();
    expect(screen.getByRole('alert')).toHaveTextContent('İçerik şu anda yüklenemiyor');
    expect(screen.queryByText('Sayfa bulunamadı.')).not.toBeInTheDocument();
  });
});
