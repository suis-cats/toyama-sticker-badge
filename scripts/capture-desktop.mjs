import { chromium } from "playwright";
import path from "node:path";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1180 },
    deviceScaleFactor: 2,
  });

  await page.goto("http://127.0.0.1:3000", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.waitForTimeout(4_000);

  await page.screenshot({
    path: path.join("qa", "desktop-check.png"),
    fullPage: false,
    timeout: 60_000,
  });

  const canvasHandle = await page.$("canvas");
  console.log("hasCanvas", Boolean(canvasHandle));
} finally {
  await browser.close();
}
