import type { ReactNode } from "react";
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
import "./quote-options.css";
import type { StlMetrics } from "./StlViewer";
import { ModelInfoPanel } from "./ModelInfoPanel";
const Viewer = lazy(() => import("./StlViewer"));
export type StudioSpec = {
  summary: string;
  material: string;
  quantity: number;
  campaignName: string | null;
  discount: number;
  estimatedTotal?: number | null;
};
type CatalogMaterial = QuoteMaterial & { technology: string; description?: string; colors?: string };
const demoMaterials: CatalogMaterial[] = [
  {
    id: "demo-pla",
    name: "PLA",
    technology: "FDM",
    density: 1.24,
    pricePerGram: 6,
    setupFee: 35,
    minPrice: 90,
  },
  {
    id: "demo-petg",
    name: "PETG",
    technology: "FDM",
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
  badge?: string | null;
  message?: string;
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
  stage,
  renderWorkspace,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  onSpec: (spec: StudioSpec) => void;
  service: string;
  stage?: "file" | "options" | "contact";
  renderWorkspace?: (preview: ReactNode, options: ReactNode) => ReactNode;
}) {
  const { tenant } = useTenant();
  const [materials, setMaterials] = useState<CatalogMaterial[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [technology, setTechnology] = useState("");
  const [customMaterial, setCustomMaterial] = useState("");
  const [purpose, setPurpose] = useState("Birlikte belirleyelim");
  const [colorPreference, setColorPreference] = useState("Birlikte belirleyelim");
  const [finishes, setFinishes] = useState<string[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<"loading" | "ready" | "error">("loading");
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
    setTechnology("");
    setCustomMaterial("");
    setCatalogStatus("loading");
    if (demoMode) {
      setMaterials(demoMaterials);
      setPricing(demoPricing);
      setCatalogStatus("ready");
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
      if (!active) return;
      setCatalogStatus(m.error ? "error" : "ready");
      const values = (m.error ? [] : m.data || []).map((m) => ({
          id: m.id,
          name: m.name,
          technology: m.technology.trim().toUpperCase(),
          description: m.description || "",
          colors: m.color || "",
          density: Number(m.density_g_cm3),
          pricePerGram: Number(m.price_per_gram),
          setupFee: Number(m.setup_fee),
          minPrice: Number(m.min_price),
        }));
      setMaterials(values);

      const map = Object.fromEntries(
        (s.data || []).map((v) => [v.key, Number(v.value)]),
      );
      if (
        !s.error && [
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
      if (!c.error) setCampaigns((c.data || []).filter(c => ["percent","fixed"].includes(c.discount_type) && [Number(c.discount_value),Number(c.min_quote_amount),Number(c.min_quantity)].every(v => Number.isFinite(v) && v >= 0) && (c.discount_type !== "percent" || Number(c.discount_value) <= 100)));
      if (!s.error && Number.isFinite(map.infill_percent) && map.infill_percent >= 5 && map.infill_percent <= 100) setInfill(map.infill_percent);
    }).catch(() => { if (active) setCatalogStatus("error"); });
    return () => {
      active = false;
    };
  }, [tenant?.id]);
  useEffect(() => {
    setMetrics(null);
  }, [file]);
  const material = materials.find((m) => m.id === materialId);
  const technologies = [...new Set(materials.map((m) => m.technology))];
  const selectedTechnology = material?.technology || technology;
  const materialName = materialId === "custom" ? customMaterial.trim() || "Diğer malzeme (belirlenecek)" : material?.name || "Malzeme önerisi istiyorum";
  const requestedColor = colorPreference === "Özel renk" ? `Özel renk: ${color}` : colorPreference;
  const isFdm = selectedTechnology === "FDM";
  const price = useMemo(
    () =>
      service === "3D Baskı" && metrics && metrics.closed !== false && material && pricing && isFdm && material.pricePerGram > 0 && finishes.length === 0 && colorPreference !== "Çok renkli"
        ? computeEstimate(
            metrics.volumeCm3,
            material,
            qualities[quality].multiplier,
            infill,
            quantity,
            pricing,
          )
        : null,
    [service, metrics, material, pricing, quality, infill, quantity, isFdm, finishes.length, colorPreference],
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
          ? materialName
          : "Belirlenecek",
      quantity,
      campaignName: campaign?.name || null,
      discount,
      estimatedTotal: price ? price.total - discount : null,
      summary: [
        `Hizmet: ${service}`,
        `Adet: ${quantity}`,
        service === "3D Baskı"
          ? [
              `Teknoloji: ${selectedTechnology || "Teknik ekip önersin"}`,
              `Malzeme: ${materialName}`,
              `Kullanım amacı: ${purpose}`,
              `Renk: ${requestedColor}`,
              `Son işlem: ${finishes.length ? finishes.join(", ") : "Standart / birlikte belirlenecek"}`,
              isFdm ? `Kalite: ${qualities[quality].name} · Doluluk: %${infill}` : "Baskı parametreleri teknik değerlendirmede belirlenecek.",
            ].join(" · ")
          : "Tarama / modelleme kapsamı teknik inceleme ile belirlenecek.",
        metrics
          ? `${metrics.format || "STL"}${metrics.unitAssumed ? " (mm varsayımı)" : ""}: ${metrics.bboxCm.x.toFixed(2)} × ${metrics.bboxCm.y.toFixed(2)} × ${metrics.bboxCm.z.toFixed(2)} cm; ${metrics.closed === false ? "açık yüzey — hacimle fiyatlandırılmaz" : `hacim ${metrics.volumeCm3.toFixed(2)} cm³`}`
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
    materialName,
    selectedTechnology,
    purpose,
    requestedColor,
    finishes,
    isFdm,
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
      if (
        f &&
        (!/\.(stl|obj|3mf|step|stp|igs|iges)$/i.test(f.name) ||
          f.size > 20 * 1024 * 1024)
      ) {
        setError("STL, OBJ, 3MF, STEP veya IGES seçin. En fazla 20 MB.");
        return;
      }
      setMetrics(null);
      onFile(f);
    },
    [onFile],
  );
  const preview = (
      <div className="studio-preview-content">
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
          {file ? (
            <Suspense
              fallback={<div className="studio-empty">Studio açılıyor…</div>}
            >
              <Viewer
                file={file}
                color={colorPreference === "Birlikte belirleyelim" || colorPreference === "Çok renkli" ? undefined : color}
                onMetrics={setMetrics}
                className="studio-model-viewer"
              />
            </Suspense>
          ) : (
            <div className="studio-empty">
              <Box size={65} strokeWidth={1} />
              <strong>Modelinizi buraya bırakın.</strong>
              <p>
                STL, OBJ, 3MF, STEP/STP ve IGES/IGS dosyalarını döndürün, yakınlaştırın ve boyutlarını inceleyin.
              </p>
            </div>
          )}
          <div className="studio-file">
            <label>
              <Upload size={15} className="inline mr-2" />
              <span>{file ? "Dosyayı değiştir" : "Dosya seç"}</span><small>STL, OBJ, 3MF, STEP, IGES · en fazla 20 MB</small>
              <input
                type="file"
                aria-label="3D dosyası"
                accept=".stl,.obj,.3mf,.step,.stp,.igs,.iges"
                onChange={(e) => { const next = e.target.files?.[0]; if (next) load(next); e.target.value = ""; }}
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
        <ModelInfoPanel file={file} metrics={metrics} />
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
      </div>
  );
  const options = (
      <div className="studio-options" hidden={Boolean(stage && stage !== "options")}>
        {!stage && <h2>Üretim seçenekleri</h2>}
        {service === "3D Baskı" && (
          <>
            <p className="studio-hint">Malzemeden emin değilseniz seçimi bize bırakın. Seçenekler talep tercihleridir; stok ve üretim uygunluğu teklif aşamasında teyit edilir.</p>
            <label>
              Üretim teknolojisi
              <select value={technology} onChange={(e) => { setTechnology(e.target.value); setMaterialId(""); setCustomMaterial(""); }}>
                <option value="">Teknik ekip önersin / tüm seçenekler</option>
                {technologies.map((t) => <option key={t} value={t}>{t === "FDM" ? "FDM · filament baskı" : ["SLA", "DLP"].includes(t) ? `${t} · reçine baskı` : ["SLS", "MJF"].includes(t) ? `${t} · toz baskı` : t}</option>)}
              </select>
            </label>
            <label>
              Malzeme tercihi
              <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} aria-describedby="material-help">
                <option value="">Malzeme önerisi istiyorum</option>
                {technologies.filter((t) => !technology || technology === t).map((t) => (
                  <optgroup key={t} label={t}>
                    {materials.filter((m) => m.technology === t).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </optgroup>
                ))}
                <option value="custom">Diğer malzeme / özel talep</option>
              </select>
            </label>
            <p id="material-help" className="studio-hint" role="status">
              {catalogStatus === "loading" ? "Malzeme seçenekleri yükleniyor…" : catalogStatus === "error" ? "Katalog şu an yüklenemedi. Özel malzeme talebinizi yine iletebilirsiniz." : material?.description || "Malzeme adı veya kullanım amacınız üzerinden birlikte seçim yapabiliriz."}
              {material?.colors && ` Renk bilgisi: ${material.colors}.`}
            </p>
            {materialId === "custom" && <label>İstediğiniz malzeme<input maxLength={100} value={customMaterial} onChange={(e) => setCustomMaterial(e.target.value)} placeholder="Örn. özel bir filament veya ürün kodu" /></label>}
            <label>
              Kullanım amacı
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                {["Birlikte belirleyelim", "Görsel prototip / sunum", "Fonksiyonel prototip", "Yedek parça", "Maket / minyatür", "Fikstür / üretim yardımcısı", "Dekoratif ürün", "Küçük seri üretim"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label>
              Renk tercihi
              <select value={colorPreference} onChange={(e) => {
                const v = e.target.value; setColorPreference(v);
                const swatches: Record<string, string> = { Siyah: "#242424", Beyaz: "#eeeeee", Gri: "#888888", Kırmızı: "#c93434", Mavi: "#2359e8", Yeşil: "#338151", Turuncu: "#ed692b" };
                if (swatches[v]) setColor(swatches[v]);
              }}>
                {["Birlikte belirleyelim", "Siyah", "Beyaz", "Gri", "Kırmızı", "Mavi", "Yeşil", "Turuncu", "Şeffaf / yarı saydam", "Çok renkli", "Özel renk"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <details className="studio-detail-options">
              <summary>Son işlem ve baskı detayları{finishes.length ? ` · ${finishes.length} tercih` : ""}</summary>
              <fieldset className="studio-finishes">
                <legend>Son işlem tercihi</legend>
                {["Zımpara", "Astar / boya", "Yüzey parlatma", "Dişli insert", "Montaj", "Yapıştırma"].map((v) => <label key={v}><input type="checkbox" checked={finishes.includes(v)} onChange={(e) => setFinishes((current) => e.target.checked ? [...current, v] : current.filter((f) => f !== v))} />{v}</label>)}
              </fieldset>
              {isFdm ? <>
                <label>Baskı kalitesi<select value={quality} onChange={(e) => setQuality(Number(e.target.value))}>{qualities.map((q, i) => <option key={q.id} value={i}>{q.name}</option>)}</select></label>
                <label>Doluluk: %{infill}<input type="range" min={5} max={100} step={5} value={infill} onChange={(e) => setInfill(Number(e.target.value))} /></label>
                <p className="studio-hint">Katman ve doluluk tercihi, parçanın geometrisine göre değerlendirilir.</p>
              </> : <p className="studio-hint">Katman ve doluluk seçenekleri FDM seçtiğinizde açılır. Diğer teknolojilerde parametreleri teknik ekip belirler.</p>}
            </details>
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
          {service === "3D Baskı" && colorPreference === "Özel renk" && (
            <label>
              Özel renk referansı
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          )}
        </div>
        {campaign && <div className="quote-campaign" role="status"><strong>{campaign.badge || "KAMPANYA"} · {campaign.name}</strong>{campaign.message && <p>{campaign.message}</p>}<p>{fmtTRY(discount)} ön tahmin indirimi</p></div>}
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
                : !material || !isFdm || !pricing || material.pricePerGram <= 0 || material.density <= 0 || finishes.length > 0 || colorPreference === "Çok renkli"
                  ? "Bu tercihler için dosya ve üretim kapsamını inceleyip size özel teklif hazırlayacağız."
                  : metrics?.closed === false ? "Model açık yüzey içeriyor; fiyat teknik incelemeyle belirlenir." : "Ön hesaplama için kapalı yüzeyli bir 3D model yükleyin."}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Kesin fiyat; teknik inceleme, destekler, son işlem ve teslimat
          kapsamıyla belirlenir. Renk ve malzeme uygunluğu teyit edilir.
        </p>
      </div>
  );
  return renderWorkspace ? renderWorkspace(preview, options) : (
    <div className={`quote-studio${stage ? " quote-studio-staged" : ""}`}>{preview}{options}</div>
  );
}
