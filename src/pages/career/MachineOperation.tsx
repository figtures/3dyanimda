import { getTenantId } from "@/lib/tenant";
import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, FileUp, Loader2, X, Cpu, TrendingUp, Wrench, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

  return (
    <>
      <Seo
        title="Makinemi Siz İşletin — İş Ortaklığı"
        description="3D yazıcınızı veya tarayıcınızı stüdyomuza alıyoruz, sizin adınıza işletip aylık gelir paylaşımı yapıyoruz. Şeffaf raporlama, sigortalı saklama."
        path="/kariyer/makine-isletim"
      />
      <PageHero
        eyebrow="Kariyer · Makine İşletim"
        title={<>Makinenizi <em className="text-accent-blue not-italic">geliriniz</em> haline getirelim.</>}
        lead="Atıl ya da düşük kapasiteli 3D baskı/tarama ekipmanınızı stüdyomuza alıyor; profesyonel bakım, müşteri yönlendirme ve şeffaf gelir paylaşımı sunuyoruz."
        breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Kariyer", to: "/kariyer" }, { label: "Makine İşletim" }]}
      />

      <section className="bg-background py-16">
        <div className="container-page max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Benefit icon={TrendingUp} title="Aylık gelir paylaşımı" desc="Net üretim cirosundan şeffaf pay." />
          <Benefit icon={Eye} title="7/24 izlenebilirlik" desc="Sipariş, üretim ve gelir raporu paneli." />
          <Benefit icon={Wrench} title="Profesyonel bakım" desc="Kalibrasyon, yedek parça, uzman teknisyen." />
          <Benefit icon={Cpu} title="Sigorta & sorumluluk" desc="Stüdyomuzda makineniz tam koruma altında." />
        </div>
      </section>

      <section className="bg-background pb-20 lg:pb-28">
        <div className="container-page max-w-3xl mx-auto">
          {success ? (
            <SuccessCard onReset={() => { setSuccess(false); setFile(null); setForm({ full_name: "", email: "", phone: "", company: "", machine_brand: "", machine_model: "", machine_type: "", build_volume: "", current_location: "", expected_volume: "", details: "", kvkk_consent: false }); }} />
          ) : (
            <form onSubmit={onSubmit} className="space-y-8 rounded-3xl bg-card border border-border p-6 lg:p-10 shadow-soft">
              <Section title="İletişim">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Ad Soyad *">
                    <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required maxLength={120} />
                  </Field>
                  <Field label="Firma">
                    <Input value={form.company} onChange={(e) => update("company", e.target.value)} maxLength={200} />
                  </Field>
                  <Field label="E-posta *">
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required maxLength={255} />
                  </Field>
                  <Field label="Telefon">
                    <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={40} />
                  </Field>
                </div>
              </Section>

              <Section title="Makine Bilgileri">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Marka *">
                    <Input value={form.machine_brand} onChange={(e) => update("machine_brand", e.target.value)} placeholder="Bambu, Prusa, Form..." required maxLength={100} />
                  </Field>
                  <Field label="Model *">
                    <Input value={form.machine_model} onChange={(e) => update("machine_model", e.target.value)} placeholder="X1C, MK4, Form 4..." required maxLength={100} />
                  </Field>
                  <Field label="Tip *">
                    <Select value={form.machine_type} onValueChange={(v) => update("machine_type", v)}>
                      <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                      <SelectContent>
                        {MACHINE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Baskı hacmi">
                    <Input value={form.build_volume} onChange={(e) => update("build_volume", e.target.value)} placeholder="256x256x256 mm" maxLength={100} />
                  </Field>
                  <Field label="Mevcut konum">
                    <Input value={form.current_location} onChange={(e) => update("current_location", e.target.value)} placeholder="İl / İlçe" maxLength={200} />
                  </Field>
                </div>
                <Field label="Beklediğiniz aylık üretim hacmi (opsiyonel)">
                  <Input value={form.expected_volume} onChange={(e) => update("expected_volume", e.target.value)} placeholder="Ör: ayda 200 saat / 8 kg filament" maxLength={200} />
                </Field>
              </Section>

              <Section title="Hizmet Kapsamı">
                <div className="grid sm:grid-cols-2 gap-2">
                  {SCOPE.map((s) => (
                    <label key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-card hover:bg-muted/40 p-3 cursor-pointer transition-colors">
                      <Checkbox checked={scope.has(s.id)} onCheckedChange={() => toggleScope(s.id)} />
                      <span className="text-[13px] text-foreground/85">{s.label}</span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="Detaylar & Görseller">
                <Field label="Notlar">
                  <Textarea value={form.details} onChange={(e) => update("details", e.target.value)} rows={5} placeholder="Makinenizin durumu, tercih ettiğiniz çalışma modeli, sorularınız..." maxLength={4000} />
                </Field>
                <Field label="Makine fotoğrafı veya teknik dosya (opsiyonel — max 15MB)">
                  <FileDrop file={file} onFile={onFile} accept=".pdf,.jpg,.jpeg,.png,.webp,.heic" />
                </Field>
              </Section>

              <Section title="KVKK Onayı">
                <label className="flex gap-3 items-start cursor-pointer rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                  <Checkbox checked={form.kvkk_consent} onCheckedChange={(v) => update("kvkk_consent", !!v)} className="mt-0.5" />
                  <span className="text-[13px] text-foreground/85 leading-relaxed">
                    <Link to="/basvuru-acik-riza-metni" target="_blank" className="text-accent-blue underline">Açık Rıza Metni</Link>'ni okudum;
                    talebimin değerlendirilmesi için kişisel ve makine verilerimin işlenmesine onay veriyorum.
                    <Link to="/kvkk-aydinlatma-metni" target="_blank" className="text-accent-blue underline ml-1">KVKK Aydınlatma Metni</Link>'ni de inceledim.
                  </span>
                </label>
              </Section>

              <Button type="submit" disabled={submitting} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary-glow rounded-full h-14 text-base">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gönderiliyor...</> : "Talebi Gönder"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[12px] font-medium text-foreground/80">{label}</Label>
    {children}
  </div>
);

const Benefit = ({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <Icon className="h-5 w-5 text-accent-blue mb-3" />
    <p className="font-display text-[15px] font-semibold text-primary">{title}</p>
    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
  </div>
);

const FileDrop = ({ file, onFile, accept }: { file: File | null; onFile: (f: File | null) => void; accept: string }) => (
  <div className="relative">
    {file ? (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <FileUp className="h-4 w-4 text-accent-blue shrink-0" />
          <span className="text-[13px] text-foreground truncate">{file.name}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        <button type="button" onClick={() => onFile(null)} className="text-muted-foreground hover:text-destructive p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-accent-blue p-8 cursor-pointer transition-colors">
        <FileUp className="h-5 w-5 text-accent-blue" />
        <span className="text-[13px] text-foreground/85">Dosya seçmek için tıklayın</span>
        <span className="text-[11px] text-muted-foreground">PDF, JPG, PNG — max 15MB</span>
        <input type="file" className="hidden" accept={accept} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </label>
    )}
  </div>
);

const SuccessCard = ({ onReset }: { onReset: () => void }) => (
  <div className="rounded-3xl bg-card border border-border p-10 text-center shadow-soft">
    <div className="mx-auto h-14 w-14 rounded-full bg-accent-blue-soft flex items-center justify-center mb-5">
      <CheckCircle2 className="h-7 w-7 text-accent-blue" />
    </div>
    <h3 className="font-display text-2xl font-semibold text-primary mb-2">Talebiniz alındı</h3>
    <p className="text-muted-foreground mb-6">3 iş günü içinde fizibilite çalışmamızla geri dönüş yapacağız.</p>
    <Button variant="outline" onClick={onReset} className="rounded-full">Yeni talep</Button>
  </div>
);