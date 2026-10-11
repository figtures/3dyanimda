import { previewSearch } from "@/lib/tenant";
import {useEffect,useState,useRef,useId} from 'react';
import {Link,NavLink,useLocation} from 'react-router-dom';
import {ArrowUpRight,Box,ChevronDown,Layers3,Menu,ScanLine,Printer,ArrowRight} from 'lucide-react';
import {useBrand} from '@/brands/config';
import {useNavItems} from '@/hooks/useNavItems';
import {resolveMediaUrl} from '@/lib/media';
import {getSiteTheme} from '@/themes/config';
import './navigation.css';
const services=[{path:'/3d-baski',label:'3D Baskı',caption:'Dijital modelden fiziksel parçaya',icon:Printer},{path:'/3d-tarama',label:'3D Tarama',caption:'Mevcut objeden yüzey verisine',icon:ScanLine},{path:'/3d-modelleme',label:'3D Modelleme',caption:'Fikir ve ölçüden CAD tasarımına',icon:Layers3}];
const groups=[{title:'Üretimi planlayın',items:[['/cozumler','Uygulama alanları'],['/sektorler','Sektörler'],['/malzemeler','Malzeme seçenekleri']]},{title:'Bilgiye ulaşın',items:[['/rehber','Teknik rehberler'],['/bolgeler','Hizmet bölgeleri'],['/hizmetler','Tüm hizmetler']]},{title:'Bizi tanıyın',items:[['/hakkimizda','Hakkımızda'],['/iletisim','İletişim'],['/admin/login','Yönetim girişi']]}];
export default function BrandNavigation(){
 const brand=useBrand();const location=useLocation();const theme=getSiteTheme(brand.slug,location.search);
 const [expanded,setExpanded]=useState(false);const [mobile,setMobile]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),explore=useRef<HTMLDivElement>(null),exploreButton=useRef<HTMLButtonElement>(null);const id=useId();
 useEffect(()=>{const el=dialog.current;if(!el)return;if(mobile&&!el.open)el.showModal();else if(!mobile&&el.open)el.close();const old=document.body.style.overflow;if(mobile)document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;};},[mobile]);
 useEffect(()=>{if(!expanded)return;const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setExpanded(false);exploreButton.current?.focus();}};const outside=(event:PointerEvent)=>{if(!explore.current?.contains(event.target as Node))setExpanded(false);};document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};},[expanded]);
 const extra=useNavItems('header_extra').filter(i=>i.url.startsWith('/')&&!i.url.startsWith('//'));
 const wordmark=resolveMediaUrl(brand.settings.logo_wordmark?.url);
 const link=(path:string)=>path+previewSearch(location.search);
 useEffect(()=>{setExpanded(false);setMobile(false)},[location.pathname,location.search]);
 useEffect(()=>{const mq=window.matchMedia('(min-width: 1100px)');const close=()=>{setMobile(false);setExpanded(false)};mq.addEventListener('change',close);return()=>mq.removeEventListener('change',close)},[]);
 const logo=<Link to={link('/')} className="product-wordmark" aria-label={brand.name+' anasayfa'}>{wordmark?<img src={wordmark} alt={brand.name}/>:<><Box size={27} strokeWidth={1.5}/><span>{brand.name}</span></>}</Link>;
 const directory=(close:()=>void)=><>{groups.map(group=><section className="navigation-group" key={group.title}><h3>{group.title}</h3>{group.items.map(([path,label])=><NavLink key={path} to={link(path)} onClick={close}>{label}<ArrowUpRight size={14}/></NavLink>)}</section>)}{extra.length>0&&<section className="navigation-group"><h3>Diğer bağlantılar</h3>{extra.map(item=><NavLink key={item.id} to={link(item.url)} onClick={close}>{item.label_tr}<ArrowUpRight size={14}/></NavLink>)}</section>}</>;
 return <header className="product-header" data-navigation-theme={theme}>
  <div className="product-header-inner">{logo}
  <nav aria-label="Ana menü" className="product-desktop-nav">
   {services.map(service=><NavLink key={service.path} to={link(service.path)}>{service.label}</NavLink>)}
   <div ref={explore}><button ref={exploreButton} type="button" className="product-explore" aria-label="Keşfet menüsü" aria-expanded={expanded} aria-controls={id+"-explore"} onClick={()=>setExpanded(!expanded)}>Keşfet<ChevronDown size={15} className={expanded?'is-rotated':''}/></button>{expanded&&<div id={id+"-explore"} className="brand-navigation-panel native-navigation-panel" data-navigation-theme={theme}>
    <div className="navigation-panel-head"><span>{brand.name}</span><span>{brand.focus}</span></div>
    <nav aria-label="Keşfet" className="navigation-directory">{directory(()=>setExpanded(false))}</nav>
    <Link className="navigation-lab" to={link('/araclar')} onClick={()=>setExpanded(false)}><span><strong>3D Lab</strong><small>STL önizleme · Kesit analizi · Tarama görüntüleme</small></span><ArrowUpRight size={23}/></Link>
   </div>}</div>
  </nav>
  <div className="product-header-actions"><Link to={link('/araclar')} className="product-lab-link">3D Lab<span>Ücretsiz</span></Link><Link to={link('/teklif-al')} className="product-quote">Teklif al<ArrowUpRight size={17}/></Link>
  <button className="product-menu-toggle" aria-label="Menüyü aç" type="button" aria-haspopup="dialog" aria-expanded={mobile} aria-controls={id+"-mobile"} onClick={()=>setMobile(true)}><Menu size={23}/></button><dialog ref={dialog} id={id+"-mobile"} aria-labelledby={id+"-title"} aria-describedby={id+"-description"} className="brand-navigation-drawer native-navigation-drawer" data-navigation-theme={theme} onCancel={()=>setMobile(false)} onClose={()=>setMobile(false)} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)setMobile(false);}}}>{mobile&&<>
   <h2 id={id+"-title"}>{brand.name}</h2><p id={id+"-description"}>Hizmetler, mühendislik araçları ve iletişim.</p><button type="button" className="native-navigation-close" aria-label="Menüyü kapat" onClick={()=>setMobile(false)}>×</button>
   <nav aria-label="Mobil ana menü" className="navigation-mobile-body"><div className="mobile-service-links">{services.map(service=><NavLink key={service.path} to={link(service.path)} onClick={()=>setMobile(false)}><service.icon size={23}/><span><strong>{service.label}</strong><small>{service.caption}</small></span><ArrowUpRight size={18}/></NavLink>)}</div>
   <div className="navigation-mobile-directory">{directory(()=>setMobile(false))}</div>
   <Link className="navigation-lab" to={link('/araclar')} onClick={()=>setMobile(false)}><span><strong>3D Lab</strong><small>Dosyanızı tarayıcıda inceleyin.</small></span><ArrowUpRight size={23}/></Link></nav>
   <Link className="mobile-quote" to={link('/teklif-al')} onClick={()=>setMobile(false)}>Projeniz için teklif alın<ArrowRight size={19}/></Link>
  </>}</dialog></div></div>
 </header>;
}
