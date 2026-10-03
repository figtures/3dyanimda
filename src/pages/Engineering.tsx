import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Upload, Box } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import type { ModelData } from "@/engineering/Viewer";
import "@/engineering/engineering.css";
const Viewer = lazy(() => import("@/engineering/Viewer"));
const tools = [
  [
    "stl-onizle",
    "STL önizleyici",
    "STL modelinizin dış ölçülerini seçtiğiniz birimle kontrol edin.",
  ],
  [
    "kesit-analizi",
    "Kesit inceleme",
    "X, Y ve Z yönlerinde iç boşlukları ve yüzey ilişkilerini keşfedin.",
  ],
  [
    "tarama-goruntuleyici",
    "Tarama görüntüleyici",
    "Renkli PLY nokta bulutları ve yüzey ağları desteklenir. E57 ve LAS desteklenmez.",
  ],
];
export default function Engineering() {
  const { pathname, search } = useLocation();
  const query = import.meta.env.DEV ? search : "";
  const [model, setModel] = useState<ModelData>();
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("solid");
  const [axis, setAxis] = useState("X");
  const [section, setSection] = useState(50);
  const [cutting, setCutting] = useState(false);
  const [unit, setUnit] = useState("mm");
  const worker = useRef<Worker>();
  const generation = useRef(0);
  const file = useRef<File>();
  useEffect(
    () => () => {
      generation.current++;
      worker.current?.terminate();
    },
    [],
  );
  useEffect(() => setCutting(pathname.endsWith("kesit-analizi")), [pathname]);
  async function load(input: File) {
    const version = ++generation.current;
    worker.current?.terminate();
    setError("");
    setBusy(false);
    if (!/\.(stl|ply)$/i.test(input.name)) {
      setError("STL veya PLY dosyası seçin.");
      return;
    }
    if (input.size > 20 * 1024 * 1024 || !input.size) {
      setError("Dosya boş olmamalı ve 20 MB sınırını aşmamalıdır.");
      return;
    }
    setBusy(true);
    try {
      const buffer = await input.arrayBuffer();
      if (version !== generation.current) return;
      const w = new Worker(
        new URL("../engineering/parse.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = w;
      const timer = window.setTimeout(() => {
        w.terminate();
        if (version === generation.current) {
          setError("İşleme süresi aşıldı. Daha hafif bir dosya deneyin.");
          setBusy(false);
        }
      }, 15000);
      w.onmessage = ({ data }) => {
        clearTimeout(timer);
        w.terminate();
        if (version !== generation.current) return;
        setBusy(false);
        if (data.error) {
          setError(data.error);
          return;
        }
        setModel(data);
        setFilename(input.name);
        file.current = input;
        setMode(data.isPoints ? "points" : "solid");
        setSection(50);
      };
      w.onerror = () => {
        clearTimeout(timer);
        w.terminate();
        if (version === generation.current) {
          setBusy(false);
          setError("Dosya işlenemedi. Geçerli bir STL veya PLY deneyin.");
        }
      };
      w.postMessage(
        { buffer, extension: input.name.split(".").pop()?.toLowerCase() },
        [buffer],
      );
    } catch {
      if (version === generation.current) {
        setBusy(false);
        setError("Dosya okunamadı.");
      }
    }
  }
  async function example() {
    try {
      const response = await fetch("/models/inspection-sample.stl");
      if (!response.ok) throw Error();
      await load(new File([await response.blob()], "ornek-baglanti.stl"));
    } catch {
      setError("Örnek model yüklenemedi.");
    }
  }
  const active = tools.find((t) => pathname.endsWith(t[0]));
  const title = active?.[1] || "Mühendislik araçları";
  return (
    <>
      <Seo
        title={title}
        description="Ücretsiz STL önizleme, hareketli kesit ve PLY tarama görüntüleme. Modelinizi tarayıcınızda inceleyin; dosyanız sunucuya gönderilmez."
        path={pathname}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: title,
          applicationCategory: "DesignApplication",
          operatingSystem: "Web",
          isAccessibleForFree: true,
        }}
      />
      <section className="wrap engineering-intro">
        <p className="brand-eyebrow">ENGINEERING LAB / 01</p>
        <h1>
          {active ? (
            title
          ) : (
            <>
              Bir dosyadan
              <br />
              <em>daha fazlasını görün.</em>
            </>
          )}
        </h1>
        <p>
          {active
            ? active[2]
            : "Geometriyi döndürün. Kesiti kaydırın. Tarama verisini inceleyin."}
          <br />
          3D baskı, 3D tarama ve 3D modelleme öncesi ücretsiz çalışma alanınız.
        </p>
      </section>
      <section className="wrap engineering-lab" aria-label={title}>
        <nav className="engineering-tabs" aria-label="Mühendislik araçları">
          {tools.map(([slug, label]) => (
            <Link
              key={slug}
              to={"/araclar/" + slug + query}
              aria-current={pathname.endsWith(slug) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="engineering-workspace">
          <div className="engineering-main">
            <div className="engineering-topbar">
              <span>
                <i /> {model ? filename : "MODEL BEKLENİYOR"}
              </span>
              <span>YEREL · GİZLİ</span>
            </div>
            {model ? (
              <Suspense
                fallback={
                  <div className="engineering-empty">
                    Görüntüleyici hazırlanıyor…
                  </div>
                }
              >
                <Viewer
                  model={model}
                  mode={mode}
                  axis={axis}
                  section={section}
                  cutting={cutting}
                />
              </Suspense>
            ) : (
              <div className="engineering-empty">
                <Box size={76} strokeWidth={0.7} />
                <h2>İlk bakış. Her açıdan.</h2>
                <p>Dosyanızı seçin veya örnek parçayla başlayın.</p>
                <button
                  className="brand-button"
                  onClick={example}
                  disabled={busy}
                >
                  Örnek modeli aç <ArrowUpRight size={17} />
                </button>
              </div>
            )}
            <div className="engineering-bottom">
              Sürükle → döndür <span>Dosyanız bu cihazda işlenir.</span>
            </div>
          </div>
          <aside className="engineering-panel">
            <label className="engineering-upload">
              <Upload size={24} />
              <strong>Modelinizi açın</strong>
              <span>STL / PLY · en fazla 20 MB</span>
              <input
                type="file"
                accept=".stl,.ply"
                aria-label="STL veya PLY dosyası"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void load(f);
                  e.target.value = "";
                }}
              />
            </label>
            {busy && <p role="status">Geometri işleniyor…</p>}
            {error && (
              <p role="alert" className="engineering-error">
                {error}
              </p>
            )}
            <fieldset disabled={!model || busy}>
              <legend>01 / Görünüm</legend>
              <div className="engineering-segments">
                {[
                  ["solid", "Yüzey"],
                  ["wire", "Tel kafes"],
                  ["points", "Noktalar"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    disabled={model?.isPoints && value !== "points"}
                    aria-pressed={mode === value}
                    onClick={() => setMode(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="engineering-note">
                {model?.isPoints
                  ? "PLY nokta verisi. Yüzey oluşturulmaz."
                  : "Noktalar, modelin köşeleridir; gerçek tarama değildir."}
              </p>
            </fieldset>
            <fieldset disabled={!model || busy}>
              <legend>02 / Kesit düzlemi</legend>
              <label className="engineering-check">
                <input
                  type="checkbox"
                  checked={cutting}
                  onChange={(e) => setCutting(e.target.checked)}
                />{" "}
                Kesiti göster
              </label>
              <div className="engineering-segments">
                {["X", "Y", "Z"].map((a) => (
                  <button
                    key={a}
                    aria-pressed={axis === a}
                    onClick={() => setAxis(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <label className="engineering-range">
                Düzlem konumu <output>{section}%</output>
                <input
                  aria-label="Kesit konumu"
                  type="range"
                  min="0"
                  max="100"
                  value={section}
                  disabled={!cutting}
                  onChange={(e) => setSection(Number(e.target.value))}
                />
              </label>
              <p className="engineering-note">
                Görsel kesit; açık yüzeyler kapatılmaz. Dilimleyici veya ölçüm
                raporu değildir.
              </p>
            </fieldset>
            <fieldset disabled={!model}>
              <legend>03 / Model bilgisi</legend>
              <label>
                Dosya birimi{" "}
                <select
                  aria-label="Dosya birimi"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option>mm</option>
                  <option>cm</option>
                  <option>in</option>
                </select>
              </label>
              <p className="engineering-note">
                Birim dosyadan doğrulanmaz; seçiminizi esas alır.
              </p>
              <dl className="engineering-metrics">
                {["X", "Y", "Z"].map((a, i) => (
                  <div key={a}>
                    <dt>{a}</dt>
                    <dd>
                      {model
                        ? (
                            (model.bounds[1][i] - model.bounds[0][i]) *
                            (unit === "cm" ? 10 : unit === "in" ? 25.4 : 1)
                          ).toFixed(2)
                        : "—"}{" "}
                      mm
                    </dd>
                  </div>
                ))}
                <div>
                  <dt>{model?.isPoints ? "Nokta" : "Üçgen"}</dt>
                  <dd>
                    {model
                      ? (
                          model.positions.length / (model.isPoints ? 3 : 9)
                        ).toLocaleString("tr-TR")
                      : "—"}
                  </dd>
                </div>
              </dl>
            </fieldset>
            {model && (
              <button
                className="engineering-clear"
                onClick={() => {
                  generation.current++;
                  worker.current?.terminate();
                  setBusy(false);
                  setModel(undefined);
                  file.current = undefined;
                  setFilename("");
                  setError("");
                }}
              >
                Modeli kaldır
              </button>
            )}
            <Link
              className="brand-button"
              to={"/teklif-al" + query}
              state={
                file.current?.name.toLowerCase().endsWith(".stl")
                  ? { studioFile: file.current, studioService: "3D Baskı" }
                  : undefined
              }
            >
              Üretim için teklif al <ArrowUpRight size={17} />
            </Link>
          </aside>
        </div>
      </section>
      <section className="wrap engineering-guides">
        {tools.map(([slug, label, description]) => (
          <article key={slug}>
            <h2>{label}</h2>
            <p>{description}</p>
            <Link to={"/araclar/" + slug + query}>Aracı aç →</Link>
          </article>
        ))}
      </section>
    </>
  );
}
