import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
} from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandLayout as Layout } from "@/components/brand/BrandLayout";

import BrandAbout from "./pages/BrandAbout";
import BrandLegal from "./pages/BrandLegal";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FeatureProvider } from "@/contexts/FeatureContext";
import { RequireFeature } from "@/components/site/RequireFeature";
import "@/lib/tenant";
import Index from "./pages/Index";
import { RequirePermission } from "@/components/admin/RequirePermission";

// Code-split: ana sayfa hariç tüm route'lar lazy
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
const Portfolio = lazy(() => import("./pages/Portfolio"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));

// Legal

// Career
const JobApplication = lazy(() => import("./pages/career/JobApplication"));
const MachineOperation = lazy(() => import("./pages/career/MachineOperation"));

// Admin
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

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Index /> },
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
      { path: "/hakkimizda", element: <BrandAbout /> },
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

const RenderReadiness = () => (
  <span hidden data-pending-queries={useIsFetching()} />
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <RenderReadiness />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TenantProvider>
          <ThemeProvider>
            <FeatureProvider>
              <RouterProvider router={router} />
            </FeatureProvider>
          </ThemeProvider>
        </TenantProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
