import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ closed: true, volume: 100, pricingError: false, materialError: false, campaigns: [] as any[], filters: vi.fn() }));
vi.mock('@/contexts/TenantContext', () => ({ useTenant: () => ({ tenant: { id: 'brand-a' } }) }));
vi.mock('@/lib/supabase', () => ({ demoMode: false, supabase: { from: (table: string) => {
  const result = () => table === 'materials' ? { error: api.materialError, data: api.materialError ? null : [
    { id: 'pla', name: 'PLA', technology: 'FDM', density_g_cm3: 1.24, price_per_gram: 6, setup_fee: 35, min_price: 90, description: 'PLA açıklaması', color: 'Siyah' },
    { id: 'asa', name: 'ASA', technology: 'FDM', density_g_cm3: 0, price_per_gram: 0, setup_fee: 0, min_price: 0 },
    { id: 'resin', name: 'Şeffaf Reçine', technology: 'SLA', density_g_cm3: 1.2, price_per_gram: 8, setup_fee: 40, min_price: 100 },
  ] } : table === 'pricing_settings' ? { error: api.pricingError, data: ['margin_percent','vat_percent','labor_per_hour','min_order_price'].map((key,i) => ({ key, value: [30,20,150,150][i] })) } : { data: api.campaigns };
  const chain = { select: () => chain, eq: (key: string, value: unknown) => { api.filters(table,key,value); return chain; }, order: () => chain, then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(result()).then(resolve,reject) };
  return chain;
} } }));
vi.mock('./StlViewer', () => ({ default: ({onMetrics}: {onMetrics: (metrics: unknown) => void}) => <button onClick={() => onMetrics({volumeCm3: api.volume, bboxCm: {x:10,y:5,z:2}, triangles:12,parts:1,format:"STL",unitAssumed:true,closed:api.closed})}>Modeli ölç</button> }));
import QuoteStudio from './QuoteStudio';
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); api.closed = true; api.volume = 100; api.pricingError = false; api.materialError = false; api.campaigns = []; });
const props = () => ({file:null, onFile:vi.fn(), onSpec:vi.fn(), service:'3D Baskı'});
const change = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), {target:{value}});
describe('quote production preferences', () => {
  for(const volume of [100,0])it(`estimates an open mesh with volume ${volume}, including the reference minimum-price fallback`,async()=>{
    api.closed=false;api.volume=volume;
    const p={...props(),file:new File(['surface'],'open.obj')};const view=render(<QuoteStudio {...p} stage="file"/>);
    await waitFor(()=>expect(screen.getByLabelText('Malzeme tercihi')).toHaveValue('pla'));
    fireEvent.click(await screen.findByRole('button',{name:'Modeli ölç'}));
    await waitFor(()=>expect(p.onSpec.mock.lastCall?.[0].estimatedTotal).toBeGreaterThan(0));
    expect(view.container.querySelector('.studio-live-estimate')).toHaveTextContent(volume?'yaklaşık hacim':'minimum hizmet');
  });
  it('shows a measured estimate in the file step using the first configured FDM material', async () => {
    const p={...props(),file:new File(['solid test'],'test.stl')};
    const view=render(<QuoteStudio {...p} stage="file"/>);
    await waitFor(()=>expect(screen.getByLabelText('Malzeme tercihi')).toHaveValue('pla'));
    fireEvent.click(await screen.findByRole('button',{name:'Modeli ölç'}));
    await waitFor(()=>expect(view.container.querySelector('.studio-live-estimate strong')).toBeTruthy());
    expect(p.onSpec.mock.lastCall?.[0].estimatedTotal).toBeGreaterThan(0);
    expect(view.container.querySelector('.studio-live-estimate')).toHaveTextContent('PLA · 1 adet');
  });
  it('does not fabricate an estimate when live pricing settings are unavailable', async () => {
    api.pricingError=true;
    const p={...props(),file:new File(['solid test'],'test.stl')};
    const view=render(<QuoteStudio {...p} stage="file"/>);
    await waitFor(()=>expect(screen.getByLabelText('Malzeme tercihi')).toHaveValue('pla'));
    fireEvent.click(await screen.findByRole('button',{name:'Modeli ölç'}));
    await waitFor(()=>expect(view.container.querySelector('.studio-live-estimate')).toHaveTextContent('anlık fiyat henüz etkin değil'));
    expect(view.container.querySelector('.studio-live-estimate strong')).toBeNull();
    expect(p.onSpec.mock.lastCall?.[0].estimatedTotal).toBeNull();
  });
  it('keeps one interactive model in its persistent pane through every step', async () => {
    const layout = (preview: React.ReactNode, options: React.ReactNode) => <div><aside data-testid="persistent-preview">{preview}</aside><main>{options}</main></div>;
    const p={...props(),file:new File(['solid test'],'persistent.stl')};
    const view=render(<QuoteStudio {...p} stage="file" renderWorkspace={layout}/>);
    try {
      const target=screen.getByTestId('persistent-preview');
      const model=await screen.findByRole('button',{name:'Modeli ölç'});
      for (const stage of ['options','contact','file'] as const) {
        view.rerender(<QuoteStudio {...p} stage={stage} renderWorkspace={layout}/>);
        expect(target.contains(model)).toBe(true);
        expect(model).toBeVisible();
        fireEvent.click(model);
        expect(p.onSpec.mock.lastCall?.[0].summary).toContain('100.00 cm³');
        expect(screen.getByLabelText('3D dosyası')).toBeVisible();
        expect(document.querySelector('.studio-options')?.hasAttribute('hidden')).toBe(stage !== 'options');
      }
      fireEvent.change(screen.getByLabelText('3D dosyası'),{target:{files:[]}});
      expect(p.onFile).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button',{name:'Dosyayı kaldır'}));
      expect(p.onFile).toHaveBeenCalledWith(null);
    } finally { view.unmount(); }
  });

  it('preserves material and measured estimate when moving between file and options steps', async () => {
    const p={...props(),file:new File(['solid test'],'test.stl')};
    const view=render(<QuoteStudio {...p} stage="file"/>);
    await waitFor(()=>expect(document.querySelector('option[value="pla"]')).toBeTruthy());
    fireEvent.click(await screen.findByRole('button',{name:'Modeli ölç'}));
    view.rerender(<QuoteStudio {...p} stage="options"/>);
    change('Malzeme tercihi','pla');
    expect(p.onSpec.mock.lastCall?.[0].estimatedTotal).toBeGreaterThan(0);
    view.rerender(<QuoteStudio {...p} stage="file"/>);
    view.rerender(<QuoteStudio {...p} stage="options"/>);
    expect(screen.getByLabelText('Malzeme tercihi')).toHaveValue('pla');
    expect(p.onSpec.mock.lastCall?.[0].estimatedTotal).toBeGreaterThan(0);
  });
  it('shows configured campaign content and removes its discount when eligibility changes', async () => {
    api.campaigns=[{name:'Seri üretim',badge:'SERİ',message:'Beş adet ve üzeri',discount_type:'percent',discount_value:10,min_quote_amount:0,min_quantity:5}];
    const p={...props(),file:new File(['solid test'],'test.stl')}; render(<QuoteStudio {...p}/>);
    await screen.findByRole('option',{name:'PLA'}); change('Malzeme tercihi','pla');
    fireEvent.click(await screen.findByRole('button',{name:'Modeli ölç'}));
    change('Adet','5'); expect(await screen.findByText('Beş adet ve üzeri')).toBeInTheDocument();
    expect(p.onSpec.mock.lastCall?.[0].discount).toBeGreaterThan(0);
    change('Adet','1'); expect(p.onSpec.mock.lastCall?.[0].discount).toBe(0);
    expect(screen.queryByText('Beş adet ve üzeri')).not.toBeInTheDocument();
  });
  it('loads all active technologies for the selected brand and resets incompatible material choices', async () => {
    const p=props(); render(<QuoteStudio {...p}/>);
    await screen.findByRole('option',{name:'Şeffaf Reçine'});
    expect(api.filters).toHaveBeenCalledWith('materials','tenant_id','brand-a');
    expect(api.filters).toHaveBeenCalledWith('materials','active',true);
    change('Malzeme tercihi','pla');
    expect(p.onSpec.mock.lastCall?.[0].summary).toContain('Teknoloji: FDM');
    change('Üretim teknolojisi','SLA');
    expect(screen.queryByRole('option',{name:'PLA'})).not.toBeInTheDocument();
    expect(p.onSpec.mock.lastCall?.[0].material).toBe('Malzeme önerisi istiyorum');
    change('Malzeme tercihi','resin');
    expect(p.onSpec.mock.lastCall?.[0].summary).toContain('Teknoloji: SLA');
    expect(screen.queryByLabelText('Baskı kalitesi')).not.toBeInTheDocument();
  });
  it('includes custom material, color, use and every finishing choice in the persisted specification', async () => {
    const p=props(); render(<QuoteStudio {...p}/>); await screen.findByRole('option',{name:'PLA'});
    change('Malzeme tercihi','custom'); change('İstediğiniz malzeme','Özel PA ürünü');
    change('Kullanım amacı','Yedek parça'); change('Renk tercihi','Özel renk'); change('Özel renk referansı','#ca4214');
    fireEvent.click(screen.getByText('Son işlem ve baskı detayları'));
    fireEvent.click(screen.getByLabelText('Zımpara')); fireEvent.click(screen.getByLabelText('Dişli insert'));
    const spec=p.onSpec.mock.lastCall?.[0]; expect(spec.material).toBe('Özel PA ürünü');
    for(const value of ['Yedek parça','#ca4214','Zımpara','Dişli insert'])expect(spec.summary).toContain(value);
  });
  it('limits estimates to configured FDM, suppressing unpriced materials, resin and extra operations', async () => {
    const p={...props(),file:new File(['solid test'],'test.stl')}; render(<QuoteStudio {...p}/>);
    await screen.findByRole('option',{name:'PLA'}); change('Malzeme tercihi','pla');
    fireEvent.click(await screen.findByRole('button',{name:'Modeli ölç'}));
    await waitFor(()=>expect(p.onSpec.mock.lastCall?.[0].summary).toContain('Müşteri tarafı ön tahmin'));
    change('Malzeme tercihi','asa'); expect(p.onSpec.mock.lastCall?.[0].summary).not.toContain('Müşteri tarafı ön tahmin');
    change('Malzeme tercihi','resin'); expect(p.onSpec.mock.lastCall?.[0].summary).not.toContain('Müşteri tarafı ön tahmin');
    change('Malzeme tercihi','pla'); fireEvent.click(screen.getByText('Son işlem ve baskı detayları')); fireEvent.click(screen.getByLabelText('Montaj'));
    expect(p.onSpec.mock.lastCall?.[0].summary).not.toContain('Müşteri tarafı ön tahmin');
    fireEvent.click(screen.getByLabelText('Montaj')); change('Renk tercihi','Çok renkli');
    expect(p.onSpec.mock.lastCall?.[0].summary).not.toContain('Müşteri tarafı ön tahmin');
  });
  it('keeps the material catalogue usable when pricing is unavailable', async () => {
    api.pricingError=true; const p=props(); render(<QuoteStudio {...p}/>);
    await screen.findByRole('option',{name:'Şeffaf Reçine'}); change('Malzeme tercihi','resin');
    expect(p.onSpec.mock.lastCall?.[0].material).toBe('Şeffaf Reçine');
  });
  it('supports custom requests when catalogue loading fails', async () => {
    api.materialError=true; const p=props(); render(<QuoteStudio {...p}/>);
    await screen.findByText(/Katalog şu an yüklenemedi/); change('Malzeme tercihi','custom'); change('İstediğiniz malzeme','TPU');
    expect(p.onSpec.mock.lastCall?.[0].material).toBe('TPU');
  });
  it('does not attach printing preferences to scanning requests', async () => {
    const p=props(); const view=render(<QuoteStudio {...p}/>); await screen.findByRole('option',{name:'PLA'}); change('Malzeme tercihi','pla');
    view.rerender(<QuoteStudio {...p} service="3D Tarama"/>);
    expect(p.onSpec.mock.lastCall?.[0].material).toBe('Belirlenecek');
    expect(p.onSpec.mock.lastCall?.[0].summary).not.toContain('Malzeme: PLA');
  });
});
