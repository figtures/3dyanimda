import { Link, useLocation } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { ArrowRight } from "lucide-react";

const Soon = ({ title, description }: { title: string; description: string }) => {
  const { pathname } = useLocation();
  return (
    <>
      <Seo title={title} description={description} path={pathname} />
      <section className="bg-hero text-cream min-h-[70vh] flex items-center grain">
        <div className="container-page py-24">
          <p className="eyebrow text-cream/85">Çok Yakında</p>
          <h1 className="font-serif text-5xl md:text-6xl mt-5 max-w-3xl text-balance">{title}</h1>
          <p className="text-cream/90 mt-5 max-w-2xl">{description}</p>
          <p className="text-cream/85 mt-8 max-w-xl">
            Bu sayfa hazırlanıyor. Bilgi almak veya teklif istemek için bizimle iletişime geçebilirsiniz.
          </p>
          <div className="flex gap-4 mt-10">
            <Link to="/teklif-al" className="inline-flex items-center gap-2 bg-cream text-primary px-6 py-3 rounded-sm font-medium hover:bg-gold transition-colors">
              Teklif Al <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 border border-cream/30 px-6 py-3 rounded-sm font-medium hover:bg-cream/5">
              Anasayfa
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Soon;
