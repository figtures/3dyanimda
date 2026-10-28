import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, RouterProvider, StaticRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { InPageLink } from './InPageLink';

afterEach(cleanup);

it.each([
  ['/', '#hizmetler'],
  ['/3d-baski', '#karsilastirma'],
  ['/kariyer', '#acik-pozisyonlar'],
] as const)('keeps the visitor query in exported HTML before hydration on %s', (path, hash) => {
  const html = renderToStaticMarkup(<StaticRouter location={path}><InPageLink hash={hash}>Bölüme git</InPageLink></StaticRouter>);
  const document = new DOMParser().parseFromString(html, 'text/html');
  const href = document.querySelector('a')!.getAttribute('href')!;
  // The export was built without this visitor's attribution or preview query.
  const visitorUrl = `https://3dyanimda.com${path}?utm_source=chatgpt&theme=studio`;
  expect(new URL(href, visitorUrl).href).toBe(visitorUrl + hash);
});

it('leaves modified clicks and cancelled navigation to the browser or caller', () => {
  const router = createMemoryRouter([{ path: '/3d-baski', element: <>
    <InPageLink hash="#karsilastirma">Bölüme git</InPageLink>
    <InPageLink hash="#sorular" onClick={event => event.preventDefault()}>İptal</InPageLink>
  </> }], { initialEntries: ['/3d-baski?utm_source=chatgpt'] });
  render(<RouterProvider router={router} />);
  const initial = router.state.location;
  fireEvent.click(screen.getByRole('link', { name: 'Bölüme git' }), { ctrlKey: true });
  fireEvent.click(screen.getByRole('link', { name: 'İptal' }));
  expect(router.state.location).toEqual(initial);
});
