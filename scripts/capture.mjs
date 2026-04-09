import { chromium, devices } from "playwright";
import path from "node:path";

const baseUrl = "http://127.0.0.1:3000";

async function capturePage(browser, pageOptions, name, dragMode) {
  const page = await browser.newPage(pageOptions);

  await page.goto(baseUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.locator("canvas").waitFor({
    state: "visible",
    timeout: 30_000,
  });
  await page.waitForTimeout(1_800);

  await page.screenshot({
    path: path.join("qa", `${name}.png`),
    fullPage: false,
    timeout: 60_000,
  });

  const box = await page.locator("canvas").boundingBox();
  if (box && dragMode === "mouse") {
    await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.42);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.32, box.y + box.height * 0.52, {
      steps: 24,
    });
    await page.mouse.up();
    await page.waitForTimeout(900);
    await page.screenshot({
      path: path.join("qa", `${name}-rotated.png`),
      fullPage: false,
      timeout: 60_000,
    });
  }

  if (box && dragMode === "touch") {
    await page.locator("canvas").evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      const events = [
        ["pointerdown", 0.62, 0.42],
        ["pointermove", 0.5, 0.46],
        ["pointermove", 0.38, 0.52],
        ["pointerup", 0.38, 0.52],
      ];

      for (const [type, px, py] of events) {
        canvas.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            pointerId: 1,
            pointerType: "touch",
            isPrimary: true,
            clientX: rect.left + rect.width * px,
            clientY: rect.top + rect.height * py,
            buttons: type === "pointerup" ? 0 : 1,
          }),
        );
      }
    });

    await page.waitForTimeout(900);
    await page.screenshot({
      path: path.join("qa", `${name}-rotated.png`),
      fullPage: false,
      timeout: 60_000,
    });
  }

  await page.close();
  return { name, box };
}

const browser = await chromium.launch({ headless: true });

try {
  const results = [];

  results.push(
    await capturePage(
      browser,
      {
        viewport: { width: 1440, height: 1180 },
        deviceScaleFactor: 2,
      },
      "desktop",
      "mouse",
    ),
  );

  results.push(
    await capturePage(browser, devices["iPhone 13"], "mobile-portrait", "touch"),
  );

  results.push(
    await capturePage(
      browser,
      {
        ...devices["iPhone 13"],
        viewport: { width: 844, height: 390 },
        screen: { width: 844, height: 390 },
        isMobile: true,
        hasTouch: true,
      },
      "mobile-landscape",
      null,
    ),
  );

  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
