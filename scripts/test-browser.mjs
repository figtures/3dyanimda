import { createServer } from "vite";
const server = await createServer({
  server: { host: "127.0.0.1", port: 8080 },
});
await server.listen();
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
const options = process.env.CHROMIUM_EXECUTABLE
  ? {
      executablePath: process.env.CHROMIUM_EXECUTABLE,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
      ],
    }
  : {};
const browser = await chromium.launch({ headless: true, ...options });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
mkdirSync("docs/previews", { recursive: true });
const brands = JSON.parse(readFileSync("src/brands/catalog.json", "utf8"));
for (const brand of brands) {
  await page.goto(`http://127.0.0.1:8080/?tenant=${brand.slug}`);
  await page.getByRole("heading", { level: 1 }).waitFor();
  assert.equal(await page.locator("h1").innerText(), brand.title);
  await page.locator(".industrial-visual img").evaluate((img) => img.decode());
  await page.locator("#solution-tab-0").focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await page.locator("#solution-tab-1").getAttribute("aria-selected"),
    "true",
  );
  assert.equal(
    await page.locator("#solution-panel h3").innerText(),
    brand.applications[1],
  );
  await page.locator("#solution-tab-0").click();
  assert.ok(
    (await page
      .getByRole("link", { name: "Talep şablonunu indirin" })
      .getAttribute("download")) !== null,
  );
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({top:0,behavior:"instant"}); });
  await page.screenshot({
    path: `docs/previews/${brand.slug}.png`,
    fullPage: true,
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({path:`docs/previews/${brand.slug}-desktop.png`});
  await page
    .getByRole("link", { name: "Teknik teklif alın", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Teknik ihtiyacınızı birlikte değerlendirelim.",
    })
    .waitFor();
  assert.ok(page.url().includes(`tenant=${brand.slug}`));
  assert.equal(
    await page
      .getByRole("button", { name: "Teklif talebini gönder" })
      .isDisabled(),
    true,
  );
  assert.equal(await page.getByLabel("Departman", { exact: true }).count(), 1);
  assert.equal(
    await page.getByLabel("Gizlilik sözleşmesi görüşmek istiyorum").count(),
    1,
  );
  if (brand.slug === "3dsanayi") await page.screenshot({path:"docs/previews/quote.png",fullPage:true});
  console.log("PASS desktop and quote navigation", brand.slug);
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:8080/?tenant=maketyanimda");
await page.locator("h1").waitFor();
assert.equal(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
  true,
);
await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({top:0,behavior:"instant"}); });
await page.locator(".industrial-visual img").evaluate(img => img.decode());
await page.screenshot({ path: "docs/previews/mobile.png", fullPage: true });
await page.screenshot({ path: "docs/previews/mobile-fold.png" });
await page.getByRole("button", { name: "Menüyü aç" }).click();
await page.getByRole("link", { name: "Üretim çözümleri", exact: true }).click();
await page.getByRole("heading", { level: 1 }).waitFor();
assert.ok(page.url().includes("/hizmetler?tenant=maketyanimda"));
await page.goto("http://127.0.0.1:8080/?tenant=unknown");
await page
  .getByText("Bu alan adına bağlı aktif bir marka bulunamadı.")
  .waitFor();
assert.deepEqual(errors, []);
console.log("PASS mobile menu, overflow, unknown tenant, no runtime errors");
await browser.close();
await server.close();
