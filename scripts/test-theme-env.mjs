// Production build: exercise actual env injection, per-tenant priority and ignored query overrides.
import { build, preview } from "vite";
import { chromium } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "theme-env-"));
const values = {
  VITE_SUPABASE_URL: "https://theme-fixture.invalid",
  VITE_SUPABASE_PUBLISHABLE_KEY: "public-fixture-key",
  VITE_SITE_THEME: "industrial",
  VITE_THEME_3DYANIMDA: "editorial",
  VITE_THEME_3DSANAYI: "",
  VITE_THEME_MAKETYANIMDA: "studio",
  VITE_THEME_PARCAYANIMDA: "invalid-name",
};
let server, browser;
try {
  await build({
    logLevel: "error",
    build: { outDir: dir, emptyOutDir: true },
    define: Object.fromEntries(
      Object.entries(values).map(([k, v]) => [
        `import.meta.env.${k}`,
        JSON.stringify(v),
      ]),
    ),
  });
  server = await preview({
    build: { outDir: dir },
    preview: { host: "127.0.0.1", port: 8082 },
  });
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE
      ? {
          executablePath: process.env.CHROMIUM_EXECUTABLE,
          args: [
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--no-zygote",
            "--single-process",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
          ],
        }
      : {}),
  });
  const page = await browser.newPage();
  let slug = "3dyanimda";
  await page.route("https://theme-fixture.invalid/**", async (route) => {
    const table = new URL(route.request().url()).pathname.split("/").pop();
    let data = [];
    if (table === "current_tenant_id")
      data = "10000000-0000-4000-8000-000000000001";
    if (table === "tenants")
      data = {
        id: "10000000-0000-4000-8000-000000000001",
        slug,
        name: slug,
        domain: `${slug}.example`,
        status: "active",
        settings: {},
      };
    if (
      route
        .request()
        .headers()
        .accept?.includes("application/vnd.pgrst.object") &&
      Array.isArray(data)
    )
      data = null;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  for (const [brand, expected] of [
    ["3dyanimda", "editorial"],
    ["3dsanayi", "industrial"],
    ["maketyanimda", "studio"],
    ["parcayanimda", "industrial"],
  ]) {
    slug = brand;
    // Query intentionally conflicts with selected env theme.
    await page.goto(
      "http://127.0.0.1:8082/?theme=" +
        (expected === "studio" ? "editorial" : "studio"),
    );
    await page.locator(`[data-theme="${expected}"]`).waitFor();
    assert.equal(await page.locator(".theme-picker").count(), 0);
    assert.equal(await page.locator(".brand-preview").count(), 0);
    await page.getByRole("link", { name: "Teklif Al", exact: true }).click();
    await page.getByRole("heading", { name: "Üretim seçenekleri" }).waitFor();
    assert.equal(
      await page.locator(".brand-site").getAttribute("data-theme"),
      expected,
    );
    assert.equal(new URL(page.url()).search, "");
    console.log(
      `PASS production env ${brand} → ${expected}; query ignored, quote retains theme`,
    );
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise((r) => server.httpServer.close(r));
  await rm(dir, { recursive: true, force: true });
}
