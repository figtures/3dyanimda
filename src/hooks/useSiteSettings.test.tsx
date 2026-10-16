import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn(), tenantId: 'tenant-a' }));
vi.mock('@/contexts/TenantContext', () => ({ useTenant: () => ({ tenant: { id: mocks.tenantId } }) }));
vi.mock('@/lib/tenant', () => ({ getTenantId: () => mocks.tenantId }));
vi.mock('@/lib/public-render-state', () => ({ publicRenderState: () => null }));
vi.mock('@/lib/media', () => ({ resolveMediaUrl: (value: string) => value }));
vi.mock('@/lib/backend-config', () => ({
  getSupabase: async () => ({ from: () => ({ select: () => ({ eq: mocks.read }), upsert: mocks.write }) }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.tenantId = 'tenant-a';
  mocks.read.mockResolvedValue({ data: [], error: null });
  mocks.write.mockResolvedValue({ error: null });
});
afterEach(cleanup);

describe('site settings loading', () => {
  it('rejects failed explicit refreshes without erasing the last good snapshot or notifying empty data', async () => {
    const api = await import('./useSiteSettings');
    const contact = { email: 'info@3dyanimda.com', future_setting: { preserve: true } };
    mocks.read.mockResolvedValueOnce({ data: [{ key: 'contact_info', value: contact }], error: null });
    await expect(api.refreshSiteSettings('tenant-a')).resolves.toEqual({ contact_info: contact });
    const { result } = renderHook(() => api.useSiteSettings());
    mocks.read.mockResolvedValueOnce({ data: null, error: new Error('Network failed') });
    await act(async () => {
      await expect(api.refreshSiteSettings('tenant-a')).rejects.toThrow('Network failed');
    });
    expect(result.current).toEqual({ contact_info: contact });
    expect(api.exportPublicSettings('tenant-a')).toEqual({ contact_info: contact });
    expect(mocks.write).not.toHaveBeenCalled();
  });

  it('handles a failed background load without caching an empty success and permits a successful retry', async () => {
    const api = await import('./useSiteSettings');
    mocks.read.mockResolvedValueOnce({ data: null, error: new Error('Read failed') });
    const { result, unmount } = renderHook(() => api.useSiteSettings());
    await waitFor(() => expect(mocks.read).toHaveBeenCalledTimes(1));
    await act(async () => { await Promise.resolve(); });
    expect(result.current).toEqual({});
    unmount();
    mocks.read.mockResolvedValueOnce({ data: [{ key: 'contact_info', value: { future_setting: 'safe' } }], error: null });
    const retry = renderHook(() => api.useSiteSettings());
    await waitFor(() => expect(retry.result.current).toEqual({ contact_info: { future_setting: 'safe' } }));
  });

  it('does not replace cached data when an unsuccessful write returns an error', async () => {
    const api = await import('./useSiteSettings');
    const original = { contact_info: { email: 'old@3dyanimda.com', extra: 'keep' } };
    mocks.read.mockResolvedValueOnce({ data: Object.entries(original).map(([key, value]) => ({ key, value })), error: null });
    await api.refreshSiteSettings();
    mocks.write.mockResolvedValueOnce({ error: new Error('Write denied') });
    await expect(api.setSiteSetting('contact_info', { email: 'new@3dyanimda.com' }, 'tenant-a')).rejects.toThrow('Write denied');
    expect(api.exportPublicSettings('tenant-a')).toEqual(original);
    expect(mocks.read).toHaveBeenCalledTimes(1);
  });

  it('rejects a refresh for a different tenant before accessing the backend', async () => {
    const api = await import('./useSiteSettings');
    await expect(api.refreshSiteSettings('tenant-b')).rejects.toThrow('Marka değişti');
    expect(mocks.read).not.toHaveBeenCalled();
  });
});
