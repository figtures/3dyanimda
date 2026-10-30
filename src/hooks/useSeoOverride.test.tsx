import {act, cleanup, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';

const state = vi.hoisted(() => ({tenantId: 'brand-a', read: vi.fn()}));
vi.mock('@/contexts/TenantContext', () => ({useTenant: () => ({tenant: {id: state.tenantId}})}));
vi.mock('@/lib/public-render-state', () => ({publicRenderState: () => null}));
vi.mock('@/lib/backend-config', () => ({getSupabase: async () => ({from: () => ({select: () => ({eq: (_column: string, tenant: string) => ({eq: (_path: string, path: string) => ({maybeSingle: () => state.read(tenant, path)})})})})})}));
beforeEach(() => {vi.resetModules(); state.tenantId = 'brand-a'; state.read.mockReset();});
afterEach(cleanup);
it('keeps language caches separate and does not replace English text with Turkish-only metadata',async()=>{
  state.read.mockResolvedValue({data:{title_tr:'Türkçe başlık',description_tr:'Türkçe açıklama'}});
  const {useSeoOverride}=await import('./useSeoOverride');
  const view=renderHook(({lang}:{lang:'tr'|'en'})=>useSeoOverride('/blog/uretim',lang),{initialProps:{lang:'tr' as 'tr'|'en'}});
  await waitFor(()=>expect(view.result.current?.title).toBe('Türkçe başlık'));
  view.rerender({lang:'en'});
  expect(view.result.current?.title).toBeUndefined();
  await waitFor(()=>expect(state.read).toHaveBeenCalledTimes(2));
  expect(view.result.current?.title).toBeUndefined();
  view.rerender({lang:'tr'});
  await waitFor(()=>expect(view.result.current?.title).toBe('Türkçe başlık'));
});

it('never returns the previous route or brand metadata during an unresolved request', async () => {
  state.read.mockResolvedValueOnce({data: {title_tr: 'Brand A home'}});
  const {useSeoOverride} = await import('./useSeoOverride');
  const frames: Array<string | undefined> = [];
  const view = renderHook(({path}) => {const value = useSeoOverride(path); frames.push(value?.title); return value;}, {initialProps: {path: '/'}});
  await waitFor(() => expect(view.result.current?.title).toBe('Brand A home'));
  let complete: (value: unknown) => void = () => {};
  state.read.mockImplementation(() => new Promise(resolve => {complete = resolve;}));
  frames.length = 0;
  view.rerender({path: '/3d-baski'});
  expect(frames).not.toContain('Brand A home');
  await waitFor(() => expect(state.read).toHaveBeenCalledWith('brand-a', '/3d-baski'));
  await act(async () => {complete({data: {title_tr: 'Brand A printing'}});});
  frames.length = 0;
  state.tenantId = 'brand-b'; view.rerender({path: '/3d-baski'});
  expect(frames).not.toContain('Brand A printing');
  await waitFor(() => expect(state.read).toHaveBeenCalledWith('brand-b', '/3d-baski'));
  await act(async () => {complete({data: {title_tr: 'Brand B printing'}});});
  expect(view.result.current?.title).toBe('Brand B printing');
});
