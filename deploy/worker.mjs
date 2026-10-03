/** Serve exported HTML with real 404s; keep administrative client routes functional. */
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
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
