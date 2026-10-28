import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import PrintHero from './PrintHero';

vi.mock('@/brands/config', () => ({ useBrand: () => ({ settings: {}, eyebrow: 'Kurumsal üretim', lead: 'Dosyanızla başlayın.' }) }));
vi.mock('./PrinterPoster', () => ({ default: () => <span>Üretim sahnesi</span> }));
vi.mock('./printer/CanvasPrinter', () => ({ default: () => null }));
vi.mock('./printer/PrinterScene', () => ({ default: () => null }));

let scrollIntoView: ReturnType<typeof vi.fn>;
let scrollTo: ReturnType<typeof vi.spyOn>;
const show = () => {
  const router = createMemoryRouter([{ element: <><Outlet /><ScrollRestoration /></>, children: [
    { path: '/', element: <><PrintHero query="?tenant=3dyanimda" /><section id="hizmetler"><h2>Hizmetler</h2></section></> },
  ] }], { initialEntries: ['/?tenant=3dyanimda&utm_source=customer'] });
  render(<RouterProvider router={router} />);
  return router;
};

beforeEach(() => {
  sessionStorage.clear();
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
  scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, writable: true, value: scrollIntoView });
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('PrintHero service navigation', () => {
  it('scrolls to services through the router while preserving the full current query', async () => {
    const router = show();
    const oldKey = router.state.location.key;
    scrollIntoView.mockClear(); scrollTo.mockClear();
    fireEvent.click(screen.getByRole('link', { name: 'Hizmetleri keşfedin' }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById('hizmetler'));
    expect(router.state.location).toMatchObject({ pathname: '/', search: '?tenant=3dyanimda&utm_source=customer', hash: '#hizmetler' });
    expect(router.state.location.key).not.toBe(oldKey);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('returns to services when the same fragment is clicked again after scrolling elsewhere', async () => {
    const router = show();
    fireEvent.click(screen.getByRole('link', { name: 'Hizmetleri keşfedin' }));
    await waitFor(() => expect(router.state.location.hash).toBe('#hizmetler'));
    window.scrollY = 237;
    scrollIntoView.mockClear(); scrollTo.mockClear();
    fireEvent.click(screen.getByRole('link', { name: 'Hizmetleri keşfedin' }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById('hizmetler'));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
