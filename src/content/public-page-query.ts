import { getSupabase, demoMode } from '@/lib/backend-config';
import type { Tenant } from '@/contexts/TenantContext';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
export function publicPageQuery(tenant:Tenant|null,path:string) {
 return {queryKey:['public-page',tenant?.id,path],enabled:!!tenant,staleTime:60_000,queryFn:async()=>{
  if(demoMode && path==='/sss') {
    const {default:faqs}=await import('./brand-faq.json');
    return (faqs[tenant!.slug as keyof typeof faqs]||[]).map(([question_tr,answer_tr],i)=>({id:String(i),question_tr,answer_tr,category:'Üretim süreci'}));
  }
  if(demoMode && path==='/kariyer') {
    const {default:roles}=await import('./career-roles.json');
    return (roles[tenant!.slug as keyof typeof roles]||[]).map(role=>({...role,id:tenant!.slug+'-'+role.slug}));
  }
  if(demoMode)return path.startsWith('/blog/')||path.startsWith('/portfoy/')||isLegalPath(path)?null:[];
  const db=await getSupabase(),id=tenant!.id,now=new Date().toISOString();
  const result=path==='/blog'? await db.from('blog_posts').select('slug,title,excerpt,title_en,excerpt_en,cover_image_url,published_at').eq('tenant_id',id).eq('published',true).or(`published_at.is.null,published_at.lte.${now}`).order('published_at',{ascending:false})
   :path.startsWith('/blog/')? await db.from('blog_posts').select('slug,title,excerpt,content,title_en,excerpt_en,content_en,cover_image_url,tags,published_at').eq('tenant_id',id).eq('slug',decodeURIComponent(path.slice(6))).eq('published',true).or(`published_at.is.null,published_at.lte.${now}`).maybeSingle()
   :path==='/portfoy'? await db.from('portfolio_projects').select('id,slug,title_tr,title_en,excerpt_tr,excerpt_en,cover_image_url,industry').eq('tenant_id',id).eq('published',true).or(`published_at.is.null,published_at.lte.${now}`).order('sort_order',{ascending:true})
   :path.startsWith('/portfoy/')? await db.from('portfolio_projects').select('id,slug,title_tr,excerpt_tr,content_tr,cover_image_url,gallery,industry,materials,tags').eq('tenant_id',id).eq('slug',decodeURIComponent(path.slice(9))).eq('published',true).or(`published_at.is.null,published_at.lte.${now}`).maybeSingle()
   :path==='/kariyer'? await db.from('job_postings').select('id,slug,title_tr,department,location,employment_type,level,summary_tr,description_tr,requirements_tr').eq('tenant_id',id).eq('active',true).order('sort_order',{ascending:true})
   :path==='/sss'? await db.from('faq_items').select('id,question_tr,question_en,answer_tr,answer_en,category,sort_order,active').eq('tenant_id',id).eq('active',true).order('sort_order',{ascending:true})
   :await db.from('legal_documents').select('title_tr,content_tr').eq('tenant_id',id).eq('slug',path.slice(1)).maybeSingle();
  if(result.error)throw result.error;
  return result.data;
 }};
}
export const isLegalPath=(path:string)=>['/yasal','/kvkk-aydinlatma-metni','/gizlilik-politikasi','/cerez-politikasi','/kullanim-kosullari','/basvuru-acik-riza-metni'].includes(path);
export const hasPublicPageQuery=(path:string)=>isLegalPath(path)||['/blog','/sss','/portfoy','/kariyer'].includes(path)||path.startsWith('/blog/')||path.startsWith('/portfoy/');
export function usePublicPage(path:string){return useQuery(publicPageQuery(useTenant().tenant,path));}
