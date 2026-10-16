import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Blog from './Blog';
import BlogPost from './BlogPost';

const fixtures = vi.hoisted(() => ({
  tenant: { id: 'tenant-3dyanimda', slug: '3dyanimda', name: '3dyanımda', domain: '3dyanimda.com', custom_domain: '3dyanimda.com' },
  settings: { contact_info: { business_name: '3D Yanımda Atölye', google_business_url: 'https://www.google.com/maps?cid=123' } },
  post: { slug: 'ornek-uretim', title: 'Örnek üretim', excerpt: 'Üretim çalışması', content: '<p>Üretim çalışması.</p>', cover_image_url: null, tags: [], published_at: '2026-10-01T09:00:00Z' },
}));
vi.mock('@/lib/backend-config',()=>({demoMode:false,getSupabase:()=>import('@/lib/supabase').then(m=>m.supabase)}));
vi.mock('@/lib/i18n', () => ({}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'tr' }, t: (key: string) => key }) }));
vi.mock('@/contexts/TenantContext', () => ({ useTenant: () => ({ tenant: fixtures.tenant }) }));
vi.mock('@/hooks/useSiteSettings', () => ({ useSiteSettings: () => fixtures.settings }));
vi.mock('@/hooks/useSeoOverride', () => ({ useSeoOverride: () => undefined }));
vi.mock('@/lib/tenant', () => ({ getTenantIdentity: () => ({ name: fixtures.tenant.name, origin: 'https://3dyanimda.com' }) }));
vi.mock('@/components/site/PageHero', () => ({ PageHero: () => null }));
vi.mock('@/components/site/Prose', () => ({ Prose: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ select: () => {
    const query = {
      eq: () => query,
      or: () => query,
      order: () => Promise.resolve({ data: [fixtures.post] }),
      maybeSingle: () => Promise.resolve({ data: fixtures.post }),
    };
    return query;
  } }) },
}));

afterEach(cleanup);

describe('blog pages after an admin business name edit', () => {
  it.each(['/blog', '/blog/ornek-uretim'])('renders %s with one effective organization and stable publisher references', async (path) => {
    render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><HelmetProvider><MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
    </Routes></MemoryRouter></HelmetProvider></QueryClientProvider>);
    await waitFor(() => expect(document.getElementById('site-structured-data')).not.toBeNull());
    const graph = JSON.parse(document.getElementById('site-structured-data')!.textContent!)['@graph'] as Record<string, unknown>[];
    const organizations = graph.filter(node => node['@type'] === 'Organization');
    expect(organizations).toHaveLength(1);
    expect(organizations[0]).toMatchObject({ name: '3D Yanımda Atölye', '@id': 'https://3dyanimda.com/#organization', sameAs: ['https://www.google.com/maps?cid=123'] });
    if (path === '/blog') expect(graph.find(node => node['@type'] === 'Blog')).toHaveProperty('name', '3D Yanımda Atölye Blog');
    else expect(graph.find(node => node['@type'] === 'Article')).toHaveProperty('publisher', { '@id': 'https://3dyanimda.com/#organization' });
  });
});
