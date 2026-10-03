import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const server = await createServer({ server: { host: "127.0.0.1", port: 8083 } });
await server.listen();
const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE,args:["--no-sandbox","--disable-dev-shm-usage","--no-zygote","--single-process","--use-angle=swiftshader","--enable-unsafe-swiftshader"]}: {})});
try {
  const page = await browser.newPage();
  mkdirSync("docs/previews/themes",{recursive:true});
  for (const theme of ["industrial","editorial","studio"]) for(const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(`http://127.0.0.1:8083/?tenant=3dyanimda&theme=${theme}`);
    await page.locator(".application-list a").first().waitFor();
    await page.waitForFunction(()=>document.fonts.status === "loaded");
    if(theme !== "industrial") await page.locator(".part-scene canvas").first().waitFor();
    await page.locator("img").evaluateAll(images=>Promise.all(images.map(i=>i.decode().catch(()=>{}))));
    await page.screenshot({path:`docs/previews/themes/${theme}-${width}.png`,fullPage:true});
    console.log(`Captured ${theme} / ${width}`);
  }
} finally {await browser.close();await server.close();}
