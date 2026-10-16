import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { usePublicPage } from "@/content/public-page-query";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { previewSearch } from "@/lib/tenant";
import { resolveMediaUrl } from "@/lib/media";
import { modelsForBrand } from "@/themes/models";
import "@/components/brand/public-sections.css";
export type PortfolioProject = {id:string;slug:string;title_tr:string;excerpt_tr:string|null;cover_image_url:string|null;industry:string|null;content_tr?:string;gallery?:unknown;materials?:string[];tags?:string[]};
export default function Portfolio() {
 const brand=useBrand(),{search}=useLocation(),query=previewSearch(search);
 const {data}=usePublicPage("/portfoy");
 const projects=(data||[]) as PortfolioProject[];
 const [category,setCategory]=useState("Tümü");
 const categories=useMemo(()=>["Tümü",...new Set(projects.map(p=>p.industry).filter(Boolean) as string[])],[projects]);
 const visible=projects.filter(p=>category==="Tümü"||p.industry===category);
 return <>
  <Seo title={`Portföy ve Proje Çalışmaları | ${brand.name}`} description={`${brand.name} tarafından yayınlanan 3D baskı, tarama ve modelleme proje çalışmalarını inceleyin.`} path="/portfoy" noindex={!projects.length}/>
  <PageHero eyebrow="Portföy" title="Fikirden parçaya, projenin hikâyesi." lead="Yayınlanan çalışmalar üzerinden projenin ihtiyacını, kullanılan yaklaşımı ve üretim detaylarını inceleyin." breadcrumbs={[{label:"Anasayfa",to:"/"+query},{label:"Portföy"}]}/>
  <section className="wrap public-collection">
   {categories.length>2&&<div className="collection-filters" role="group" aria-label="Portföy kategorisi">{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div>}
   {projects.length>0?<div className="portfolio-grid">{visible.map(p=><Link className="portfolio-project" key={p.id} to={"/portfoy/"+encodeURIComponent(p.slug)+query}>{p.cover_image_url&&<img src={resolveMediaUrl(p.cover_image_url)} alt={p.title_tr} width="960" height="720" loading="lazy"/>}<div>{p.industry&&<p className="collection-meta">{p.industry}</p>}<h2>{p.title_tr}</h2>{p.excerpt_tr&&<p>{p.excerpt_tr}</p>}<span className="text-link">Projeyi incele <ArrowUpRight size={18}/></span></div></Link>)}</div>:<>
    <div className="public-empty"><h2>Proje seçkimiz hazırlanıyor.</h2><p>Bu marka için henüz yayınlanmış bir müşteri projesi bulunmuyor. Aşağıdaki geometriler, üretim olanaklarını anlatan temsili tasarımlardır.</p></div>
    <div className="portfolio-concepts">{modelsForBrand(brand.slug).map(model=><article key={model.id}><span className="collection-meta">Temsili tasarım</span><h3>{model.material}</h3><p>{model.description}</p><Link className="text-link" to={"/"+query+"#ornekler"}>3D örnekleri incele <ArrowUpRight size={17}/></Link></article>)}</div>
   </>}
   <div className="public-contact"><h2>Sizin projenizle başlayalım.</h2><Link className="brand-button" to={"/teklif-al"+query}>Projenizi paylaşın <ArrowUpRight size={18}/></Link></div>
  </section>
 </>;
}
