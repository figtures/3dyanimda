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
import { CheckCircle2, FileUp, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const POSITIONS = [
  "3D Tarama Operatörü",
  "Reverse Engineering Mühendisi",
  "Üretim & Baskı Operatörü",
  "CAD / CAM Tasarımcı",
  "Kalite Kontrol Mühendisi",
  "Müşteri Operasyonları",
  "Pazarlama / Büyüme",
  "Diğer",
];

const schema = z.object({
  full_name: z.string().trim().min(2, "Ad soyad gerekli").max(120),
  email: z.string().trim().email("Geçerli e-posta girin").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  position: z.string().min(1, "Pozisyon seçin"),
  experience_years: z.coerce.number().int().min(0).max(60).optional(),
  cover_letter: z.string().trim().max(4000).optional().or(z.literal("")),
  portfolio_url: z.string().trim().url("Geçerli URL").max(300).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Geçerli URL").max(300).optional().or(z.literal("")),
  kvkk_consent: z.literal(true, { errorMap: () => ({ message: "Açık rıza vermelisiniz" }) }),
});

type Form = z.infer<typeof schema>;

const ALLOWED = [".pdf", ".doc", ".docx"];
const MAX_MB = 10;

export default function JobApplication() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", position: "",
    experience_years: "", cover_letter: "", portfolio_url: "", linkedin_url: "",
    kvkk_consent: false,
  });

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((s) => ({ ...s, [k]: v }));

  const onFile = (f: File | null) => {
    if (!f) { setCv(null); return; }
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) { toast.error("Yalnızca PDF / DOC / DOCX yükleyebilirsiniz"); return; }
    if (f.size > MAX_MB * 1024 * 1024) { toast.error(`Dosya en fazla ${MAX_MB}MB olabilir`); return; }
    setCv(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      experience_years: form.experience_years === "" ? undefined : form.experience_years,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Form bilgileri eksik");
      return;
    }
    setSubmitting(true);
    try {
      let cv_file_path: string | null = null;
      let cv_file_name: string | null = null;
      if (cv) {
        const path = `${getTenantId()}/applications/${Date.now()}-${cv.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("career-uploads").upload(path, cv, {
          contentType: cv.type || "application/octet-stream",
          upsert: false,
        });
        if (upErr) throw upErr;
        cv_file_path = path;
        cv_file_name = cv.name;
      }
      const { error } = await supabase.from("job_applications").insert({
        tenant_id: (await import("@/lib/tenant")).getTenantId()!,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        position: parsed.data.position,
        experience_years: parsed.data.experience_years ?? null,
        cover_letter: parsed.data.cover_letter || null,
        portfolio_url: parsed.data.portfolio_url || null,
        linkedin_url: parsed.data.linkedin_url || null,
        cv_file_path,
        cv_file_name,
        kvkk_consent: true,
      });
      if (error) throw error;

      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", { method: "job_application", position: parsed.data.position });
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Başvuru gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo
        title="İş Başvurusu — Kariyer"
        description="3D Yanında ekibine katılın. Mühendislik, üretim ve operasyon pozisyonları için online başvuru."
        path="/kariyer/is-basvurusu"
      />
      <PageHero
        eyebrow="Kariyer · İş Başvurusu"
        title={<>Kadromuza <em className="text-accent-blue not-italic">katılın</em>.</>}
        lead="Aşağıdaki formu doldurun; başvurunuzu 5 iş günü içinde değerlendirip size dönüş yapıyoruz."
        breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Kariyer", to: "/kariyer" }, { label: "İş Başvurusu" }]}
      />

      <section className="bg-background py-16 lg:py-24">
        <div className="container-page max-w-3xl mx-auto">
          {success ? (
            <SuccessCard onReset={() => { setSuccess(false); setCv(null); setForm({ full_name: "", email: "", phone: "", position: "", experience_years: "", cover_letter: "", portfolio_url: "", linkedin_url: "", kvkk_consent: false }); }} />
          ) : (
            <form onSubmit={onSubmit} className="space-y-8 rounded-3xl bg-card border border-border p-6 lg:p-10 shadow-soft">
              <Section title="Kişisel Bilgiler">
                <Field label="Ad Soyad *">
                  <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Adınız Soyadınız" required maxLength={120} />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="E-posta *">
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="ornek@mail.com" required maxLength={255} />
                  </Field>
                  <Field label="Telefon">
                    <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+90 5xx xxx xx xx" maxLength={40} />
                  </Field>
                </div>
              </Section>

              <Section title="Pozisyon & Deneyim">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Pozisyon *">
                    <Select value={form.position} onValueChange={(v) => update("position", v)}>
                      <SelectTrigger><SelectValue placeholder="Pozisyon seçin" /></SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Deneyim (yıl)">
                    <Input type="number" min={0} max={60} value={form.experience_years} onChange={(e) => update("experience_years", e.target.value)} placeholder="0" />
                  </Field>
                </div>
                <Field label="Ön Yazı">
                  <Textarea value={form.cover_letter} onChange={(e) => update("cover_letter", e.target.value)} placeholder="Kendinizden, deneyiminizden ve neden 3D Yanında ekibine katılmak istediğinizden bahsedin." rows={6} maxLength={4000} />
                </Field>
              </Section>

              <Section title="Bağlantılar & CV">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="LinkedIn">
                    <Input type="url" value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." maxLength={300} />
                  </Field>
                  <Field label="Portföy / Web">
                    <Input type="url" value={form.portfolio_url} onChange={(e) => update("portfolio_url", e.target.value)} placeholder="https://..." maxLength={300} />
                  </Field>
                </div>

                <Field label="CV (PDF / DOC / DOCX — max 10MB)">
                  <FileDrop file={cv} onFile={onFile} />
                </Field>
              </Section>

              <Section title="KVKK Onayı">
                <label className="flex gap-3 items-start cursor-pointer rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                  <Checkbox checked={form.kvkk_consent} onCheckedChange={(v) => update("kvkk_consent", !!v)} className="mt-0.5" />
                  <span className="text-[13px] text-foreground/85 leading-relaxed">
                    <Link to="/basvuru-acik-riza-metni" target="_blank" className="text-accent-blue underline">Açık Rıza Metni</Link>'ni okudum;
                    iş başvuru süreci kapsamında kişisel verilerimin ve CV'min işlenmesine, en fazla 2 yıl saklanmasına onay veriyorum.
                    <Link to="/kvkk-aydinlatma-metni" target="_blank" className="text-accent-blue underline ml-1">KVKK Aydınlatma Metni</Link>'ni de inceledim.
                  </span>
                </label>
              </Section>

              <Button type="submit" disabled={submitting} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary-glow rounded-full h-14 text-base">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gönderiliyor...</> : "Başvuruyu Gönder"}
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
    <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[12px] font-medium text-foreground/80">{label}</Label>
    {children}
  </div>
);

const FileDrop = ({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) => (
  <div className="relative">
    {file ? (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <FileUp className="h-4 w-4 text-accent-blue shrink-0" />
          <span className="text-[13px] text-foreground truncate">{file.name}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        <button type="button" aria-label="Dosyayı kaldır" onClick={() => onFile(null)} className="text-muted-foreground hover:text-destructive p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-accent-blue p-8 cursor-pointer transition-colors">
        <FileUp className="h-5 w-5 text-accent-blue" />
        <span className="text-[13px] text-foreground/85">CV'nizi seçmek için tıklayın</span>
        <span className="text-[11px] text-muted-foreground">PDF, DOC, DOCX — max 10MB</span>
        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </label>
    )}
  </div>
);

const SuccessCard = ({ onReset }: { onReset: () => void }) => (
  <div className="rounded-3xl bg-card border border-border p-10 text-center shadow-soft">
    <div className="mx-auto h-14 w-14 rounded-full bg-accent-blue-soft flex items-center justify-center mb-5">
      <CheckCircle2 className="h-7 w-7 text-accent-blue" />
    </div>
    <h3 className="font-display text-2xl font-semibold text-primary mb-2">Başvurunuz alındı</h3>
    <p className="text-muted-foreground mb-6">5 iş günü içinde size geri dönüş yapacağız. Teşekkürler!</p>
    <Button variant="outline" onClick={onReset} className="rounded-full">Yeni başvuru</Button>
  </div>
);