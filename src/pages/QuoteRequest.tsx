import { useState, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useBrand } from "@/brands/config";
import { useTenant } from "@/contexts/TenantContext";
import { supabase, demoMode } from "@/lib/supabase";
import { Seo } from "@/components/site/Seo";
const StlViewer = lazy(() => import("@/components/quote/StlViewer"));
const schema = z.object({
  full_name: z.string().trim().min(2).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(40),
  company: z.string().max(200),
  quantity: z.coerce.number().int().min(1).max(1000),
  part_description: z.string().trim().min(10).max(3500),
  department: z.string().trim().max(100),
  reference: z.string().trim().max(100),
  target_date: z.string().max(10),
  environment: z.string().trim().max(500),
  material_pref: z.string().trim().max(100),
  nda: z.string().optional(),
});
export default function QuoteRequest() {
  const brand = useBrand();
  const { tenant } = useTenant();
  const { search } = useLocation();
  const [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  const application = new URLSearchParams(search).get("application") || "";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (demoMode) {
      setError(
        "Bu bir tasarım önizlemesidir. Yeni Supabase projesi bağlandığında talepler kaydedilecek.",
      );
      return;
    }
    const parsed = schema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
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
      department && `Departman: ${department}`,
      reference && `Proje / revizyon: ${reference}`,
      target_date && `Hedef tarih (teyide tabi): ${target_date}`,
      environment && `Kullanım ortamı: ${environment}`,
      nda && "Gizlilik sözleşmesi görüşmesi talep ediliyor.",
    ]
      .filter(Boolean)
      .join("\n\n");
    setBusy(true);
    try {
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
          service_type: brand.focus,
          stl_file_path: path,
          stl_file_name: file?.name ?? null,
          status: "new",
        });
      if (insertError) throw insertError;
      setDone(true);
    } catch {
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
        title="Teknik teklif talebi"
        description={`${brand.name} için 3D üretim talebi oluşturun.`}
        path="/teklif-al"
      />
      <section className="brand-inner">
        <p className="brand-eyebrow">TEKNİK TEKLİF TALEBİ</p>
        <h1>
          Teknik ihtiyacınızı
          <br />
          birlikte değerlendirelim.
        </h1>
        <p className="section-lead">
          CAD dosyanızı veya teknik ihtiyacınızı paylaşın. Kullanım koşulları,
          adet ve takvim üzerinden proje kapsamını birlikte belirleyelim.
        </p>
        {done ? (
          <div role="status" className="form-message">
            <CheckCircle2 className="mb-4" />
            <h2>Talebiniz kaydedildi.</h2>
            <p>
              Projeniz {brand.name} ekibinin değerlendirme listesine kaydedildi.
            </p>
          </div>
        ) : (
          <div className="quote-grid">
            <form className="brand-form" onSubmit={submit}>
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
              <label>
                Malzeme tercihi
                <input
                  name="material_pref"
                  maxLength={100}
                  placeholder="Belirlenecek / tercih edilen malzeme"
                />
              </label>
              <label className="wide">
                Kullanım ortamı ve montaj koşulları
                <textarea
                  name="environment"
                  maxLength={500}
                  placeholder="Sıcaklık, yük, kimyasal temas, eşleşen parçalar ve kritik ölçüler…"
                />
              </label>
              <label>
                Adet *
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={1000}
                  defaultValue={1}
                  required
                />
              </label>
              <label>
                3D dosyası (isteğe bağlı)
                <input
                  type="file"
                  accept=".stl,.obj,.3mf,.step,.stp,.igs,.iges"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError("");
                  }}
                />
              </label>
              <label className="wide">
                Teknik ihtiyaç / proje açıklaması *
                <textarea
                  name="part_description"
                  minLength={10}
                  maxLength={3500}
                  required
                  defaultValue={application ? `${application}: ` : ""}
                  placeholder="Nerede kullanılacak? Yaklaşık ölçüler, beklentiler ve hedef teslim tarihi…"
                />
              </label>
              {file?.name.toLowerCase().endsWith(".stl") && (
                <div className="wide">
                  <Suspense fallback={<p>Model hazırlanıyor…</p>}>
                    <StlViewer file={file} color="#849477" className="h-64" />
                  </Suspense>
                </div>
              )}
              <label className="wide nda-option">
                <input type="checkbox" name="nda" value="requested" />
                Gizlilik sözleşmesi görüşmek istiyorum
              </label>
              <p className="wide text-xs">
                Paylaştığınız bilgiler talebinizin değerlendirilmesi için
                kullanılır.{" "}
                <Link
                  className="underline"
                  to={`/gizlilik-politikasi${import.meta.env.DEV ? search : ""}`}
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
            <aside className="quote-aside">
              <h2>Teknik değerlendirme için</h2>
              <p>
                Hedef tarih bir teslim taahhüdü değildir. Üretim yöntemi,
                malzeme ve takvim teknik değerlendirme sonrasında teklif
                kapsamında netleştirilir.
              </p>
              <p>
                Kullanım amacını ve kritik ölçüleri belirtin. Malzeme tercihiniz
                yoksa birlikte belirleyebiliriz.
              </p>
              <p>
                Dosya formatları: STL, OBJ, 3MF, STEP, IGES.
                <br />
                Dosya başına en fazla 20 MB.
              </p>
              <p>
                Fiyat ve teslim süresi; tasarım, malzeme, detay seviyesi ve
                adede göre değerlendirilir.
              </p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
