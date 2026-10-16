import { describe, expect, it } from 'vitest';
import { normalizeGoogleBusinessUrl, normalizeMapEmbedUrl, normalizePublicUrl, normalizeSocialUrl, resolveBusinessProfile, validateContactInfo } from './business-profile';

const brand = { name: '3D Yanımda', origin: 'https://3dyanimda.com' };
const legacy = {
  email: 'info@3dyanimda.com', telephone: '+90 536 448 82 30',
  address: { streetAddress: 'Örnek Sokak 8', addressLocality: 'Ataşehir', addressRegion: 'İstanbul', addressCountry: 'TR' },
  geo: { latitude: 40.98, longitude: 29.12 },
  sameAs: ['https://www.instagram.com/3dyanimda/', 'https://www.linkedin.com/company/3dyanimda/', 'https://www.google.com/maps?cid=12345'],
};

describe('tenant business profile resolution', () => {
  it('preserves existing verified facts until the corresponding contact field is edited', () => {
    const settings = { verified_business_identity: legacy, contact_info: { about_title: 'Atölyemiz' } };
    const snapshot = JSON.stringify(settings);
    const business = resolveBusinessProfile(settings, brand);
    expect(business.phone).toBe('+905364488230');
    expect(business.email).toBe(legacy.email);
    expect(business.address).toEqual(legacy.address);
    expect(business.geo).toEqual(legacy.geo);
    expect(business.socialLinks).toHaveLength(2);
    expect(business.googleBusinessUrl).toBe('https://www.google.com/maps?cid=12345');
    expect(JSON.stringify(settings)).toBe(snapshot);
  });

  it('allows deliberately clearing inherited contact and profile facts', () => {
    const business = resolveBusinessProfile({ verified_business_identity: legacy, contact_info: {
      email: '', phone: '', instagram: '', google_business_url: '', address_tr: '',
    } }, brand);
    expect(business.email).toBeUndefined();
    expect(business.phone).toBeUndefined();
    expect(business.address).toBeUndefined();
    expect(business.geo).toBeUndefined();
    expect(business.addressText).toBe('');
    expect(business.sameAs).toEqual(['https://www.linkedin.com/company/3dyanimda']);
  });

  it('does not carry stale verified postal facts or coordinates into a new freeform address', () => {
    const business = resolveBusinessProfile({ verified_business_identity: legacy, contact_info: { address_tr: 'Yeni adres' } }, brand);
    expect(business.addressText).toBe('Yeni adres');
    expect(business.address).toBeUndefined();
    expect(business.geo).toBeUndefined();
  });

  it('preserves matching legacy address data when the old freeform field is already present', () => {
    const business = resolveBusinessProfile({ verified_business_identity: legacy, contact_info: { address_tr: 'Örnek Sokak 8, Ataşehir / İstanbul' } }, brand);
    expect(business.address).toEqual(legacy.address);
    expect(business.geo).toEqual(legacy.geo);
    const changed = resolveBusinessProfile({ verified_business_identity: legacy, contact_info: { address_tr: 'Örnek Sokak 9, Ataşehir / İstanbul' } }, brand);
    expect(changed.address).toBeUndefined();
    expect(changed.geo).toBeUndefined();
  });

  it('uses only entered structured fields after an address edit', () => {
    const business = resolveBusinessProfile({ verified_business_identity: legacy, contact_info: {
      address_city: 'İzmir', address_country: 'TR', address_street: '',
    } }, brand);
    expect(business.address).toEqual({ addressRegion: 'İzmir', addressCountry: 'TR' });
    expect(business.addressText).toBe('İzmir, TR');
    expect(business.geo).toBeUndefined();
  });

  it('keeps Google profile identity separate from its embedded map and deduplicates social identity', () => {
    const business = resolveBusinessProfile({ contact_info: {
      google_business_url: 'https://www.google.com/maps?cid=12345',
      map_url: 'https://www.google.com/maps/embed?pb=example',
      instagram: 'https://instagram.com/3dyanimda/?utm_source=footer',
      tiktok: 'https://www.tiktok.com/@3dyanimda',
    } }, brand);
    expect(business.mapEmbedUrl).toContain('/maps/embed');
    expect(business.sameAs).toEqual(['https://www.google.com/maps?cid=12345', 'https://instagram.com/3dyanimda', 'https://www.tiktok.com/@3dyanimda']);
    expect(business.sameAs.some(url => url.includes('/embed'))).toBe(false);
  });

  it('has no invented contacts and stays tenant-local', () => {
    for (const slug of ['3dyanimda', '3dsanayi', 'maketyanimda', 'parcayanimda']) {
      const business = resolveBusinessProfile({}, { name: slug, origin: `https://${slug}.com` });
      expect(business.name).toBe(slug);
      expect(business.email).toBeUndefined();
      expect(business.phone).toBeUndefined();
      expect(business.address).toBeUndefined();
      expect(business.sameAs).toEqual([]);
    }
    expect(resolveBusinessProfile({ contact_info: { business_name: 'Üretim Atölyesi' } }, brand).name).toBe('Üretim Atölyesi');
    expect(resolveBusinessProfile({ contact_info: { business_name: '' }, verified_business_identity: { name: 'Önceki ad' } }, brand).name).toBe(brand.name);
  });

  it('shows existing service instructions for missing fields and allows their intentional removal', () => {
    expect(resolveBusinessProfile({}, brand).visitNote).toContain('önceden randevu');
    const business = resolveBusinessProfile({ contact_info: { visit_note: '', delivery_note: '', onsite_note: '' } }, brand);
    expect([business.visitNote, business.deliveryNote, business.onsiteNote]).toEqual(['', '', '']);
  });
});

