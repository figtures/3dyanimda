import { cloneElement, type FormEvent, type ReactElement, type ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JobApplication from './JobApplication';
import MachineOperation from './MachineOperation';

const api = vi.hoisted(() => ({
  insert: vi.fn(),
  from: vi.fn(),
  upload: vi.fn(),
  storageFrom: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  jobs: [{ title_tr: 'Üretim Uzmanı' }],
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { from: api.from, storage: { from: api.storageFrom } },
}));
vi.mock('@/lib/backend-config', () => ({ demoMode: false }));
vi.mock('@/lib/tenant', () => ({ getTenantId: () => 'career-test-tenant', previewSearch: () => '' }));
vi.mock('@/content/public-page-query', () => ({ usePublicPage: () => ({ data: api.jobs, isPending: false }) }));
vi.mock('react-router-dom', () => ({ useLocation: () => ({ search: '' }) }));
vi.mock('sonner', () => ({ toast: { error: api.error, info: api.info } }));

// Keep each page's real state, submit handler and Zod schema. The shell exposes
// every step and bypasses native HTML validation so assertions reach safeParse.
vi.mock('./ApplicationFrame', () => ({
  ApplicationFrame: ({ steps, onSubmit, submitting, success, submitLabel }: {
    steps: { title: string; content: ReactNode }[];
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    submitting: boolean;
    success: boolean;
    submitLabel: string;
  }) => success ? <p role="status">Gönderildi</p> : <form aria-label="Başvuru" noValidate onSubmit={onSubmit}>
    {steps.map(step => <section key={step.title}>{step.content}</section>)}
    <button type="submit" disabled={submitting}>{submitLabel}</button>
  </form>,
  Field: ({ label, children }: { label: string; children: ReactElement<Record<string, unknown>> }) =>
    <label>{label}{cloneElement(children, { 'aria-label': label })}</label>,
  FileUpload: () => null,
  Consent: ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) =>
    <label>KVKK onayı<input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /></label>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.insert.mockResolvedValue({ error: null });
  api.from.mockReturnValue({ insert: api.insert });
  api.upload.mockResolvedValue({ error: null });
  api.storageFrom.mockReturnValue({ upload: api.upload });
  vi.stubGlobal('gtag', vi.fn());
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const change = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.submit(screen.getByRole('form', { name: 'Başvuru' }));
const consent = () => fireEvent.click(screen.getByRole('checkbox', { name: 'KVKK onayı' }));
const fillContact = () => {
  change('Ad soyad *', '  Ada Üretim  ');
  change('E-posta *', 'ada+teklif@example.com');
};
const fillMachine = () => {
  fillContact();
  change('Ekipman tipi *', 'FDM (Filament)');
  change('Marka *', '  Bambu Lab  ');
  change('Model *', '  X1C  ');
};

describe('career application validation after the Zod upgrade', () => {
  it.each([
    { name: 'job', Component: JobApplication, fill: fillContact },
    { name: 'machine', Component: MachineOperation, fill: fillMachine },
  ])('rejects $name submission without explicit consent using the Turkish schema error', async ({ Component, fill }) => {
    render(<Component />);
    fill();
    submit();
    await waitFor(() => expect(api.error).toHaveBeenCalledExactlyOnceWith('Açık rıza vermelisiniz'));
    expect(api.from).not.toHaveBeenCalled();
    expect(api.insert).not.toHaveBeenCalled();
    expect(api.storageFrom).not.toHaveBeenCalled();
  });

  it('submits an accepted job application with trimmed contact data and empty experience as null', async () => {
    render(<JobApplication />);
    fillContact();
    change('Telefon', '   ');
    consent();
    submit();
    await screen.findByRole('status');
    expect(api.from).toHaveBeenCalledExactlyOnceWith('job_applications');
    expect(api.insert).toHaveBeenCalledExactlyOnceWith({
      tenant_id: 'career-test-tenant',
      full_name: 'Ada Üretim',
      email: 'ada+teklif@example.com',
      phone: null,
      position: 'Genel Başvuru',
      experience_years: null,
      cover_letter: null,
      portfolio_url: null,
      linkedin_url: null,
      cv_file_path: null,
      cv_file_name: null,
      kvkk_consent: true,
    });
    expect(api.error).not.toHaveBeenCalled();
    expect(api.upload).not.toHaveBeenCalled();
  });

  it('coerces a supplied job experience value to a number and preserves valid optional URLs', async () => {
    render(<JobApplication />);
    fillContact();
    change('İlgilendiğiniz pozisyon *', 'Üretim Uzmanı');
    change('Deneyim (yıl)', '7');
    change('Portföy veya web siteniz', 'https://example.com/portfolyo#parca');
    change('LinkedIn', 'https://www.linkedin.com/in/test-applicant');
    consent();
    submit();
    await screen.findByRole('status');
    expect(api.insert).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      position: 'Üretim Uzmanı',
      experience_years: 7,
      portfolio_url: 'https://example.com/portfolyo#parca',
      linkedin_url: 'https://www.linkedin.com/in/test-applicant',
      kvkk_consent: true,
    }));
    expect(api.error).not.toHaveBeenCalled();
  });

  it('submits accepted machine data with normalization and the chosen service scope', async () => {
    render(<MachineOperation />);
    fillMachine();
    change('Firma', '  Test Atölyesi  ');
    change('Telefon', '  +905551112233  ');
    change('Baskı hacmi', '  256 × 256 × 256 mm  ');
    change('Makinenin konumu', '   ');
    change('Eklemek istedikleriniz', '  Düzenli bakım yapılıyor.  ');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Bakım & kalibrasyon' }));
    consent();
    submit();
    await screen.findByRole('status');
    expect(api.from).toHaveBeenCalledExactlyOnceWith('machine_operation_requests');
    expect(api.insert).toHaveBeenCalledExactlyOnceWith({
      tenant_id: 'career-test-tenant',
      full_name: 'Ada Üretim',
      email: 'ada+teklif@example.com',
      phone: '+905551112233',
      company: 'Test Atölyesi',
      machine_brand: 'Bambu Lab',
      machine_model: 'X1C',
      machine_type: 'FDM (Filament)',
      build_volume: '256 × 256 × 256 mm',
      current_location: null,
      expected_volume: null,
      service_scope: ['operation', 'maintenance'],
      details: 'Düzenli bakım yapılıyor.',
      attachment_path: null,
      attachment_name: null,
      kvkk_consent: true,
    });
    expect(api.error).not.toHaveBeenCalled();
    expect(api.upload).not.toHaveBeenCalled();
  });

  it('rejects invalid job email and portfolio URLs before attempting persistence', async () => {
    render(<JobApplication />);
    fillContact();
    consent();
    change('E-posta *', 'not-an-email');
    submit();
    await waitFor(() => expect(api.error).toHaveBeenLastCalledWith('Geçerli e-posta girin'));
    expect(api.insert).not.toHaveBeenCalled();

    api.error.mockClear();
    change('E-posta *', 'ada+teklif@example.com');
    change('Portföy veya web siteniz', 'not a URL');
    submit();
    await waitFor(() => expect(api.error).toHaveBeenCalledExactlyOnceWith('Geçerli URL'));
    expect(api.from).not.toHaveBeenCalled();
    expect(api.insert).not.toHaveBeenCalled();
  });
});
