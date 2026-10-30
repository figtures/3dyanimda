import {Link} from 'react-router-dom';
import {popularDistricts} from './local-commercial';
export default function PopularDistricts({query=''}:{query?:string}) {
 return <nav className="footer-popular-districts" aria-labelledby="footer-districts-heading">
  <div className="footer-districts-heading"><h3 id="footer-districts-heading">Popüler ilçeler</h3><Link to={'/istanbul-3d-baski'+query}>İstanbul 3D baskı →</Link></div>
  <div className="footer-districts-links">{popularDistricts.map(([slug,name])=><Link key={slug} to={'/'+slug+'-3d-baski'+query}>{name} 3D baskı</Link>)}</div>
  <Link className="footer-all-districts" to={'/bolgeler'+query}>Tüm hizmet bölgeleri →</Link>
 </nav>;
}