describe('public business links', () => {
  it('rejects executable, credentialed, spoofed and non-HTTPS URLs', () => {
    for (const value of ['javascript:alert(1)', 'http://instagram.com/test', 'https://owner:secret@instagram.com/test', '//instagram.com/test', 'https://instagram.com\\@evil.example/test']) {
      expect(normalizePublicUrl(value)).toBeUndefined();
    }
    expect(normalizeSocialUrl('instagram', 'https://instagram.com.evil.example/test')).toBeUndefined();
    expect(normalizeGoogleBusinessUrl('https://google.com.evil.example/maps?cid=12')).toBeUndefined();
    expect(normalizeMapEmbedUrl('https://evil.example/maps/embed?pb=x')).toBeUndefined();
    expect(normalizeMapEmbedUrl('https://www.google.com.tr/maps/embed?pb=x')).toBeUndefined();
    expect(normalizeMapEmbedUrl('https://www.google.com:8443/maps/embed?pb=x')).toBeUndefined();
    expect(normalizeMapEmbedUrl('https://www.google.com/maps/embed?pb=x')).toBe('https://www.google.com/maps/embed?pb=x');
  });

  it('accepts Google place-query URLs and official short links without stripping their IDs', () => {
    for (const url of ['https://www.google.com/maps?cid=12345', 'https://maps.google.com/?q=place_id:123', 'https://maps.app.goo.gl/AbcDef', 'https://g.page/3dyanimda', 'https://www.google.com/maps/search/?api=1&query=3D&query_place_id=ChIJ123']) {
      expect(normalizeGoogleBusinessUrl(url)).toBe(url);
    }
    expect(normalizeGoogleBusinessUrl('https://www.google.com/maps')).toBeUndefined();
    expect(normalizeGoogleBusinessUrl('https://maps.google.com/maps?q=test&output=embed')).toBeUndefined();
  });

  it('accepts account profiles and excludes posts, video pages and embedding URLs', () => {
    expect(normalizeSocialUrl('youtube', 'https://youtube.com/@3dyanimda')).toBe('https://youtube.com/@3dyanimda');
    expect(normalizeSocialUrl('facebook', 'https://www.facebook.com/profile.php?id=123&utm_source=test')).toBe('https://www.facebook.com/profile.php?id=123');
    expect(normalizeSocialUrl('instagram', 'https://instagram.com/p/ABC')).toBeUndefined();
    expect(normalizeSocialUrl('twitter', 'https://x.com/account/status/123')).toBeUndefined();
    expect(normalizeSocialUrl('youtube', 'https://youtube.com/watch?v=123')).toBeUndefined();
  });

  it('validates editable fields while allowing blank removals and relative images', () => {
    expect(validateContactInfo({ email: '', phone: '', google_business_url: '', instagram: '', map_url: '', about_image_url: '/images/workshop.jpg' })).toEqual({});
    expect(validateContactInfo({ email: 'bad', google_business_url: 'https://example.com', about_image_url: 'javascript:alert(1)' })).toHaveProperty('google_business_url');
    expect(normalizePublicUrl('/images/workshop.jpg', brand.origin)).toBe('https://3dyanimda.com/images/workshop.jpg');
  });
});
