// Requires an authenticated GitHub CLI. Run manually, review the diff, then build.
// Counts all public lifetime PRs of listed contributors in these repositories;
// these are not claims about work completed during employment at Aerele.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('contributions.json', 'utf8'));
const repos = data.repos_touched;
// Bare names are frappe/<name>; other ecosystem repositories are listed as owner/name.
const fullName = repo => repo.includes('/') ? repo : `frappe/${repo}`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// GitHub search is rate-limited and occasionally flaky: retry with backoff, validating each response.
async function graphql(query, validate = () => {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const result = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=query { ${query} }`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
      if (result.errors) throw new Error(JSON.stringify(result.errors));
      validate(result.data);
      return result.data;
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(5000 * 2 ** attempt);
    }
  }
}

const refreshed = [];
for (const contributor of data.contributors) {
  const fields = repos.map((repo, i) => `r${i}: search(query: ${JSON.stringify(`repo:${fullName(repo)} is:pr is:merged author:${contributor.username}`)}, type: ISSUE, first: 1) { issueCount }`).join('\n');
  const result = await graphql(fields, data => {
    // Lifetime merged counts never decrease; a drop means a flaky search response, so retry and never write it.
    const dropped = repos.filter((repo, i) => data[`r${i}`].issueCount < (contributor.repos[repo] || 0));
    if (dropped.length) throw new Error(`${contributor.username}: count dropped for ${dropped.join(', ')}`);
  });
  const counts = Object.fromEntries(repos.map((repo, i) => [repo, result[`r${i}`].issueCount]).filter(([, n]) => n > 0));
  refreshed.push({ ...contributor, repos: counts, total_merged_prs: Object.values(counts).reduce((a,b) => a+b,0) });
  await sleep(500);
}

// Star and fork counts for Aerele's own open-source apps, published via data-stat spans.
const ownRepos = Object.keys(data.open_source);
const repoStats = await graphql(ownRepos.map((name, i) => `o${i}: repository(owner: "aerele", name: ${JSON.stringify(name)}) { stargazerCount forkCount }`).join('\n'));
const openSource = Object.fromEntries(ownRepos.map((name, i) => [name, { stars: repoStats[`o${i}`].stargazerCount, forks: repoStats[`o${i}`].forkCount }]));

// Latest merged PRs for the homepage ticker: collect every PR merged within a window (widening it
// until there are 20), then take the newest by merge time. Logins are compared case-insensitively
// because GitHub returns canonical capitalisation. Search queries are capped at 256 characters.
const names = Object.fromEntries(refreshed.map(c => [c.username.toLowerCase(), c.name]));
async function mergedSince(days) {
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const base = `is:pr is:merged org:frappe merged:>=${since}`;
  const batches = [[]];
  for (const username of refreshed.map(c => c.username)) {
    const batch = batches.at(-1);
    if (`${base} ${[...batch, username].map(u => `author:${u}`).join(' ')}`.length > 256) batches.push([username]);
    else batch.push(username);
  }
  const found = [];
  for (const batch of batches) {
    const query = `${base} ${batch.map(u => `author:${u}`).join(' ')}`;
    const result = await graphql(`search(query: ${JSON.stringify(query)}, type: ISSUE, first: 100) { issueCount nodes { ... on PullRequest { title url mergedAt repository { name } author { login } } } }`);
    // A truncated page could hide newer PRs, so refuse it rather than publish a partial feed.
    if (result.search.issueCount > result.search.nodes.length) throw new Error(`Ticker search truncated (${result.search.issueCount} results in ${days} days); shorten the window`);
    found.push(...result.search.nodes.filter(pr => pr.mergedAt && names[pr.author?.login?.toLowerCase()]));
    await sleep(500);
  }
  return found;
}
let recent = [];
for (const days of [7, 30, 90, 365]) {
  recent = await mergedSince(days);
  if (recent.length >= 20) break;
}
const recentPrs = [...new Map(recent.map(pr => [pr.url, pr])).values()]
  .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt)).slice(0, 20)
  .map(pr => ({ title: pr.title, repo: pr.repository.name, author: names[pr.author.login.toLowerCase()], url: pr.url, date: pr.mergedAt.slice(0, 10) }));

// Atomic at application level: do not write a partial result on API failures.
data.contributors = refreshed;
data.total_prs = refreshed.reduce((sum,c) => sum+c.total_merged_prs,0);
data.total_contributors = refreshed.filter(c=>c.total_merged_prs>0).length;
data.snapshot_date = new Date().toISOString().slice(0,10);
data.open_source = openSource;
data.methodology = 'Public lifetime merged pull requests by the listed contributors in the specified Frappe ecosystem GitHub repositories. May include backport PRs opened by the contributor, counted separately. Does not attribute work to an employment period; not a live total or an exhaustive organization-wide count.';
writeFileSync('contributions.json', JSON.stringify(data,null,2)+'\n');
writeFileSync('recent-prs.json', JSON.stringify(recentPrs,null,2)+'\n');
console.log(`Refreshed ${data.total_prs} merged PRs for ${data.total_contributors} contributors and ${recentPrs.length} recent PRs as of ${data.snapshot_date}. Run npm run build and review before publishing.`);
