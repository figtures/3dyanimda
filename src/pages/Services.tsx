import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { Services as ServicesGrid } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Capabilities } from "@/components/sections/Capabilities";
import { CTA } from "@/components/sections/CTA";

const ServicesPage = () => (
  <>
    <Seo
      title="Hizmetlerimiz — 3D Tarama, Modelleme ve Baskı"
      description="3D tarama, mühendislik modelleme ve yüksek hassasiyetli 3D baskı. Türkiye'nin uçtan uca dijital üretim atölyesi 3D Yanında'nın hizmet detayları."
      path="/hizmetler"
    />
    <PageHero
      eyebrow="Hizmetler"
      breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Hizmetler" }]}
      title={<>Tek atölye, <span className="text-gradient-blue italic font-medium">uçtan uca</span> dijital üretim.</>}
      lead="Tarama, mühendislik modelleme ve baskı süreçlerinin tamamını tek bir ekiple yönetiyoruz. Bu sayede süre kısalıyor, kalite garanti altına alınıyor."
      ctaPrimary={{ label: "Teklif al", to: "/teklif-al" }}
    />
    <ServicesGrid />
    <Process />
    <Capabilities />
    <CTA />
  </>
);

export default ServicesPage;