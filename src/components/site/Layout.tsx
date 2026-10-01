import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent } from "./CookieConsent";
import { AnalyticsListener } from "./AnalyticsListener";
import { MobileStickyCTA } from "./MobileStickyCTA";
import { AnnouncementBar } from "./AnnouncementBar";
import { FloatingContactButtons } from "./FloatingContactButtons";
import { useRedirects } from "@/hooks/useRedirects";

export const Layout = () => {
  useRedirects();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pt-[72px]">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
      <CookieConsent />
      <AnalyticsListener />
      <MobileStickyCTA />
      <FloatingContactButtons />
    </div>
  );
};
