import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { Seo } from './Seo';

const mocks=vi.hoisted(()=>({slug:'3dyanimda',override:undefined as undefined|{og_image_url:string}}));
vi.mock('@/contexts/TenantContext',()=>({useTenant:()=>({tenant:{slug:mocks.slug,name:mocks.slug,domain:mocks.slug+'.com'}})}));
vi.mock('@/hooks/useSiteSettings',()=>({useSiteSettings:()=>({})}));
vi.mock('@/hooks/useSeoOverride',()=>({useSeoOverride:()=>mocks.override}));
const meta=(name:string)=>document.head.querySelector(`meta[property="${name}"],meta[name="${name}"]`)?.getAttribute('content');
const graph=()=>JSON.parse(document.getElementById('site-structured-data')!.textContent!)['@graph'];

beforeEach(()=>{mocks.slug='3dyanimda';mocks.override=undefined;});
afterEach(cleanup);
describe('page metadata image and date agreement',()=>{
  it.each(['3dyanimda','3dsanayi','maketyanimda','parcayanimda'])('keeps %s metadata on its own domain with known brand image dimensions',async slug=>{
    mocks.slug=slug;
    render(<HelmetProvider><Seo title="Hizmet" description="Üretim" path="/3d-baski" /></HelmetProvider>);
    await waitFor(()=>expect(meta('og:image')).toBe(`https://${slug}.com/brand/identity/${slug}/og-image.png`));
    expect(meta('twitter:image')).toBe(meta('og:image'));
    expect(meta('og:image:type')).toBe('image/png');
    expect(meta('og:image:width')).toBe('1200');
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href',`https://${slug}.com/3d-baski`);
  });
  it('aligns a page image in OG, Twitter, WebPage and Article with source dates',async()=>{
    render(<HelmetProvider><Seo title="Malzeme seçimi" description="Karşılaştırma" path="/rehber/malzeme" type="article" image="/guide.webp" imageAlt="Malzeme tablosu" imageWidth={1200} imageHeight={630} published="2026-10-01T09:00:00Z" modified="2026-10-03T09:00:00Z" jsonLd={{'@type':'Article',headline:'Malzeme seçimi',image:'/old.jpg'}} /></HelmetProvider>);
    await waitFor(()=>expect(meta('og:image')).toBe('https://3dyanimda.com/guide.webp'));
    expect(meta('twitter:image')).toBe(meta('og:image'));
    expect(meta('og:image:secure_url')).toBe(meta('og:image'));
    expect(meta('og:image:alt')).toBe('Malzeme tablosu');
    expect(meta('og:image:type')).toBe('image/webp');
    expect(meta('article:published_time')).toBe('2026-10-01T09:00:00.000Z');
    expect(meta('article:modified_time')).toBe('2026-10-03T09:00:00.000Z');
    expect(graph().find((n:Record<string,unknown>)=>n['@type']==='Article').image).toBe(meta('og:image'));
    expect(graph().find((n:Record<string,unknown>)=>n['@type']==='WebPage').primaryImageOfPage.url).toBe(meta('og:image'));
  });
  it('uses administrator override without borrowing page image dimensions or inventing dates',async()=>{
    mocks.override={og_image_url:'/custom.jpg'};
    render(<HelmetProvider><Seo title="Rehber" description="Üretim" path="/rehber/uretim" type="article" image="/page.png" imageWidth={1200} imageHeight={630} published="invalid" modified="2999-01-01" /></HelmetProvider>);
    await waitFor(()=>expect(meta('og:image')).toBe('https://3dyanimda.com/custom.jpg'));
    expect(meta('og:image:width')).toBeUndefined();
    expect(meta('og:image:height')).toBeUndefined();
    expect(meta('article:published_time')).toBeUndefined();
    expect(meta('article:modified_time')).toBeUndefined();
  });
});
