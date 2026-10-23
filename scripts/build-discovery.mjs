// Publish evidence in the HTML itself; consumers do not need JavaScript.
import { readFileSync, writeFileSync } from 'node:fs';
import { htmlFiles } from './site-files.mjs';
import { applyCounts, managesCounts, siteCounts } from './site-counts.mjs';
const fmt = n => n.toLocaleString('en-IN');
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const data = JSON.parse(readFileSync('contributions.json', 'utf8'));
const counts = siteCounts(data);
const repoUrl = repo => `https://github.com/${repo.includes('/') ? repo.split('/').map(encodeURIComponent).join('/') : `frappe/${encodeURIComponent(repo)}`}`;
const cards = data.contributors.filter(c => c.total_merged_prs > 0).sort((a, b) => b.total_merged_prs - a.total_merged_prs).map(c => `
                <article class="p-5 rounded-xl border border-ae-200/60 hover:border-ae-300 bg-white transition-all">
                    <div class="flex items-center gap-3 mb-3">
                        <a href="${escape(c.profile_url)}" class="shrink-0" aria-hidden="true" tabindex="-1"><img src="${escape(c.avatar)}" alt="" width="40" height="40" class="w-10 h-10 rounded-full bg-ae-100" loading="lazy"></a>
                        <div class="min-w-0">
                            <a href="${escape(c.profile_url)}" class="block text-sm font-semibold text-ae-900 hover:text-ae-700 transition-colors">${escape(c.name)}</a>
                            <div class="text-[11px] text-ae-400">@${escape(c.username)}</div>
                        </div>
                        <div class="ml-auto text-right">
                            <div class="text-base font-semibold text-ae-950">${fmt(c.total_merged_prs)}</div>
                            <div class="text-[10px] text-ae-400">merged PRs</div>
                        </div>
                    </div>
                    <p class="text-sm text-ae-500 leading-relaxed mb-3">${escape(c.summary || '')}</p>
                    <div class="flex flex-wrap gap-1">${Object.entries(c.repos).sort((a, b) => b[1] - a[1]).map(([repo, count]) => `<a class="px-2 py-0.5 rounded text-[10px] bg-ae-50 text-ae-500 hover:text-ae-900 hover:bg-ae-100 transition-colors" href="${repoUrl(repo)}/pulls?q=${encodeURIComponent(`is:pr is:merged author:${c.username}`)}">${escape(repo.split('/').pop())} (${fmt(count)})</a>`).join('')}</div>
                </article>`).join('\n');
for (const [file, id] of [['index.html', 'contributors-grid'], ['hire-erpnext-developer/index.html', 'erpnext-contributors-grid']]) {
  let source = readFileSync(file, 'utf8');
  const note = `<p class="text-sm text-ae-600 sm:col-span-2 lg:col-span-3">Snapshot: ${escape(data.snapshot_date)}. ${counts.total} public merged PRs across ${counts.repos} Frappe ecosystem repositories, including ${counts.erpnext} in ERPNext, made by our engineers as part of their work at Aerele. Counts may include backport PRs opened by the contributor. Ask us about current developer availability. <a class="underline" href="/contributions.json">Data and methodology</a>.</p>`;
  source = source.replace(new RegExp(`(<div id="${id}"[^>]*>)[\\s\\S]*?(?=\\n            </div>)`), `$1\n<!-- generated:contributors:start -->${note}${cards}\n<!-- generated:contributors:end -->`);
  writeFileSync(file, source);
}

