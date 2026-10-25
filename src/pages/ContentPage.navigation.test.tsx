import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, Link, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import type { LandingPage } from '@/content/types';
import ContentPage from './ContentPage';

const fixtures = vi.hoisted(() => ({ page: null as LandingPage | null }));
vi.mock('@/content/useContent', () => ({ useContentPage: () => ({ data: fixtures.page, isLoading: false, isError: false }), useRelatedContent: () => ({ data: [] }) }));
vi.mock('@/brands/config', () => ({ useBrand: () => ({ name: '3D Yanımda', focus: '3D baskı' }) }));
vi.mock('@/lib/tenant', () => ({ getTenantIdentity: () => ({ origin: 'https://3dyanimda.com' }), previewSearch: () => '' }));
vi.mock('@/components/site/Seo', () => ({ Seo: () => null }));
vi.mock('./RegionPlanner', () => ({ default: () => null }));
vi.mock('./NotFound', () => ({ default: () => null }));
vi.mock('@/components/brand/LocalServiceAccess', () => ({ LocalServiceAccess: () => <section id="hizmet-ve-teslimat" /> }));

let scrollIntoView: ReturnType<typeof vi.fn>;
let scrollTo: ReturnType<typeof vi.spyOn>;
const show = () => {
  const router = createMemoryRouter([{ element: <><Outlet /><ScrollRestoration /></>, children: [
    { path: '/rehber/test', element: <><ContentPage /><Link to="/other">Başka sayfa</Link></> },
    { path: '/other', element: <h1>Başka sayfa</h1> },
  ] }], { initialEntries: ['/rehber/test?tenant=3dyanimda&theme=industrial'] });
  render(<RouterProvider router={router} />);
  return router;
};

beforeEach(() => {
  sessionStorage.clear();
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
  scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, writable: true, value: scrollIntoView });
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation((_x, y) => { window.scrollY = y ?? 0; });
  fixtures.page = { path: '/rehber/test', brand: '3dyanimda', title: 'Dosya kontrolü', summary: 'Bir modelin aktarım ve birim kontrolü.', kind: 'guide', image: '', status: 'published', sections: [{ title: 'Dosyayı açın', body: 'Aktarılan dosyayı kontrol edin.' }], faq: [{ q: 'Nasıl başlanır?', a: 'Dosyanızla başlayın.' }], city: '', district: '', neighborhood: '', service: '', local_context: '', logistics: '', evidence: '', reviewed_at: null, updated_at: null,
    editorial: { answer: 'Birim ve ölçüyü kontrol edin.', takeaways: [], relatedPaths: [], comparison: { title: 'Yöntem seçimi', columns: ['Yöntem', 'Amaç'], rows: [['FDM', 'Prototip']] }, resources: [{ title: 'Örnek model', path: '/downloads/3dyanimda/referans-kup-20mm.stl' }] } };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('content in-page navigation with router scroll restoration', () => {
  it.each([
    ['Dosyayı açın', 'bolum-0'],
    ['Karşılaştırma', 'karsilastirma'],
    ['Araçlar ve örnek dosyalar', 'araclar-ve-dosyalar'],
    ['Sorular ve yanıtlar', 'sorular'],
  ])('scrolls %s to its section and preserves the current query', async (name, id) => {
    const router = show();
    const originalKey = router.state.location.key;
    scrollIntoView.mockClear(); scrollTo.mockClear();
    fireEvent.click(screen.getByRole('link', { name }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById(id));
    expect(router.state.location).toMatchObject({ pathname: '/rehber/test', search: '?tenant=3dyanimda&theme=industrial', hash: `#${id}` });
    expect(router.state.location.key).not.toBe(originalKey);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls the location-specific delivery link to its section', async () => {
    fixtures.page!.kind = 'location';
    show(); scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole('link', { name: 'Hizmete erişim ve teslimat' }));
    await waitFor(() => expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById('hizmet-ve-teslimat')));
  });

  it('keeps ordinary route reset and Back position restoration', async () => {
    const router = show();
    fireEvent.click(screen.getByRole('link', { name: 'Karşılaştırma' }));
    await waitFor(() => expect(router.state.location.hash).toBe('#karsilastirma'));
    window.scrollY = 900;
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole('link', { name: 'Başka sayfa' }));
    await screen.findByRole('heading', { name: 'Başka sayfa' });
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
    expect(router.state.location.hash).toBe('');
    await act(async () => { await router.navigate(-1); });
    expect(router.state.location.hash).toBe('#karsilastirma');
    expect(scrollTo).toHaveBeenLastCalledWith(0, 900);
  });
});
