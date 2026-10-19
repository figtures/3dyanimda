import { previewSearch } from "@/lib/tenant";
import ServiceVisual from "./ServiceVisual";
import EditorialHero from "./EditorialHero";
import { modelsForBrand } from "./models";
import { lazy, Suspense, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDown,
  Upload,
  Box,
  ScanLine,
  PenTool,
} from "lucide-react";
import { useBrand } from "@/brands/config";
import { getSiteTheme } from "./config";
const PartScene = lazy(() => import("./PartScene"));
export const services = [
  {
    path: "/3d-baski",
    name: "3D Baskı",
    label: "Üret",
    description: "Prototipten fonksiyonel parçaya, ihtiyacınıza uygun üretim.",
    icon: Box,
  },
  {
    path: "/3d-tarama",
    name: "3D Tarama",
    label: "Sayısallaştır",
    description: "Mevcut parçadan dijital veriye; ölçü, form ve yüzey bilgisi.",
    icon: ScanLine,
  },
  {
    path: "/3d-modelleme",
    name: "3D Modelleme",
    label: "Tasarla",
    description: "Fikir, çizim veya numuneden üretime hazır modele.",
    icon: PenTool,
  },
];
export function Part({
  mode = "solid",
  model,
  interactive = false,
  label,
}: {
  mode?: "solid" | "wire" | "points";
  model?: string;
  interactive?: boolean;
  label?: string;
}) {
  const brand = useBrand();
  const selected = modelsForBrand(brand.slug)[0];
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, {rootMargin:'100px'});
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={host} style={{minHeight:320}}>
    {!visible ? <div className="part-scene scene-loading"><Box size={64} strokeWidth={1} /></div> :
    <Suspense
      fallback={
        <div className="part-scene scene-loading">
          <Box size={64} strokeWidth={1} />
        </div>
      }
    >
      <PartScene
        mode={mode}
        model={model || selected.id}
        label={label || selected.material}
        interactive={interactive}
        fallback={`/brand/industrial/${brand.heroAsset}.webp`}
      />
    </Suspense>}
    </div>
  );
}
export default function HomeHero() {
  const brand = useBrand();
  const { search } = useLocation();
  const theme = getSiteTheme(brand.slug, search);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const q = previewSearch(search);
  const link = (path: string) => path + q;
  function openStudio(file?: File) {
    if (
      file &&
      (!/\.(stl|obj|3mf|step|stp|igs|iges)$/i.test(file.name) ||
        file.size > 20 * 1024 * 1024)
    ) {
      setError("STL, OBJ, 3MF, STEP veya IGES seçin. En fazla 20 MB.");
      return;
    }
    // Router state retains the actual File without uploading or exposing it in the URL.
    navigate(link("/teklif-al"), {
      state: {
        studioFile: file || null,
        studioService: services[selected].name,
      },
    });
  }
  const customTitle = brand.settings.hero_content?.title_tr;
  const title =
    customTitle ||
    (theme === "editorial" && brand.slug === "3dyanimda"
      ? "Fikirlerinizin üçüncü boyutu."
      : theme === "studio" && brand.slug === "3dyanimda"
        ? "Üretime buradan başlayın."
        : brand.title);
  if (theme === "industrial" || theme === "industrialtwo")
    return (
      <>
        <section className="immersive-hero">
          <picture>
          {!brand.image && <source type="image/avif" srcSet={`/brand/optimized/${brand.heroAsset}-768.avif 768w, /brand/optimized/${brand.heroAsset}-1536.avif 1536w`} sizes="100vw" />}
          <img
            className="immersive-image"
            src={brand.image || `/brand/industrial/${brand.heroAsset}.webp`}
            alt={brand.heroCaption + " — temsili uygulama"}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width="1536"
            height="1024"
          />
          </picture>
          <div className="immersive-shade" />
          <div className="wrap immersive-content">
            <div className="theme-overline">
              <span>İSTANBUL / TASARIMDAN ÜRETİME</span>
              <span>{brand.focus}</span>
            </div>
            <h1>{title}</h1>
            <div className="immersive-bottom">
              <div>
                <p>{brand.lead}</p>
                <Link className="brand-button" to={link("/teklif-al")}>
                  3D Studio’da başla <ArrowUpRight size={20} />
                </Link>
              </div>
              <a className="explore-down" href="#hizmetler">
                Üretim olanaklarını keşfet <ArrowDown size={22} />
              </a>
            </div>
            <span className="visual-note">Temsili uygulama görseli</span>
          </div>
        </section>
      </>
    );
  if (theme === "editorial") return <EditorialHero title={title} query={q} />;
  return (
    <section className="studio-home wrap">
      <div className="theme-overline">
        <span>3D ÜRETİM / ONLINE STUDIO</span>
        <span>{brand.focus}</span>
      </div>
      <h1>{title}</h1>
      <p className="studio-home-lead">{brand.lead}</p>
      <div className="studio-workbench">
        <div className="studio-service-menu" aria-label="Başlangıç hizmeti">
          {services.map((s, i) => (
            <button
              type="button"
              key={s.path}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <span>0{i + 1}</span>
              <s.icon size={21} />
              <strong>{s.name}</strong>
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
        <div className="studio-object">
          <ServiceVisual service={selected} />
          <div className="studio-object-caption">
            <span>{services[selected].description}</span>
            <span>HİZMET AKIŞI</span>
          </div>
        </div>
        <div
          className="home-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            openStudio(e.dataTransfer.files[0]);
          }}
        >
          <div className="home-upload-title">
            <span className="live-dot" /> 3D STUDIO <span>01 / BAŞLANGIÇ</span>
          </div>
          <Upload size={32} strokeWidth={1} />
          <h2>Dosyanız hazır mı?</h2>
          <p>
            Modelinizi yükleyin. Ölçüleri inceleyin, üretim seçeneklerini
            belirleyin.
          </p>
          <label className="brand-button upload-label">
            Dosya seç <ArrowUpRight size={18} />
            <input
              type="file"
              accept=".stl,.obj,.3mf,.step,.stp,.igs,.iges"
              onChange={(e) => openStudio(e.target.files?.[0])}
            />
          </label>
          <span className="file-formats">
            STL · OBJ · STEP · 3MF · IGES
            <br />
            En fazla 20 MB
          </span>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button
            className="text-link"
            type="button"
            onClick={() => openStudio()}
          >
            Dosyam yok, ihtiyacımı anlatayım <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
