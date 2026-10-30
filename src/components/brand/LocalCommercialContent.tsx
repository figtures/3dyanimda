import {Link} from 'react-router-dom';
import type {LandingPage} from '@/content/types';
import {serviceKey,servicePlace} from '@/content/service-experience.mjs';
import {localServices} from './local-commercial';
import './local-commercial.css';
export default function LocalCommercialContent({page,quoteUrl,query=''}:{page:LandingPage;quoteUrl:string;query?:string}) {
 const service=localServices[serviceKey(page) as keyof typeof localServices];
 if(!service)return null;
 const place=servicePlace(page);
 return <div className="local-commercial-content">
  <section id="neden-3d-yanimda" aria-labelledby="local-value-heading">
   <p className="brand-eyebrow">DOSYADAN ÜRETİME</p>
   <h2 id="local-value-heading">{place} {service.name} için neden 3D Yanımda?</h2>
   <p>{service.introduction}</p>
   <dl className="local-value-list">{service.benefits.map(([title,body],i)=><div key={title}><dt><span aria-hidden="true">0{i+1}</span>{title}</dt><dd>{body}</dd></div>)}</dl>
  </section>
  <section id="fiyat-ve-teklif" className="local-price-panel" aria-labelledby="local-price-heading">
   <p className="brand-eyebrow">KAPSAMI NETLEŞTİRİN</p>
   <h2 id="local-price-heading">{place} {service.name} fiyatı nasıl belirlenir?</h2>
   <p>{service.price}</p>
   <div className="local-commercial-actions"><Link className="brand-button" to={quoteUrl}>{service.quoteLabel} →</Link><Link to={service.priceGuide+query}>Maliyeti etkileyen ayrıntılar →</Link></div>
  </section>
  <section id="proje-hazirligi" aria-labelledby="local-process-heading">
   <h2 id="local-process-heading">Tekliften teslimata, üç net adım</h2>
   <ol className="local-process-list">
    <li><h3>Dosya veya numuneyle başlayın</h3><p>{service.inputs}</p></li>
    <li><h3>Teknik kapsamı birlikte belirleyelim</h3><p>Malzeme veya çıktı formatı, adet, kritik ölçüler ve revizyon ihtiyacını teklifin parçası yapın. Üretime geçmeden önce kapsam ve tutar netleşsin.</p></li>
    <li><h3>Teslimat planını netleştirelim</h3><p>{place} için teslim noktası ve ihtiyaç tarihini belirtin. Üretim süresini taşıma süresinden ayrı planlayın; acil taleplerde uygunluğu sipariş öncesinde teyit edin.</p></li>
   </ol>
  </section>
  <nav className="local-decision-links" aria-label="Üretim kararına yardımcı kaynaklar"><h3>Karar vermeden önce inceleyin</h3>{service.guides.map(([path,label])=><Link key={path} to={path+query}>{label} →</Link>)}<Link to={'/portfoy'+query}>Üretim çalışmalarını inceleyin →</Link></nav>
 </div>;
}
