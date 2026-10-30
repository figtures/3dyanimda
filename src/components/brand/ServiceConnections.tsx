import {Link} from 'react-router-dom';
import type {LandingPage} from '@/content/types';
import {serviceExperience} from '@/content/service-experience.mjs';
import {publicLocalPath} from '@/lib/local-urls.mjs';
import './local-commercial.css';

export default function ServiceConnections({page, brand, query = ''}: {page: LandingPage; brand: string; query?: string}) {
  const experience = serviceExperience(page, brand);
  if (!experience) return null;
  const currentPath = publicLocalPath(page.path, brand);
  return <section id="dort-hizmet" className="service-connections" aria-labelledby="service-connections-heading">
    <p className="brand-eyebrow">İHTİYACINIZA GÖRE BAŞLAYIN</p>
    <h2 id="service-connections-heading">{experience.heading}</h2>
    <p>Hazır dosyanız varsa baskıyla, fiziksel parçanız varsa taramayla, çizim veya fikriniz varsa modellemeyle başlayın. Yedek parça talebinde gereken adımları aynı proje içinde değerlendirelim.</p>
    <div className="service-connections-grid">
      {experience.links.map(service => <Link key={service.key} to={service.path + query} aria-current={service.path === currentPath ? 'page' : undefined}>
        <h3>{service.name}</h3><p>{service.description}</p>
        <span>{service.path === currentPath ? 'Bu sayfadaki hizmet' : 'Hizmeti inceleyin'} →</span>
      </Link>)}
    </div>
  </section>;
}
