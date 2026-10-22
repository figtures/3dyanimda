import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { resolveBusinessProfile } from '@/lib/business-profile';

const fixture = vi.hoisted(() => ({ slug: '3dyanimda', settings: {} as Record<string, unknown> }));
vi.mock('@/brands/config', () => ({ useBrand: () => ({
  slug: fixture.slug, name: '3D Yanımda', settings: fixture.settings,
  business: resolveBusinessProfile(fixture.settings, { name: '3D Yanımda', origin: 'https://3dyanimda.com' }),
}) }));
vi.mock('@/components/site/Seo', () => ({ Seo: () => null }));
vi.mock('@/lib/tenant', () => ({ previewSearch: () => '' }));
import Contact from './Contact';
afterEach(() => { cleanup(); fixture.slug = '3dyanimda'; fixture.settings = {}; });

describe('public contact facts', () => {
  it('shows address directions without manufacturing a Google business profile', () => {
    fixture.settings = { contact_info: { address_tr: 'Bestekar Sokak No: 17, Ataşehir, İstanbul' } };
    render(<MemoryRouter><Contact /></MemoryRouter>);
    const link = screen.getByRole('link', { name: /Haritada yol tarifi/ });
    expect(new URL(link.getAttribute('href')!).searchParams.get('destination')).toBe('Bestekar Sokak No: 17, Ataşehir, İstanbul');
    expect(screen.queryByRole('heading', { name: '3D Yanımda profilleri' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Çalışma saatleri' })).not.toBeInTheDocument();
  });

  it('renders the same normalized hours and distinct onsite/delivery areas used by schema', () => {
    fixture.settings = { contact_info: {
      opening_hours: [{ dayOfWeek: 'Wednesday', opens: '10:00', closes: '17:00' }],
      service_areas: 'İstanbul', delivery_areas: 'Türkiye', contact_languages: 'Türkçe\nEnglish',
    } };
    render(<MemoryRouter><Contact /></MemoryRouter>);
    expect(screen.getByText('Çarşamba')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
    expect(screen.getByText(/Kargo \/ teslimat bölgeleri: Türkiye/)).toBeInTheDocument();
    expect(screen.getByText(/Yerinde hizmet bölgeleri: İstanbul/)).toBeInTheDocument();
    expect(screen.getByText('Türkçe, English')).toBeInTheDocument();
  });

  it('does not add fallback directions or language panels to the other brands', () => {
    fixture.slug = '3dsanayi';
    fixture.settings = { contact_info: { address_tr: 'Test address' } };
    render(<MemoryRouter><Contact /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: /Haritada yol tarifi/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'İletişim dilleri' })).not.toBeInTheDocument();
  });
});
