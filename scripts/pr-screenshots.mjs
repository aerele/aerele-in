// Capture full-page screenshots of the pages a PR changes (or a default set).
//
// Serves the repo with a tiny static server, renders each route with Playwright
// Chromium, reveals scroll-in (.fade-in) content, and writes PNGs + manifest.json
// into .pr-screenshots/. Used by .github/workflows/pr-screenshots.yml.
//
// Env: CHANGED_FILES = newline-separated list of changed paths (from git diff).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, '.pr-screenshots');
const PORT = 8799;
const MAX_PAGES = 16;

const MIME = {
  '.html': 'text/html;charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let fp = join(ROOT, p);
    if (!existsSync(fp) && existsSync(fp + '.html')) fp += '.html';
    const buf = await readFile(fp);
    res.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(PORT, r));

// Map changed *.html files to routes; fall back to a representative default set.
const DEFAULT = ['/', '/blog/', '/products/lens/', '/products/optimus/', '/products/frappe-claw/'];
const changedRoutes = (process.env.CHANGED_FILES || '')
  .split('\n').map((s) => s.trim()).filter((f) => f.endsWith('.html'))
  .map((f) => '/' + f.replace(/index\.html$/, '').replace(/\.html$/, ''))
  .map((r) => (r.endsWith('/') ? r : r + '/'))
  .map((r) => (r === '//' ? '/' : r));

// Prioritise the marketing surfaces (home, products, blog) so the cap never cuts them.
const rank = (r) => (r === '/' ? 0 : r.startsWith('/products/') ? 1 : r === '/blog/' ? 2 : r.startsWith('/blog/') ? 3 : 4);
const routes = [...new Set(changedRoutes.length ? ['/', ...changedRoutes] : DEFAULT)]
  .sort((a, b) => rank(a) - rank(b))
  .slice(0, MAX_PAGES);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const manifest = [];
for (const route of routes) {
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(900); // let the Tailwind CDN + web fonts settle
    await page.evaluate(() => document.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible')));
    await page.waitForTimeout(200);
    const name = (route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '__')) + '.png';
    await page.screenshot({ path: join(OUT, name), fullPage: true });
    manifest.push({ route, name });
    console.log('captured', route);
  } catch (e) {
    console.error('skip', route, e.message);
  }
  await page.close();
}
await browser.close();
server.close();
await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Done: ${manifest.length} screenshot(s).`);
