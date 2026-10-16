/** Tenant-owned public business facts. Empty saved fields intentionally remove legacy values. */
export type ContactInfo = {
  business_name?: string;
  business_description?: string;
  email?: string;
  phone?: string;
  phone_display?: string;
  whatsapp?: string;
  address_tr?: string;
  address_en?: string;
  location_tr?: string;
  location_en?: string;
  address_street?: string;
  address_district?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  google_business_url?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  map_url?: string;
  about_title?: string;
  about_text?: string;
  about_image_url?: string;
  about_image_alt?: string;
  visit_note?: string;
  delivery_note?: string;
  onsite_note?: string;
  floating_enabled?: boolean;
  floating_whatsapp?: boolean;
  floating_phone?: boolean;
};

export type PostalAddress = {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
};
export const SOCIAL_PROFILES = [
  { key: 'instagram', label: 'Instagram', hosts: ['instagram.com'] },
  { key: 'facebook', label: 'Facebook', hosts: ['facebook.com', 'fb.com'] },
  { key: 'linkedin', label: 'LinkedIn', hosts: ['linkedin.com'] },
  { key: 'youtube', label: 'YouTube', hosts: ['youtube.com'] },
  { key: 'twitter', label: 'X', hosts: ['x.com', 'twitter.com'] },
  { key: 'tiktok', label: 'TikTok', hosts: ['tiktok.com'] },
] as const;
export type SocialProfileKey = typeof SOCIAL_PROFILES[number]['key'];
export type SocialProfile = { key: SocialProfileKey; label: string; url: string };

