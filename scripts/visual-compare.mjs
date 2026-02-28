#!/usr/bin/env node
/**
 * Visual Comparison Tool for I-LIT
 *
 * Screenshots every route of the deployed app, then generates an HTML
 * comparison page showing reference screenshots side-by-side with current.
 *
 * Usage:
 *   node scripts/visual-compare.mjs                    # screenshot + compare
 *   node scripts/visual-compare.mjs --screenshot-only   # just take screenshots
 *   node scripts/visual-compare.mjs --compare-only      # just build HTML from existing shots
 *   node scripts/visual-compare.mjs --url https://...   # custom deploy URL
 *
 * Output:
 *   docs/screenshots/current/   — latest screenshots of our app
 *   docs/screenshots/compare.html — side-by-side comparison page
 */

import { execSync } from "child_process";
import { mkdirSync, readdirSync, writeFileSync, existsSync } from "fs";
import { resolve, basename } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const REF_DIR = resolve(ROOT, "docs/screenshots");
const CUR_DIR = resolve(ROOT, "docs/screenshots/current");
const COMPARE_HTML = resolve(ROOT, "docs/screenshots/compare.html");

// Routes to screenshot and their reference image mappings
const ROUTES = [
  {
    path: "/dashboard/library",
    name: "library",
    ref: "library-main.png",
    label: "Library (Carousel)",
  },
  {
    path: "/dashboard/assignments",
    name: "assignments",
    ref: "assignments-all-expanded.png",
    label: "Assignments",
  },
  {
    path: "/dashboard/notebook",
    name: "notebook",
    ref: "notebook-journal.png",
    label: "Notebook",
  },
  {
    path: "/dashboard/connect",
    name: "connect",
    ref: "connect-tab.png",
    label: "Connect",
  },
  {
    path: "/dashboard/review",
    name: "review",
    ref: null,
    label: "Review",
  },
  {
    path: "/interactive/bomb-dogs",
    name: "ir-bombdogs-slide1",
    ref: "interactive-reader-bombdogs-slide1.png",
    label: "IR: Bomb Dogs (Slide 1)",
  },
];

// Parse args
const args = process.argv.slice(2);
const screenshotOnly = args.includes("--screenshot-only");
const compareOnly = args.includes("--compare-only");
const urlFlag = args.indexOf("--url");
let baseUrl = urlFlag !== -1 ? args[urlFlag + 1] : null;

// Auto-detect Vercel production URL if not specified
if (!baseUrl && !compareOnly) {
  try {
    // Try `vercel inspect` for the production alias first
    const inspect = execSync("vercel ls 2>&1", {
      encoding: "utf-8",
      timeout: 15000,
    });
    // Match the most recent Production deployment URL
    const lines = inspect.split("\n");
    for (const line of lines) {
      if (line.includes("Production") || line.includes("● Ready")) {
        const match = line.match(/https:\/\/\S+/);
        if (match) {
          baseUrl = match[0];
          break;
        }
      }
    }
  } catch {
    // fall through
  }
  if (!baseUrl) {
    console.error(
      "Could not detect deploy URL. Pass --url https://your-app.vercel.app"
    );
    process.exit(1);
  }
}

async function screenshot() {
  mkdirSync(CUR_DIR, { recursive: true });
  console.log(`\nScreenshotting ${ROUTES.length} routes from ${baseUrl}\n`);

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    const outFile = resolve(CUR_DIR, `${route.name}.png`);
    console.log(`  ${route.label}: ${url}`);
    try {
      execSync(
        `npx playwright screenshot --viewport-size="1280,800" --wait-for-timeout=3000 "${url}" "${outFile}"`,
        { stdio: "pipe", timeout: 30000 }
      );
      console.log(`    -> ${basename(outFile)}`);
    } catch (e) {
      console.error(`    !! Failed: ${e.message?.split("\n")[0]}`);
    }
  }
  console.log(`\nScreenshots saved to docs/screenshots/current/`);
}

