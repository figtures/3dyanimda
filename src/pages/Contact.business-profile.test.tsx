import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { resolveBusinessProfile, validateContactInfo, WEEKDAYS } from '@/lib/business-profile';
import { businessGraph } from '@/lib/structured-data';

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

  it('shows verified all-day hours while retaining appointment requirements and schema values', () => {
    const contact = {
      opening_hours: WEEKDAYS.map(day => ({ dayOfWeek: day.key, opens: '00:00', closes: '23:59' })),
      geo_latitude: '40.9974165', geo_longitude: '29.0763174',
      address_city: 'İstanbul', address_district: 'Ataşehir', address_country: 'TR',
    };
    fixture.settings = { contact_info: contact };
    expect(validateContactInfo(contact)).toEqual({});
    render(<MemoryRouter><Contact /></MemoryRouter>);
    expect(screen.getAllByText('24 saat açık')).toHaveLength(7);
    expect(screen.getByText(/Atölye ziyareti ve elden teslim için önceden randevu alın/)).toBeInTheDocument();
    const profile = resolveBusinessProfile(fixture.settings, { name: '3D Yanımda', origin: 'https://3dyanimda.com' });
    expect(profile.geo).toEqual({ latitude: 40.9974165, longitude: 29.0763174 });
    expect(profile.openingHoursSpecification).toEqual(contact.opening_hours.map(hours => ({ '@type': 'OpeningHoursSpecification', ...hours })));
    const graph = businessGraph({ name: profile.name, origin: 'https://3dyanimda.com', address: profile.address, geo: profile.geo, openingHoursSpecification: profile.openingHoursSpecification });
    const localBusiness = graph['@graph'].find(node => node['@type'] === 'ProfessionalService');
    expect(localBusiness).toMatchObject({ geo: { '@type': 'GeoCoordinates', latitude: 40.9974165, longitude: 29.0763174 }, openingHoursSpecification: profile.openingHoursSpecification });
  });

  it('does not add fallback directions or language panels to the other brands', () => {
    fixture.slug = '3dsanayi';
    fixture.settings = { contact_info: { address_tr: 'Test address' } };
    render(<MemoryRouter><Contact /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: /Haritada yol tarifi/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'İletişim dilleri' })).not.toBeInTheDocument();
  });
});
