import {useLocation} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {useTenant} from '@/contexts/TenantContext';
import {dynamicPageQuery} from '@/content/dynamic-page-query';
import {PageRenderer} from '@/components/cms/PageRenderer';
import NotFound from '@/pages/NotFound';
export default function DynamicPage(){
 const {pathname,search}=useLocation(),{tenant}=useTenant();
 const {data,isLoading,error}=useQuery(dynamicPageQuery(tenant,pathname,new URLSearchParams(search).get('preview')==='1'));
 if(error)throw error;
 if(isLoading)return null;
 if(!data?.page)return <NotFound/>;
 return <PageRenderer page={data.page} blocks={data.blocks} path={pathname} ctx={data.ctx}/>;
}
