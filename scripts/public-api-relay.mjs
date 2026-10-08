import { createHash } from "node:crypto";

/** One real-public-API snapshot cache per tenant's HTML export, kept only in memory.
 * No fixture, credentials replacement, or response substitution is used.
 */
export function createPublicApiRelay({ timeoutMs = 30_000, fetchImpl = fetch } = {}) {
  const snapshots = new Map();
  const pending = new Map();
  const cacheable = ({ status, headers }) =>
    status >= 200 && status < 300 &&
    !(headers.vary || "").split(",").some(value => ["*", "referer"].includes(value.trim().toLowerCase()));

  return async function relayPublicApi(route) {
    const request = route.request();
    try {
      const method = request.method();
      const url = new URL(request.url());
      const headers = await request.allHeaders();
      const body = !["GET", "HEAD"].includes(method) ? request.postDataBuffer() : undefined;
      const isSnapshotRead = method === "GET" ||
        (method === "POST" && url.pathname === "/rest/v1/rpc/current_tenant_id");
      const identityHeaders = Object.entries(headers)
        .map(([name, value]) => [name.toLowerCase(), value])
        .sort(([a], [b]) => a.localeCompare(b));
      const keyFor = selectedHeaders => createHash("sha256").update(JSON.stringify({
        method, url: url.href, headers: selectedHeaders, body: body?.toString("base64") ?? null,
      })).digest("hex");
      // Authorization, API key, tenant host, origin, accept and every other
      // header remain in the key. Only the page's Referer is reusable; Vary:
      // Referer (or *) responses are never reused. Raw secrets are not logged.
      const key = isSnapshotRead ? keyFor(identityHeaders.filter(([name]) => name !== "referer")) : null;
      const pendingKey = isSnapshotRead ? keyFor(identityHeaders) : null;
      const readActual = async () => {
        const response = await fetchImpl(request.url(), {
          method, headers, ...(body !== undefined ? { body } : {}),
          redirect: "manual", signal: AbortSignal.timeout(timeoutMs),
        });
        const bytes = Buffer.from(await response.arrayBuffer());
        const responseHeaders = Object.fromEntries(response.headers);
        // Node fetch decodes compressed bytes; discard only transport headers
        // that no longer describe the body passed to Playwright.
        for (const name of ["content-encoding", "content-length", "transfer-encoding", "connection"])
          delete responseHeaders[name];
        return { status: response.status, headers: Object.freeze(responseHeaders), body: bytes };
      };
      let snapshot = key && snapshots.get(key);
      if (!snapshot) {
        const running = pendingKey && pending.get(pendingKey);
        if (running) {
          const candidate = await running;
          // A failed or Vary:* / Vary:Referer response is not replayed even to
          // an identical concurrent reader. It gets its own actual request.
          snapshot = cacheable(candidate) ? candidate : await readActual();
        } else {
          const work = readActual();
          if (pendingKey) pending.set(pendingKey, work);
          try { snapshot = await work; }
          finally { if (pendingKey) pending.delete(pendingKey); }
        }
        if (key && cacheable(snapshot)) snapshots.set(key, snapshot);
      }
      await route.fulfill({
        status: snapshot.status,
        headers: { ...snapshot.headers, "access-control-allow-origin": "*" },
        body: Buffer.from(snapshot.body),
      });
    } catch (error) {
      throw new Error(`Public API relay failed for ${new URL(request.url()).pathname} (${error?.name || "Error"}).`);
    }
  };
}

/** One-off forwarding without retaining a cache between calls. */
export async function relayPublicApi(route, options) {
  return createPublicApiRelay(options)(route);
}
