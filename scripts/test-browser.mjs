import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
const server = await createServer({
  server: { host: "127.0.0.1", port: 8080 },
});
await server.listen();
const browser = await chromium.launch({
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
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  mkdirSync("docs/previews", { recursive: true });
  const brands = JSON.parse(readFileSync("src/brands/catalog.json", "utf8"));
  for (const brand of brands) {
    await page.goto(`http://127.0.0.1:8080/?tenant=${brand.slug}`);
    await page.locator("h1").waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    assert.ok((await page.locator("h1").innerText()).length > 10);
    assert.equal(await page.locator(".home-services .service-card").count(), 3);
    await page.locator(".application-list a").first().waitFor();
    assert.equal(await page.locator(".application-list a").count(), 4);
    await page.screenshot({ path: `docs/previews/${brand.slug}-desktop.png` });
    await page.screenshot({
      path: `docs/previews/${brand.slug}.png`,
      fullPage: true,
    });
    await page.getByRole("link", { name: "Teklif Al", exact: true }).click();
    await page.getByRole("heading", { name: "Üretim seçenekleri" }).waitFor();
    assert.ok(page.url().includes(brand.slug));
    assert.equal(
      await page
        .getByRole("button", { name: "Teklif talebini gönder" })
        .isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "3D Tarama", exact: true }).click();
    await page
      .getByText(
        "Tarama ve modelleme projeleri kapsam üzerinden fiyatlandırılır.",
      )
      .waitFor();
    await page.getByRole("button", { name: "3D Baskı", exact: true }).click();
    // Closed tetrahedron, 10 mm edges, positive signed volume.
    const vertices = [
      [
        [0, 0, 0],
        [0, 10, 0],
        [10, 0, 0],
      ],
      [
        [0, 0, 0],
        [10, 0, 0],
        [0, 0, 10],
      ],
      [
        [0, 0, 0],
        [0, 0, 10],
        [0, 10, 0],
      ],
      [
        [10, 0, 0],
        [0, 10, 0],
        [0, 0, 10],
      ],
    ];
    const stl =
      "solid test\n" +
      vertices
        .map(
          (v) =>
            "facet normal 0 0 0\nouter loop\n" +
            v.map((p) => "vertex " + p.join(" ")).join("\n") +
            "\nendloop\nendfacet",
        )
        .join("\n") +
      "\nendsolid test";
    await page.locator(".studio-file input").setInputFiles({
      name: "test.stl",
      mimeType: "model/stl",
      buffer: Buffer.from(stl),
    });
    await page.locator(".studio-metrics").waitFor();
    await page.locator(".estimate-box strong").waitFor();
    const firstPrice = await page.locator(".estimate-box strong").innerText();
    await page.getByLabel("Adet", { exact: true }).fill("100");
    await page.waitForFunction(
      (first) =>
        document.querySelector(".estimate-box strong")?.textContent !== first,
      firstPrice,
    );
    await page.locator(".studio-file input").setInputFiles({
      name: "invalid.stl",
      mimeType: "model/stl",
      buffer: Buffer.from("broken"),
    });
    await page
      .getByText(
        "STL dosyası okunamadı. Dosyanın geçerli olduğundan emin olun.",
      )
      .waitFor();
    assert.equal(await page.locator(".estimate-box strong").count(), 0);
    await page.getByRole("button", { name: "Dosyayı kaldır" }).click();
    await page.locator(".studio-file input").setInputFiles({
      name: "part.step",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("ISO-10303-21;"),
    });
    await page
      .getByText("Bu format teknik incelemeye iletilir.", { exact: false })
      .waitFor();
    assert.equal(await page.locator(".estimate-box strong").count(), 0);
    if (brand.slug === "3dyanimda")
      await page.screenshot({
        path: "docs/previews/quote.png",
        fullPage: true,
      });
    await page.goto(`http://127.0.0.1:8080/3d-tarama?tenant=${brand.slug}`);
    await page
      .getByRole("heading", { name: "Tarama ile CAD aynı şey değildir" })
      .waitFor();
    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    assert.ok(schemas.some((s) => JSON.parse(s)["@type"] === "Service"));
    await page.goto(
      `http://127.0.0.1:8080/bolgeler/istanbul/atasehir?tenant=${brand.slug}`,
    );
    await page.getByRole("heading", { name: "Sayfa bulunamadı." }).waitFor();
    assert.ok(
      (
        await page.locator("meta[name=robots]").getAttribute("content")
      ).includes("noindex"),
    );
    console.log(
      "PASS brand, services, Studio configuration, STL/STEP, draft gate",
      brand.slug,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:8080/?tenant=3dyanimda");
  await page.locator("h1").waitFor();

  await page.screenshot({ path: "docs/previews/mobile-fold.png" });
  await page.screenshot({ path: "docs/previews/mobile.png", fullPage: true });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await page
    .locator(".brand-nav")
    .getByRole("link", { name: "3D Modelleme", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Doğru model, açık bir ihtiyaçla başlar" })
    .waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.goto("http://127.0.0.1:8080/bolgeler?tenant=3dyanimda");
  await page.locator(".district-directory a").first().waitFor();
  assert.equal(await page.locator(".district-directory a").count(), 39);
  await page
    .locator(".district-directory")
    .getByRole("link", { name: "Ataşehir" })
    .click();
  await page.getByRole("heading", { name: "Üretim seçenekleri" }).waitFor();
  assert.equal(
    await page.getByLabel("Teknik ihtiyaç / proje açıklaması *").inputValue(),
    "Ataşehir",
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.goto("http://127.0.0.1:8080/?tenant=unknown");
  await page
    .getByRole("heading", { name: "Site henüz hazır değil." })
    .waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS mobile navigation, overflow, region prefill and unknown tenant",
  );
} finally {
  await browser.close();
  await server.close();
}
