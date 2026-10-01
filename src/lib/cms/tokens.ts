// Token interpolation for CMS block data.
// Supports {{item.field}}, {{params.name}}, {{tenant.field}} inside any string.
// Walks objects/arrays recursively without touching non-string values.

export type TokenContext = {
  item?: Record<string, any> | null;
  params?: Record<string, string> | null;
  tenant?: Record<string, any> | null;
  page?: Record<string, any> | null;
};

const TOKEN_RE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function getPath(obj: any, path: string): any {
  if (obj == null) return undefined;
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function interpolateString(input: string, ctx: TokenContext): string {
  if (!input || typeof input !== "string") return input;
  if (!input.includes("{{")) return input;
  return input.replace(TOKEN_RE, (full, path: string) => {
    const dot = path.indexOf(".");
    if (dot === -1) return full;
    const root = path.slice(0, dot);
    const rest = path.slice(dot + 1);
    let src: any;
    switch (root) {
      case "item": src = ctx.item; break;
      case "params": src = ctx.params; break;
      case "tenant": src = ctx.tenant; break;
      case "page": src = ctx.page; break;
      default: return full;
    }
    const v = getPath(src, rest);
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
    try { return JSON.stringify(v); } catch { return ""; }
  });
}

export function interpolateDeep<T>(value: T, ctx: TokenContext): T {
  if (value == null) return value;
  if (typeof value === "string") return interpolateString(value, ctx) as any;
  if (Array.isArray(value)) return value.map((v) => interpolateDeep(v, ctx)) as any;
  if (typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value as any)) {
      out[k] = interpolateDeep((value as any)[k], ctx);
    }
    return out;
  }
  return value;
}

// Pattern matcher: supports `/:name` segments. Returns params map or null.
export function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const pParts = pattern.split("/").filter(Boolean);
  const xParts = path.split("/").filter(Boolean);
  if (pParts.length !== xParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pParts.length; i++) {
    const p = pParts[i];
    const x = xParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(x);
    } else if (p !== x) {
      return null;
    }
  }
  return params;
}

export function specificity(pattern: string): number {
  // More literal segments = more specific.
  const parts = pattern.split("/").filter(Boolean);
  let score = 0;
  for (const p of parts) score += p.startsWith(":") ? 1 : 10;
  return score;
}