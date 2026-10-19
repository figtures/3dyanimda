import assert from 'node:assert/strict';
import {compileRedirects,legacyRedirects} from '../search/redirects.mjs';

export const coreRoutes=['/','/araclar','/araclar/stl-onizle','/araclar/kesit-analizi','/araclar/tarama-goruntuleyici','/sektorler','/hizmetler','/cozumler','/malzemeler','/rehber','/bolgeler','/hakkimizda','/iletisim','/teklif-al'];
export const legalRoutes=['/yasal','/kvkk-aydinlatma-metni','/gizlilik-politikasi','/cerez-politikasi','/kullanim-kosullari','/basvuru-acik-riza-metni'];

/** Plan from successful public API reads, never from the generated sitemap. */
export function publicExportRoutes({landing,pages,posts,seo,redirects,portfolio,features,faqs}) {
 for(const value of [landing,pages,posts,seo,redirects,portfolio,features,faqs])assert.ok(Array.isArray(value),'Missing public route inventory');
 const enabled=key=>!features.some(f=>f.feature_key===key&&f.enabled===false);
 const routes=new Map(coreRoutes.map(p=>[p,null]));
 const noindex=new Map(legalRoutes.map(p=>[p,'legal-utility']));
 if(enabled('faq')) {routes.set('/sss',null);if(!faqs.length)noindex.set('/sss','empty-faq');}
 if(enabled('portfolio')) {
  routes.set('/portfoy',null);
  if(!portfolio.length)noindex.set('/portfoy','empty-portfolio');
  for(const p of portfolio)routes.set('/portfoy/'+p.slug,p.updated_at);
 }
 if(enabled('career')) {
  routes.set('/kariyer',null);routes.set('/kariyer/is-basvurusu',null);
  if(enabled('career.machine_ops'))routes.set('/kariyer/makine-isletim',null);
 }
 for(const p of landing)routes.set(p.path,p.updated_at);
 for(const p of pages) {
  const url='/'+p.slug.replace(/^\//,'');
  if(!p.meta?.noindex&&!/^\/(bolgeler|istanbul)(\/|$)/.test(url))routes.set(url,p.updated_at);
 }
 for(const p of posts)routes.set('/blog/'+p.slug,p.updated_at);
 for(const p of seo.filter(p=>p.noindex))routes.delete(p.path);
 for(const url of legalRoutes)routes.set(url,null);
 const redirectMap=compileRedirects([...legacyRedirects,...redirects],new Set(routes.keys()));
 for(const source of Object.keys(redirectMap))routes.delete(source);
 for(const url of noindex.keys())if(!routes.has(url))noindex.delete(url);
 for(const url of routes.keys())assert.ok(/^\/[a-z0-9/-]*$/.test(url)&&!url.includes('..'),'Unsafe public path');
 return {routes,noindex,redirectMap};
}

/** Missing, unexpected or misclassified HTML remains a release blocker. */
export function assertExportedRouteSets(plan,{htmlPaths,indexPaths,approvedPaths=[]}) {
 assert.equal(htmlPaths.length,new Set(htmlPaths).size,'Duplicate exported HTML');
 assert.equal(indexPaths.length,new Set(indexPaths).size,'Duplicate indexed route');
 assert.deepEqual(new Set(htmlPaths),new Set(plan.routes.keys()),'Exported HTML must match public API route inventory');
 assert.deepEqual(new Set(indexPaths),new Set([...plan.routes.keys()].filter(p=>!plan.noindex.has(p))),'Discovery must contain exactly the indexable routes');
 for(const route of approvedPaths)assert.ok(indexPaths.includes(route),'Missing approved landing route: '+route);
 for(const route of coreRoutes)assert.ok(indexPaths.includes(route),'Missing core route: '+route);
}

/** Reachable noindex pages are valid destinations, outside the discovery graph. */
export function indexableLinkTarget(href,{origin,sourcePath,plan}) {
 const url=new URL(href,origin);
 if(url.origin!==origin||/^\/(admin|studio|auth)(\/|$)/.test(url.pathname))return null;
 const target=url.pathname.replace(/\/+$/,'')||'/';
 if(/\.[a-z0-9]+$/i.test(target))return null;
 assert.ok(plan.routes.has(target),'Unpublished internal target '+sourcePath+' -> '+target);
 return plan.noindex.has(target)?null:target;
}
