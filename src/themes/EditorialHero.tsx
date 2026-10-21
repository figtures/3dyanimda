import { lazy, Suspense, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useBrand } from "@/brands/config";
import "./editorial-visual.css";
const FormationScene=lazy(()=>import('./FormationScene'));
export default function EditorialHero({title,query}:{title:string;query:string}) {
 const brand=useBrand();const [paused,setPaused]=useState(false),[phase,setPhase]=useState(0);
 const poster=brand.image||`/brand/industrial/${brand.heroAsset}.webp`;
 return <section className="formation-hero" aria-labelledby="editorial-title">
  <div className="formation-light" aria-hidden="true"/>
  <div className="formation-copy wrap"><p>3D baskı · Tarama · Modelleme</p><h1 id="editorial-title">{title}</h1><p className="formation-lead">{brand.lead}</p></div>
  <div className="formation-stage"><Suspense fallback={<img className="formation-poster" src={poster} alt="3D üretim — temsili uygulama" width="1536" height="1024" fetchPriority="high"/>}><FormationScene paused={paused} onPhase={setPhase} fallback={poster}/></Suspense></div>
  <div className="formation-footer wrap"><div className="formation-process" aria-label="3D üretimin aşamaları"><span className={phase===0?'is-current':''}>Fikir</span><span aria-hidden="true">/</span><span className={phase===1?'is-current':''}>Form</span><span aria-hidden="true">/</span><span className={phase===2?'is-current':''}>Üretim</span></div><Link className="brand-button" to={'/teklif-al'+query}>Fikrinizi üretime taşıyın <ArrowUpRight size={20}/></Link><button className="formation-motion" type="button" aria-label={paused?'3D animasyonu oynat':'3D animasyonu duraklat'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={17}/>:<Pause size={17}/>}</button></div>
  <p className="formation-note">Temsili 3D tasarımlar. Üretim yöntemi ve malzeme projenize göre belirlenir.</p>
 </section>;
}
