// Isolated production-export fixture, not a live Supabase integration test.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import assert from "node:assert/strict";
const all = JSON.parse(await readFile("src/content/pages.json", "utf8"));
const host = "3dyanimda.example";
const tenant = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "3dyanimda",
  name: "3dyanımda",
  domain: host,
  custom_domain: null,
  status: "active",
  settings: {},
};
const rows = all
  .filter((p) => p.brand === tenant.slug && p.status === "published")
  .map((p) => ({
    ...p,
    tenant_id: tenant.id,
    updated_at: "2026-10-02T00:00:00Z",
  }));
const hidden = "/rehber/numune-ve-revizyon";
const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }
  const url = new URL(req.url, "http://localhost");
  const table = url.pathname.split("/").pop();
  let data = [];
  if (table === "current_tenant_id") data = tenant.id;
  else if (table === "tenants") data = [tenant];
  else if (table === "landing_pages") data = rows;
  else if (table === "seo_meta")
    data = url.searchParams.get("path")
      ? url.searchParams.get("path") === "eq." + hidden
        ? [{ path: hidden, noindex: true }]
        : []
      : [{ path: hidden, noindex: true }];
  if (req.headers.accept?.includes("application/vnd.pgrst.object"))
    data = Array.isArray(data) ? data[0] || null : data;
  res.end(JSON.stringify(data));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const env = {
  ...process.env,
  VITE_SUPABASE_URL: `http://127.0.0.1:${server.address().port}`,
  VITE_SUPABASE_PUBLISHABLE_KEY: "public-fixture-key",
  SITE_HOSTS: host,
};
const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    child.stdout.on("data", (b) => {
      out += b;
    });
    child.stderr.on("data", (b) => {
      out += b;
    });
    child.on("close", (code) => (code ? reject(new Error(out)) : resolve(out)));
  });
try {
  await run("npm", ["run", "build"]);
  console.log("PASS production bundle with fixture API");
  console.log(await run("node", ["scripts/export-sites.mjs"]));
  const root = `release/${host}`;
  const html = await readFile(`${root}/3d-tarama/index.html`, "utf8");
  assert.ok(html.includes("Tarama ile CAD aynı şey değildir"));
  assert.ok(html.includes("https://3dyanimda.example/3d-tarama"));
  assert.ok(html.includes("application/ld+json"));
  assert.ok(!html.includes("noindex"));
  const sitemap = await readFile(`${root}/sitemap.xml`, "utf8");
  assert.ok(!sitemap.includes("/bolgeler/istanbul/atasehir"));
  assert.ok(!sitemap.includes(hidden));
  assert.ok(sitemap.includes("/bolgeler/istanbul"));
  const notfound = await readFile(`${root}/404.html`, "utf8");
  assert.ok(notfound.includes("noindex"));
  assert.ok(notfound.includes("Sayfa bulunamadı."));
  const redirects = await readFile(`${root}/_redirects`, "utf8");
  assert.ok(redirects.includes("/* /404.html 404"));
  console.log(
    "PASS rendered HTML, canonical, schema, draft/noindex exclusion, 404 output",
  );
} finally {
  await new Promise((r) => server.close(r));
  await rm(`release/${host}`, { recursive: true, force: true });
}
