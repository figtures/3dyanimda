/** Capture public responses from the anonymous export, never credentials or writes. */
const allowed=new Set(['current_tenant_id','tenants','site_settings','seo_meta','landing_pages','features','tenant_features','tenant_theme_config','url_redirects','navigation_items','nav_items','translations','legal_documents']);
export function capturePublicBootstrap(page,apiOrigin,host) {
 let entries=new Map();const pending=new Set();
 page.on('response',response=>{
  const work=(async()=>{
   const url=new URL(response.url());const request=response.request();
   if(url.origin!==apiOrigin || response.status()!==200 || !allowed.has(url.pathname.split('/').at(-1)))return;
   const method=request.method();if(method!=='GET'&&!(method==='POST'&&url.pathname==='/rest/v1/rpc/current_tenant_id'))return;
   const headers=typeof request.allHeaders==='function'?await request.allHeaders():request.headers();
   if(!headers.apikey || headers.authorization!==`Bearer ${headers.apikey}`)return;
   const body=await response.text();JSON.parse(body);
   const key=JSON.stringify([method,url.pathname+url.search,headers.accept||'*/*',method==='POST'?request.postData()||'':'']);
   entries.set(key,{key,body,contentType:response.headers()['content-type']||'application/json'});
  })();pending.add(work);work.finally(()=>pending.delete(work)).catch(()=>{});
 });
 return {
  clear(){entries=new Map();},
  async embed(){
   await Promise.all([...pending]);
   const snapshot={host,path:new URL(page.url()).pathname,apiOrigin,entries:[...entries.values()]};
   await page.evaluate(snapshot=>{document.getElementById('public-bootstrap')?.remove();const script=document.createElement('script');script.id='public-bootstrap';script.type='application/json';script.textContent=JSON.stringify(snapshot).replace(/</g,'\\u003c');document.head.appendChild(script);},snapshot);
   return snapshot.entries.length;
  }
 };
}
