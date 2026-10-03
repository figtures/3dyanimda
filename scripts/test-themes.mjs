import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
const server = await createServer({
  server: { host: "127.0.0.1", port: 8081 },
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
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const brands = ["3dyanimda", "3dsanayi", "maketyanimda", "parcayanimda"];
const themes = ["industrial", "editorial", "studio"];
const pages = JSON.parse(readFileSync("src/content/pages.json", "utf8")).filter(
  (p) => p.brand === "3dyanimda" && p.status === "published",
);
const base = "http://127.0.0.1:8081";
let checks = 0;
async function visit(path, theme, brand = "3dyanimda") {
  await page.goto(`${base}${path}?tenant=${brand}&theme=${theme}`);
  await page.locator("h1").waitFor();
  await page.locator(`[data-theme="${theme}"]`).waitFor();
  await page.waitForFunction(() => document.fonts.status === "loaded");
  assert.equal(await page.locator("h1").count(), 1, path);
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: innerWidth,
    elements: [...document.querySelectorAll("main *")]
      .filter((el) => el.getBoundingClientRect().right > innerWidth + 2)
      .slice(0, 3)
      .map((el) => el.className),
  }));
  assert.ok(
    overflow.scroll <= overflow.width + 1,
    `${theme} ${path} ${JSON.stringify(overflow)}`,
  );
  checks++;
}
try {
  mkdirSync("docs/previews/themes", { recursive: true });
  for (const theme of themes) {
    for (const brand of brands)
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 960 });
        await visit("/", theme, brand);
        assert.equal(
          await page.locator(".home-services .service-card").count(),
          3,
        );
        await page.locator(".application-list a").first().waitFor();
        assert.equal(await page.locator(".application-list a").count(), 5);
        if (width < 960) {
          await page.getByRole("button", { name: "Menüyü aç" }).click();
          assert.equal(
            await page.locator("#main-navigation").isVisible(),
            true,
          );
          await page.keyboard.press("Escape");
          assert.equal(
            await page.locator("#main-navigation").isVisible(),
            false,
          );
        }
        if (brand === "3dyanimda" && [390, 1440].includes(width)) {
          if (theme !== "industrial")
            await page.locator(".service-visual svg").first().waitFor();
          await page.screenshot({
            path: `docs/previews/themes/${theme}-${width}.png`,
            fullPage: true,
          });
        }
      }
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      for (const path of [
        "/teklif-al",
        "/iletisim",
        "/hakkimizda",
        "/gizlilik-politikasi",
        "/yasal",
        "/sektorler",
        "/araclar",
        "/bolgeler/istanbul/atasehir/3d-baski",
        "/hizmetler",
        "/cozumler",
        "/malzemeler",
        "/rehber",
        "/bolgeler",
      ])
        await visit(path, theme);
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      for (const p of pages) {
        await visit(p.path, theme);
        assert.notEqual(
          await page.locator("h1").innerText(),
          "Sayfa bulunamadı.",
        );
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await visit("/teklif-al", theme);
    await page.getByRole("heading", { name: "Üretim seçenekleri" }).waitFor();
    await page.getByRole("button", { name: "3D Tarama", exact: true }).click();
    await page
      .getByText(
        "Tarama ve modelleme projeleri kapsam üzerinden fiyatlandırılır.",
      )
      .waitFor();
    await page.getByRole("button", { name: "3D Baskı", exact: true }).click();
    const faces = [
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
      faces
        .map(
          (v) =>
            "facet normal 0 0 0\nouter loop\n" +
            v.map((p) => "vertex " + p.join(" ")).join("\n") +
            "\nendloop\nendfacet",
        )
        .join("\n") +
      "\nendsolid test";
    const file = {
      name: "test.stl",
      mimeType: "model/stl",
      buffer: Buffer.from(stl),
    };
    await page.locator(".studio-file input").setInputFiles(file);
    await page.locator(".estimate-box strong").waitFor();
    const price = await page.locator(".estimate-box strong").innerText();
    await page.getByLabel("Adet", { exact: true }).fill("100");
    await page.waitForFunction(
      (p) => document.querySelector(".estimate-box strong")?.textContent !== p,
      price,
    );
    await page.screenshot({
      path: `docs/previews/themes/${theme}-quote.png`,
      fullPage: true,
    });
    if (theme === "studio") {
      await visit("/", theme);
      await page.locator(".upload-label input").setInputFiles(file);
      await page.locator(".estimate-box strong").waitFor();
      assert.ok(page.url().includes("/teklif-al"));
      await page.getByRole("button", { name: "Dosyayı kaldır" }).click();
      assert.equal(await page.locator(".estimate-box strong").count(), 0);
      await visit("/", theme);
      await page
        .getByRole("button", { name: "3D Tarama", exact: false })
        .click();
      await page
        .getByRole("button", {
          name: "Dosyam yok, ihtiyacımı anlatayım",
          exact: false,
        })
        .click();
      assert.equal(
        await page
          .getByRole("button", { name: "3D Tarama", exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
    }
    console.log(
      `PASS ${theme}: 4 brands, 4 widths, published pages, quote engine`,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS ${checks} responsive route checks, upload handoff and no browser exceptions`,
  );
} finally {
  await browser.close();
  await server.close();
}
