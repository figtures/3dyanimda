import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({
  server: { host: "127.0.0.1", port: 8084 },
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
page.on("pageerror", (e) => {errors.push(e.message); console.log("PAGE ERROR",e.message);});

try {
  for (const brand of [
    "3dyanimda",
    "3dsanayi",
    "maketyanimda",
    "parcayanimda",
  ]) {
    for (const theme of ["industrial", "editorial", "studio"]) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`http://127.0.0.1:8084/?tenant=${brand}&theme=${theme}`);
      await page.locator(".showcase-shell").scrollIntoViewIfNeeded();
      await page.locator(".showcase-stage [data-model-status=ready]").waitFor();
      for (let i = 0; i < 3; i++) {
        await page.locator(".model-selector>button").nth(i).click();
        await page
          .locator(".showcase-stage [data-model-status=ready]")
          .waitFor();
        assert.equal(
          await page
            .locator(".model-selector>button")
            .nth(i)
            .getAttribute("aria-pressed"),
          "true",
        );
      }
      for (const name of ["Çizgiler", "Nokta bulutu", "Yüzey"]) {
        await page.getByRole("button", { name, exact: true }).click();
        await page
          .locator(".showcase-stage [data-model-status=ready]")
          .waitFor();
      }
      await page
        .getByRole("button", { name: "Modeli yakınlaştır", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Model görünümünü sıfırla" })
        .click();
      const href = await page
        .locator(".showcase-stage-bottom a")
        .getAttribute("href");
      const res = await page.request.get("http://127.0.0.1:8084" + href);
      assert.equal((await res.body()).subarray(0, 4).toString(), "glTF");
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      if (theme === "studio") {
        await page.setViewportSize({ width: 1440, height: 1050 });
        await page.locator(".showcase-heading").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `/tmp/showcase-${brand}.png` });
      }
    }
    console.log(
      "PASS models, views, controls, GLB download and mobile:",
      brand,
    );
  }
  assert.deepEqual(errors, []);
  // Failed GLB downloads offer a visible fallback and retry, never a blank canvas.
  await page.route("**/models/*.glb", (route) => route.abort());
  await page.goto("http://127.0.0.1:8084/?tenant=maketyanimda&theme=studio");
  await page.locator(".showcase-shell").scrollIntoViewIfNeeded();
  await page.locator(".showcase-stage [data-model-status=error]").waitFor();
  assert.ok(await page.locator(".showcase-stage .model-fallback").isVisible());
  console.log("PASS failed model fallback");
} catch(error) { await page.screenshot({path:"/tmp/showcase-failure.png",fullPage:true}); console.log(await page.locator(".model-view").evaluateAll(els=>els.map(e=>({status:e.dataset.modelStatus,model:e.dataset.model,rect:e.getBoundingClientRect().toJSON()})))); throw error; } finally {
  await browser.close();
  await server.close();
}
