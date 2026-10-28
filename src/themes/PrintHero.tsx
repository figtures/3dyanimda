import { useCallback, useEffect, useState, type ComponentType } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { InPageLink } from "@/components/site/InPageLink";
import { useBrand } from "@/brands/config";
import PrinterPoster from "./PrinterPoster";
import CanvasPrinter from "./printer/CanvasPrinter";
import type { PrinterSceneProps, PrintState } from "./printer/types";
import "./print-hero.css";

export default function PrintHero({ query }: { query: string }) {
  const brand = useBrand();
  const [Scene, setScene] = useState<ComponentType<PrinterSceneProps> | null>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [useCanvas, setUseCanvas] = useState(false);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [restart, setRestart] = useState(0);
  const [state, setState] = useState<PrintState>({ layer: 18, total: 72, phase: "printing" });
  const onFailure = useCallback(() => { setReady(false); setUnavailable(true); }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onState = useCallback((next: PrintState) => setState(next), []);

  useEffect(() => {
    let active = true;
    // Text, CTA and the vector poster paint before the independently loaded renderer.
    import("./printer/PrinterScene").then(module => {
      if (active) setScene(() => module.default);
    }).catch(() => { if (active) setUseCanvas(true); });
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => { if (motion.matches) setPaused(true); };
    motion.addEventListener("change", change);
    return () => { active = false; motion.removeEventListener("change", change); };
  }, [onFailure]);

  const customTitle = brand.settings.hero_content?.title_tr;
  const legacyTitle = !customTitle || customTitle.replace(/\s+/g, " ").trim() === "Fikrinizden parçaya. Üretim yanınızda.";
  const phase = unavailable ? "Fikirden fiziksel forma" : paused ? "Bir ana yakından bakın" : state.phase === "complete" ? "Bir fikir, artık bir form." : state.phase === "reset" ? "Yeni bir form başlıyor" : "Katmanlar birleşiyor";

  return <section className="print-hero" aria-labelledby="print-hero-title">
    <div className="print-hero-body wrap">
      <div className="print-hero-copy">
        <p className="print-hero-eyebrow"><span aria-hidden="true" />{brand.eyebrow}</p>
        <h1 id="print-hero-title">{legacyTitle ? <>Fikrinizden{" "}<span>parçaya.</span></> : customTitle}</h1>
        <p className="print-hero-lead">{brand.lead}</p>
        <div className="print-hero-actions">
          <Link className="print-hero-primary" to={"/teklif-al" + query}>Projenizi başlatın <ArrowUpRight size={20} aria-hidden="true" /></Link>
          <InPageLink className="print-hero-secondary" hash="#hizmetler">Hizmetleri keşfedin <ArrowDown size={17} aria-hidden="true" /></InPageLink>
        </div>
        <p className="print-hero-location">İstanbul, Ataşehir <span aria-hidden="true">/</span> Mühendislikten üretime.</p>
      </div>

      <div className="print-hero-visual">
        <div className="print-stage-heading" aria-hidden="true"><span>01 — BİR FİKRİN OLUŞUMU</span><span className="print-stage-symbol">+</span></div>
        <div className="print-stage" data-ready={ready} data-scene-state={unavailable ? "fallback" : ready ? "ready" : "loading"}>
          <div className="print-stage-glow" aria-hidden="true" />
          <div className="print-stage-poster"><PrinterPoster /></div>
          {useCanvas ? <CanvasPrinter paused={paused} restart={restart} onReady={onReady} onFailure={onFailure} onState={onState} /> : Scene && <Scene paused={paused} restart={restart} onReady={onReady} onFailure={() => { setReady(false); setUseCanvas(true); }} onState={onState} />}
        </div>
        <div className="print-stage-caption">
          <div className="print-stage-status"><span className="print-status-dot" data-running={ready && !paused && !unavailable} aria-hidden="true" /><span>{phase}</span></div>
          <div className="print-stage-controls">
            <button type="button" aria-label={paused ? "Baskı animasyonunu oynat" : "Baskı animasyonunu duraklat"} aria-pressed={paused} disabled={!ready || unavailable} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>
            <button type="button" aria-label="Baskı animasyonunu baştan göster" disabled={!ready || unavailable} onClick={() => { setRestart(value => value + 1); setPaused(false); }}><RotateCcw size={16} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="print-stage-progress" aria-hidden="true"><span style={{ transform: `scaleX(${unavailable ? 1 : state.layer / state.total})` }} /></div>
        <p className="print-stage-note">Temsili üretim sahnesi<span aria-hidden="true"> / </span><span>Katman katman, olasılıklara.</span></p>
      </div>
    </div>
    <div className="print-hero-baseline wrap">
      <span>HER FİKİR BİR BAŞLANGIÇ.</span>
      <div><Link to={"/3d-baski" + query}>Üret <ArrowUpRight size={14} aria-hidden="true" /></Link><Link to={"/3d-tarama" + query}>Sayısallaştır <ArrowUpRight size={14} aria-hidden="true" /></Link><Link to={"/3d-modelleme" + query}>Tasarla <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
    </div>
  </section>;
}
