import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Layers, ScanLine, Download } from "lucide-react";
import { useBrand } from "@/brands/config";
import { Part } from "./HomeHero";
import { modelsForBrand } from "./models";
export default function ModelShowcase() {
  const brand = useBrand(),
    { search } = useLocation(),
    models = modelsForBrand(brand.slug);
  const [index, setIndex] = useState(0),
    [mode, setMode] = useState<"solid" | "wire" | "points">("solid");
  const stage = useRef<HTMLDivElement>(null);
  const model = models[index],
    q = import.meta.env.DEV ? search : "";
  return (
    <section className="showcase-section wrap" aria-labelledby="showcase-title">
      <div className="showcase-heading">
        <div>
          <p className="brand-eyebrow">FİKİRDEN FİZİKSEL PARÇAYA</p>
          <h2 id="showcase-title">
            Detayına girin.
            <br />
            Olanakları keşfedin.
          </h2>
        </div>
        <p>
          {brand.slug === "maketyanimda"
            ? "Ölçeği, mekânı ve detayları her açıdan inceleyin."
            : "Geometriyi, birleşimleri ve detayları her açıdan inceleyin."}{" "}
          Projenize benzer bir başlangıç noktası bulun.
        </p>
      </div>
      <div className="showcase-shell">
        <div className="showcase-stage" ref={stage}>
          <div className="showcase-stage-top">
            <span>
              0{index + 1} / 0{models.length}
            </span>
            <div className="model-modes" aria-label="Model gösterimi">
              {(
                [
                  ["solid", "Yüzey", Box],
                  ["wire", "Çizgiler", Layers],
                  ["points", "Nokta bulutu", ScanLine],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <Part
            model={model.id}
            mode={mode}
            interactive
            label={model.material}
          />
          <div className="showcase-stage-bottom">
            <span>ETKİLEŞİMLİ 3D / GLB</span>
            <a
              href={`/models/${model.id}.glb`}
              download
              aria-label={`${model.material} örnek GLB dosyasını indir`}
            >
              <Download size={15} /> Örnek modeli indir
            </a>
          </div>
        </div>
        <div className="showcase-story" aria-live="polite">
          <span className="showcase-tag">{model.category}</span>
          <h3>{model.title}</h3>
          <p>{model.description}</p>
          <div className="showcase-services">
            <span>3D modelleme</span>
            <span>3D tarama</span>
            <span>3D baskı</span>
          </div>
          <Link className="brand-button" to={`/teklif-al${q}`}>
            Benzer bir projem var
          </Link>
          <small>
            Örnekler temsili tasarımlardır; gerçek müşteri işi veya üretime
            hazır teknik dosya değildir.
          </small>
        </div>
      </div>
      <div className="model-selector" aria-label="Sektörel örnekler">
        {models.map((m, i) => (
          <button
            type="button"
            key={m.id}
            aria-pressed={index === i}
            onClick={() => { setIndex(i); stage.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }}
          >
            <span className="selector-number">0{i + 1}</span>
            <span>
              <strong>{m.material}</strong>
              <small>{m.category}</small>
            </span>
            <span className="selector-marker" />
          </button>
        ))}
      </div>
    </section>
  );
}
