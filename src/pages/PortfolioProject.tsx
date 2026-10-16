import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { usePublicPage } from "@/content/public-page-query";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { previewSearch } from "@/lib/tenant";
import { resolveMediaUrl } from "@/lib/media";
import { safeHtml } from "@/lib/safe-html";
import type { PortfolioProject as Project } from "./Portfolio";
import "@/components/brand/public-sections.css";
export default function PortfolioProject() {
 const {pathname,search}=useLocation(),query=previewSearch(search),brand=useBrand();
 const {data}=usePublicPage(pathname);const project=data as Project|null;
 if(!project)return <><Seo title="Proje bulunamadı" description="Bu proje yayında değil. Diğer çalışmalarımızı portföy sayfasından inceleyebilirsiniz." path={pathname} noindex/><div className="wrap public-collection"><h1>Bu proje yayında değil.</h1><Link className="text-link" to={"/portfoy"+query}>Portföye dön</Link></div></>;
 const gallery=Array.isArray(project.gallery)?project.gallery.map(x=>typeof x==="string"?x:x?.url).filter((x):x is string=>typeof x==="string"):[];
 return <><Seo title={`${project.title_tr} | ${brand.name}`} description={project.excerpt_tr||project.title_tr} path={pathname}/><PageHero eyebrow={project.industry||"Proje çalışması"} title={project.title_tr} lead={project.excerpt_tr||undefined} breadcrumbs={[{label:"Anasayfa",to:"/"+query},{label:"Portföy",to:"/portfoy"+query},{label:project.title_tr}]}/><article className="wrap public-collection portfolio-detail">{project.cover_image_url&&<img className="project-cover" src={resolveMediaUrl(project.cover_image_url)} alt={project.title_tr} width="1200" height="800"/>}{!!project.materials?.length&&<p className="collection-meta">Malzemeler: {project.materials.join(" · ")}</p>}<div className="public-prose" dangerouslySetInnerHTML={{__html:safeHtml(project.content_tr)}}/>{gallery.length>0&&<div className="project-gallery">{gallery.map((url,i)=><img key={url+String(i)} src={resolveMediaUrl(url)} alt={`${project.title_tr} — detay ${i+1}`} width="960" height="720" loading="lazy"/>)}</div>}<div className="public-contact"><h2>Benzer bir projeniz mi var?</h2><Link className="brand-button" to={"/teklif-al"+query}>Birlikte değerlendirelim <ArrowUpRight size={18}/></Link></div></article></>;
}
