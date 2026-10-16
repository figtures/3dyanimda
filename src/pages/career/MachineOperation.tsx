import { getTenantId, previewSearch } from "@/lib/tenant";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { demoMode } from "@/lib/backend-config";
import { toast } from "sonner";
import { ApplicationFrame, Field, FileUpload, Consent } from "./ApplicationFrame";

const MACHINE_TYPES = ["FDM (Filament)", "SLA / DLP (Reçine)", "SLS (Toz)", "MJF", "3D Tarayıcı", "Diğer"];
const SCOPE = [
  { id: "operation", label: "Tam işletim (sipariş yönlendirme + üretim)" },
  { id: "maintenance", label: "Bakım & kalibrasyon" },
  { id: "storage", label: "Depolama & güvenlik" },
  { id: "marketing", label: "Pazarlama & müşteri bulma" },
];

const schema = z.object({
  full_name: z.string().trim().min(2, "Ad soyad gerekli").max(120),
  email: z.string().trim().email("Geçerli e-posta").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  machine_brand: z.string().trim().min(1, "Marka gerekli").max(100),
  machine_model: z.string().trim().min(1, "Model gerekli").max(100),
  machine_type: z.string().min(1, "Tip seçin"),
  build_volume: z.string().trim().max(100).optional().or(z.literal("")),
  current_location: z.string().trim().max(200).optional().or(z.literal("")),
  expected_volume: z.string().trim().max(200).optional().or(z.literal("")),
  details: z.string().trim().max(4000).optional().or(z.literal("")),
  kvkk_consent: z.literal(true, { errorMap: () => ({ message: "Açık rıza vermelisiniz" }) }),
});

const MAX_MB = 15;
const ALLOWED = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic"];