// Every published count comes from contributions.json (see site-counts.mjs).
const top = data.contributors.map(c => c.total_merged_prs).sort((a, b) => b - a).slice(0, 7).map(fmt).join(', ');
const stats = `### Contribution Statistics
- **${counts.prFloor} pull requests** merged into Frappe ecosystem repositories (snapshot ${data.snapshot_date}: ${counts.total}, including ${counts.erpnext} in ERPNext; https://aerele.in/contributions.json)
- **30+ engineers** on the team
- **${counts.repos} Frappe ecosystem repositories** contributed to
- **${counts.contributors} contributors** with merged PRs in the snapshot (top contributors: ${top} PRs)
`;
let llmsFull = readFileSync('llms-full.txt', 'utf8').replace(/### Contribution Statistics\n(?:- .*\n)+/, stats);
writeFileSync('llms-full.txt', llmsFull);
for (const file of [...htmlFiles().filter(managesCounts), 'llms.txt', 'llms-full.txt']) {
  const source = readFileSync(file, 'utf8');
  const updated = applyCounts(source, data);
  if (updated !== source) writeFileSync(file, updated);
}

// The blog index is fully server-rendered with the same markup the page used to build in the
// browser; its script only filters these cards.
let blog = readFileSync('blog/index.html','utf8');
const { posts } = JSON.parse(readFileSync('blog/posts.json','utf8'));
const sorted = posts.slice().sort((a, b) => b.date.localeCompare(a.date));
const fmtDate = iso => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const cover = (post, big) => `
                <div class="relative ${big ? 'h-56 sm:h-64' : 'h-44'} bg-ae-950 cover-glow overflow-hidden flex items-center justify-center">
                    <span class="font-mono ${big ? 'text-7xl sm:text-8xl' : 'text-6xl'} font-semibold text-white/10 select-none">${escape(post.cover.glyph)}</span>
                    <span class="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${post.category === 'Use Case' ? 'bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30' : post.category === 'Product' ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/40' : 'bg-white/10 text-ae-200 ring-1 ring-white/15'}">${escape(post.category)}</span>
                    ${post.video ? `<span class="absolute bottom-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/90 text-white shadow-md ring-1 ring-white/20" title="Includes a demo video"><svg class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>` : ''}
                </div>`;
const postCard = post => `
            <a href="/blog/${escape(post.slug)}/" data-cat="${escape(post.category)}" data-search="${escape([post.title, post.excerpt, ...post.tags].join(' ').toLowerCase())}" class="group flex flex-col bg-white border border-ae-200/60 hover:border-ae-300 rounded-xl overflow-hidden transition-colors">
                ${cover(post, false)}
                <div class="p-6 flex flex-col flex-1">
                    <h3 class="text-base font-semibold text-ae-950 leading-snug mb-2 group-hover:text-ae-700 transition-colors">${escape(post.title)}</h3>
                    <p class="text-sm text-ae-500 leading-relaxed mb-4 flex-1">${escape(post.excerpt)}</p>
                    <div class="flex items-center gap-3 mb-3">${post.tags.slice(0, 3).map(t => `<span class="text-[11px] text-ae-400 font-mono">#${escape(t)}</span>`).join('')}</div>
                    <div class="flex items-center justify-between text-[11px] text-ae-400 pt-3 border-t border-ae-200/60">
                        <span>${escape(post.author)}</span>
                        <span>${fmtDate(post.date)} · ${escape(post.readingTime)}</span>
                    </div>
                </div>
            </a>`;
const featuredCard = post => `
            <a href="/blog/${escape(post.slug)}/" class="group flex flex-col sm:flex-row bg-white border border-ae-200/60 hover:border-ae-300 rounded-2xl overflow-hidden transition-colors">
                <div class="sm:w-1/2">${cover(post, true)}</div>
                <div class="p-7 sm:p-8 flex flex-col justify-center sm:w-1/2">
                    <span class="text-[11px] font-semibold uppercase tracking-wider ${post.category === 'Use Case' || post.category === 'Product' ? 'text-brand-600' : 'text-ae-400'} mb-3">${escape(post.category)}</span>
                    <h3 class="text-xl font-semibold text-ae-950 leading-snug mb-3 group-hover:text-ae-700 transition-colors">${escape(post.title)}</h3>
                    <p class="text-sm text-ae-500 leading-relaxed mb-5">${escape(post.excerpt)}</p>
                    <div class="flex items-center gap-2 text-[11px] text-ae-400">
                        <span>${escape(post.author)}</span><span>·</span><span>${fmtDate(post.date)}</span><span>·</span><span>${escape(post.readingTime)}</span>
                    </div>
                </div>
            </a>`;
const filterButtons = ['All', 'Product', 'Use Case', 'Experience'].map(c => `
                <button type="button" data-cat="${c}" aria-pressed="${c === 'All'}" class="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${c === 'All' ? 'bg-ae-900 text-white' : 'bg-white text-ae-600 border border-ae-200 hover:border-ae-300'}">${c === 'Use Case' ? 'Use Cases' : c === 'Experience' ? 'Experiences' : c}</button>`).join('');
const region = (html, id, name, content) => html.replace(
  new RegExp(`(<div id="${id}"[^>]*>)(?:<!-- generated:${name}:start -->[\\s\\S]*?<!-- generated:${name}:end -->)?(</div>)`),
  `$1<!-- generated:${name}:start -->${content}\n            <!-- generated:${name}:end -->$2`);
blog = region(blog, 'featured-grid', 'featured', sorted.filter(p => p.featured).slice(0, 2).map(featuredCard).join(''));
blog = region(blog, 'filters', 'filters', filterButtons);
blog = region(blog, 'posts-grid', 'posts', sorted.map(postCard).join(''));
writeFileSync('blog/index.html',blog);

// Homepage PR ticker, server-rendered from recent-prs.json. The list is repeated once
// (hidden from assistive tech) so the CSS scroll animation loops seamlessly.
const tickerBg = { erpnext: 'rgba(226,232,240,0.15)', frappe: 'rgba(219,234,254,0.15)', hrms: 'rgba(224,231,255,0.15)', payments: 'rgba(252,231,243,0.15)', webshop: 'rgba(209,250,229,0.15)', ecommerce_integrations: 'rgba(254,243,199,0.15)' };
const tickerFg = { erpnext: '#94a3b8', frappe: '#93c5fd', hrms: '#a5b4fc', payments: '#f9a8d4', webshop: '#6ee7b7', ecommerce_integrations: '#fcd34d' };
const recentPrs = JSON.parse(readFileSync('recent-prs.json', 'utf8'));
const tickerItems = hidden => recentPrs.map(pr => `
                                    <a href="${escape(pr.url)}"${hidden ? ' tabindex="-1" aria-hidden="true"' : ''} class="block px-4 py-3 mx-2 rounded-lg group hover:bg-white/5 transition-colors" style="background:${tickerBg[pr.repo] || 'rgba(241,245,249,0.1)'}">
                                        <div class="flex items-center gap-2 mb-1.5">
                                            <span class="text-xs font-mono font-medium" style="color:${tickerFg[pr.repo] || '#94a3b8'}">${escape(pr.repo)}</span>
                                            <span class="text-xs text-ae-500">·</span>
                                            <span class="text-xs text-ae-400">${escape(pr.author)}</span>
                                        </div>
                                        <div class="text-sm text-ae-200 leading-snug group-hover:text-white transition-colors">${escape(pr.title.length > 78 ? pr.title.slice(0, 78) + '…' : pr.title)}</div>
                                    </a>`).join('');
let home = readFileSync('index.html', 'utf8');
home = region(home, 'pr-ticker', 'ticker', tickerItems(false) + tickerItems(true));
writeFileSync('index.html', home);

// Include only indexable canonical pages. Omit lastmod rather than publish stale
// or build-time dates; git timestamps are not reliable content modification dates.
const urls = htmlFiles().flatMap(file => {
  const source = readFileSync(file, 'utf8');
  if (/name="robots" content="[^"]*noindex/.test(source)) return [];
  const canonical = source.match(/rel="canonical" href="([^"]+)"/)?.[1];
  return canonical ? [canonical] : [];
});
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].sort().map(url => `    <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
