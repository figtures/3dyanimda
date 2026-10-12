import {brandAsset,publicAssetUrl} from './brand-assets';
import catalog from '@/brands/catalog.json';

/** Only public raster assets can be used as share cards; reject credential/query URLs. */
export function socialImage(origin: string, slug: string | undefined, candidate?: string, settings:Record<string,unknown>={}) {
  const brand = catalog.find(item => item.slug === slug) || catalog[0];
  if (candidate) {
    try {
      const url = new URL(candidate, origin);
      if (url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && /\.(png|jpe?g)$/i.test(url.pathname)) {
        return { url: url.href, alt: `${brand.name} — ${brand.focus}`, width: undefined, height: undefined };
      }
    } catch { /* Use the controlled, versioned fallback. */ }
  }
  const asset=brandAsset(brand.slug,'og_image',settings);
  return {url:new URL(asset.url,origin).href,alt:asset.alt||`${brand.name} — ${brand.focus}`,width:asset.width,height:asset.height};
}
