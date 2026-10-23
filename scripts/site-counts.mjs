// One source of truth for every count published on the site: contributions.json.
// The build rewrites these figures in place; check-seo fails if any claim disagrees.
const fmt = n => n.toLocaleString('en-IN');

// Refuse internally inconsistent data, so a hand edit can never publish a figure the cards contradict.
export function validateCounts(data) {
  const fail = message => { throw new Error(`contributions.json: ${message}`); };
  for (const c of data.contributors) {
    const sum = Object.values(c.repos).reduce((a, b) => a + b, 0);
    if (sum !== c.total_merged_prs) fail(`${c.username} total ${c.total_merged_prs} != repository sum ${sum}`);
    for (const repo of Object.keys(c.repos)) if (!data.repos_touched.includes(repo)) fail(`${c.username} has unlisted repository ${repo}`);
  }
  const total = data.contributors.reduce((a, c) => a + c.total_merged_prs, 0);
  if (total !== data.total_prs) fail(`total_prs ${data.total_prs} != contributor sum ${total}`);
  const active = data.contributors.filter(c => c.total_merged_prs > 0).length;
  if (active !== data.total_contributors) fail(`total_contributors ${data.total_contributors} != ${active}`);
}

export function siteCounts(data) {
  validateCounts(data);
  const active = data.contributors.filter(c => c.total_merged_prs > 0);
  return {
    // Rounded down so the public figure stays a conservative lower bound between refreshes.
    prFloor: `${fmt(Math.floor(data.total_prs / 100) * 100)}+`,
    total: fmt(data.total_prs),
    erpnext: fmt(active.reduce((sum, c) => sum + (c.repos.erpnext || 0), 0)),
    contributors: active.length,
    repos: new Set(active.flatMap(c => Object.keys(c.repos))).size,
  };
}

// "N+" (1100+ or 1,100+) followed by a PR/contribution noun, allowing tags or markdown emphasis in between.
export const PR_CLAIM = /\b(?:\d{1,3}(?:,\d{2,3})+|\d{1,5})\+(?=(?:\s|\*\*|<[^>]+>)*(?:merged\b|pull requests|PRs\b|Merged PRs|Frappe ecosystem PRs|contributions\b|ecosystem contributions|core contributions|contributions to the core|figure\b))/g;

// Historical titles quote the figure at the time of writing ("What 600+ merged PRs ... taught us").
const historical = (text, index) => /^[^<\n]{0,40}taught us/.test(text.slice(index));

// Dated blog posts keep the figures they were written with; their CTA comes from the blog template.
export const managesCounts = file => !/^blog\/(?!index\.html$)/.test(file) && !file.startsWith('content/');

export function prClaims(text) {
  return [...text.matchAll(PR_CLAIM)].filter(m => !historical(text, m.index)).map(m => m[0]);
}

export function applyCounts(text, data) {
  const counts = siteCounts(data);
  text = text.replace(PR_CLAIM, (match, index, whole) => historical(whole, index) ? match : counts.prFloor);
  text = text.replace(/\b\d+ Frappe ecosystem repositories\b/g, `${counts.repos} Frappe ecosystem repositories`);
  for (const [repo, stats] of Object.entries(data.open_source || {})) {
    for (const [stat, value] of Object.entries(stats)) {
      text = text.replace(new RegExp(`(<span data-stat="${repo}:${stat}">)[^<]*(</span>)`, 'g'), `$1${value}$2`);
      // Plain-text listings (llms-full.txt): "**repo** (github.com/aerele/repo) – ... N+ stars".
      if (stat === 'stars') text = text.replace(new RegExp(`(\\(github\\.com/aerele/${repo}\\)[^\\n]*?)\\d+\\+ stars`, 'g'), `$1${value}+ stars`);
    }
  }
  return text;
}
