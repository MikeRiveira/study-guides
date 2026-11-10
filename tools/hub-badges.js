// Refreshes the badge name list used by the progress hub on the roadmap page (index.html).
// Run from the repo root after a guide adds or renames badges:  node tools/hub-badges.js
// Needs Playwright. It opens each guide, reads allBadges(), and rewrites the BADGES line in index.html.
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const guides = [...html.matchAll(/guide:"([a-z0-9]+)\/"/g)].map(m => m[1]);
(async () => {
  const browser = await chromium.launch(), page = await browser.newPage(), out = {};
  for (const g of guides) {
    if (!fs.existsSync(path.join(root, g, "index.html"))) continue;
    await page.goto("file://" + path.join(root, g, "index.html"));
    await page.waitForTimeout(300);
    const b = await page.evaluate(() => typeof allBadges === "function" ? Object.fromEntries(allBadges().map(b => [b.id, b.name])) : null);
    if (b) { out[g] = b; console.log(g, Object.keys(b).length, "badges"); }
  }
  await browser.close();
  const line = /const BADGES=\/\*BADGES\*\/.*;\n/;
  if (!line.test(html)) throw new Error("BADGES line not found in index.html");
  fs.writeFileSync(path.join(root, "index.html"), html.replace(line, () => "const BADGES=/*BADGES*/" + JSON.stringify(out) + ";\n"));
})();
