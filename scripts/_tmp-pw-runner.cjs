const { chromium } = require('playwright');

const BASE = 'https://ilit-1wxsnzxaw-dereklomas-projects.vercel.app';
const OUT = __dirname + '/../docs/screenshots/current';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(BASE + '/dashboard/notebook', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Screenshot locked state
  await page.screenshot({ path: OUT + '/notebook-locked-fresh.png' });
  console.log('Saved: notebook-locked-fresh.png');

  // Unlock — click fingerprint
  const fp = page.locator('button[aria-label="Unlock notebook with fingerprint"]');
  if (await fp.isVisible()) {
    await fp.click();
    await page.waitForTimeout(1000);
  }

  // Journal tab (default after unlock)
  await page.screenshot({ path: OUT + '/notebook-journal-fresh.png' });
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
      await page.screenshot({ path: OUT + '/' + t.file });
      console.log('Saved: ' + t.file);
    } else {
      console.log('Not found: ' + t.title);
    }
  }

  await browser.close();
  console.log('Done!');
})();
