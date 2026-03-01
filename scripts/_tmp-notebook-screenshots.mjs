#!/usr/bin/env node
/**
 * Takes screenshots of each notebook tab using playwright's test library.
 * Uses npx to avoid needing playwright as a project dep.
 */
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE = "https://ilit-1wxsnzxaw-dereklomas-projects.vercel.app";
const OUT = resolve(import.meta.dirname, "../docs/screenshots/current");

// Write a temp playwright script
const script = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto('${BASE}/dashboard/notebook', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Screenshot locked state
  await page.screenshot({ path: '${OUT}/notebook-locked-fresh.png' });
  console.log('Saved: notebook-locked-fresh.png');

  // Unlock — click fingerprint
  const fp = page.locator('button[aria-label="Unlock notebook with fingerprint"]');
  if (await fp.isVisible()) {
    await fp.click();
    await page.waitForTimeout(1000);
  }

  // Journal tab (default after unlock)
  await page.screenshot({ path: '${OUT}/notebook-journal-fresh.png' });
  console.log('Saved: notebook-journal-fresh.png');

  // Click each tab
  const tabs = [
    { title: 'Word Bank', file: 'notebook-wordbank-fresh.png' },
    { title: 'Class Notes', file: 'notebook-classnotes-fresh.png' },
    { title: 'My Work', file: 'notebook-mywork-fresh.png' },
    { title: 'Resources', file: 'notebook-resources-fresh.png' },
  ];

  for (const t of tabs) {
    const btn = page.locator('button[title="' + t.title + '"]');
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: '${OUT}/' + t.file });
      console.log('Saved: ' + t.file);
    } else {
      console.log('Not found: ' + t.title);
    }
  }

  await browser.close();
  console.log('Done!');
})();
`;

const tmpScript = resolve(import.meta.dirname, "_tmp-pw-runner.cjs");
writeFileSync(tmpScript, script);

try {
  execSync(`npx playwright test --config=/dev/null 2>&1; node ${tmpScript}`, {
    stdio: "inherit",
    timeout: 60000,
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "0" },
  });
} catch {
  // Try direct node with global playwright
  try {
    execSync(`node ${tmpScript}`, { stdio: "inherit", timeout: 60000 });
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
