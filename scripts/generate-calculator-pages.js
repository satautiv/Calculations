// Generates a static dist/calc/<id>/index.html per CALCULATOR_REGISTRY entry, so
// each calculator gets a real crawlable URL instead of all 129 looking like the
// same page behind a #calc/<id> hash. Each generated page is a full copy of
// index.html's shell (same css/js includes) that pre-sets location.hash before
// js/calculators.js runs, so the existing hash router activates the right panel
// with zero routing-logic changes, and injects per-calculator SEO metadata
// (title, description, canonical, Open Graph). Also emits dist/sitemap.xml
// listing every one of those URLs plus the homepage and privacy policy, so
// crawlers can discover them without following links. See issues
// #444/#445/#446/#447.
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

// Matches index.html's whole homepage <title>/description/OG block (from the
// <title> down through the og:image tag it ends with) so it can be swapped
// wholesale for the per-calculator equivalent - a plain <title> replace would
// leave the homepage's description/OG tags sitting alongside the new ones.
const HOMEPAGE_HEAD_RE = /<title>Calculator Suite<\/title>[\s\S]*?<meta property="og:image" content="https:\/\/mycalcsuite\.com\/icons\/icon-512\.png">/;

function buildPage(baseHtml, calc) {
  const title = escapeHtml(`${calc.name} — Calculator Suite`);
  const description = escapeHtml(calc.description);
  const canonical = `${SITE_URL}/calc/${calc.id}/`;
  const ogImage = `${SITE_URL}/icons/icon-512.png`;

  // js/i18n.js's applyTranslations() walks every leaf element in the whole
  // document (including <title>) and runs it through t(), which falls back to
  // the original text unchanged for anything not in a translation dictionary
  // - so this per-calculator title/OG text is safe to leave English-only, it
  // just won't be a no-op lookup like the homepage's "Calculator Suite" title.
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${ogImage}">`,
  ].join('\n');

  let html = baseHtml.replace(HOMEPAGE_HEAD_RE, head);

  // Setting the hash before js/calculators.js runs (rather than in a
  // hashchange listener) matters: calculators.js reads location.hash
  // synchronously on load (`showView(currentCalcIdFromHash())`), so the panel
  // must already be set by the time that script executes.
  html = html.replace('<body>', `<body>\n<script>location.hash = ${JSON.stringify(`#calc/${calc.id}`)};</script>`);

  return html;
}

// Auto-generated from the registry (rather than hand-maintained) so it can't
// drift out of date as calculators are added/removed - see #447.
function buildSitemap() {
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/privacy.html`,
    ...CALCULATOR_REGISTRY.map(calc => `${SITE_URL}/calc/${calc.id}/`),
  ];

  const urlEntries = urls.map(url => `  <url>\n    <loc>${escapeHtml(url)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

function main() {
  const rawHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const baseHtml = toAbsoluteAssetPaths(rawHtml);

  for (const calc of CALCULATOR_REGISTRY) {
    const outDir = path.join(DIST, 'calc', calc.id);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(baseHtml, calc));
  }

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), buildSitemap());

  console.log(`Generated ${CALCULATOR_REGISTRY.length} calculator pages and sitemap.xml in ${path.relative(ROOT, DIST)}/`);
}

main();
