import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
export default function BrandServices() {
  const b = useBrand();
  const { search } = useLocation();
  const defaults = b.applications.map((title, index) => [
    title,
    b.applicationDetails[index],
  ]);
  const services: string[][] = Array.isArray(b.settings.services_cards)
    ? b.settings.services_cards.map((card) => [
        card.title_tr || "Üretim çözümü",
        card.desc_tr || "",
      ])
    : defaults;
  return (
    <>
      <Seo
        title={`${b.focus} ve üretim olanakları`}
        description={b.description}
        path="/hizmetler"
      />
      <section className="brand-inner">
        <p className="brand-eyebrow">ÜRETİM OLANAKLARI</p>
        <h1>
          Tek bir ihtiyaç.
          <br />
          Birçok üretim olanağı.
        </h1>
        <p className="section-lead">
          {b.featureLead} Tüm 3D üretim ihtiyaçlarınızı da aynı ekip ile
          değerlendirebilirsiniz.
        </p>
        <div className="service-list">
          {services.map(([title, desc], i) => (
            <article key={title}>
              <span className="brand-eyebrow">0{i + 1}</span>
              <h2>{title}</h2>
              <p>{desc}</p>
              <Link
                className="text-link"
                to={`/teklif-al${import.meta.env.DEV ? search : ""}`}
              >
                Projenizi paylaşın <ArrowUpRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
