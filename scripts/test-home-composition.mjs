import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({
  server: { host: "127.0.0.1", port: 8086 },
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
try {
  for (const theme of ["industrial", "editorial", "studio"])
    for (const tenant of [
      "3dyanimda",
      "3dsanayi",
      "maketyanimda",
      "parcayanimda",
    ])
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 960 });
        await page.goto(
          `http://127.0.0.1:8086/?theme=${theme}&tenant=${tenant}`,
        );
        await page.locator("h1").waitFor();
        assert.equal(
          await page
            .locator(".studio-home .model-view,.editorial-hero .model-view")
            .count(),
          0,
          "hero must not repeat gallery geometry",
        );
        if (theme === "editorial")
          assert.equal(
            await page.locator(".editorial-hero .service-visual").count(),
            3,
          );
        if (theme === "studio") {
          for (let i = 0; i < 3; i++) {
            await page.locator(".studio-service-menu button").nth(i).click();
            await page
              .locator(`.studio-home [data-service-visual="${i}"]`)
              .waitFor();
          }
        }
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          "overflow",
        );
        await page.locator(".showcase-stage").scrollIntoViewIfNeeded();
        await page
          .locator(".showcase-stage [data-model-status=ready]")
          .waitFor();
        assert.equal(await page.locator(".model-selector button").count(), 3);
        if (tenant === "3dyanimda" && theme === "studio" && width === 1440) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: "/tmp/home-composition.png" });
        }
      }
  assert.deepEqual(errors, []);
  console.log(
    "PASS 24 homepage compositions: distinct service illustrations, interactive gallery, service switching, responsive layouts",
  );
} finally {
  await browser.close();
  await server.close();
}
