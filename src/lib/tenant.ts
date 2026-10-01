// Public tenant selection is not authorization. Private access is enforced by RLS.
let tenantId: string | null = null;
const listeners = new Set<(id: string | null) => void>();
export const getTenantId = () => tenantId;
export function setTenantId(id: string | null) {
  if (tenantId === id) return;
  tenantId = id;
  listeners.forEach((listener) => listener(id));
}
export function onTenantChange(callback: (id: string | null) => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
export function normalizeHost(host: string) {
  return host.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}
export function requestHost(
  host: string,
  search: string,
  development: boolean,
) {
  const normalized = normalizeHost(host);
  if (development && ["localhost", "127.0.0.1"].includes(normalized)) {
    const slug = new URLSearchParams(search).get("tenant") || "3dyanimda";
    return /^[a-z0-9-]+$/.test(slug)
      ? `${slug}.localhost`
      : "invalid.localhost";
  }
  return normalized;
}
// Keep the resolved host stable during SPA navigation; brand switches use full navigation.
const initialRequestHost = requestHost(
  window.location.hostname,
  window.location.search,
  import.meta.env.DEV,
);
export const getRequestHost = () => initialRequestHost;
export function tenantFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
  headers.set("x-tenant-host", getRequestHost());
  if (tenantId) headers.set("x-tenant-id", tenantId);
  else headers.delete("x-tenant-id");
  return fetch(input, { ...init, headers });
}

let identity: { name: string; domain: string | null } = {
  name: "3D üretim",
  domain: null,
};
export const setTenantIdentity = (value: typeof identity) => {
  identity = value;
};
export const getTenantIdentity = () => ({
  name: identity.name,
  origin: identity.domain
    ? `https://${identity.domain}`
    : window.location.origin,
});
