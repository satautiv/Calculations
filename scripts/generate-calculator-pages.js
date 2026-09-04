// Generates a static dist/calc/<id>/index.html per CALCULATOR_REGISTRY entry, so
// each calculator gets a real crawlable URL instead of all 129 looking like the
// same page behind a #calc/<id> hash. Each generated page is a full copy of
// index.html's shell (same css/js includes) that pre-sets location.hash before
// js/calculators.js runs, so the existing hash router activates the right panel
// with zero routing-logic changes. See issue #444/#445.
const fs = require('fs');
const path = require('path');
const { CALCULATOR_REGISTRY } = require('../js/calculators-registry.js');

const SITE_URL = 'https://mycalcsuite.com';
const ROOT = path.join(__dirname, '..');
const DIST = process.env.CALC_PAGES_DIST || path.join(ROOT, 'dist');

// index.html's asset links are root-relative ("css/style.css") so they resolve
// correctly when the file is served from the site root. Generated pages live
// two levels deeper (dist/calc/<id>/index.html), so those same paths need to
// become absolute ("/css/style.css") to keep resolving to the shared assets
// instead of a nonexistent dist/calc/<id>/css/.
function toAbsoluteAssetPaths(html) {
  return html
    .replace('href="css/style.css"', 'href="/css/style.css"')
    .replace('href="manifest.json"', 'href="/manifest.json"')
    .replace('href="icons/apple-touch-icon.png"', 'href="/icons/apple-touch-icon.png"')
    .replace('href="privacy.html"', 'href="/privacy.html"')
    .replace(/src="js\//g, 'src="/js/')
    .replace("register('sw.js')", "register('/sw.js')");
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildPage(baseHtml, calc) {
  const title = escapeHtml(`${calc.name} Calculator | Calculator Suite`);
  const description = escapeHtml(calc.description);
  const canonical = `${SITE_URL}/calc/${calc.id}/`;

  let html = baseHtml.replace(
    '<title>Calculator Suite</title>',
    `<title>${title}</title>\n<meta name="description" content="${description}">\n<link rel="canonical" href="${canonical}">`
  );

  // Setting the hash before js/calculators.js runs (rather than in a
  // hashchange listener) matters: calculators.js reads location.hash
  // synchronously on load (`showView(currentCalcIdFromHash())`), so the panel
  // must already be set by the time that script executes.
  html = html.replace('<body>', `<body>\n<script>location.hash = ${JSON.stringify(`#calc/${calc.id}`)};</script>`);

  return html;
}

function main() {
  const rawHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const baseHtml = toAbsoluteAssetPaths(rawHtml);

  for (const calc of CALCULATOR_REGISTRY) {
    const outDir = path.join(DIST, 'calc', calc.id);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(baseHtml, calc));
  }

  console.log(`Generated ${CALCULATOR_REGISTRY.length} calculator pages in ${path.relative(ROOT, DIST)}/calc/`);
}

main();
