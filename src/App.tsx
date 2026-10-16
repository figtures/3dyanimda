import {dynamicPageQuery} from "@/content/dynamic-page-query";
import {prepareContentDestination,registerRoutePreparation} from "@/lib/route-preparation";
import {RouteErrorBoundary} from "@/components/site/RouteErrorBoundary";
import {preloadable as lazy} from '@/lib/preloadable';
import {publicRenderState,setPublicRenderState,publicQueryForPath} from '@/lib/public-render-state';
import {exportPublicTenant} from '@/contexts/TenantContext';
import {exportPublicSettings} from '@/hooks/useSiteSettings';
import {exportPublicNav} from '@/hooks/useNavItems';
import {exportPublicFlags} from '@/contexts/FeatureContext';
import {exportPublicTheme} from '@/contexts/ThemeContext';
import {exportPublicSeo} from '@/hooks/useSeoOverride';
import {exportPublicRedirects} from '@/hooks/useRedirects';
import {getRequestHost} from '@/lib/tenant';
import {
  QueryClient,
  dehydrate, hydrate,
  QueryClientProvider,
  useIsFetching,
} from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { createBrowserRouter, RouterProvider, matchRoutes, type RouteObject } from "react-router-dom";
import { Suspense,useSyncExternalStore,isValidElement,Children } from "react";
import { BrandLayout as Layout } from "@/components/brand/BrandLayout";

import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FeatureProvider } from "@/contexts/FeatureContext";
import { RequireFeature } from "@/components/site/RequireFeature";
import "@/lib/tenant";
const RequirePermission=lazy(()=>import("@/components/admin/RequirePermission").then(m=>({default:m.RequirePermission})));

