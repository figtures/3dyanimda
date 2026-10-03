import {
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
  useCallback,
} from "react";
import { Box, Upload } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { supabase, demoMode } from "@/lib/supabase";
import {
  computeEstimate,
  fmtTRY,
  qualities,
  type QuoteMaterial,
  type PricingConfig,
} from "@/lib/quote-engine";
import type { StlMetrics } from "./StlViewer";
const Viewer = lazy(() => import("./StlViewer"));
export type StudioSpec = {
  summary: string;
  material: string;
  quantity: number;
  campaignName: string | null;
  discount: number;
};
const demoMaterials: QuoteMaterial[] = [
  {
    id: "demo-pla",
    name: "PLA",
    density: 1.24,
    pricePerGram: 6,
    setupFee: 35,
    minPrice: 90,
  },
  {
    id: "demo-petg",
    name: "PETG",
    density: 1.27,
    pricePerGram: 8,
    setupFee: 35,
    minPrice: 100,
  },
];
const demoPricing = {
  marginPct: 30,
  vatPct: 20,
  laborPerHour: 150,
  minOrder: 150,
};
type Campaign = {
  name: string;
  discount_type: string;
  discount_value: number;
  min_quote_amount: number;
  min_quantity: number;
};
export default function QuoteStudio({
  file,
  onFile,
  onSpec,
  service,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  onSpec: (spec: StudioSpec) => void;
  service: string;
}) {
  const { tenant } = useTenant();
  const [materials, setMaterials] = useState<QuoteMaterial[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [quality, setQuality] = useState(1);
  const [infill, setInfill] = useState(20);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("#2359e8");
  const [metrics, setMetrics] = useState<StlMetrics | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setMaterials([]);
    setPricing(null);
    setCampaigns([]);
    setMaterialId("");
    if (demoMode) {
      setMaterials(demoMaterials);
      setPricing(demoPricing);
      setMaterialId(demoMaterials[0].id);
      return;
    }
    if (!tenant) return;
    Promise.all([
      supabase
        .from("materials")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("pricing_settings")
        .select("key,value")
        .eq("tenant_id", tenant.id),
      supabase
        .from("discount_campaigns")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("active", true)
        .order("sort_order"),
    ]).then(([m, s, c]) => {
      if (!active || m.error || s.error) return;
      const values = (m.data || [])
        .filter((m) => m.technology === "FDM")
        .map((m) => ({
          id: m.id,
          name: m.name,
          density: Number(m.density_g_cm3),
          pricePerGram: Number(m.price_per_gram),
          setupFee: Number(m.setup_fee),
          minPrice: Number(m.min_price),
        }));
      setMaterials(values);
      setMaterialId(values[0]?.id || "");
      const map = Object.fromEntries(
        (s.data || []).map((v) => [v.key, Number(v.value)]),
      );
      if (
        [
          "margin_percent",
          "vat_percent",
          "labor_per_hour",
          "min_order_price",
        ].every((k) => Number.isFinite(map[k]) && map[k] >= 0)
      )
        setPricing({
          marginPct: map.margin_percent,
          vatPct: map.vat_percent,
          laborPerHour: map.labor_per_hour,
          minOrder: map.min_order_price,
        });
      if (!c.error) setCampaigns(c.data || []);
    });
    return () => {
      active = false;
    };
  }, [tenant?.id]);
  useEffect(() => {
    setMetrics(null);
  }, [file]);
  const material = materials.find((m) => m.id === materialId);
  const price = useMemo(
    () =>
      service === "3D Baskı" && metrics && material && pricing
        ? computeEstimate(
            metrics.volumeCm3,
            material,
            qualities[quality].multiplier,
            infill,
            quantity,
            pricing,
          )
        : null,
    [service, metrics, material, pricing, quality, infill, quantity],
  );
  const campaign = price
    ? campaigns.find(
        (c) => price.total >= c.min_quote_amount && quantity >= c.min_quantity,
      )
    : null;
  const discount =
    price && campaign
      ? Math.min(
          price.total,
          Math.max(
            0,
            campaign.discount_type === "percent"
              ? (price.total * campaign.discount_value) / 100
              : campaign.discount_value,
          ),
        )
      : 0;
  useEffect(() => {
    onSpec({
      material:
        service === "3D Baskı"
          ? material?.name || "Belirlenecek"
          : "Belirlenecek",
      quantity,
      campaignName: campaign?.name || null,
      discount,
      summary: [
        `Hizmet: ${service}`,
        `Adet: ${quantity}`,
        service === "3D Baskı"
          ? `Malzeme: ${material?.name || "Belirlenecek"} · Kalite: ${qualities[quality].name} · Doluluk: %${infill} · Renk: ${color}`
          : "Tarama / modelleme kapsamı teknik inceleme ile belirlenecek.",
        metrics
          ? `STL (mm varsayımı): ${metrics.bboxCm.x.toFixed(2)} × ${metrics.bboxCm.y.toFixed(2)} × ${metrics.bboxCm.z.toFixed(2)} cm; hacim ${metrics.volumeCm3.toFixed(2)} cm³`
          : "Otomatik ölçüm yok.",
        price
          ? `Müşteri tarafı ön tahmin (kesin teklif değildir): ${fmtTRY(price.total - discount)}`
          : "Teknik değerlendirme ile fiyatlandırma.",
        campaign
          ? `Kampanya ön tahmini: ${campaign.name}, ${fmtTRY(discount)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }, [
    service,
    material,
    quantity,
    quality,
    infill,
    color,
    metrics,
    price,
    campaign,
    discount,
    onSpec,
  ]);
  const load = useCallback(
    (f: File | null) => {
      setError("");
      setMetrics(null);
      if (
        f &&
        (!/\.(stl|obj|3mf|step|stp|igs|iges)$/i.test(f.name) ||
          f.size > 20 * 1024 * 1024)
      ) {
        setError("STL, OBJ, 3MF, STEP veya IGES seçin. En fazla 20 MB.");
        return;
      }
      onFile(f);
    },
    [onFile],
  );
  return (
    <div className="quote-studio">
      <div>
        <div
          className="studio-canvas"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            load(e.dataTransfer.files[0] || null);
          }}
        >
          <header>
            <strong>3D STUDIO</strong>
            <span>MODEL ÖNİZLEME</span>
          </header>
          {file?.name.toLowerCase().endsWith(".stl") ? (
            <Suspense
              fallback={<div className="studio-empty">Studio açılıyor…</div>}
            >
              <Viewer
                file={file}
                color={color}
                onMetrics={setMetrics}
                className="h-[310px]"
              />
            </Suspense>
          ) : (
            <div className="studio-empty">
              <Box size={65} strokeWidth={1} />
              <strong>{file ? file.name : "Modelinizi buraya bırakın."}</strong>
              <p>
                {file
                  ? "Bu format teknik incelemeye iletilir. Etkileşimli önizleme ve hacim hesabı STL dosyalarında kullanılabilir."
                  : "Döndürün, yakınlaştırın ve boyutları inceleyin. Dosyanız yoksa talebinizi aşağıda anlatın."}
              </p>
            </div>
          )}
          <div className="studio-file">
            <label>
              <Upload size={15} className="inline mr-2" />
              3D dosyası · en fazla 20 MB
              <input
                type="file"
                accept=".stl,.obj,.3mf,.step,.stp,.igs,.iges"
                onChange={(e) => load(e.target.files?.[0] || null)}
              />
            </label>
            {file && (
              <button
                type="button"
                className="underline mt-2"
                onClick={() => load(null)}
              >
                Dosyayı kaldır
              </button>
            )}
          </div>
        </div>
        {metrics && (
          <div className="studio-metrics">
            <span>
              {(metrics.bboxCm.x * 10).toFixed(1)} ×{" "}
              {(metrics.bboxCm.y * 10).toFixed(1)} ×{" "}
              {(metrics.bboxCm.z * 10).toFixed(1)} mm
            </span>
            <span>{metrics.volumeCm3.toFixed(2)} cm³</span>
            <span>{metrics.triangles.toLocaleString("tr-TR")} üçgen</span>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-3">
          STL birimi milimetre kabul edilir. Ölçüleri kontrol edin. Önizleme,
          üretilebilirlik veya kapalı yüzey doğrulaması değildir.
        </p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
      </div>
      <div className="studio-options">
        <p className="brand-eyebrow">ONLINE HESAPLAMA</p>
        <h2>Üretim seçenekleri</h2>
        {service === "3D Baskı" && (
          <>
            <label>
              Malzeme
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
              >
                {!materials.length && (
                  <option value="">Teknik değerlendirmede belirlenecek</option>
                )}
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Baskı kalitesi
              <select
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              >
                {qualities.map((q, i) => (
                  <option key={q.id} value={i}>
                    {q.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Doluluk: %{infill}
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={infill}
                onChange={(e) => setInfill(Number(e.target.value))}
              />
            </label>
          </>
        )}
        <div className="studio-option-pair">
          <label>
            Adet
            <input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(1000, Math.floor(Number(e.target.value) || 1)),
                  ),
                )
              }
            />
          </label>
          {service === "3D Baskı" && (
            <label>
              Tercih edilen renk
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          )}
        </div>
        <div className="estimate-box" aria-live="polite">
          {demoMode
            ? "Örnek fiyatlarla demo hesaplama"
            : "Tahmini üretim tutarı"}
          {price ? (
            <>
              <strong>{fmtTRY(price.total - discount)}</strong>
              <span>
                {pricing?.vatPct}% KDV dahil ön tahmin.{" "}
                {campaign &&
                  `${campaign.name}: ${fmtTRY(discount)} tahmini indirim.`}
              </span>
            </>
          ) : (
            <p>
              {service !== "3D Baskı"
                ? "Tarama ve modelleme projeleri kapsam üzerinden fiyatlandırılır."
                : !pricing || !materials.length
                  ? "Fiyatlar tanımlandığında STL dosyanız için ön hesaplama açılır. Şimdi teknik talep gönderebilirsiniz."
                  : "Hesaplama için geçerli bir STL modeli yükleyin."}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Kesin fiyat; teknik inceleme, destekler, son işlem ve teslimat
          kapsamıyla belirlenir. Renk ve malzeme uygunluğu teyit edilir.
        </p>
      </div>
    </div>
  );
}