const clean = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
const own = (value: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(value, key);
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const googleHost = (host: string) => /^(?:www\.|maps\.)?google\.(?:com|com\.tr|co\.uk)$/.test(host);

/** Absolute HTTPS links only, except same-origin relative media when an origin is supplied. */
export function normalizePublicUrl(value: unknown, origin?: string): string | undefined {
  const text = clean(value);
  if (!text || /[\u0000-\u001f\u007f\\]/.test(text)) return;
  if (!/^https:\/\//i.test(text) && !(origin && /^\/(?!\/)/.test(text))) return;
  try {
    const url = new URL(text, origin);
    if (url.protocol !== 'https:' || url.username || url.password) return;
    return url.href;
  } catch { return; }
}

export function normalizeGoogleBusinessUrl(value: unknown): string | undefined {
  const safe = normalizePublicUrl(value);
  if (!safe) return;
  const url = new URL(safe);
  const host = url.hostname.toLowerCase();
  // Public profile links can use place IDs, CID queries, or Google Maps short links.
  const maps = googleHost(host) && (host.startsWith('maps.') || /^\/maps(?:\/|$)/.test(url.pathname) || url.searchParams.has('cid'));
  const short = ['maps.app.goo.gl', 'g.page'].includes(host) && url.pathname !== '/';
  const oldShort = host === 'goo.gl' && /^\/maps\/.+/.test(url.pathname);
  if ((!maps && !short && !oldShort) || /\/embed(?:\/|$)/.test(url.pathname) || url.searchParams.get('output') === 'embed') return;
  if (maps && /^\/maps\/?$/.test(url.pathname) && !['cid', 'q', 'query', 'query_place_id'].some(key => url.searchParams.get(key))) return;
  return safe;
}

export function normalizeMapEmbedUrl(value: unknown): string | undefined {
  const safe = normalizePublicUrl(value);
  if (!safe) return;
  const url = new URL(safe);
  // Keep accepted iframe URLs aligned with deploy/security-headers.mjs frame-src.
  if (!['https://www.google.com', 'https://maps.google.com'].includes(url.origin)) return;
  if (/^\/maps\/embed(?:\/|$)/.test(url.pathname) || ((url.hostname.startsWith('maps.') || /^\/maps(?:\/|$)/.test(url.pathname)) && url.searchParams.get('output') === 'embed')) return safe;
}

export function normalizeSocialUrl(key: SocialProfileKey, value: unknown): string | undefined {
  const safe = normalizePublicUrl(value);
  if (!safe) return;
  const url = new URL(safe);
  const profile = SOCIAL_PROFILES.find(item => item.key === key);
  const host = url.hostname.replace(/^(www|m)\./, '');
  if (!profile?.hosts.some(allowed => host === allowed) || !url.pathname.split('/').filter(Boolean).length) return;
  // Share, video and sign-in URLs identify content/actions rather than this business.
  if (/^\/(?:share|sharer(?:\.php)?|intent|login|accounts|watch|shorts|reel|reels|p|status|video|embed)(?:\/|$)/i.test(url.pathname)) return;
  if (key === 'linkedin' && !/^\/(?:company|in|school)\/[^/]+/.test(url.pathname)) return;
  if (key === 'youtube' && !/^\/(?:@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)/.test(url.pathname)) return;
  if (key === 'tiktok' && !/^\/@[^/]+\/?$/.test(url.pathname)) return;
  if ((key === 'instagram' || key === 'twitter') && url.pathname.split('/').filter(Boolean).length !== 1) return;
  // Tracking and view-selection parameters aren't part of social account identity.
  const facebookId = key === 'facebook' && url.pathname === '/profile.php' ? url.searchParams.get('id') : undefined;
  if (key === 'facebook' && url.pathname === '/profile.php' && !facebookId) return;
  url.search = '';
  if (facebookId) url.searchParams.set('id', facebookId);
  url.hash = '';
  return url.href.replace(/\/$/, '');
}

export function normalizePhone(value: unknown): string | undefined {
  const text = clean(value);
  if (!text || !/^\+?[\d\s().-]+$/.test(text)) return;
  const digits = text.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 ? (text.startsWith('+') ? '+' : '') + digits : undefined;
}
const normalizeEmail = (value: unknown): string | undefined => {
  const text = clean(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : undefined;
};
const addressFields = {
  address_street: 'streetAddress', address_district: 'addressLocality',
  address_city: 'addressRegion', address_postal_code: 'postalCode', address_country: 'addressCountry',
} as const;
const cleanAddress = (value: Record<string, unknown>): PostalAddress | undefined => {
  const address = Object.fromEntries(Object.values(addressFields).flatMap(key => clean(value[key]) ? [[key, clean(value[key])]] : []));
  return Object.keys(address).length ? address : undefined;
};
export function formatPostalAddress(address?: PostalAddress): string {
  if (!address) return '';
  return [address.streetAddress, [address.postalCode, address.addressLocality].filter(Boolean).join(' '), address.addressRegion, address.addressCountry].filter(Boolean).join(', ');
}

function matchesPostalAddress(text: unknown, address?: PostalAddress): boolean {
  if (!clean(text) || !address) return false;
  const comparable = (value: string) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]/g, '');
  const actual = comparable(clean(text));
  const { addressCountry, ...withoutCountry } = address;
  const candidates = [formatPostalAddress(address), formatPostalAddress(withoutCountry)];
  if (addressCountry === 'TR') candidates.push(formatPostalAddress({ ...address, addressCountry: 'Türkiye' }));
  return candidates.some(candidate => comparable(candidate) === actual);
}

export function resolveBusinessProfile(settings: Record<string, unknown>, brand: { name: string; origin: string }) {
  const contact = record(settings.contact_info);
  const verified = record(settings.verified_business_identity);
  const value = (key: keyof ContactInfo, legacy?: unknown) => own(contact, key) ? contact[key] : legacy;
  const legacySameAs = Array.isArray(verified.sameAs) ? verified.sameAs : [];
  const legacyAddress = cleanAddress(record(verified.address));
  const addressOwned = Object.keys(addressFields).some(key => own(contact, key));
  // Older settings already stored both forms. Preserve verified facts only while they agree.
  const freeformChanged = own(contact, 'address_tr') && !matchesPostalAddress(contact.address_tr, legacyAddress);
  const address = addressOwned
    ? cleanAddress(Object.fromEntries(Object.entries(addressFields).map(([key, schemaKey]) => [schemaKey, contact[key]])))
    : freeformChanged ? undefined : legacyAddress;
  const googleBusinessUrl = normalizeGoogleBusinessUrl(value('google_business_url', verified.hasMap || verified.google_business_url || legacySameAs.find(url => normalizeGoogleBusinessUrl(url))));
  const socialLinks: SocialProfile[] = SOCIAL_PROFILES.flatMap(profile => {
    const url = normalizeSocialUrl(profile.key, value(profile.key, legacySameAs.find(url => normalizeSocialUrl(profile.key, url))));
    return url ? [{ key: profile.key, label: profile.label, url }] : [];
  });
  const phone = normalizePhone(value('phone', verified.telephone));
  const phoneDisplay = own(contact, 'phone_display') ? clean(contact.phone_display) : phone;
  // Clearing a required display name restores the tenant name, never a previous override.
  const name = clean(value('business_name', verified.name)) || clean(brand.name);
  const legacyGeo = record(verified.geo);
  const geo = !addressOwned && !freeformChanged && Number.isFinite(legacyGeo.latitude) && Number.isFinite(legacyGeo.longitude)
    && Math.abs(Number(legacyGeo.latitude)) <= 90 && Math.abs(Number(legacyGeo.longitude)) <= 180
    ? { latitude: Number(legacyGeo.latitude), longitude: Number(legacyGeo.longitude) } : undefined;
  return {
    name,
    description: clean(value('business_description', verified.description)),
    email: normalizeEmail(value('email', verified.email)),
    phone,
    phoneDisplay: phoneDisplay || phone,
    addressText: own(contact, 'address_tr') ? clean(contact.address_tr) : formatPostalAddress(address),
    address,
    googleBusinessUrl,
    mapEmbedUrl: normalizeMapEmbedUrl(contact.map_url),
    socialLinks,
    sameAs: [...new Set([googleBusinessUrl, ...socialLinks.map(profile => profile.url)].filter((url): url is string => Boolean(url)))],
    aboutTitle: clean(contact.about_title),
    aboutText: clean(contact.about_text),
    aboutImageUrl: normalizePublicUrl(contact.about_image_url, brand.origin),
    aboutImageAlt: clean(contact.about_image_alt),
    visitNote: clean(value('visit_note', 'Atölye ziyareti ve elden teslim için önceden randevu alın. Ziyaret planını teklif talebinizde belirtebilirsiniz.')),
    deliveryNote: clean(value('delivery_note', 'Kargo, kurye ve elden teslim seçenekleri için projenizi paylaşın. Teslimat yöntemi ve takvimini birlikte belirleyelim.')),
    onsiteNote: clean(value('onsite_note', 'Taranacak parçayı, yaklaşık ölçülerini ve bulunduğu konumu paylaşın; yerinde hizmet için çalışma koşullarını ve randevuyu birlikte değerlendirelim.')),
    geo,
    openingHoursSpecification: Array.isArray(verified.openingHoursSpecification) ? verified.openingHoursSpecification as Record<string, unknown>[] : undefined,
  };
}

/** Validate saved fields without adding defaults or altering intentional empty values. */
export function validateContactInfo(data: ContactInfo): Partial<Record<keyof ContactInfo, string>> {
  const errors: Partial<Record<keyof ContactInfo, string>> = {};
  if (clean(data.email) && !normalizeEmail(data.email)) errors.email = 'Geçerli bir e-posta adresi girin.';
  if (clean(data.phone) && !normalizePhone(data.phone)) errors.phone = 'Geçerli bir telefon numarası girin (ör. +905364488230).';
  if (clean(data.whatsapp) && !/^\d{7,15}$/.test(clean(data.whatsapp).replace(/^\+/, ''))) errors.whatsapp = 'WhatsApp numarasını ülke koduyla, yalnızca rakam kullanarak girin.';
  if (clean(data.google_business_url) && !normalizeGoogleBusinessUrl(data.google_business_url)) errors.google_business_url = 'Google Haritalar işletme profilinizin HTTPS paylaşım bağlantısını girin.';
  if (clean(data.map_url) && !normalizeMapEmbedUrl(data.map_url)) errors.map_url = 'Google Haritalar “Haritayı yerleştir” bölümündeki www.google.com veya maps.google.com HTTPS src bağlantısını girin.';
  for (const profile of SOCIAL_PROFILES) {
    if (clean(data[profile.key]) && !normalizeSocialUrl(profile.key, data[profile.key])) errors[profile.key] = `${profile.label} işletme profilinizin tam HTTPS bağlantısını girin.`;
  }
  if (clean(data.about_image_url) && !normalizePublicUrl(data.about_image_url, 'https://example.invalid')) errors.about_image_url = 'HTTPS görsel bağlantısı veya / ile başlayan site içi görsel yolu girin.';
  return errors;
}
