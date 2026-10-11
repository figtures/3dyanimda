/** Reuse only anonymous reads already embedded in this exact public HTML page.
 * Writes, authenticated sessions, other tenants and later navigation always use
 * the live API. Each response is consumed once, within 30 seconds of startup. */
type Entry = { key: string; body: string; contentType: string };
type Snapshot = { host: string; path: string; apiOrigin: string; entries: Entry[] };
export function createPublicBootstrapFetch(snapshot: Snapshot | null, next: typeof fetch, host: string, pagePath: () => string, now = () => performance.now()): typeof fetch {
  const started = now();
  const entries = new Map(snapshot?.entries.map(e => [e.key,e]) || []);
  return async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    const headers = request.headers;
    const key = headers.get('apikey');
    const anonymous = key && headers.get('authorization') === `Bearer ${key}`;
    const read = request.method === 'GET' || (request.method === 'POST' && url.pathname === '/rest/v1/rpc/current_tenant_id');
    if (snapshot && anonymous && read && host === snapshot.host && pagePath() === snapshot.path && url.origin === snapshot.apiOrigin && now()-started < 30000) {
      const body = request.method === 'POST' ? await request.clone().text() : '';
      const id = JSON.stringify([request.method,url.pathname+url.search,headers.get('accept') || '*/*',body]);
      const entry = entries.get(id);
      if (entry) {
        entries.delete(id);
        return new Response(entry.body,{status:200,headers:{'content-type':entry.contentType}});
      }
    }
    return next(input,init);
  };
}
export function readPublicBootstrap(): Snapshot | null {
  const node=document.getElementById('public-bootstrap');
  if (!node) return null;
  try {
    const result=JSON.parse(node.textContent || 'null');node.remove();
    return result && typeof result.host==='string' && typeof result.path==='string' && typeof result.apiOrigin==='string' && Array.isArray(result.entries) && result.entries.every((e:Entry)=>typeof e.key==='string'&&typeof e.body==='string'&&typeof e.contentType==='string') ? result : null;
  }
  catch {node.remove();return null;}
}
