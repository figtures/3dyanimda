import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { usePublicPage } from "@/content/public-page-query";
import { useBrand } from "@/brands/config";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { faqJsonLd } from "@/components/site/FAQ";
import { previewSearch } from "@/lib/tenant";
import "@/components/brand/public-sections.css";
import {operationsFaq,researchedFaq,researchedSources} from '@/content/business-operations.mjs';
export default function FaqPage() {
 const brand=useBrand(),{search}=useLocation(),query=previewSearch(search);
 const {data}=usePublicPage("/sss");const authored=(data||[]) as any[];
 const additions=brand.slug==='3dyanimda'?[...operationsFaq.common,...operationsFaq['3d-tarama'],...operationsFaq['3d-baski'],...researchedFaq].map((f,i)=>({id:'operations-'+i,question_tr:f.q,answer_tr:f.a})):[];
 const items=[...authored,...additions.filter(f=>!authored.some(a=>a.question_tr===f.question_tr))];
 const [term,setTerm]=useState("");
 const filtered=items.filter(x=>(x.question_tr+" "+x.answer_tr).toLocaleLowerCase("tr").includes(term.toLocaleLowerCase("tr")));
 const jsonItems=filtered.map(x=>({q:x.question_tr,a:x.answer_tr}));
 return <><Seo title={`Sık Sorulan Sorular | ${brand.name}`} description="Dosya hazırlığı, malzeme seçimi, fiyatlandırma ve teslimat hakkında sorularınıza yanıtlar." path="/sss" jsonLd={jsonItems.length?[faqJsonLd(jsonItems)]:undefined} noindex={!items.length}/><PageHero eyebrow="Sık sorulan sorular" title="Başlamadan önce aklınızdakiler." lead="İlk kez 3D baskı yaptırıyor veya teknik bir proje planlıyor olabilirsiniz. İhtiyacınız olan yanıtı burada bulun." breadcrumbs={[{label:"Anasayfa",to:"/"+query},{label:"SSS"}]}/><section className="wrap public-collection faq-collection"><label className="faq-search"><Search size={20} aria-hidden="true"/><span className="sr-only">Sorularda ara</span><input type="search" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Dosya, malzeme, teslimat…"/></label><div className="public-faq-list">{filtered.map((item,i)=><details key={item.id||i}><summary>{item.question_tr}<Plus size={20} aria-hidden="true"/></summary><p>{item.answer_tr}</p></details>)}</div>{!filtered.length&&<p role="status">{items.length?"Aramanızla eşleşen soru bulunamadı. Farklı bir kelime deneyebilirsiniz.":"Sorularınızı iletişim sayfamızdan bize iletebilirsiniz."}</p>}<div className="public-contact">{brand.slug==='3dyanimda'&&<p>Teknik başvuru kaynakları: {researchedSources.map((source,i)=><span key={source.url}>{i>0&&' · '}<a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></span>)}</p>}<h2>Başka bir sorunuz var mı?</h2><Link className="brand-button" to={"/iletisim"+query}>Bize ulaşın <ArrowUpRight size={18}/></Link></div></section></>;
}
