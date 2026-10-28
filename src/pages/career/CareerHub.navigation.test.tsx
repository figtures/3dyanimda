import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import CareerHub from './CareerHub';

vi.mock('@/brands/config', () => ({ useBrand: () => ({ name: '3D Yanımda', slug: '3dyanimda' }) }));
vi.mock('@/content/public-page-query', () => ({ usePublicPage: () => ({ data: [], isPending: false, isError: false, refetch: vi.fn() }) }));
vi.mock('@/contexts/FeatureContext', () => ({ useFeature: () => false }));
vi.mock('@/components/site/Seo', () => ({ Seo: () => null }));
vi.mock('@/lib/tenant', () => ({ previewSearch: () => '?tenant=3dyanimda' }));

let scrollIntoView: ReturnType<typeof vi.fn>;
let scrollTo: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  sessionStorage.clear();
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 2393 });
  scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, writable: true, value: scrollIntoView });
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('CareerHub opportunities navigation', () => {
  it('scrolls to opportunities instead of restoring an unrelated position and keeps the full query', async () => {
    const router = createMemoryRouter([{ element: <><Outlet /><ScrollRestoration /></>, children: [
      { path: '/kariyer', element: <CareerHub /> },
    ] }], { initialEntries: ['/kariyer?tenant=3dyanimda&utm_source=career'] });
    render(<RouterProvider router={router} />);
    const oldKey = router.state.location.key;
    scrollIntoView.mockClear(); scrollTo.mockClear();
    fireEvent.click(screen.getByRole('link', { name: 'Fırsatları keşfedin' }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById('acik-pozisyonlar'));
    expect(router.state.location).toMatchObject({ pathname: '/kariyer', search: '?tenant=3dyanimda&utm_source=career', hash: '#acik-pozisyonlar' });
    expect(router.state.location.key).not.toBe(oldKey);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
