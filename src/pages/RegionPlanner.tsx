import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { useBrand } from "@/brands/config";
import regions from "@/content/region-routes.json";
import NotFound from "./NotFound";
import "@/engineering/engineering.css";
const workflows: Record<
  string,
  { title: string; checks: string[]; intro: string; tool: string }
> = {
  "3d-baski": {
    title: "3D baskı",
    checks: [
      "Dosyanın birimini ve dış ölçülerini kontrol ettim.",
      "Adet ve montajda eşleşen parçaları belirledim.",
      "Çalışma sıcaklığı, yük ve yüzey beklentisini not ettim.",
    ],
    intro:
      "Baskıya başlarken dış ölçü, adet ve kullanım ortamı üretim kararını belirler. Dosyanızı STL önizleyicide açarak ölçek ve geometriyi kontrol edin. Renk tercihi ile işlevsel malzeme ihtiyacını ayrı belirtin.",
    tool: "stl-onizle",
  },
  "3d-tarama": {
    title: "3D tarama",
    checks: [
      "Numunenin genel ve yakın fotoğraflarını hazırladım.",
      "Kritik yüzeyleri ve ulaşılması zor bölgeleri işaretledim.",
      "Yüzey ağı mı, düzenlenebilir CAD mi istediğimi belirledim.",
    ],
    intro:
      "Taranacak numunenin boyutu, yüzey özellikleri ve erişilebilirliği çalışma kapsamını belirler. Parlak veya şeffaf yüzeyler için hazırlık ihtiyacı değerlendirilir. Mevcut PLY veriniz varsa önce tarama görüntüleyicide açabilirsiniz.",
    tool: "tarama-goruntuleyici",
  },
  "3d-modelleme": {
    title: "3D modelleme",
    checks: [
      "Eskiz, fotoğraf ve referans ölçüleri hazırladım.",
      "Bağlantı noktaları ile hareketli bölgeleri belirledim.",
      "İstenen çıktı formatı ve revizyon kapsamını tanımladım.",
    ],
    intro:
      "Modelleme briefinde yalnızca parçanın görünüşünü değil, nasıl çalışacağını da anlatın. Montaj referansları ve korunması gereken ölçüler, yeniden tasarlanabilecek yüzeylerden ayrılmalıdır. Kesit aracı mevcut bir modelde iç boşlukları görmenize yardımcı olur.",
    tool: "kesit-analizi",
  },
  "3d-yedek-parca": {
    title: "3D yedek parça",
    checks: [
      "Kırık numune ile sağlam eş parçanın fotoğraflarını hazırladım.",
      "Arızanın nedenini ve çalışma koşullarını anlattım.",
      "Parçanın güvenlik açısından kritik olup olmadığını belirttim.",
    ],
    intro:
      "Yedek parçada önce arızanın nedeni ve montaj ilişkisi incelenir. Kırık yüzeyi kopyalamak yerine tasarım niyeti geri kazanılır. Güvenlik açısından kritik parçalar, mühendislik doğrulaması olmadan kullanım için uygun kabul edilmez.",
    tool: "stl-onizle",
  },
};
export default function RegionPlanner() {
  const { pathname, search } = useLocation();
  const route = regions.find((r) => r.path === pathname.replace(/\/$/, ""));
  const b = useBrand();
  const q = import.meta.env.DEV ? search : "";
  const [checked, setChecked] = useState<string[]>([]);
  const [method, setMethod] = useState("Dijital dosya ile başlayacağım");
  if (!route) return <NotFound />;
  const service = workflows[route.service] || workflows["3d-baski"];
  const title = `${route.name} · ${route.service ? service.title : "3D proje planı"}`;
  const selections = checked.filter((c) => service.checks.includes(c));
  const params = new URLSearchParams(q);
  params.set("region", route.name);
  function download() {
    const text = [
      b.name,
      title,
      "Hizmet: " + service.title,
      "Başlangıç: " + method,
      "Kontrol listesi:",
      ...service.checks.map((c) => (checked.includes(c) ? "[x] " : "[ ] ") + c),
      "Notlar:",
      "",
      "Teslimat ve üretim koşulları teklif aşamasında teyit edilir.",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "proje-hazirlik.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <Seo
        title={title}
        description={`${route.name} için ${service.title} projenizi hazırlayın. Dosya kontrolü, numune planı ve teklif briefini aynı çalışma alanında tamamlayın.`}
        path={route.path}
        noindex
      />
      <section className="content-hero wrap">
        <p className="brand-eyebrow">{b.name} / PROJE HAZIRLIĞI</p>
        <h1>{title}</h1>
        <p className="section-lead">
          {b.focus} odağında projenizin ilk adımlarını hazırlayın. Atölyemiz
          Örnek Mahallesi, Ataşehir’dedir; bu sayfa {route.name} içinde ayrı bir
          şube bulunduğu anlamına gelmez.
        </p>
      </section>
      <div className="article-layout wrap">
        <article className="content-article">
          <section>
            <h2>Hangi hizmetle başlayalım?</h2>
            <div className="engineering-tabs">
              {Object.entries(workflows).map(([key, w]) => (
                <Link
                  key={key}
                  aria-current={route.service === key ? "page" : undefined}
                  to={route.base + "/" + key + q}
                >
                  {w.title}
                </Link>
              ))}
            </div>
          </section>
          <section>
            <h2>{service.title} için hazırlık</h2>
            <p>{service.intro}</p>
            <Link className="text-link" to={"/araclar/" + service.tool + q}>
              Ücretsiz inceleme aracını aç →
            </Link>
          </section>
          <section>
            <h2>Proje kontrol listeniz</h2>
            <p>
              Hazırladığınız bilgileri işaretleyin. Seçimler bu oturumda kalır;
              hazırlık notunu cihazınıza indirebilirsiniz.
            </p>
            {service.checks.map((c) => (
              <label
                key={c}
                style={{
                  display: "flex",
                  gap: 12,
                  margin: "20px 0",
                  alignItems: "baseline",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked.includes(c)}
                  onChange={(e) =>
                    setChecked((v) =>
                      e.target.checked ? [...v, c] : v.filter((x) => x !== c),
                    )
                  }
                />
                {c}
              </label>
            ))}
            <p role="status">
              {selections.length} / {service.checks.length} adım hazır
            </p>
          </section>
          <section>
            <h2>Numune ve dosya planı</h2>
            <label>
              Başlangıç şekliniz{" "}
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{
                  display: "block",
                  padding: 12,
                  maxWidth: "100%",
                  marginTop: 12,
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                }}
              >
                {[
                  "Dijital dosya ile başlayacağım",
                  "Fiziksel numune paylaşacağım",
                  "Önce fotoğraf ve ölçü göndereceğim",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <p>
              {method === "Fiziksel numune paylaşacağım"
                ? "Numuneyi göndermeden önce boyutunu, ağırlığını ve kırılgan bölgelerini paylaşın. Ambalaj, teslim alma adresi ve iade koşulları teyit edilmeden sevkiyat başlatmayın."
                : "Dosyaya birim ve revizyon bilgisi ekleyin. Fotoğrafla başlayacaksanız referans ölçüyü ve parçanın kullanım amacını belirtin; fotoğraf tek başına hassas ölçü verisi sağlamaz."}
            </p>
            <button className="brand-button" onClick={download}>
              Hazırlık notunu indir
            </button>
          </section>
          <section>
            <h2>{route.name} için çalışma planı</h2>
            <p>
              Teklif talebine bölge bilginiz eklenir. Ziyaret, numune kabulü,
              taşıma ve teslim tarihi proje kapsamıyla birlikte netleştirilir.
              Otomatik teslim süresi veya yerinde hizmet taahhüdü verilmez.
            </p>
            <p>
              3D baskı, 3D tarama ve 3D modelleme aynı talepte
              birleştirilebilir. Önce ihtiyacınızı tarif edin; dosya hazırlama
              ve üretim adımları buna göre belirlenir.
            </p>
          </section>
        </article>
        <aside className="article-aside">
          <p className="brand-eyebrow">SONRAKİ ADIM</p>
          <h2>Hazırlıktan teklife.</h2>
          <p>
            {route.name} bilgisi teklif formuna aktarılır. İndirdiğiniz hazırlık
            notunu proje açıklamasına ekleyebilirsiniz.
          </p>
          <Link
            className="brand-button"
            to={"/teklif-al?" + params}
            state={{
              studioService:
                service.title === "3D baskı"
                  ? "3D Baskı"
                  : service.title === "3D tarama"
                    ? "3D Tarama"
                    : "3D Modelleme",
            }}
          >
            3D Studio’yu aç →
          </Link>
          <hr />
          <Link to={"/bolgeler" + q}>Tüm bölgeler →</Link>
          {route.base.includes("/atasehir") && (
            <p>
              <Link to={"/bolgeler/istanbul/atasehir/ornek" + q}>
                Örnek Mahallesi proje hazırlığı →
              </Link>
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
