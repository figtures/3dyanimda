import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { previewSearch } from '@/lib/tenant';
import type { LandingPage } from '@/content/types';
import { Feature } from '@/contexts/FeatureContext';
import './public-sections.css';
export default function HomeDiscovery({sectors}:{sectors:LandingPage[]}) {
 const {search}=useLocation(),q=previewSearch(search);
 return <section className="wrap home-discovery" aria-labelledby="sector-discovery-title"><div className="sector-discovery"><div><p className="brand-eyebrow">Sektörler ve üretim alanları</p><h2 id="sector-discovery-title">Üretim hattından çalışma masanıza.</h2><p>Bir fabrikanın ihtiyacı, bir tasarımcının prototipi veya kişisel bir proje. Kullanım amacını anlayarak uygun malzeme ve üretim yaklaşımını birlikte belirleyelim.</p><Link className="text-link" to={'/sektorler'+q}>Tüm sektörleri keşfedin <ArrowUpRight size={18}/></Link></div><nav aria-label="Sektörler">{sectors.map(sector=><Link key={sector.path} to={sector.path+q}>{sector.title}<ArrowUpRight size={18}/></Link>)}</nav></div><div className="discover-paths"><Feature flag="portfolio"><Link to={'/portfoy'+q}><strong>Portföy</strong><ArrowUpRight size={20}/><p>Yayınlanan çalışmalar ve üretim örnekleri.</p></Link></Feature><Feature flag="faq"><Link to={'/sss'+q}><strong>Sık sorulan sorular</strong><ArrowUpRight size={20}/><p>Dosya, malzeme ve üretim süreci hakkında yanıtlar.</p></Link></Feature><Feature flag="career"><Link to={'/kariyer'+q}><strong>Birlikte çalışalım</strong><ArrowUpRight size={20}/><p>Kariyer fırsatları ve üretim iş birliği.</p></Link></Feature></div></section>;
}
