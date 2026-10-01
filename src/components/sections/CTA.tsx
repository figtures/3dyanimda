import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useBrand } from "@/brands/config";
export const CTA = () => {
  const b = useBrand();
  const { search } = useLocation();
  const cta = b.settings.cta_content ?? {};
  return (
    <section className="brand-cta">
      <div>
        <p className="brand-eyebrow">PROJENİZİ KONUŞALIM</p>
        <h2>
          {cta.title_tr || "Bir sonraki parçanızı birlikte geliştirelim."}
        </h2>
        <p>
          {cta.lead_tr ||
            "Teknik ihtiyacınız için birlikte bir üretim yolu belirleyelim."}
        </p>
      </div>
      <Link
        className="brand-button accent"
        to={`/teklif-al${import.meta.env.DEV ? search : ""}`}
      >
        Teknik teklif talebi
        <ArrowUpRight size={18} />
      </Link>
    </section>
  );
};
