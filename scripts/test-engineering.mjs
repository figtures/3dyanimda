import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const server = await createServer({
  server: { host: "127.0.0.1", port: 8085 },
});
await server.listen();
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-zygote",
    "--single-process",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const sample = await readFile("public/models/inspection-sample.stl");
try {
  for (const tenant of [
    "3dyanimda",
    "3dsanayi",
    "maketyanimda",
    "parcayanimda",
  ])
    for (const theme of ["industrial", "editorial", "studio"]) {
      const q = `?tenant=${tenant}&theme=${theme}`;
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("http://127.0.0.1:8085/araclar/kesit-analizi" + q);
      await page.getByRole("button", { name: "Örnek modeli aç" }).click();
      await page.locator("[data-viewer-state=ready] canvas").waitFor();
      await page.getByRole("checkbox", { name: "Kesiti göster" }).check();
      await page.getByLabel("Kesit konumu").fill("25");
      const before = await page.locator(".engineering-viewport").screenshot();
      await page.getByLabel("Kesit konumu").fill("75");
      const after = await page.locator(".engineering-viewport").screenshot();
      assert(!before.equals(after), "section must alter rendered geometry");
      for (const name of ["Y", "Z"])
        await page.getByRole("button", { name, exact: true }).click();
      for (const name of ["Tel kafes", "Noktalar", "Yüzey"])
        await page.getByRole("button", { name, exact: true }).click();
      await page.getByLabel("Dosya birimi").selectOption("cm");
      assert.match(
        await page.locator(".engineering-metrics").innerText(),
        /670.00/,
      );
      await page
        .getByRole("button", { name: "Yakınlaştır", exact: true })
        .click();
      await page.getByRole("button", { name: "Görünümü sıfırla" }).click();
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        "mobile overflow",
      );
      await page.setViewportSize({ width: 1440, height: 1000 });
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        "desktop overflow",
      );
      await page.getByRole("link", { name: "Üretim için teklif al" }).click();
      await page
        .getByText("ornek-baglanti.stl", { exact: false })
        .first()
        .waitFor();
      await page.goto("http://127.0.0.1:8085/3d-tarama" + q);
      assert.equal(
        await page
          .locator(".content-hero")
          .evaluate((e) => getComputedStyle(e).borderBottomLeftRadius),
        "0px",
      );
      await page.goto(
        "http://127.0.0.1:8085/bolgeler/istanbul/kadikoy/3d-tarama" + q,
      );
      await page
        .getByRole("heading", { name: "Kadıköy · 3D tarama", exact: true })
        .waitFor();
      assert.match(
        await page.locator("meta[name=robots]").getAttribute("content"),
        /noindex/,
      );
      await page.getByRole("checkbox").first().check();
      await page.getByRole("status").filter({ hasText: "1 / 3" }).waitFor();
      console.log(tenant, theme, "passed");
    }
  await page.goto(
    "http://127.0.0.1:8085/araclar/tarama-goruntuleyici?tenant=3dyanimda&theme=studio",
  );
  const ply =
    "ply\nformat ascii 1.0\nelement vertex 4\nproperty float x\nproperty float y\nproperty float z\nproperty float nx\nproperty float ny\nproperty float nz\nproperty uchar red\nproperty uchar green\nproperty uchar blue\nend_header\n0 0 0 0 0 1 255 0 0\n10 0 0 0 0 1 0 255 0\n0 10 0 0 0 1 0 0 255\n0 0 10 0 0 1 255 255 0\n";
  await page
    .getByLabel("STL veya PLY dosyası")
    .setInputFiles({
      name: "scan.ply",
      mimeType: "application/octet-stream",
      buffer: Buffer.from(ply),
    });
  await page.locator("[data-viewer-state=ready] canvas").waitFor();
  assert(
    await page.getByRole("button", { name: "Yüzey", exact: true }).isDisabled(),
  );
  await page.getByText("PLY nokta verisi. Yüzey oluşturulmaz.").waitFor();
  await page
    .getByLabel("STL veya PLY dosyası")
    .setInputFiles({
      name: "invalid.stl",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("broken"),
    });
  await page.getByRole("alert").waitFor();
  await page
    .getByLabel("STL veya PLY dosyası")
    .setInputFiles({
      name: "real.stl",
      mimeType: "application/octet-stream",
      buffer: sample,
    });
  await page.getByText("real.stl", { exact: true }).waitFor();
  await page.locator("[data-viewer-state=ready] canvas").waitFor();
  await page.screenshot({
    path: "/tmp/engineering-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/engineering-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Modeli kaldır" }).click();
  await page.getByRole("button", { name: "Örnek modeli aç" }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "STL / normal-bearing colored PLY / invalid file / clear / clipping / unit / quote handoff / responsive / noindex passed",
  );
} finally {
  await browser.close();
  await server.close();
}
