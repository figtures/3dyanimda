import { FileBox, Info } from "lucide-react";
import type { ModelMetrics } from "@/lib/model-import/types";
import "./model-info.css";

export function ModelInfoPanel({ file, metrics }: { file: File | null; metrics: ModelMetrics | null }) {
  if (!file) return null;
  const size = file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB`;
  return <section className="studio-model-info" aria-label="Yüklenen model bilgileri">
    <div className="studio-file-identity">
      <span className="studio-file-icon"><FileBox size={20} aria-hidden="true" /></span>
      <div><p className="studio-filename" title={file.name}>{file.name}</p><span className="studio-file-size">{size} · Yüklenen dosya</span></div>
    </div>
    {metrics && <>
      <dl className="studio-metrics">
        <div className="studio-dimensions"><dt>Dış ölçüler <span>X × Y × Z</span></dt><dd>{(metrics.bboxCm.x * 10).toFixed(1)} × {(metrics.bboxCm.y * 10).toFixed(1)} × {(metrics.bboxCm.z * 10).toFixed(1)} mm</dd></div>
        <div><dt>{metrics.closed === false ? "Yüzey durumu" : "Model hacmi"}</dt><dd>{metrics.closed === false ? "Açık yüzey" : `${metrics.volumeCm3.toFixed(2)} cm³`}</dd></div>
        <div><dt>Dosya yapısı</dt><dd>{metrics.format} · {metrics.parts.toLocaleString("tr-TR")} parça</dd></div>
      </dl>
      <details className="studio-technical-details">
        <summary><Info size={16} aria-hidden="true" /><span>Teknik bilgiler ve ölçü notları</span></summary>
        <div className="studio-technical-body">
          <dl><div><dt>Geometri</dt><dd>{metrics.triangles.toLocaleString("tr-TR")} üçgen</dd></div><div><dt>Ölçü birimi</dt><dd>{metrics.unitAssumed ? "Milimetre varsayıldı" : "Dosyadan okundu, mm’ye çevrildi"}</dd></div></dl>
          {metrics.closed === false && <p>Açık yüzeyden güvenilir hacim hesaplanamaz. Fiyat, teknik incelemeyle belirlenir.</p>}
          <p>Ölçüleri kontrol edin. Önizleme, üretilebilirlik onayı değildir.</p>
        </div>
      </details>
    </>}
    {!metrics && <p className="studio-model-pending">Dosya ölçüleri, önizleme başarıyla açıldığında burada görünür.</p>}
  </section>;
}
