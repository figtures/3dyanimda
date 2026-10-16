import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/TenantContext";
import type { LandingPage } from "./types";
import { contentQuery, contentPageQuery, relatedContentQuery } from "./queries";
export function useContent(includeDrafts=false, full=false, options:{kinds?:string[];enabled?:boolean}={}) {
  return useQuery(contentQuery(useTenant().tenant,includeDrafts,full,options));
}
export function useContentPage(path:string) {return useQuery(contentPageQuery(useTenant().tenant,path));}
export function useRelatedContent(page:LandingPage|null|undefined) {return useQuery(relatedContentQuery(useTenant().tenant,page));}
