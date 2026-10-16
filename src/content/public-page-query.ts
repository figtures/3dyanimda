import { getSupabase, demoMode } from '@/lib/backend-config';
import type { Tenant } from '@/contexts/TenantContext';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
export function publicPageQuery(tenant:Tenant|null,path:string) {
 return {queryKey:['public-page',tenant?.id,path],enabled:!!tenant,staleTime:60_000,queryFn:async()=>{
  if(demoMode)return path.startsWith('/blog/')||isLegalPath(path)?null:[];
  const db=await getSupabase(),id=tenant!.id,now=new Date().toISOString();
  const result=path==='/blog'? await db.from('blog_posts').select('slug,title,excerpt,title_en,excerpt_en,cover_image_url,published_at').eq('tenant_id',id).eq('published',true).or(`published_at.is.null,published_at.lte.${now}`).order('published_at',{ascending:false})
   :path.startsWith('/blog/')? await db.from('blog_posts').select('slug,title,excerpt,content,title_en,excerpt_en,content_en,cover_image_url,tags,published_at').eq('tenant_id',id).eq('slug',decodeURIComponent(path.slice(6))).eq('published',true).or(`published_at.is.null,published_at.lte.${now}`).maybeSingle()
   :path==='/portfoy'? await db.from('portfolio_projects').select('id,slug,title_tr,title_en,excerpt_tr,excerpt_en,cover_image_url,industry').eq('tenant_id',id).eq('published',true).or(`published_at.is.null,published_at.lte.${now}`).order('sort_order',{ascending:true})
   :path==='/sss'? await db.from('faq_items').select('question_tr,question_en,answer_tr,answer_en,sort_order,active').eq('tenant_id',id).eq('active',true).order('sort_order',{ascending:true})
   :await db.from('legal_documents').select('title_tr,content_tr').eq('tenant_id',id).eq('slug',path.slice(1)).maybeSingle();
  if(result.error)throw result.error;
  return result.data;
 }};
}
export const isLegalPath=(path:string)=>['/yasal','/kvkk-aydinlatma-metni','/gizlilik-politikasi','/cerez-politikasi','/kullanim-kosullari','/basvuru-acik-riza-metni'].includes(path);
export const hasPublicPageQuery=(path:string)=>isLegalPath(path)||['/blog','/sss','/portfoy'].includes(path)||path.startsWith('/blog/');
export function usePublicPage(path:string){return useQuery(publicPageQuery(useTenant().tenant,path));}
