import {useEffect,useState} from 'react';
import {Link,NavLink,useLocation} from 'react-router-dom';
import {ArrowUpRight,Box,ChevronDown,Layers3,Menu,ScanLine,Printer,ArrowRight} from 'lucide-react';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {Sheet,SheetContent,SheetTitle,SheetDescription,SheetTrigger} from '@/components/ui/sheet';
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
 const extra=useNavItems('header_extra').filter(i=>i.url.startsWith('/')&&!i.url.startsWith('//'));
 const wordmark=resolveMediaUrl(brand.settings.logo_wordmark?.url);
 const link=(path:string)=>path+(import.meta.env.DEV?location.search:'');
 useEffect(()=>{setExpanded(false);setMobile(false)},[location.pathname,location.search]);
 useEffect(()=>{const mq=window.matchMedia('(min-width: 1100px)');const close=()=>{setMobile(false);setExpanded(false)};mq.addEventListener('change',close);return()=>mq.removeEventListener('change',close)},[]);
 const logo=<Link to={link('/')} className="product-wordmark" aria-label={brand.name+' anasayfa'}>{wordmark?<img src={wordmark} alt={brand.name}/>:<><Box size={27} strokeWidth={1.5}/><span>{brand.name}</span></>}</Link>;
 const directory=(close:()=>void)=><>{groups.map(group=><section className="navigation-group" key={group.title}><h3>{group.title}</h3>{group.items.map(([path,label])=><NavLink key={path} to={link(path)} onClick={close}>{label}<ArrowUpRight size={14}/></NavLink>)}</section>)}{extra.length>0&&<section className="navigation-group"><h3>Diğer bağlantılar</h3>{extra.map(item=><NavLink key={item.id} to={link(item.url)} onClick={close}>{item.label_tr}<ArrowUpRight size={14}/></NavLink>)}</section>}</>;
 return <header className="product-header" data-navigation-theme={theme}>
  <div className="product-header-inner">{logo}
  <nav aria-label="Ana menü" className="product-desktop-nav">
   {services.map(service=><NavLink key={service.path} to={link(service.path)}>{service.label}</NavLink>)}
   <Popover open={expanded} onOpenChange={setExpanded}><PopoverTrigger asChild><button type="button" className="product-explore" aria-label="Keşfet menüsü">Keşfet<ChevronDown size={15} className={expanded?'is-rotated':''}/></button></PopoverTrigger><PopoverContent align="end" sideOffset={20} className="brand-navigation-panel" data-navigation-theme={theme}>
    <div className="navigation-panel-head"><span>{brand.name}</span><span>{brand.focus}</span></div>
    <nav aria-label="Keşfet" className="navigation-directory">{directory(()=>setExpanded(false))}</nav>
    <Link className="navigation-lab" to={link('/araclar')} onClick={()=>setExpanded(false)}><span><strong>3D Lab</strong><small>STL önizleme · Kesit analizi · Tarama görüntüleme</small></span><ArrowUpRight size={23}/></Link>
   </PopoverContent></Popover>
  </nav>
  <div className="product-header-actions"><Link to={link('/araclar')} className="product-lab-link">3D Lab<span>Ücretsiz</span></Link><Link to={link('/teklif-al')} className="product-quote">Teklif al<ArrowUpRight size={17}/></Link>
  <Sheet open={mobile} onOpenChange={setMobile}><SheetTrigger asChild><button className="product-menu-toggle" aria-label="Menüyü aç" type="button"><Menu size={23}/></button></SheetTrigger><SheetContent side="right" className="brand-navigation-drawer" data-navigation-theme={theme}>
   <SheetTitle>{brand.name}</SheetTitle><SheetDescription>Hizmetler, mühendislik araçları ve iletişim.</SheetDescription>
   <nav aria-label="Mobil ana menü" className="navigation-mobile-body"><div className="mobile-service-links">{services.map(service=><NavLink key={service.path} to={link(service.path)} onClick={()=>setMobile(false)}><service.icon size={23}/><span><strong>{service.label}</strong><small>{service.caption}</small></span><ArrowUpRight size={18}/></NavLink>)}</div>
   <div className="navigation-mobile-directory">{directory(()=>setMobile(false))}</div>
   <Link className="navigation-lab" to={link('/araclar')} onClick={()=>setMobile(false)}><span><strong>3D Lab</strong><small>Dosyanızı tarayıcıda inceleyin.</small></span><ArrowUpRight size={23}/></Link></nav>
   <Link className="mobile-quote" to={link('/teklif-al')} onClick={()=>setMobile(false)}>Projeniz için teklif alın<ArrowRight size={19}/></Link>
  </SheetContent></Sheet></div></div>
 </header>;
}