// Keep each page's implementation out of unrelated routes' initial bundles.
const Index = lazy(() => import("./pages/Index"));
const BrandAbout = lazy(() => import("./pages/BrandAbout"));
const BrandLegal = lazy(() => import("./pages/BrandLegal"));
const Engineering = lazy(() => import("./pages/Engineering"));
const LegacyLocation = lazy(() => import("./pages/LegacyLocation"));
const ContentPage = lazy(() => import("./pages/ContentPage"));
const ContentHub = lazy(() => import("./pages/ContentHub"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const QuoteRequest = lazy(() => import("./pages/QuoteRequest"));
const Contact = lazy(() => import("./pages/Contact"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const CareerHub = lazy(() => import("./pages/career/CareerHub"));
const PortfolioProject = lazy(() => import("./pages/PortfolioProject"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));

// Legal

// Career
const JobApplication = lazy(() => import("./pages/career/JobApplication"));
const MachineOperation = lazy(() => import("./pages/career/MachineOperation"));

// Admin
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminBlogList = lazy(() => import("./pages/admin/AdminBlogList"));
const AdminBlogEdit = lazy(() => import("./pages/admin/AdminBlogEdit"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminRequests = lazy(() => import("./pages/admin/AdminRequests"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns"));
const AdminTranslations = lazy(() => import("./pages/admin/AdminTranslations"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminFaq = lazy(() => import("./pages/admin/AdminFaq"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminHomepage = lazy(() => import("./pages/admin/AdminHomepage"));
const AdminServicesCards = lazy(
  () => import("./pages/admin/AdminServicesCards"),
);
const AdminContactInfo = lazy(() => import("./pages/admin/AdminContactInfo"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminPortfolio"));
const AdminSeo = lazy(() => import("./pages/admin/AdminSeo"));
const AdminLegal = lazy(() => import("./pages/admin/AdminLegal"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications"));
const AdminMachineOps = lazy(() => import("./pages/admin/AdminMachineOps"));
const AdminEmailTemplates = lazy(
  () => import("./pages/admin/AdminEmailTemplates"),
);
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminJobs = lazy(() => import("./pages/admin/AdminJobs"));
const AdminNavigation = lazy(() => import("./pages/admin/AdminNavigation"));
const AdminSubscribers = lazy(() => import("./pages/admin/AdminSubscribers"));
const AdminAnnouncements = lazy(
  () => import("./pages/admin/AdminAnnouncements"),
);
const AdminRedirects = lazy(() => import("./pages/admin/AdminRedirects"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminTheme = lazy(() => import("./pages/admin/AdminTheme"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminPageEdit = lazy(() => import("./pages/admin/AdminPageEdit"));
const AdminCollections = lazy(() => import("./pages/admin/AdminCollections"));
const AdminCollectionEdit = lazy(
  () => import("./pages/admin/AdminCollectionEdit"),
);
const AdminCollectionItemEdit = lazy(
  () => import("./pages/admin/AdminCollectionItemEdit"),
);
const AdminRoutes = lazy(() => import("./pages/admin/AdminRoutes"));

// Studio (super admin)
const StudioLayout = lazy(() => import("./pages/studio/StudioLayout"));
const StudioDashboard = lazy(() => import("./pages/studio/StudioDashboard"));
const StudioTenants = lazy(() => import("./pages/studio/StudioTenants"));
const StudioTenantDetail = lazy(
  () => import("./pages/studio/StudioTenantDetail"),
);
const StudioThemes = lazy(() => import("./pages/studio/StudioThemes"));
const StudioFeatures = lazy(() => import("./pages/studio/StudioFeatures"));
const StudioOnboard = lazy(() => import("./pages/studio/StudioOnboard"));

const Fallback = () => <div className="min-h-screen" aria-hidden />;
const wrap = (node: React.ReactNode) => (
  <Suspense fallback={<Fallback />}>{node}</Suspense>
);

const queryClient = new QueryClient();
const initialState=publicRenderState();
if(initialState)hydrate(queryClient,{...initialState.queries,queries:initialState.queries.queries.map(q=>({...q,state:{...q.state,dataUpdatedAt:Date.now()}}))});
function publicRouteComponent(path:string){
 return path==='/kariyer'?CareerHub:path==='/portfoy'?Portfolio:path.startsWith('/portfoy/')?PortfolioProject:path==='/sss'?FaqPage:path==='/kariyer/is-basvurusu'?JobApplication:path==='/kariyer/makine-isletim'?MachineOperation:path==='/'?Index:path==='/teklif-al'?QuoteRequest:path==='/iletisim'?Contact:path==='/hakkimizda'?BrandAbout:['/sektorler','/hizmetler','/cozumler','/malzemeler','/rehber','/bolgeler'].includes(path)?ContentHub:(/^\/(3d-baski|3d-tarama|3d-modelleme)$/.test(path)||/^\/(cozumler|sektorler|malzemeler|rehber|bolgeler)\//.test(path))?ContentPage:null;
}
export async function preparePublicRoute(path:string){
 const component=publicRouteComponent(path);await component?.preload();return !!component;
}
const NotificationOverlays=lazy(()=>import('./components/site/NotificationOverlays'));

async function prepareRouteData(url:URL,dynamic=false){
 const tenant=exportPublicTenant()||publicRenderState()?.tenant||null;
 await prepareContentDestination(queryClient,tenant,url.pathname);
 if(dynamic&&tenant)await queryClient.ensureQueryData(dynamicPageQuery(tenant,url.pathname,url.searchParams.get('preview')==='1'));
}
async function preloadElement(node:React.ReactNode):Promise<void> {
 if(!isValidElement<{children?:React.ReactNode}>(node))return;
 const component=node.type as {preload?:()=>Promise<unknown>};
 await Promise.all([component.preload?.(),...Children.toArray(node.props.children).map(preloadElement)]);
}
function prepareRoutes(routes:RouteObject[]):RouteObject[] {
 return routes.map(route=>({...route,errorElement:<RouteErrorBoundary/>,
  loader:async({request})=>{
   const url=new URL(request.url);
   await Promise.all([preloadElement(route.element),prepareRouteData(url,route.path==="*")]);
   return null;
  }, ...(route.children?{children:prepareRoutes(route.children)}:{})} as RouteObject));
}
const routes = prepareRoutes([
  {
    element: <Layout />,
    children: [
      { path: "/", element: wrap(<Index />) },
      ...[
        "/araclar",
        "/araclar/stl-onizle",
        "/araclar/kesit-analizi",
        "/araclar/tarama-goruntuleyici",
      ].map((path) => ({ path, element: wrap(<Engineering />) })),
      ...[
        "/sektorler",
        "/hizmetler",
        "/cozumler",
        "/malzemeler",
        "/rehber",
        "/bolgeler",
      ].map((path) => ({ path, element: wrap(<ContentHub />) })),
      ...[
        "/3d-baski",
        "/3d-tarama",
        "/3d-modelleme",
        "/cozumler/:slug",
        "/sektorler/:slug",
        "/malzemeler/:slug",
        "/rehber/:slug",
        "/bolgeler/*",
      ].map((path) => ({ path, element: wrap(<ContentPage />) })),
      { path: "/kariyer", element: wrap(<RequireFeature flag="career"><CareerHub /></RequireFeature>) },
      { path: "/portfoy/:slug", element: wrap(<RequireFeature flag="portfolio"><PortfolioProject /></RequireFeature>) },
      { path: "/hakkimizda", element: wrap(<BrandAbout />) },
      { path: "/teklif-al", element: wrap(<QuoteRequest />) },
      {
        path: "/portfoy",
        element: wrap(
          <RequireFeature flag="portfolio">
            <Portfolio />
          </RequireFeature>,
        ),
      },
      {
        path: "/blog",
        element: wrap(
          <RequireFeature flag="blog">
            <Blog />
          </RequireFeature>,
        ),
      },
      {
        path: "/blog/:slug",
        element: wrap(
          <RequireFeature flag="blog">
            <BlogPost />
          </RequireFeature>,
        ),
      },
      {
        path: "/sss",
        element: wrap(
          <RequireFeature flag="faq">
            <FaqPage />
          </RequireFeature>,
        ),
      },
      { path: "/iletisim", element: wrap(<Contact />) },
      { path: "/istanbul/:ilce/:hizmet", element: wrap(<LegacyLocation />) },
      {
        path: "/kariyer/is-basvurusu",
        element: wrap(
          <RequireFeature flag="career">
            <JobApplication />
          </RequireFeature>,
        ),
      },
      {
        path: "/kariyer/makine-isletim",
        element: wrap(
          <RequireFeature flag="career.machine_ops">
            <MachineOperation />
          </RequireFeature>,
        ),
      },
      {
        path: "/yasal",
        element: wrap(
          <RequireFeature flag="legal">
            <BrandLegal />
          </RequireFeature>,
        ),
      },
      {
        path: "/kvkk-aydinlatma-metni",
        element: wrap(
          <RequireFeature flag="legal">
            <BrandLegal />
          </RequireFeature>,
        ),
      },
      {
        path: "/gizlilik-politikasi",
        element: wrap(
          <RequireFeature flag="legal">
            <BrandLegal />
          </RequireFeature>,
        ),
      },
      {
        path: "/cerez-politikasi",
        element: wrap(
          <RequireFeature flag="legal">
            <BrandLegal />
          </RequireFeature>,
        ),
      },
      {
        path: "/kullanim-kosullari",
        element: wrap(
          <RequireFeature flag="legal">
            <BrandLegal />
          </RequireFeature>,
        ),
      },
      {
        path: "/basvuru-acik-riza-metni",
        element: wrap(
          <RequireFeature flag="legal">
            <BrandLegal />
          </RequireFeature>,
        ),
      },
      { path: "*", element: wrap(<DynamicPage />) },
    ],
  },
  // Admin: kendi layout'u, site Layout'unun dışında
  { path: "/admin/login", element: wrap(<AdminLogin />) },
  { path: "/admin/reset-password", element: wrap(<AdminResetPassword />) },
  {
    path: "/admin",
    element: wrap(<AdminLayout />),
    children: [
      { index: true, element: wrap(<AdminDashboard />) },
      { path: "blog", element: wrap(<AdminBlogList />) },
      { path: "blog/:id", element: wrap(<AdminBlogEdit />) },
      {
        path: "content",
        element: wrap(
          <RequirePermission permission="seo.edit">
            <AdminContent />
          </RequirePermission>,
        ),
      },
      { path: "pricing", element: wrap(<AdminPricing />) },
      { path: "campaigns", element: wrap(<AdminCampaigns />) },
      { path: "requests", element: wrap(<AdminRequests />) },
      { path: "translations", element: wrap(<AdminTranslations />) },
      { path: "settings", element: wrap(<AdminSettings />) },
      { path: "media", element: wrap(<AdminMedia />) },
      { path: "users", element: wrap(<AdminUsers />) },
      { path: "faq", element: wrap(<AdminFaq />) },
      { path: "testimonials", element: wrap(<AdminTestimonials />) },
      { path: "homepage", element: wrap(<AdminHomepage />) },
      { path: "services-cards", element: wrap(<AdminServicesCards />) },
      { path: "contact-info", element: wrap(<AdminContactInfo />) },
      { path: "portfolio", element: wrap(<AdminPortfolio />) },
      { path: "seo", element: wrap(<AdminSeo />) },
      { path: "legal", element: wrap(<AdminLegal />) },
      { path: "applications", element: wrap(<AdminApplications />) },
      { path: "machine-ops", element: wrap(<AdminMachineOps />) },
      { path: "email-templates", element: wrap(<AdminEmailTemplates />) },
      { path: "messages", element: wrap(<AdminMessages />) },
      { path: "jobs", element: wrap(<AdminJobs />) },
      { path: "navigation", element: wrap(<AdminNavigation />) },
      { path: "subscribers", element: wrap(<AdminSubscribers />) },
      { path: "announcements", element: wrap(<AdminAnnouncements />) },
      { path: "redirects", element: wrap(<AdminRedirects />) },
      { path: "audit-log", element: wrap(<AdminAuditLog />) },
      {
        path: "team",
        element: wrap(
          <RequirePermission permission="users.view">
            <AdminTeam />
          </RequirePermission>,
        ),
      },
      {
        path: "roles",
        element: wrap(
          <RequirePermission permission="roles.view">
            <AdminRoles />
          </RequirePermission>,
        ),
      },
      {
        path: "theme",
        element: wrap(
          <RequirePermission permission="settings.theme">
            <AdminTheme />
          </RequirePermission>,
        ),
      },
      { path: "pages", element: wrap(<AdminPages />) },
      { path: "pages/:id", element: wrap(<AdminPageEdit />) },
      { path: "collections", element: wrap(<AdminCollections />) },
      { path: "collections/:id", element: wrap(<AdminCollectionEdit />) },
      {
        path: "collections/:id/items/:itemId",
        element: wrap(<AdminCollectionItemEdit />),
      },
      { path: "routes", element: wrap(<AdminRoutes />) },
    ],
  },
  {
    path: "/studio",
    element: wrap(<StudioLayout />),
    children: [
      { index: true, element: wrap(<StudioDashboard />) },
      { path: "tenants", element: wrap(<StudioTenants />) },
      { path: "tenants/:id", element: wrap(<StudioTenantDetail />) },
      { path: "themes", element: wrap(<StudioThemes />) },
      { path: "features", element: wrap(<StudioFeatures />) },
      { path: "onboard", element: wrap(<StudioOnboard />) },
    ],
  },
]);

const router=createBrowserRouter(routes);
export async function prepareInitialRoute(){
 if(router.state.initialized)return;
 await new Promise<void>(resolve=>{const unsubscribe=router.subscribe(state=>{if(state.initialized){unsubscribe();resolve();}});});
}
registerRoutePreparation(async url=>{
 const matched=matchRoutes(routes,url.pathname)||[];
 await Promise.all([...matched.map(match=>preloadElement(match.route.element)),prepareRouteData(url,matched.some(match=>match.route.path==="*"))]);
});
const subscribeRoute=(changed:()=>void)=>router.subscribe(changed);
const notificationRoute=()=>!publicRouteComponent(router.state.location.pathname);
function RouteNotifications(){
 const needed=useSyncExternalStore(subscribeRoute,notificationRoute,notificationRoute);
 return needed?<Suspense fallback={null}><NotificationOverlays/></Suspense>:null;
}
const RenderReadiness = () => (
  <span hidden data-pending-queries={useIsFetching()} />
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <RenderReadiness />
        <RouteNotifications />
        <TenantProvider>
          <ThemeProvider>
            <FeatureProvider>
              <RouterProvider router={router} />
            </FeatureProvider>
          </ThemeProvider>
        </TenantProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

// Export-only dynamic import: never fetched by a normal visitor.
(window as any).__renderPublicPage=async()=>{
 if(!await preparePublicRoute(location.pathname))return null;
 const tenant=exportPublicTenant()||publicRenderState()?.tenant;if(!tenant)return null;
 const queries=dehydrate(queryClient,{shouldDehydrateMutation:()=>false,shouldDehydrateQuery:q=>q.state.status==='success'&&publicQueryForPath(q.queryKey,tenant.id,location.pathname)});
 const state={version:1 as const,host:getRequestHost(),path:location.pathname,search:location.search,tenant,settings:exportPublicSettings(tenant.id),nav:exportPublicNav(tenant.id),flags:exportPublicFlags(),queries,seo:exportPublicSeo(tenant.id,location.pathname),theme:exportPublicTheme(),redirects:exportPublicRedirects(tenant.id)};
 setPublicRenderState(state);
 const {renderToString}=await import('react-dom/server.browser');
 return {html:renderToString(<App/>),state};
};
export default App;