export default function MachineOperation() {
  const query=previewSearch(useLocation().search);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scope, setScope] = useState<Set<string>>(new Set(["operation"]));
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", company: "",
    machine_brand: "", machine_model: "", machine_type: "",
    build_volume: "", current_location: "", expected_volume: "",
    details: "", kvkk_consent: false,
  });

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((s) => ({ ...s, [k]: v }));
  const toggleScope = (id: string) => setScope((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const onFile = (f: File | null) => {
    if (!f) { setFile(null); return; }
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) { toast.error("PDF veya fotoğraf yükleyin"); return; }
    if (f.size > MAX_MB * 1024 * 1024) { toast.error(`Dosya en fazla ${MAX_MB}MB olabilir`); return; }
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Form eksik"); return; }
    if (demoMode) { toast.info("Tasarım önizlemesindesiniz. Talebiniz gönderilmedi."); return; }
    setSubmitting(true);
    try {
      let attachment_path: string | null = null;
      let attachment_name: string | null = null;
      if (file) {
        const path = `${getTenantId()}/machines/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("career-uploads").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        attachment_path = path;
        attachment_name = file.name;
      }
      const { error } = await supabase.from("machine_operation_requests").insert({
        tenant_id: (await import("@/lib/tenant")).getTenantId()!,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        machine_brand: parsed.data.machine_brand,
        machine_model: parsed.data.machine_model,
        machine_type: parsed.data.machine_type,
        build_volume: parsed.data.build_volume || null,
        current_location: parsed.data.current_location || null,
        expected_volume: parsed.data.expected_volume || null,
        service_scope: Array.from(scope),
        details: parsed.data.details || null,
        attachment_path,
        attachment_name,
        kvkk_consent: true,
      });
      if (error) throw error;

      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", { method: "machine_operation", machine_type: parsed.data.machine_type });
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Talep gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return <ApplicationFrame kind="machine" query={query} title="Kapasitenizi birlikte değerlendirelim."
    intro="Ekipmanınızı ve üretim olanaklarınızı tanıyalım. İş birliğinin kapsamını, sorumlulukları ve koşulları birlikte netleştirelim."
    submitting={submitting} success={success} onSubmit={onSubmit} submitLabel="İş birliği talebini gönder"
    onReset={() => { setSuccess(false); setFile(null); setScope(new Set(['operation'])); setForm({full_name: '', email: '', phone: '', company: '', machine_brand: '', machine_model: '', machine_type: '', build_volume: '', current_location: '', expected_volume: '', details: '', kvkk_consent: false}); }}
    steps={[
      {title: 'Tanışalım', description: 'Kişisel veya kurumsal başvurunuz için iletişim bilgilerinizi paylaşın.', content: <>
        <div className="career-field-grid"><Field label="Ad soyad *"><input autoComplete="name" value={form.full_name} onChange={e => update('full_name', e.target.value)} required minLength={2} maxLength={120} /></Field><Field label="Firma"><input autoComplete="organization" value={form.company} onChange={e => update('company', e.target.value)} maxLength={200} /></Field></div>
        <div className="career-field-grid"><Field label="E-posta *"><input type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} required maxLength={255} placeholder="ornek@mail.com" /></Field><Field label="Telefon"><input type="tel" autoComplete="tel" value={form.phone} onChange={e => update('phone', e.target.value)} maxLength={40} /></Field></div>
        <p className="career-review-note">Firma sahibi olmanız gerekmez. Bireysel ekipmanınızla da iş birliği talebinizi iletebilirsiniz.</p>
      </>},
      {title: 'Ekipmanınız', description: 'Makinenizi ve değerlendirmek istediğiniz kapasiteyi tanıyalım.', content: <>
        <Field label="Ekipman tipi *"><select value={form.machine_type} onChange={e => update('machine_type', e.target.value)} required><option value="">Ekipman tipini seçin</option>{MACHINE_TYPES.map(type => <option key={type}>{type}</option>)}</select></Field>
        <div className="career-field-grid"><Field label="Marka *"><input value={form.machine_brand} onChange={e => update('machine_brand', e.target.value)} required maxLength={100} placeholder="Örn. Bambu Lab" /></Field><Field label="Model *"><input value={form.machine_model} onChange={e => update('machine_model', e.target.value)} required maxLength={100} placeholder="Örn. X1C" /></Field></div>
        <div className="career-field-grid"><Field label="Baskı hacmi"><input value={form.build_volume} onChange={e => update('build_volume', e.target.value)} maxLength={100} placeholder="Örn. 256 × 256 × 256 mm" /></Field><Field label="Makinenin konumu"><input value={form.current_location} onChange={e => update('current_location', e.target.value)} maxLength={200} placeholder="İl / ilçe" /></Field></div>
        <Field label="Ayırabileceğiniz üretim kapasitesi"><input value={form.expected_volume} onChange={e => update('expected_volume', e.target.value)} maxLength={200} placeholder="Örn. ayda 200 saat" /></Field>
        <div className="career-field"><span>Fotoğraf veya teknik dosya</span><FileUpload file={file} onFile={onFile} accept=".pdf,.jpg,.jpeg,.png,.webp,.heic" hint="PDF veya fotoğraf · En fazla 15 MB · İsteğe bağlı" /></div>
      </>},
      {title: 'İş birliği', description: 'Beklentinizi paylaşın ve talebinizi tamamlayın.', content: <>
        <fieldset className="career-scope"><legend>İlgilendiğiniz çalışma kapsamı</legend>{SCOPE.map(item => <label key={item.id}><input type="checkbox" checked={scope.has(item.id)} onChange={() => toggleScope(item.id)} /><span>{item.label}</span></label>)}</fieldset>
        <Field label="Eklemek istedikleriniz"><textarea value={form.details} onChange={e => update('details', e.target.value)} rows={4} maxLength={4000} placeholder="Makinenizin durumu, çalışma modeli ve sorularınız…" /></Field>
        <dl className="career-review"><div><dt>İletişim</dt><dd>{form.full_name} · {form.email}</dd></div><div><dt>Ekipman</dt><dd>{form.machine_brand} {form.machine_model} · {form.machine_type}</dd></div></dl>
        <Consent checked={form.kvkk_consent} onChange={value => update('kvkk_consent', value)} query={query}>talebimin değerlendirilmesi için kişisel ve makine verilerimin işlenmesine onay veriyorum.</Consent>
      </>},
    ]} />;
}
