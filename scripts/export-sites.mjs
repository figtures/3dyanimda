/** Build-time HTML export, using the public API and each registered canonical host.
 * Usage: npm run build && SITE_HOSTS=3dyanimda.com,... npm run export:sites
 * Never uses a service-role key. Throws instead of deploying empty tenant pages.
 */
import "./quality/release-preflight.mjs";
import { readFile, writeFile, mkdir, cp, stat, rm } from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "vite";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";
const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const hosts = (env.SITE_HOSTS || "").split(",").filter(Boolean);
if (
  !hosts.length ||
  !env.VITE_SUPABASE_URL ||
  !env.VITE_SUPABASE_PUBLISHABLE_KEY
)
  throw new Error("SITE_HOSTS and public Supabase configuration are required.");
const root = path.resolve(env.SITE_BUILD_DIR || "dist"),
  output = path.resolve(env.SITE_OUTPUT_DIR || "release");
const shell = await readFile(path.join(root, "index.html"), "utf8");
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const mime = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
};
const browser = await chromium.launch({
  headless: true,
  ...(env.CHROMIUM_EXECUTABLE
    ? {
        executablePath: env.CHROMIUM_EXECUTABLE,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      }
    : {}),
});
try {
  for (const host of hosts) {
    if (!/^[a-z0-9.-]+$/.test(host)) throw new Error("Invalid hostname");
    const base = `https://${host}`;
    const api = createClient(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_PUBLISHABLE_KEY,
      {
        global: { headers: { "x-tenant-host": host } },
        auth: { persistSession: false },
      },
    );
    const { data: tenantId, error: tenantError } =
      await api.rpc("current_tenant_id");
    if (tenantError || !tenantId) throw new Error(`Unregistered host: ${host}`);
    const { data: tenant } = await api
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();
    if ((tenant.custom_domain || tenant.domain) !== host)
      throw new Error(`Use canonical domain for ${host}`);
    const [landing, pages, posts, seo] = await Promise.all([
      api
        .from("landing_pages")
        .select("path,updated_at")
        .eq("tenant_id", tenantId)
        .eq("status", "published"),
      api
        .from("pages")
        .select("slug,meta,updated_at")
        .eq("tenant_id", tenantId)
        .eq("status", "published"),
      api
        .from("blog_posts")
        .select("slug,published_at,updated_at")
        .eq("tenant_id", tenantId)
        .eq("published", true)
        .or(
          `published_at.is.null,published_at.lte.${new Date().toISOString()}`,
        ),
      api.from("seo_meta").select("path,noindex").eq("tenant_id", tenantId),
    ]);
    for (const response of [landing, pages, posts, seo])
      if (response.error) throw response.error;
    const excluded = new Set(
      seo.data.filter((s) => s.noindex).map((s) => s.path),
    );
    const routes = new Map(
      [
        "/",
        "/araclar",
        "/araclar/stl-onizle",
        "/araclar/kesit-analizi",
        "/araclar/tarama-goruntuleyici",
        "/sektorler",
        "/hizmetler",
        "/cozumler",
        "/malzemeler",
        "/rehber",
        "/bolgeler",
        "/hakkimizda",
        "/iletisim",
        "/teklif-al",
      ].map((p) => [p, null]),
    );
    const utilityRoutes = new Set();
    for (const p of landing.data) {
      routes.set(p.path, p.updated_at);
      utilityRoutes.delete(p.path);
    }
    for (const p of pages.data) {
      const url = "/" + p.slug.replace(/^\//, "");
      if (!p.meta?.noindex && !/^\/(bolgeler|istanbul)(\/|$)/.test(url))
        routes.set(url, p.updated_at);
    }
    for (const p of posts.data) routes.set("/blog/" + p.slug, p.updated_at);
    for (const p of excluded) routes.delete(p);
    const dest = path.join(output, host);
    await rm(dest, { recursive: true, force: true });
    await mkdir(dest, { recursive: true });
    await cp(root, dest, { recursive: true });
    // API-backed administrative routes retain the SPA shell; missing public pages get true 404s.
    await writeFile(path.join(dest, "app.html"), shell);
    const context = await browser.newContext();
    await context.route(base + "/**", async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      const full = path.resolve(root, "." + decodeURIComponent(pathname));
      if (!full.startsWith(root + path.sep) && full !== root)
        return route.fulfill({ status: 400, body: "Invalid path" });
      try {
        if ((await stat(full)).isFile())
          return route.fulfill({
            body: await readFile(full),
            contentType: mime[path.extname(full)] || "text/html",
          });
      } catch {}
      return route.fulfill({ body: shell, contentType: "text/html" });
    });
    // Fetch the public API through Playwright's request context during build.
    // This also supports an isolated localhost fixture without browser private-network restrictions.
    await context.route(
      env.VITE_SUPABASE_URL.replace(/\/$/, "") + "/**",
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: {
            ...response.headers(),
            "access-control-allow-origin": "*",
          },
        });
      },
    );
    const page = await context.newPage();
    const failed = [];
    page.on("pageerror", (e) => failed.push(e.message));
    page.on("requestfailed", (r) =>
      failed.push(r.url() + ": " + r.failure()?.errorText),
    );
    const published = [];
    for (const [url, lastmod] of routes) {
      if (!/^\/[a-z0-9/-]*$/.test(url) || url.includes(".."))
        throw new Error("Unsafe public path");
      await page.goto(base + url, { waitUntil: "networkidle" });
      await page.locator("h1").waitFor();
      if ((await page.locator("h1").innerText()) === "Site henüz hazır değil.")
        throw new Error(
          "Tenant render failed: " +
            (await page.locator("body").innerText()) +
            " " +
            failed.join("; "),
        );
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-pending-queries]")
            ?.getAttribute("data-pending-queries") === "0",
      );
      const robots = await page
        .locator("meta[name=robots]")
        .getAttribute("content");
      if (robots?.includes("noindex") && !utilityRoutes.has(url))
        throw new Error(`Unexpected noindex: ${url}`);
      if (
        (await page.locator("link[rel=canonical]").getAttribute("href")) !==
        base + url
      )
        throw new Error(`Canonical mismatch: ${url}`);
      if (failed.length) throw new Error(failed.join("\n"));
      const file = path.join(dest, url.slice(1), "index.html");
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, await page.content());
      if (!utilityRoutes.has(url)) published.push({ url, lastmod });
    }
    await page.goto(base + "/__missing_public_page", {
      waitUntil: "networkidle",
    });
    await page.getByRole("heading", { name: "Sayfa bulunamadı." }).waitFor();
    await writeFile(path.join(dest, "404.html"), await page.content());
    await writeFile(
      path.join(dest, "sitemap.xml"),
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        published
          .map(
            (p) =>
              `<url><loc>${escape(base + p.url)}</loc>${p.lastmod ? `<lastmod>${escape(p.lastmod)}</lastmod>` : ""}</url>`,
          )
          .join("") +
        "</urlset>",
    );
    await writeFile(
      path.join(dest, "robots.txt"),
      `User-agent: *\nDisallow: /admin\nDisallow: /studio\nSitemap: ${base}/sitemap.xml\n`,
    );
    await writeFile(
      path.join(dest, "_redirects"),
      "/admin/* /app.html 200\n/studio/* /app.html 200\n/* /404.html 404\n",
    );
    await writeFile(
      path.join(dest, "_headers"),
      "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/app.html\n  X-Robots-Tag: noindex\n",
    );
    await context.close();
    console.log(
      `${host}: ${published.length} index-eligible pages + ${utilityRoutes.size} noindex utility pages exported to ${dest}`,
    );
  }
} finally {
  await browser.close();
}
