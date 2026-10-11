import {describe,it,expect,vi} from 'vitest';
vi.mock('./backend-config',()=>({backendUrl:'https://example.supabase.co'}));
import {resolveMediaUrl} from './media';
describe('Public media URLs without eager SDK initialization',()=>{
 it('normalizes storage prefixes and encodes object path segments',()=>{
  for(const p of ['site-images/tenant/a b.webp','storage/v1/object/public/site-images/tenant/a b.webp','public/site-images/tenant/a b.webp'])expect(resolveMediaUrl(p)).toBe('https://example.supabase.co/storage/v1/object/public/site-images/tenant/a%20b.webp');
 });
 it('preserves external and local asset URLs',()=>{
  for(const p of ['https://cdn.example/image.webp','/images/hero.avif','blob:https://example/123'])expect(resolveMediaUrl(p)).toBe(p);
  expect(resolveMediaUrl(null)).toBe('');
 });
});
