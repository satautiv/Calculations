// Accessibility audit: scans every calculator panel (plus the homepage) with
// axe-core and fails if any critical/serious violation is found. Not wired
// into CI yet — this script is meant to be run locally (`npm run audit:a11y`).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');

const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${base}/index.html`);
  const ids = await page.evaluate(() => CALCULATOR_REGISTRY.map(c => c.id));

  const targets = [{ name: 'homepage', hash: '' }, ...ids.map(id => ({ name: id, hash: `#calc/${id}` }))];
  let failures = 0;

  for (const t of targets) {
    await page.goto(`${base}/index.html${t.hash}`);
    await page.waitForTimeout(100);
    const results = await new AxeBuilder({ page }).analyze();
    const bad = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    if (bad.length) {
      failures += bad.length;
      console.log(`\n${t.name}:`);
      for (const v of bad) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
        for (const n of v.nodes) console.log(`      ${n.target.join(' ')}`);
      }
    }
  }

  console.log(`\nScanned ${targets.length} pages. Critical/serious violations: ${failures}`);

  await browser.close();
  server.close();
  process.exit(failures ? 1 : 0);
})();
