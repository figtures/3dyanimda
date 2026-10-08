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
        return Response.redirect(url.href,target!==clean?301:308);
      }
    }
    const preview=env.RELEASE_MODE!=='approved' || url.hostname!==env.SITE_DOMAIN;
    if(url.pathname==='/robots.txt' && preview) return new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain','X-Robots-Tag':'noindex'}});
    const privateRoute=/^\/(admin|studio)(\/|$)/.test(url.pathname);
    let response;
    if(privateRoute) {
      url.pathname=env.RELEASE_MODE==='approved'?'/app.html':'/index.html';
      response=await env.ASSETS.fetch(new Request(url,request));
    } else response=await env.ASSETS.fetch(request);
    if(response.status===404 && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      url.pathname=env.RELEASE_MODE==='approved'?'/404.html':'/index.html';
      const fallback=await env.ASSETS.fetch(new Request(url,request));
      response=new Response(fallback.body,{status:env.RELEASE_MODE==='approved'?404:fallback.status,headers:fallback.headers});
    }
    const result=new Response(response.body,response);
    result.headers.set('X-Content-Type-Options','nosniff');
    result.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
    if(preview || privateRoute || url.pathname==='/app.html' || result.status===404) result.headers.set('X-Robots-Tag','noindex, nofollow');
    if(privateRoute) result.headers.set('Cache-Control','no-store');
    return result;
  }
};
