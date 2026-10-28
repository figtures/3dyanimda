import { Link, useLocation } from 'react-router-dom';
import { InPageLink } from '@/components/site/InPageLink';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { Seo } from '@/components/site/Seo';
import { useBrand } from '@/brands/config';
import { usePublicPage } from '@/content/public-page-query';
import { previewSearch } from '@/lib/tenant';
import { useFeature } from '@/contexts/FeatureContext';
import { safeHtml } from '@/lib/safe-html';
import { careerStory, type CareerRole } from './career-content';
import './career.css';

export default function CareerHub() {
  const brand = useBrand();
  const { search } = useLocation();
  const query = previewSearch(search);
  const { data, isPending, isError, refetch } = usePublicPage('/kariyer');
  const jobs = (data || []) as CareerRole[];
  const machineOps = useFeature('career.machine_ops');
  const story = careerStory(brand.slug);
  const apply = (position?: string) => {
    const params = new URLSearchParams(query);
    if (position) params.set('position', position);
    return '/kariyer/is-basvurusu' + (params.size ? '?' + params : '');
  };
  return <div className="career-page">
    <Seo title={`Kariyer ve Üretim İş Birliği | ${brand.name}`} description={`${brand.name} için açık pozisyonları inceleyin, genel başvurunuzu veya üretim iş birliği talebinizi iletin.`} path="/kariyer" />
    <section className="career-hero wrap" aria-labelledby="career-title">
      <div className="career-hero-copy">
        <p className="career-eyebrow">{brand.name} / Kariyer</p>
        <h1 id="career-title">Ürettiğimiz gelecekte<br /><span>sizin de imzanız olsun.</span></h1>
        <p className="career-intro">{story.intro}</p>
        <InPageLink className="brand-button" hash="#acik-pozisyonlar">Fırsatları keşfedin <ArrowDown size={18} aria-hidden="true" /></InPageLink>
        <div className="career-areas" aria-label="Çalışma alanları">{story.areas.map(area => <span key={area}>{area}</span>)}</div>
      </div>
      <figure className="career-hero-art">
        <img src={story.image} width="1536" height="1024" alt="Dijital tasarımdan üretime uzanan süreci anlatan üç boyutlu konsept" fetchPriority="high" />
        <figcaption><span>Fikir. Detay. Üretim.</span><small>Temsili tasarım</small></figcaption>
      </figure>
    </section>

    <section className="career-opportunities wrap" id="acik-pozisyonlar" aria-labelledby="career-roles">
      <div className="career-section-heading"><div><p className="career-eyebrow">Bir sonraki adımınız</p><h2 id="career-roles">Açık pozisyonlar{jobs.length > 0 && <span className="career-count">{jobs.length}</span>}</h2></div><p>Merakınıza ve deneyiminize uygun alanı bulun. Detayları inceleyin, kendinizi tanıtın.</p></div>
      {isPending ? <p role="status" className="career-state">Pozisyonlar yükleniyor…</p>
        : isError ? <div className="career-state" role="alert"><h3>Pozisyonlar şu anda yüklenemedi.</h3><p>Yeniden deneyebilir veya genel başvuruyla bize ulaşabilirsiniz.</p><button className="text-link" onClick={() => void refetch()}>Yeniden dene</button></div>
        : jobs.length ? <div className="career-roles-list">{jobs.map((job, index) => <article className="career-role" key={job.id}>
          <span className="career-role-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="career-role-main"><p className="career-eyebrow">{job.department}</p><h3>{job.title_tr}</h3>{job.summary_tr && <p>{job.summary_tr}</p>}
            <div className="career-role-meta">{[job.location, job.employment_type, job.level].filter(Boolean).map((item, i) => <span key={i}>{item}</span>)}</div>
            {(job.description_tr || job.requirements_tr) && <details><summary>Pozisyonu tanıyın <Plus size={18} aria-hidden="true" /></summary><div className="career-role-detail">{job.description_tr && <div dangerouslySetInnerHTML={{__html: safeHtml(job.description_tr)}} />}{job.requirements_tr && <><h4>Bu rolde neler arıyoruz?</h4><div dangerouslySetInnerHTML={{__html: safeHtml(job.requirements_tr)}} /></>}</div></details>}
          </div>
          <Link className="career-apply" aria-label={`${job.title_tr} pozisyonuna başvur`} to={apply(job.title_tr)}>Başvur <ArrowUpRight size={20} aria-hidden="true" /></Link>
        </article>)}</div>
        : <div className="career-state"><h3>Şu anda yayınlanmış açık pozisyon bulunmuyor.</h3><p>Doğru fırsat henüz burada olmayabilir. Genel başvuruyla deneyiminizi ve ilgi alanlarınızı paylaşabilirsiniz.</p></div>}
    </section>

    <section className="career-invitations wrap" aria-label="Başvuru seçenekleri">
      <article className="career-invitation"><p className="career-eyebrow">Yeteneğinize yer açalım</p><h2>Sizin alanınız<br />henüz listede değil mi?</h2><p>Kendinizi, ilgi alanlarınızı ve çalışmalarınızı anlatın. Bir sonraki ihtiyaçta nereden başlayacağımızı bilelim.</p><Link className="brand-button" to={apply()}>Genel başvuru <ArrowUpRight size={18} aria-hidden="true" /></Link></article>
      {machineOps && <article className="career-invitation career-partnership"><p className="career-eyebrow">Üretimde iş birliği</p><h2>Makineniz var.<br />Birlikte ne üretebiliriz?</h2><p>Yazıcınızın veya tarayıcınızın kapasitesini paylaşın. Üretim kapsamını ve çalışma koşullarını birlikte değerlendirelim.</p><Link className="text-link" to={'/kariyer/makine-isletim' + query}>İş birliğini konuşalım <ArrowUpRight size={18} aria-hidden="true" /></Link></article>}
    </section>
  </div>;
}
