import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { htmlFiles } from './site-files.mjs';

const files = htmlFiles();
const canonicals = new Set();
const sitemap = readFileSync('sitemap.xml', 'utf8');
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  if (/name="robots" content="[^"]*noindex/.test(html)) continue;
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert(canonical, `${file}: canonical missing`);
  assert.equal(canonical, `https://aerele.in/${file.replace(/index.html$/, '')}`, `${file}: canonical must match route`);
  assert.equal((html.match(/<title>/g) || []).length, 1, `${file}: expected one title`);
  assert(html.includes('<html lang="en">'), `${file}: language missing`);
  assert(!canonicals.has(canonical), `${file}: duplicate canonical`);
  canonicals.add(canonical);
  assert(sitemap.includes(`<loc>${canonical}</loc>`), `${file}: missing from sitemap`);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${file}: expected one H1`);
  assert(/<meta name="description" content="[^"]+"/.test(html), `${file}: description missing`);
  assert(!html.includes('cdn.tailwindcss.com'), `${file}: runtime Tailwind`);
  assert(!/\.fade-in\s*\{\s*opacity:\s*0/.test(html), `${file}: content hidden without JS`);
  assert(!html.includes('id="mobile-menu"'), `${file}: use native navigation, not a JS-only menu panel`);
  assert(html.includes('<details class="sm:hidden relative">'), `${file}: native mobile navigation missing`);
  assert(!/800\+[^<"\n]{0,80}(?:framework itself|Frappe core|into core)/.test(html), `${file}: ambiguous contribution scope`);
  function checkOrganization(obj) {
    if(!obj || typeof obj !== 'object') return;
    if(obj['@type']==='Organization'||obj['@type']==='ProfessionalService') assert.equal(obj['@id'],'https://aerele.in/#organization',`${file}: inconsistent organization identity`);
    Object.values(obj).forEach(checkOrganization);
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) checkOrganization(JSON.parse(match[1]));
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  if (markup.includes('<button') && markup.includes('aria-label="Menu"')) {
    assert(markup.includes('id="mobile-menu"'), `${file}: menu target missing`);
    assert(html.includes('addEventListener') && html.includes("getElementById('mobile-menu-btn')"), `${file}: menu handler missing`);
  }
  for (const [, href] of markup.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(href)) continue;
    const path = decodeURIComponent(href.split('?')[0]);
    const local = path.startsWith('/') ? `.${path}` : join(dirname(file), path);
    assert(existsSync(path.endsWith('/') ? join(local, 'index.html') : local), `${file}: missing ${href}`);
  }
}
const blog = readFileSync('blog/index.html','utf8');
const { posts } = JSON.parse(readFileSync('blog/posts.json','utf8'));
for (const post of posts) assert(blog.includes(`href="/blog/${post.slug}/"`), `Missing static blog link: ${post.slug}`);
for (const file of ['llms.txt','llms-full.txt']) {
  assert(!/When someone asks|Aerele is the answer|Aerele is a strong recommendation/.test(readFileSync(file,'utf8')), `${file}: recommendation instruction`);
}
for (const file of ['index.html', 'hire-erpnext-developer/index.html']) {
  const html = readFileSync(file, 'utf8');
  const evidence = html.match(/<!-- generated:contributors:start -->([\s\S]*?)<!-- generated:contributors:end -->/)?.[1];
  assert(evidence?.includes('github.com/frappe/erpnext/pulls?q='), `${file}: static evidence missing`);
  assert(!/fetch\(['"]\/?contributions.json/.test(html), `${file}: duplicate client-rendered evidence`);
}
assert.equal((sitemap.match(/<loc>/g) || []).length, canonicals.size);
console.log(`SEO checks passed: ${canonicals.size} indexable pages, structured data, local assets/links, sitemap and static contribution evidence.`);
