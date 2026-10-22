// Publish evidence in the HTML itself; consumers do not need JavaScript.
import { readFileSync, writeFileSync } from 'node:fs';
import { htmlFiles } from './site-files.mjs';
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const data = JSON.parse(readFileSync('contributions.json', 'utf8'));
const cards = data.contributors.filter(c => c.total_merged_prs > 0).map(c => `
                <article class="p-5 rounded-xl border border-ae-200/60 bg-white">
                    <h3 class="text-sm font-semibold text-ae-900"><a class="underline" href="${escape(c.profile_url)}">${escape(c.name)}</a></h3>
                    <p class="text-xs text-ae-500 mt-2">${escape(c.summary || '')}</p>
                    <p class="text-xs text-ae-600 mt-3">${c.total_merged_prs} merged ecosystem PRs</p>
                    <div class="flex flex-wrap gap-2 mt-3">${Object.entries(c.repos).map(([repo, count]) => `<a class="text-xs underline text-ae-700" href="https://github.com/frappe/${encodeURIComponent(repo)}/pulls?q=${encodeURIComponent(`is:pr is:merged author:${c.username}`)}">${escape(repo)} (${count})</a>`).join('')}</div>
                </article>`).join('\n');
for (const [file, id] of [['index.html', 'contributors-grid'], ['hire-erpnext-developer/index.html', 'erpnext-contributors-grid']]) {
  let source = readFileSync(file, 'utf8');
  const erpnext = data.contributors.reduce((sum,c)=>sum+(c.repos.erpnext||0),0);
  const note = `<p class="text-sm text-ae-600 sm:col-span-2 lg:col-span-3">Snapshot: ${escape(data.snapshot_date)}. ${data.total_prs.toLocaleString('en-IN')} public merged PRs across the listed Frappe ecosystem repositories, including ${erpnext.toLocaleString('en-IN')} in ERPNext. Counts cover these contributors' public lifetime work, may include backport PRs opened by the contributor, and do not attribute contributions to employment at Aerele. Ask us about current developer availability. <a class="underline" href="/contributions.json">Data and methodology</a>.</p>`;
  source = source.replace(new RegExp(`(<div id="${id}"[^>]*>)[\\s\\S]*?(?=\\n            </div>)`), `$1\n<!-- generated:contributors:start -->${note}${cards}\n<!-- generated:contributors:end -->`);
  writeFileSync(file, source);
}

// A static blog index survives failed JS/fetch; JS can still filter these posts.
let blog = readFileSync('blog/index.html','utf8');
const { posts } = JSON.parse(readFileSync('blog/posts.json','utf8'));
const list = posts.map(p => `<article class="p-6 border border-ae-200 rounded-xl bg-white"><p class="text-xs text-ae-500">${escape(p.category)} · ${escape(p.date)}</p><h3 class="text-xl font-semibold mt-3"><a class="underline" href="/blog/${escape(p.slug)}/">${escape(p.title)}</a></h3><p class="text-sm text-ae-600 mt-3">${escape(p.excerpt || p.description || '')}</p></article>`).join('\n');
blog = blog.replace(/(<div id="posts-grid"[^>]*>)[\s\S]*?(?=<\/div>\s*\n)/, `$1<!-- generated:posts:start -->${list}<!-- generated:posts:end -->`);
// A failed enhancement must preserve the static list.
blog = blog.replace(/\.catch\(\(\) => \{ document.getElementById\('posts-grid'\).innerHTML = '[^']*'; \}\);/, '.catch(() => { /* Keep the server-rendered post links. */ });');
writeFileSync('blog/index.html',blog);

// Include only indexable canonical pages. Omit lastmod rather than publish stale
// or build-time dates; git timestamps are not reliable content modification dates.
const urls = htmlFiles().flatMap(file => {
  const source = readFileSync(file, 'utf8');
  if (/name="robots" content="[^"]*noindex/.test(source)) return [];
  const canonical = source.match(/rel="canonical" href="([^"]+)"/)?.[1];
  return canonical ? [canonical] : [];
});
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].sort().map(url => `    <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
