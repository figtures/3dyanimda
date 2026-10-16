import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, Printer } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { useBrand } from "@/brands/config";
import { usePublicPage } from "@/content/public-page-query";
import { previewSearch } from "@/lib/tenant";
import { useFeature } from "@/contexts/FeatureContext";
import { safeHtml } from "@/lib/safe-html";
import "@/components/brand/public-sections.css";

export default function CareerHub() {
  const brand = useBrand();
  const { search } = useLocation();
  const query = previewSearch(search);
  const { data } = usePublicPage("/kariyer");
  const jobs = (data || []) as any[];
  const machineOps = useFeature("career.machine_ops");
  const apply = (position?: string) => {
    const params = new URLSearchParams(query);
    if (position) params.set("position", position);
    return "/kariyer/is-basvurusu" + (params.size ? "?" + params : "");
  };
  return <>
    <Seo title={`Kariyer ve Üretim İş Birliği | ${brand.name}`} description={`${brand.name} için açık pozisyonları inceleyin, genel başvurunuzu veya üretim iş birliği talebinizi iletin.`} path="/kariyer" />
    <PageHero eyebrow="Kariyer ve iş birliği" title="Birlikte üretecek çok şey var." lead="Tasarım, üretim ve operasyon deneyiminizi bizimle paylaşın. Ekibe katılmak veya üretim kapasitenizle iş birliği yapmak için buradan başlayabilirsiniz." breadcrumbs={[{label:"Anasayfa",to:"/"+query},{label:"Kariyer"}]} />
    <div className="wrap public-collection">
      <div className="career-paths">
        <article><BriefcaseBusiness size={32} strokeWidth={1.4}/><h2>Ekibe katılın.</h2><p>Deneyiminizi, ilgi alanlarınızı ve çalışmalarınızı paylaşın. Başvurunuzu mevcut veya ileride oluşabilecek ihtiyaçlar için değerlendirelim.</p><Link className="brand-button" to={apply()}>Genel başvuru <ArrowUpRight size={18}/></Link></article>
        {machineOps && <article><Printer size={32} strokeWidth={1.4}/><h2>Üretimde iş birliği.</h2><p>3D yazıcınızın veya tarayıcınızın özelliklerini ve kapasitenizi iletin. Çalışma modeli, sorumluluklar ve ticari koşullar karşılıklı değerlendirmeyle belirlenir.</p><Link className="text-link" to={"/kariyer/makine-isletim"+query}>İş birliği talebi <ArrowUpRight size={18}/></Link></article>}
      </div>
      <section className="public-subsection" aria-labelledby="career-roles"><h2 id="career-roles">Açık pozisyonlar</h2>
        {jobs.length ? <div className="career-roles">{jobs.map(job=><article key={job.id}><p className="collection-meta">{[job.department,job.location,job.employment_type].filter(Boolean).join(" · ")}</p><h3>{job.title_tr}</h3>{job.summary_tr&&<p>{job.summary_tr}</p>}{(job.description_tr||job.requirements_tr)&&<details><summary>Pozisyonun detayları</summary><div className="public-prose" dangerouslySetInnerHTML={{__html:safeHtml(job.description_tr)}}/>{job.requirements_tr&&<><h4>Aranan nitelikler</h4><div className="public-prose" dangerouslySetInnerHTML={{__html:safeHtml(job.requirements_tr)}}/></>}</details>}<Link className="text-link" to={apply(job.title_tr)}>Bu pozisyona başvur <ArrowUpRight size={17}/></Link></article>)}</div> : <div className="public-empty"><h3>Şu anda yayınlanmış açık pozisyon bulunmuyor.</h3><p>Yeni fırsatlar için genel başvuru formundan kendinizi tanıtabilirsiniz.</p><Link className="text-link" to={apply()}>Kendinizi tanıtın <ArrowUpRight size={17}/></Link></div>}
      </section>
    </div>
  </>;
}
