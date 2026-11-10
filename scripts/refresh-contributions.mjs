// Requires an authenticated GitHub CLI. Run manually, review the diff, then build.
// Counts the public merged PRs of the listed Aerele engineers in these repositories,
// all made as part of their work at Aerele.
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

// Default branch per repository: PRs into any other branch are backports to a release branch.
const branchInfo = await graphql(repos.map((repo, i) => { const [owner, name] = fullName(repo).split('/'); return `b${i}: repository(owner: "${owner}", name: "${name}") { defaultBranchRef { name } }`; }).join('\n'));
const defaultBranch = Object.fromEntries(repos.map((repo, i) => [repo, branchInfo[`b${i}`].defaultBranchRef.name]));

// Contributors with a `backports` object have release-branch backports counted separately: their card
// shows PRs into the default branch, and the backports still count towards the published total.
const sumOf = counts => Object.values(counts || {}).reduce((a, b) => a + b, 0);
const refreshed = [];
for (const contributor of data.contributors) {
  const split = Boolean(contributor.backports);
  const search = (repo, extra) => `search(query: ${JSON.stringify(`repo:${fullName(repo)} is:pr is:merged author:${contributor.username}${extra}`)}, type: ISSUE, first: 1) { issueCount }`;
  const fields = repos.map((repo, i) => split
    ? `r${i}: ${search(repo, ` base:${defaultBranch[repo]}`)}\nb${i}: ${search(repo, ` -base:${defaultBranch[repo]}`)}`
    : `r${i}: ${search(repo, '')}`).join('\n');
  const result = await graphql(fields, data => {
    // Merged counts never decrease; a drop means a flaky search response, so retry and never write it.
    const merged = i => data[`r${i}`].issueCount + (split ? data[`b${i}`].issueCount : 0);
    const dropped = repos.filter((repo, i) => merged(i) < (contributor.repos[repo] || 0) + (contributor.backports?.[repo] || 0));
    if (dropped.length) throw new Error(`${contributor.username}: count dropped for ${dropped.join(', ')}`);
  });
  const counts = Object.fromEntries(repos.map((repo, i) => [repo, result[`r${i}`].issueCount]).filter(([, n]) => n > 0));
  const entry = { ...contributor, repos: counts, total_merged_prs: sumOf(counts) };
  if (split) entry.backports = Object.fromEntries(repos.map((repo, i) => [repo, result[`b${i}`].issueCount]).filter(([, n]) => n > 0));
  refreshed.push(entry);
  await sleep(500);
}
const previousTotal = data.total_prs;
const refreshedTotal = refreshed.reduce((sum, c) => sum + c.total_merged_prs + sumOf(c.backports), 0);
if (refreshedTotal < previousTotal) throw new Error(`Total dropped from ${previousTotal} to ${refreshedTotal}; not writing`);

// Star and fork counts for Aerele's own open-source apps, published via data-stat spans.
const ownRepos = Object.keys(data.open_source);
const repoStats = await graphql(ownRepos.map((name, i) => `o${i}: repository(owner: "aerele", name: ${JSON.stringify(name)}) { stargazerCount forkCount }`).join('\n'));
const openSource = Object.fromEntries(ownRepos.map((name, i) => [name, { stars: repoStats[`o${i}`].stargazerCount, forks: repoStats[`o${i}`].forkCount }]));

// Recent merged PRs for the homepage ticker. Collect PRs merged within a window (widening it until
// there are enough candidates), keep substantive changes into the default branch (no backports or
// housekeeping or one-line tweaks), allow at most two per engineer so the ticker shows the team, take the
// newest 20, and list them in the contributor order of contributions.json.
// Logins are compared case-insensitively because GitHub returns canonical capitalisation.
// Search queries are capped at 256 characters, so authors are batched.
const names = Object.fromEntries(refreshed.map(c => [c.username.toLowerCase(), c.name]));
const housekeeping = /^(chore|ci|test|tests|docs|style|build|refactor|revert)\b|^merge\b|backport|\(v\d+\)\s*$/i;
const substantive = pr => pr.mergedAt && names[pr.author?.login?.toLowerCase()]
  && pr.baseRefName === pr.repository.defaultBranchRef?.name && !housekeeping.test(pr.title.trim())
  && pr.additions + pr.deletions >= 15;
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
    for (let after = null; ;) {
      const result = await graphql(`search(query: ${JSON.stringify(query)}, type: ISSUE, first: 100${after ? `, after: ${JSON.stringify(after)}` : ''}) { pageInfo { hasNextPage endCursor } nodes { ... on PullRequest { title url mergedAt baseRefName additions deletions repository { name defaultBranchRef { name } } author { login } } } }`);
      found.push(...result.search.nodes.filter(substantive));
      await sleep(500);
      if (!result.search.pageInfo.hasNextPage) break;
      after = result.search.pageInfo.endCursor;
    }
  }
  return [...new Map(found.map(pr => [pr.url, pr])).values()].sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}
const perAuthor = 2;
let recentPrs = [];
for (const days of [14, 30, 90, 365]) {
  const taken = {};
  recentPrs = (await mergedSince(days)).filter(pr => {
    const login = pr.author.login.toLowerCase();
    taken[login] = (taken[login] || 0) + 1;
    return taken[login] <= perAuthor;
  }).slice(0, 20);
  if (recentPrs.length >= 20) break;
}
const position = Object.fromEntries(refreshed.map((c, i) => [c.username.toLowerCase(), i]));
recentPrs = recentPrs.sort((a, b) => position[a.author.login.toLowerCase()] - position[b.author.login.toLowerCase()] || b.mergedAt.localeCompare(a.mergedAt))
  .map(pr => ({ title: pr.title.trim(), repo: pr.repository.name, author: names[pr.author.login.toLowerCase()], url: pr.url, date: pr.mergedAt.slice(0, 10) }));

// Atomic at application level: do not write a partial result on API failures.
data.contributors = refreshed;
data.total_prs = refreshedTotal;
data.total_contributors = refreshed.filter(c => c.total_merged_prs + sumOf(c.backports) > 0).length;
data.snapshot_date = new Date().toISOString().slice(0,10);
data.open_source = openSource;
data.default_branches = defaultBranch;
data.methodology = 'Public merged pull requests by the listed Aerele engineers in the specified Frappe ecosystem GitHub repositories, made as part of their work at Aerele. May include backport PRs opened by the contributor, counted separately. Not a live total or an exhaustive organization-wide count.';
writeFileSync('contributions.json', JSON.stringify(data,null,2)+'\n');
writeFileSync('recent-prs.json', JSON.stringify(recentPrs,null,2)+'\n');
console.log(`Refreshed ${data.total_prs} (was ${previousTotal}) merged PRs for ${data.total_contributors} contributors and ${recentPrs.length} recent PRs as of ${data.snapshot_date}. Run npm run build and review before publishing.`);
