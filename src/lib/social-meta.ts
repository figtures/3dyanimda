import {brandAsset} from './brand-assets';
import catalog from '@/brands/catalog.json';

export type SocialImageCandidate = {url?: string; alt?: string; width?: number; height?: number};
type Candidate = string | SocialImageCandidate | undefined;
const dimension = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;
const mimeType = (url: URL) => /\.png$/i.test(url.pathname) ? 'image/png' : /\.webp$/i.test(url.pathname) ? 'image/webp' : 'image/jpeg';

/** Only public raster assets can be used as share cards; reject credential/query URLs. */
export function socialImage(origin: string, slug: string | undefined, candidate?: Candidate | Candidate[], settings:Record<string,unknown>={}) {
  const brand = catalog.find(item => item.slug === slug) || catalog[0];
  const fallback = brandAsset(brand.slug,'og_image',settings);
  const fallbackUrl = new URL(fallback.url, origin);
  for (const item of Array.isArray(candidate) ? candidate : [candidate]) {
    const asset = typeof item === 'string' ? {url:item} : item;
    if (!asset?.url || asset.url.startsWith('//')) continue;
    try {
      const url = new URL(asset.url, origin);
      if (url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && /\.(png|jpe?g|webp)$/i.test(url.pathname)) {
        const known = url.href === fallbackUrl.href ? fallback : undefined;
        return { url: url.href, alt: asset.alt?.trim() || known?.alt || `${brand.name} — ${brand.focus}`, mime: mimeType(url), width: dimension(asset.width) || dimension(known?.width), height: dimension(asset.height) || dimension(known?.height) };
      }
    } catch { /* Use the controlled, versioned fallback. */ }
  }
  return {url:fallbackUrl.href,alt:fallback.alt||`${brand.name} — ${brand.focus}`,mime:mimeType(fallbackUrl),width:dimension(fallback.width),height:dimension(fallback.height)};
}
