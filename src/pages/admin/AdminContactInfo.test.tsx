import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  refresh: vi.fn(),
  toast: vi.fn(),
  permission: true,
  tenantId: 'tenant-a',
  settings: {} as Record<string, unknown>,
}));
vi.mock('@/hooks/useSiteSettings', () => ({
  useSiteSettings: () => mocks.settings,
  setSiteSetting: mocks.save,
  refreshSiteSettings: mocks.refresh,
}));
vi.mock('@/contexts/TenantContext', () => ({ useTenant: () => ({ tenant: { id: 'tenant-a', name: '3D Yanımda', domain: '3dyanimda.com' } }) }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ hasPermission: (permission: string) => permission === 'settings.edit' && mocks.permission }) }));
vi.mock('@/lib/tenant', () => ({ getTenantId: () => mocks.tenantId }));
vi.mock('@/hooks/use-toast', () => ({ toast: mocks.toast }));

import AdminContactInfo from './AdminContactInfo';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  mocks.permission = true;
  mocks.tenantId = 'tenant-a';
  mocks.settings = {
    contact_info: { instagram: 'https://instagram.com/our_workshop', floating_enabled: false, custom_future_setting: { preserve: true } },
    verified_business_identity: { email: 'info@3dyanimda.com', telephone: '+905364488230', address: { streetAddress: 'Atölye sokak 17', addressLocality: 'Ataşehir', addressRegion: 'İstanbul', addressCountry: 'TR' } },
  };
  mocks.refresh.mockImplementation(async () => mocks.settings);
  mocks.save.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('business profile editor', () => {
  it('saves cleared profile links to the captured tenant while preserving unrelated settings and legacy defaults', async () => {
    render(<AdminContactInfo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    expect(screen.getByLabelText('E-posta')).toHaveValue('info@3dyanimda.com');
    expect(screen.getByLabelText('Telefon (uluslararası format)')).toHaveValue('+905364488230');
    expect(screen.getByLabelText('Adres metni (TR)')).toHaveValue('Atölye sokak 17, Ataşehir, İstanbul, TR');
    fireEvent.change(screen.getByLabelText('Instagram profil bağlantısı'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Google İşletme Profili / Haritalar paylaşım bağlantısı'), { target: { value: 'https://maps.app.goo.gl/ourworkshop' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith('contact_info', {
      instagram: '',
      google_business_url: 'https://maps.app.goo.gl/ourworkshop',
      floating_enabled: false,
      custom_future_setting: { preserve: true },
    }, 'tenant-a'));
  });

  it('rejects a social link for the wrong platform and arbitrary iframe markup before saving', async () => {
    render(<AdminContactInfo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Instagram profil bağlantısı'), { target: { value: 'https://facebook.com/our_workshop' } });
    fireEvent.change(screen.getByLabelText('Harita yerleştirme bağlantısı'), { target: { value: '<iframe src="https://www.google.com/maps/embed?pb=123"></iframe>' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(await screen.findByText('Instagram işletme profilinizin tam HTTPS bağlantısını girin.')).toBeInTheDocument();
    expect(screen.getByLabelText('Harita yerleştirme bağlantısı')).toHaveAttribute('aria-invalid', 'true');
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('refuses a save when the active tenant changes after the form was loaded', async () => {
    render(<AdminContactInfo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Hakkımızda başlığı'), { target: { value: 'Atölyemiz' } });
    mocks.tenantId = 'tenant-b';
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Marka değişti. Lütfen bilgileri yeniden açın.' }));
  });

  it('updates visible and structured addresses together and can remove both', async () => {
    render(<AdminContactInfo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('İlçe'), { target: { value: 'Kadıköy' } });
    expect(screen.getByLabelText('Adres metni (TR)')).toHaveValue('Atölye sokak 17, Kadıköy, İstanbul, TR');
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith('contact_info', expect.objectContaining({ address_district: 'Kadıköy', address_street: 'Atölye sokak 17', address_tr: 'Atölye sokak 17, Kadıköy, İstanbul, TR' }), 'tenant-a'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Adres metni (TR)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.save).toHaveBeenLastCalledWith('contact_info', expect.objectContaining({ address_tr: '', address_street: '', address_district: '', address_city: '', address_country: '', address_postal_code: '' }), 'tenant-a'));
  });

  it('shows inherited service notes and preserves an explicit request to hide them', async () => {
    render(<AdminContactInfo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    expect(screen.getByLabelText('Ziyaret / randevu bilgisi')).toHaveValue('Atölye ziyareti ve elden teslim için önceden randevu alın. Ziyaret planını teklif talebinizde belirtebilirsiniz.');
    expect(screen.getByLabelText('Teslimat / kargo bilgisi')).not.toHaveValue('');
    expect(screen.getByLabelText('Yerinde hizmet bilgisi')).not.toHaveValue('');
    fireEvent.change(screen.getByLabelText('Ziyaret / randevu bilgisi'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith('contact_info', expect.objectContaining({ visit_note: '' }), 'tenant-a'));
    const saved = mocks.save.mock.calls[0][1];
    expect(saved).not.toHaveProperty('delivery_note');
    expect(saved).not.toHaveProperty('onsite_note');
  });

  it('prevents writing before a fresh settings load has finished', async () => {
    let finish: (value: Record<string, unknown>) => void;
    mocks.refresh.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const { container } = render(<AdminContactInfo />);
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.save).not.toHaveBeenCalled();
    await act(async () => { finish!(mocks.settings); });
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled();
  });

  it('blocks writing after refresh failure and preserves fetched unknown fields after retry', async () => {
    mocks.refresh.mockRejectedValueOnce(new Error('Network unavailable'));
    const { container } = render(<AdminContactInfo />);
    expect(await screen.findByRole('button', { name: 'Yeniden dene' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.save).not.toHaveBeenCalled();
    mocks.refresh.mockResolvedValueOnce({ ...mocks.settings, contact_info: { server_only_field: { keep: true }, floating_phone: false } });
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Hakkımızda başlığı'), { target: { value: 'Atölyemiz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith('contact_info', { server_only_field: { keep: true }, floating_phone: false, about_title: 'Atölyemiz' }, 'tenant-a'));
  });

  it('retains unsaved changes and unknown fields when a write fails', async () => {
    mocks.save.mockRejectedValueOnce(new Error('Write denied'));
    render(<AdminContactInfo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('E-posta'), { target: { value: 'contact@3dyanimda.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Kaydedilemedi', description: 'Write denied' })));
    expect(screen.getByLabelText('E-posta')).toHaveValue('contact@3dyanimda.com');
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[1][1]).toEqual(expect.objectContaining({ email: 'contact@3dyanimda.com', custom_future_setting: { preserve: true }, floating_enabled: false }));
  });

  it('does not allow writing without the settings.edit permission', async () => {
    mocks.permission = false;
    const { container } = render(<AdminContactInfo />);
    await waitFor(() => expect(screen.queryByText('Güncel işletme bilgileri yükleniyor…')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    expect(screen.getByLabelText('E-posta')).toBeDisabled();
    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
