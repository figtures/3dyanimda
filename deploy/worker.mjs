import { secureResponse } from './security-headers.mjs';
/** Serve exported HTML with real 404s; keep administrative client routes functional. */
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if (env.RELEASE_MODE === 'approved' && (url.hostname === env.SITE_DOMAIN || url.hostname === 'www.'+env.SITE_DOMAIN)) {
      const aliases={'/hizmetler/3d-baski':'/3d-baski','/hizmetler/3d-tarama':'/3d-tarama','/hizmetler/3d-modelleme':'/3d-modelleme','/teklif':'/teklif-al'};
      const clean=url.pathname.replace(/\/index\.html$/,'/').replace(/\/+$/,'') || '/';
      let redirects=aliases;
      const manifestUrl=new URL('/redirect-manifest.json',url);
      const manifestResponse=await env.ASSETS.fetch(new Request(manifestUrl));
      if(manifestResponse.ok){
        try {
          const manifest=await manifestResponse.json();
          if(manifest.origin==='https://'+env.SITE_DOMAIN && manifest.redirects && typeof manifest.redirects==='object') redirects={...aliases,...manifest.redirects};
        } catch { /* An unavailable manifest must never become an open redirect. */ }
      }
      const mapped=redirects[clean];
      const target=typeof mapped==='string' && /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(mapped) ? mapped : clean;
      if(url.protocol!=='https:' || url.hostname!==env.SITE_DOMAIN || url.pathname!==target){
        url.protocol='https:';url.hostname=env.SITE_DOMAIN;url.pathname=target;
        return secureResponse(Response.redirect(url.href,target!==clean?301:308));
      }
    }
    const preview=env.RELEASE_MODE!=='approved' || url.hostname!==env.SITE_DOMAIN;
    if(url.pathname==='/robots.txt' && preview) return secureResponse(new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain','X-Robots-Tag':'noindex'}}));
    const privateRoute=/^\/(admin|studio)(\/|$)/.test(url.pathname);
    let response;
    if(privateRoute) {
      // Fetch the asset's canonical path: requesting app.html would make the
      // asset service return an external redirect and lose the admin URL.
      url.pathname=env.RELEASE_MODE==='approved'?'/app':'/';
      response=await env.ASSETS.fetch(new Request(url,request));
    } else response=await env.ASSETS.fetch(request);
    if(response.status===404 && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      url.pathname=env.RELEASE_MODE==='approved'?'/404':'/';
      const fallback=await env.ASSETS.fetch(new Request(url,request));
      response=new Response(fallback.body,{status:env.RELEASE_MODE==='approved'?404:fallback.status,headers:fallback.headers});
    }
    const result=secureResponse(response,{privateRoute});
    result.headers.set('X-Content-Type-Options','nosniff');
    if(preview || privateRoute || ['/app','/app.html','/404','/404.html'].includes(url.pathname) || result.status===404) result.headers.set('X-Robots-Tag','noindex, nofollow');
    if(privateRoute) result.headers.set('Cache-Control','no-store');
    else if(result.headers.get('Content-Type')?.includes('text/html')) result.headers.set('Cache-Control','no-cache');
    // Failed hashed assets must not be cached through a deployment transition.
    if(result.status>=400 && url.pathname.startsWith('/assets/')) result.headers.set('Cache-Control','no-store');
    return result;
  }
};