function buildComparison() {
  // Scan for reference screenshots
  const refFiles = existsSync(REF_DIR)
    ? readdirSync(REF_DIR).filter(
        (f) => f.endsWith(".png") && !f.startsWith("our-")
      )
    : [];

  // Scan for current screenshots
  const curFiles = existsSync(CUR_DIR)
    ? readdirSync(CUR_DIR).filter((f) => f.endsWith(".png"))
    : [];

  // Build pairs from ROUTES config
  const pairs = ROUTES.map((route) => {
    const curFile = curFiles.find((f) => f.startsWith(route.name));
    const refFile = route.ref && refFiles.includes(route.ref) ? route.ref : null;
    return {
      label: route.label,
      ref: refFile ? `${refFile}` : null,
      cur: curFile ? `current/${curFile}` : null,
    };
  });

  // Also find any IR slides that have reference screenshots
  const irRefFiles = refFiles
    .filter((f) => f.startsWith("interactive-reader-bombdogs-slide"))
    .sort();
  for (const ref of irRefFiles) {
    const slideNum = ref.match(/slide(\d+)/)?.[1];
    if (slideNum === "1") continue; // already in ROUTES
    pairs.push({
      label: `IR: Bomb Dogs (Slide ${slideNum})`,
      ref: ref,
      cur: null, // no automated screenshot for inner slides yet
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>I-LIT Visual Comparison</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 20px; }
    h1 { text-align: center; margin-bottom: 8px; font-size: 24px; }
    .subtitle { text-align: center; color: #888; margin-bottom: 30px; font-size: 14px; }
    .pair { margin-bottom: 40px; border: 1px solid #333; border-radius: 12px; overflow: hidden; background: #111; }
    .pair-header { padding: 12px 20px; background: #1a1a2e; display: flex; justify-content: space-between; align-items: center; }
    .pair-header h2 { font-size: 16px; font-weight: 600; }
    .pair-header .status { font-size: 12px; padding: 3px 10px; border-radius: 999px; }
    .status.both { background: #1a4d2e; color: #4ade80; }
    .status.ref-only { background: #4d1a1a; color: #f87171; }
    .status.cur-only { background: #4d3b1a; color: #fbbf24; }
    .images { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #333; }
    .images.single { grid-template-columns: 1fr; }
    .image-col { background: #111; padding: 8px; }
    .image-col .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; text-align: center; }
    .image-col img { width: 100%; border-radius: 4px; display: block; }
    .image-col .missing { padding: 60px 20px; text-align: center; color: #555; font-style: italic; }
    .legend { display: flex; gap: 20px; justify-content: center; margin-bottom: 20px; font-size: 13px; }
    .legend span { display: flex; align-items: center; gap: 6px; }
    .legend .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .summary { text-align: center; padding: 20px; color: #888; font-size: 13px; }
  </style>
</head>
<body>
  <h1>I-LIT Visual Comparison</h1>
  <p class="subtitle">Reference (Savvas I-LIT) vs Current Build &mdash; Generated ${new Date().toISOString().split("T")[0]}</p>
  <div class="legend">
    <span><span class="dot" style="background:#4ade80"></span> Both available</span>
    <span><span class="dot" style="background:#f87171"></span> Reference only</span>
    <span><span class="dot" style="background:#fbbf24"></span> Current only</span>
  </div>
${pairs
  .map((p) => {
    const hasBoth = p.ref && p.cur;
    const hasRef = !!p.ref;
    const hasCur = !!p.cur;
    const statusClass = hasBoth
      ? "both"
      : hasRef
        ? "ref-only"
        : "cur-only";
    const statusText = hasBoth
      ? "Compare"
      : hasRef
        ? "Reference only"
        : "Current only";

    return `  <div class="pair">
    <div class="pair-header">
      <h2>${p.label}</h2>
      <span class="status ${statusClass}">${statusText}</span>
    </div>
    <div class="images${hasBoth ? "" : " single"}">
      ${
        hasRef
          ? `<div class="image-col">
        <div class="label">Reference (Savvas)</div>
        <img src="${p.ref}" alt="Reference: ${p.label}" loading="lazy">
      </div>`
          : hasBoth
            ? `<div class="image-col"><div class="missing">No reference screenshot</div></div>`
            : ""
      }
      ${
        hasCur
          ? `<div class="image-col">
        <div class="label">Current (Ours)</div>
        <img src="${p.cur}" alt="Current: ${p.label}" loading="lazy">
      </div>`
          : hasBoth
            ? `<div class="image-col"><div class="missing">No current screenshot</div></div>`
            : ""
      }
    </div>
  </div>`;
  })
  .join("\n")}
  <div class="summary">
    ${pairs.filter((p) => p.ref && p.cur).length} comparisons &middot;
    ${pairs.filter((p) => p.ref && !p.cur).length} reference-only &middot;
    ${pairs.filter((p) => !p.ref && p.cur).length} current-only
  </div>
</body>
</html>`;

  writeFileSync(COMPARE_HTML, html);
  console.log(`\nComparison page: docs/screenshots/compare.html`);
  console.log(
    `  ${pairs.filter((p) => p.ref && p.cur).length} side-by-side pairs`
  );
  console.log(
    `  ${pairs.filter((p) => p.ref && !p.cur).length} reference-only (no current screenshot)`
  );
}

// Run
if (!compareOnly) await screenshot();
if (!screenshotOnly) buildComparison();
console.log("\nDone.");
