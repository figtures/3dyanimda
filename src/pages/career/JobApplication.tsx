import { getTenantId, previewSearch } from "@/lib/tenant";
import { useEffect, useState } from "react";
import { usePublicPage } from "@/content/public-page-query";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { demoMode } from "@/lib/backend-config";
import { toast } from "sonner";
import { ApplicationFrame, Field, FileUpload, Consent } from "./ApplicationFrame";
import type { CareerRole } from "./career-content";

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



const ALLOWED = [".pdf", ".doc", ".docx"];
const MAX_MB = 10;

export default function JobApplication() {
  const {search}=useLocation();
  const query=previewSearch(search);
  const {data: jobs=[], isPending: jobsPending}=usePublicPage("/kariyer");
  const positions=["Genel Başvuru",...(jobs as CareerRole[]).map(job=>job.title_tr)];
  const requested=new URLSearchParams(search).get("position")||"";
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", position: positions.includes(requested)?requested:"Genel Başvuru",
    experience_years: "", cover_letter: "", portfolio_url: "", linkedin_url: "",
    kvkk_consent: false,
  });

  const [positionChanged, setPositionChanged] = useState(false);
  useEffect(() => {
    if (!positionChanged && !jobsPending && requested) {
      setForm(previous => ({...previous, position: positions.includes(requested) ? requested : "Genel Başvuru"}));
    }
  }, [jobs, jobsPending, requested, positionChanged]);

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
    if (demoMode) { toast.info("Tasarım önizlemesindesiniz. Başvurunuz gönderilmedi."); return; }
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

  return <ApplicationFrame kind="job" query={query} title="Sizi tanımak isteriz."
    intro="Deneyiminiz, merakınız, üretmek istedikleriniz. İlk adımı birlikte atalım."
    submitting={submitting} success={success} onSubmit={onSubmit} submitLabel="Başvuruyu gönder"
    onReset={() => { setSuccess(false); setCv(null); setPositionChanged(true); setForm({full_name: '', email: '', phone: '', position: 'Genel Başvuru', experience_years: '', cover_letter: '', portfolio_url: '', linkedin_url: '', kvkk_consent: false}); }}
    steps={[
      {title: 'Tanışalım', description: 'Size nasıl ulaşabiliriz ve hangi alanda birlikte çalışabiliriz?', content: <>
        <Field label="Ad soyad *"><input autoComplete="name" value={form.full_name} onChange={e => update('full_name', e.target.value)} required minLength={2} maxLength={120} placeholder="Adınız ve soyadınız" /></Field>
        <div className="career-field-grid"><Field label="E-posta *"><input type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} required maxLength={255} placeholder="ornek@mail.com" /></Field><Field label="Telefon"><input type="tel" autoComplete="tel" value={form.phone} onChange={e => update('phone', e.target.value)} maxLength={40} placeholder="+90" /></Field></div>
        <Field label="İlgilendiğiniz pozisyon *"><select value={form.position} onChange={e => {setPositionChanged(true); update('position', e.target.value);}} required>{positions.map(position => <option key={position}>{position}</option>)}</select></Field>
      </>},
      {title: 'Deneyiminiz', description: 'Çalışmalarınızı paylaşın. Bu adımın tamamı isteğe bağlıdır.', content: <>
        <Field label="Deneyim (yıl)"><input type="number" min={0} max={60} step={1} value={form.experience_years} onChange={e => update('experience_years', e.target.value)} placeholder="0" /></Field>
        <Field label="Kendinizden bahsedin"><textarea value={form.cover_letter} onChange={e => update('cover_letter', e.target.value)} rows={5} maxLength={4000} placeholder="Neler ürettiniz, hangi konular sizi heyecanlandırıyor?" /></Field>
        <div className="career-field-grid"><Field label="Portföy veya web siteniz"><input type="url" value={form.portfolio_url} onChange={e => update('portfolio_url', e.target.value)} placeholder="https://" maxLength={300} /></Field><Field label="LinkedIn"><input type="url" value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/…" maxLength={300} /></Field></div>
        <div className="career-field"><span>Özgeçmişiniz</span><FileUpload file={cv} onFile={onFile} accept=".pdf,.doc,.docx" hint="PDF, DOC veya DOCX · En fazla 10 MB · İsteğe bağlı" /></div>
      </>},
      {title: 'Son bir kontrol', description: 'Bilgilerinizi kontrol edin ve başvurunuzu tamamlayın.', content: <>
        <dl className="career-review"><div><dt>Ad soyad</dt><dd>{form.full_name}</dd></div><div><dt>E-posta</dt><dd>{form.email}</dd></div><div><dt>Pozisyon</dt><dd>{form.position}</dd></div>{form.phone && <div><dt>Telefon</dt><dd>{form.phone}</dd></div>}{cv && <div><dt>Özgeçmiş</dt><dd>{cv.name}</dd></div>}</dl>
        <p className="career-review-note">Bir bilgiyi değiştirmek için önceki adımlara dönebilirsiniz. Yazdıklarınız korunur.</p>
        <Consent checked={form.kvkk_consent} onChange={value => update('kvkk_consent', value)} query={query}>iş başvuru süreci kapsamında kişisel verilerimin ve CV'min işlenmesine, en fazla 2 yıl saklanmasına onay veriyorum.</Consent>
      </>},
    ]} />;
}
