#!/usr/bin/env node

// Run with: npx puppeteer node _tmp-screenshots.mjs
// Or install globally and run directly

const puppeteer = await import("puppeteer");
const { setTimeout } = await import("timers/promises");

const BASE = "https://ilit.vercel.app";
const OUT = "/Users/dereklomas/ilit/docs/screenshots";

async function run() {
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  // Dashboard pages
  const dashPages = [
    { name: "our-library-v2", url: `${BASE}/dashboard/library`, wait: 3000 },
    { name: "our-assignments-v2", url: `${BASE}/dashboard/assignments`, wait: 1500 },
    { name: "our-notebook-v2", url: `${BASE}/dashboard/notebook`, wait: 1500 },
    { name: "our-connect-v2", url: `${BASE}/dashboard/connect`, wait: 1500 },
  ];

  for (const { name, url, wait } of dashPages) {
    console.log(`Capturing ${name}...`);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await setTimeout(wait);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  }

  // IR reading slide 1
  console.log("Capturing IR slide 1...");
  await page.goto(`${BASE}/interactive/bomb-dogs`, { waitUntil: "networkidle0", timeout: 30000 });
  await setTimeout(2000);
  await page.screenshot({ path: `${OUT}/our-ir-slide1-v2.png` });

  // Navigate via dot navigation
  // Get all the small dot buttons at the bottom
  const dotSelector = "button.rounded-full";

  // Click 4th dot for highlight checkpoint (index 3)
  console.log("Navigating to highlight checkpoint...");
  let dots = await page.$$(dotSelector);
  // Filter to only the small navigation dots (w-2.5 h-2.5)
  const navDots = [];
  for (const d of dots) {
    const box = await d.boundingBox();
    if (box && box.width < 15 && box.height < 15 && box.y > 600) {
      navDots.push(d);
    }
  }
  console.log(`Found ${navDots.length} navigation dots`);

  if (navDots.length > 3) {
    await navDots[3].click();
    await setTimeout(1000);
    await page.screenshot({ path: `${OUT}/our-ir-highlight-v2.png` });
  }

  // Click 9th dot for drag-drop checkpoint (index 8)
  if (navDots.length > 8) {
    console.log("Navigating to drag-drop checkpoint...");
    await navDots[8].click();
    await setTimeout(1000);
    await page.screenshot({ path: `${OUT}/our-ir-dragdrop-v2.png` });
  }

  // Click 10th dot for summary (index 9)
  if (navDots.length > 9) {
    console.log("Navigating to summary...");
    await navDots[9].click();
    await setTimeout(1000);
    await page.screenshot({ path: `${OUT}/our-ir-summary-v2.png` });
  }

  await browser.close();
  console.log("Done! Screenshots saved to docs/screenshots/");
}

run().catch(console.error);
