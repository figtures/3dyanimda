import { previewSearch } from "@/lib/tenant";
import { useState, useRef, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useBrand } from "@/brands/config";
import { useTenant } from "@/contexts/TenantContext";
import { getSupabase, demoMode } from "@/lib/backend-config";
import { Seo } from "@/components/site/Seo";
import { trackGrowth } from "@/lib/growth-analytics";
import "@/components/quote/quote-flow.css";
import { fmtTRY } from "@/lib/quote-engine";
import type { StudioSpec } from "@/components/quote/QuoteStudio";
const QuoteStudio = lazy(() => import("@/components/quote/QuoteStudio"));

export default function QuoteRequest() {
  const brand = useBrand();
  const { tenant } = useTenant();
  const { search, state } = useLocation();
  const [file, setFile] = useState<File | null>(() =>
      state?.studioFile instanceof File ? state.studioFile : null,
    ),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  const application = new URLSearchParams(search).get("application") || "";
  const region = new URLSearchParams(search).get("region") || "";
  const requestedService = ({"3d-baski":"3D Baskı","3d-tarama":"3D Tarama","3d-modelleme":"3D Modelleme"} as Record<string,string>)[new URLSearchParams(search).get("service") || ""];
  const started = useRef(false);
  const [step, setStep] = useState(1);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const [previewTarget, setPreviewTarget] = useState<HTMLDivElement | null>(null);
  function goToStep(next: number) {
    // Keep the document height stable when a shorter step replaces a longer one.
    // Focus remains accessible without moving the visitor's viewport.
    if (workspace.current) workspace.current.style.minHeight = `${workspace.current.getBoundingClientRect().height}px`;
    setStep(next);
    requestAnimationFrame(() => stepHeading.current?.focus({ preventScroll: true }));
  }
  const [service, setService] = useState(() =>
    ["3D Baskı", "3D Tarama", "3D Modelleme"].includes(state?.studioService)
      ? state.studioService
      : requestedService || "3D Baskı",
  );
  const [spec, setSpec] = useState<StudioSpec>({
    summary: "",
    material: "Belirlenecek",
    quantity: 1,
    campaignName: null,
    discount: 0,
  });
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (demoMode) {
      setError(
        "Bu bir tasarım önizlemesidir. Yeni Supabase projesi bağlandığında talepler kaydedilecek.",
      );
      return;
    }
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (busy) return;
    setBusy(true);
    try {
    const {schema} = await import("@/components/quote/quote-schema");
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError(
        "Lütfen ad, geçerli e-posta, adet ve en az 10 karakterlik proje açıklamasını kontrol edin.",
      );
      return;
    }
    if (!tenant) return;
    if (
      file &&
      (!/\.(stl|obj|3mf|step|stp|igs|iges)$/i.test(file.name) ||
        file.size > 20 * 1024 * 1024)
    ) {
      setError("STL, OBJ, 3MF, STEP veya IGES dosyası seçin. Üst sınır 20 MB.");
      return;
    }
    const { department, reference, target_date, environment, nda, ...request } =
      parsed.data;
    const description = [
      request.part_description,
      spec.summary,
      region && `Bölge: ${region.slice(0, 100)}`,
      department && `Departman: ${department}`,
      reference && `Proje / revizyon: ${reference}`,
      target_date && `Hedef tarih (teyide tabi): ${target_date}`,
      environment && `Kullanım ortamı: ${environment}`,
      nda && "Gizlilik sözleşmesi görüşmesi talep ediliyor.",
    ]
      .filter(Boolean)
      .join("\n\n");
      const supabase=await getSupabase();
      let path: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (
          !ext ||
          !["stl", "obj", "3mf", "step", "stp", "igs", "iges"].includes(ext) ||
          file.size > 20 * 1024 * 1024
        )
          throw new Error(
            "STL, OBJ, 3MF, STEP veya IGES dosyası seçin. Üst sınır 20 MB.",
          );
        path = `${tenant.id}/${crypto.randomUUID()}.${ext}`;
        const upload = await supabase.storage
          .from("stl-uploads")
          .upload(path, file, { upsert: false });
        if (upload.error) throw upload.error;
      }
      const { error: insertError } = await supabase
        .from("quote_requests")
        .insert({
          ...request,
          full_name: parsed.data.full_name!,
          email: parsed.data.email!,
          part_description: description,
          tenant_id: tenant.id,
          service_type: service,
          quantity: spec.quantity,
          material_pref: spec.material,
          applied_campaign_name: spec.campaignName,
          applied_discount_amount: spec.discount || null,
          stl_file_path: path,
          stl_file_name: file?.name ?? null,
          status: "new",
        });
      if (insertError) throw insertError;
      trackGrowth(brand.slug, "generate_lead", {service});
      setDone(true);
    } catch {
      trackGrowth(brand.slug, "quote_submit_error", {service});
      setError(
        "Talep kaydedilemedi. Lütfen tekrar deneyin; henüz bir onay oluşmadı.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Seo
        title="3D Studio & Teklif Al"
        description={`${brand.name} için 3D üretim talebi oluşturun.`}
        path="/teklif-al"
      />
      <section className="brand-inner quote-flow">
        <p className="brand-eyebrow">3D STUDIO & TEKLİF AL</p>
        <h1>Projenize teklif alın.</h1>
        <p className="section-lead">Dosyanızı paylaşın, üretim tercihlerinizi seçin ve talebinizi iletin. Dosyanız veya malzeme tercihiniz yoksa birlikte belirleyebiliriz.</p>
        {done ? (
          <div role="status" className="form-message">
            <CheckCircle2 className="mb-4" />
            <h2>Talebiniz kaydedildi.</h2>
            <p>
              Projeniz {brand.name} ekibinin değerlendirme listesine kaydedildi.
            </p>
          </div>
        ) : (
          <>
            <nav className="quote-steps" aria-label="Teklif adımları">
              {["Dosya & hizmet", "Üretim tercihleri", "İletişim & gönderim"].map((label, index) => <button type="button" key={label} aria-current={step === index + 1 ? "step" : undefined} onClick={() => goToStep(index + 1)}><span>{index + 1}</span>{label}</button>)}
            </nav>
            <div className="quote-workspace" ref={workspace}>
            <aside className="quote-preview" aria-label="Dosya çalışma alanı"><div ref={setPreviewTarget} /></aside>
            <div className="quote-main">
            <h2 className="quote-step-title" ref={stepHeading} tabIndex={-1}>{step === 1 ? "Hizmetinizi seçin, dosyanızı ekleyin" : step === 2 ? "Parçanız nasıl üretilecek?" : "Talebinizi tamamlayın"}</h2>
            <div hidden={step !== 1}>
            <div
              className="quote-service-choice"
              aria-label="Talep edilen hizmet"
            >
              {["3D Baskı", "3D Tarama", "3D Modelleme"].map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={service === item}
                  onClick={() => setService(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            </div>
            <div>
            <Suspense fallback={<p>3D Studio yükleniyor…</p>}>
              <QuoteStudio
                file={file}
                onFile={setFile}
                onSpec={setSpec}
                service={service}
                stage={step === 1 ? "file" : step === 2 ? "options" : "contact"}
                previewTarget={previewTarget}
              />
            </Suspense>
            </div>
            {step < 3 && <div className="quote-step-actions">{step === 2 && <button type="button" className="quote-back" onClick={() => goToStep(1)}>Geri</button>}<button type="button" className="brand-button dark" onClick={() => goToStep(step + 1)}>{step === 1 ? (file ? "Üretim tercihlerini seç" : "Dosya olmadan devam et") : "İletişim bilgilerine geç"}<ArrowUpRight size={18}/></button></div>}
            <div hidden={step !== 3}>
              <form className="brand-form" onSubmit={submit} onFocus={() => { if (!started.current && !demoMode) { trackGrowth(brand.slug,"quote_start",{service}); started.current = true; } }}>
                <label>
                  Ad soyad *
                  <input
                    name="full_name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={200}
                    required
                  />
                </label>
                <label>
                  E-posta *
                  <input
                    name="email"
                    autoComplete="email"
                    type="email"
                    maxLength={254}
                    required
                  />
                </label>
                <label>
                  Telefon
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                  />
                </label>
                <label>
                  Firma / proje adı
                  <input
                    name="company"
                    autoComplete="organization"
                    maxLength={200}
                  />
                </label>
                <input
                  type="hidden"
                  name="material_pref"
                  value={spec.material}
                />
                <input type="hidden" name="quantity" value={spec.quantity} />
                <label className="wide">
                  Teknik ihtiyaç / proje açıklaması *
                  <textarea
                    name="part_description"
                    minLength={10}
                    maxLength={2400}
                    required
                    defaultValue={[application, region]
                      .filter(Boolean)
                      .join(" · ")}
                    placeholder="Nerede kullanılacak? Yaklaşık ölçüler, beklentiler ve hedef teslim tarihi…"
                  />
                </label>
                <details className="quote-extra wide"><summary>Proje detayları <span>İsteğe bağlı · tarih, revizyon, kullanım koşulları</span></summary><div className="quote-extra-fields">
                <label>
                  Departman
                  <input
                    name="department"
                    maxLength={100}
                    placeholder="Ar-Ge, üretim, bakım, satın alma…"
                  />
                </label>
                <label>
                  Proje / parça referansı ve revizyon
                  <input
                    name="reference"
                    maxLength={100}
                    placeholder="Parça kodu / Rev. A"
                  />
                </label>
                <label>
                  Hedef teslim tarihi
                  <input name="target_date" type="date" />
                </label>
                <label className="wide">
                  Kullanım ortamı ve montaj koşulları
                  <textarea
                    name="environment"
                    maxLength={500}
                    placeholder="Sıcaklık, yük, kimyasal temas, eşleşen parçalar ve kritik ölçüler…"
                  />
                </label>
                </div></details>
                <label className="wide nda-option">
                  <input type="checkbox" name="nda" value="requested" />
                  Gizlilik sözleşmesi görüşmek istiyorum
                </label>
                <p className="wide text-xs">
                  Paylaştığınız bilgiler talebinizin değerlendirilmesi için
                  kullanılır.{" "}
                  <Link
                    className="underline"
                    to={`/gizlilik-politikasi${previewSearch(search)}`}
                  >
                    Gizlilik bilgileri
                  </Link>
                </p>
                {demoMode && (
                  <p className="wide form-message">
                    Önizleme: Bu form henüz bir veritabanına bağlı değil.
                  </p>
                )}
                {error && (
                  <p role="alert" className="wide form-error">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="brand-button dark wide"
                  disabled={busy || demoMode}
                >
                  {busy ? "Gönderiliyor…" : "Teklif talebini gönder"}
                  <ArrowUpRight size={18} />
                </button>
              </form>
              <button type="button" className="quote-back" onClick={() => goToStep(2)}>Üretim tercihlerine dön</button>
            </div>
            <aside className="quote-summary" aria-label="Talep özeti">
              <p className="brand-eyebrow">TALEBİNİZ</p><h2>Proje özeti</h2>
              <dl><div><dt>Hizmet</dt><dd>{service}</dd></div><div><dt>Dosya</dt><dd>{file?.name || "Dosya eklenmedi"}</dd></div><div><dt>Malzeme</dt><dd>{spec.material}</dd></div><div><dt>Adet</dt><dd>{spec.quantity}</dd></div></dl>
              <div className="quote-summary-price" aria-live="polite"><span>Tahmini üretim tutarı</span><strong>{spec.estimatedTotal != null ? fmtTRY(spec.estimatedTotal) : "Teknik teklif"}</strong><p>{spec.estimatedTotal != null ? "KDV dahil ön tahmin. Kesin tutar teknik inceleme sonrası teyit edilir." : "Uygun STL ve fiyatlandırılmış FDM malzemesi seçildiğinde hızlı ön hesaplama burada görünür."}</p>{spec.campaignName && <p>{spec.campaignName} · {fmtTRY(spec.discount)} tahmini indirim</p>}</div>
              <details><summary>Değerlendirme nasıl ilerler?</summary><p>Dosya, kullanım amacı ve kritik ölçüler incelenir. Malzeme, stok, üretilebilirlik, son işlem ve teslimat birlikte netleştirilir. Hedef tarih teslim taahhüdü değildir.</p><p>STL, OBJ, 3MF, STEP, IGES · en fazla 20 MB. STL ölçü birimi milimetre kabul edilir.</p></details>
            </aside>
            </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
