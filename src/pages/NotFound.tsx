import { Link, useLocation } from "react-router-dom";
import { Seo } from "@/components/site/Seo";

const NotFound = () => {
  const { pathname } = useLocation();
  return (
    <>
      <Seo title="Sayfa Bulunamadı (404)" description="Aradığınız sayfa mevcut değil." path={pathname} noindex />
      <section className="bg-hero text-cream min-h-[70vh] flex items-center grain">
        <div className="container-page py-24 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cream/85">Hata 404</p>
          <h1 className="font-serif text-6xl md:text-7xl mt-4">Sayfa bulunamadı.</h1>
          <p className="text-cream/90 mt-5 max-w-md mx-auto">Aradığınız sayfa kaldırılmış ya da hiç var olmamış olabilir.</p>
          <Link to="/" className="inline-flex mt-8 items-center bg-cream text-primary px-6 py-3 rounded-sm font-medium hover:bg-gold">Anasayfaya dön</Link>
        </div>
      </section>
    </>
  );
};
export default NotFound;
