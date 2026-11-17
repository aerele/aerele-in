// Requires an authenticated GitHub CLI. Run manually, review the diff, then build.
// Counts the public merged PRs of the Aerele team in these repositories, all made as part of their
// work at Aerele. Every PR, backports included, is credited to the team member who made its first
// commit. ALLOW_DROP=1 permits a lower total.
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

// Default branch per repository: PRs into any other branch target a release branch.
const branchInfo = await graphql(repos.map((repo, i) => { const [owner, name] = fullName(repo).split('/'); return `b${i}: repository(owner: "${owner}", name: "${name}") { defaultBranchRef { name } }`; }).join('\n'));
const defaultBranch = Object.fromEntries(repos.map((repo, i) => [repo, branchInfo[`b${i}`].defaultBranchRef.name]));

const team = new Map(data.team.map(login => [login.toLowerCase(), login]));
const aliases = Object.fromEntries(Object.entries(data.commit_aliases || {}).map(([email, login]) => [email.toLowerCase(), login.toLowerCase()]));
const repoKey = Object.fromEntries(repos.map(repo => [fullName(repo).toLowerCase(), repo]));
const scopes = [...new Set(repos.map(repo => repo.includes('/') ? `repo:${repo}` : 'org:frappe'))];
const prFields = 'number repository { nameWithOwner } author { login } commits(first: 1) { nodes { commit { author { name email user { login } } } } }';
// Commit author login, or the team member a known unlinked commit email belongs to.
const firstCommitter = pr => {
  const author = pr.commits.nodes[0]?.commit.author;
  return author?.user?.login?.toLowerCase() || aliases[author?.email?.toLowerCase()];
};

// Every merged PR opened by a team member. Each search must return all of its results.
const opened = new Map();
for (const login of team.values()) {
  for (const scope of scopes) {
    const query = `${scope} is:pr is:merged author:${login}`;
    const found = [];
    for (let after = null, total; ;) {
      const result = await graphql(`search(query: ${JSON.stringify(query)}, type: ISSUE, first: 50${after ? `, after: ${JSON.stringify(after)}` : ''}) { issueCount pageInfo { hasNextPage endCursor } nodes { ... on PullRequest { ${prFields} } } }`);
      total = result.search.issueCount;
      if (total > 1000) throw new Error(`${query}: ${total} results exceed the search limit`);
      found.push(...result.search.nodes);
      await sleep(300);
      if (!result.search.pageInfo.hasNextPage) {
        if (found.length !== total) throw new Error(`${query}: fetched ${found.length} of ${total}`);
        break;
      }
      after = result.search.pageInfo.endCursor;
    }
    for (const pr of found) if (repoKey[pr.repository.nameWithOwner.toLowerCase()]) opened.set(`${pr.repository.nameWithOwner}#${pr.number}`, pr);
  }
}

const credit = {};
const openedRepos = {};
const skipped = { outsideFirstCommit: 0, unlinked: {} };
for (const pr of opened.values()) {
  const repo = repoKey[pr.repository.nameWithOwner.toLowerCase()];
  (openedRepos[pr.author.login.toLowerCase()] ??= new Set()).add(repo);
  const login = firstCommitter(pr);
  const author = pr.commits.nodes[0]?.commit.author;
  if (!login && author?.email) skipped.unlinked[author.email] = author.name;
  if (!team.has(login)) { skipped.outsideFirstCommit++; continue; }
  credit[login] ??= {};
  credit[login][repo] = (credit[login][repo] || 0) + 1;
}

// Cards are sorted by PR count. Team members without a card get one from their GitHub profile;
// their summary is written by hand.
const sumOf = counts => Object.values(counts || {}).reduce((a, b) => a + b, 0);
const known = new Map(data.contributors.map(c => [c.username.toLowerCase(), c]));
const newcomers = Object.keys(credit).filter(login => !known.has(login));
if (newcomers.length) {
  const profiles = await graphql(newcomers.map((login, i) => `u${i}: user(login: "${team.get(login)}") { login name avatarUrl url }`).join('\n'));
  newcomers.forEach((login, i) => { const u = profiles[`u${i}`]; known.set(login, { username: u.login, name: u.name || u.login, avatar: u.avatarUrl, profile_url: u.url, summary: '' }); });
}
const refreshed = [...known.values()].map(({ backports, ...c }) => {
  const counts = Object.fromEntries(repos.map(repo => [repo, credit[c.username.toLowerCase()]?.[repo] || 0]).filter(([, n]) => n > 0));
  // Repositories where the contributor opened PRs; their card links to the GitHub search there.
  const openedIn = repos.filter(repo => openedRepos[c.username.toLowerCase()]?.has(repo) && counts[repo]);
  return { ...c, repos: counts, opened_repos: openedIn, total_merged_prs: sumOf(counts) };
}).filter(c => c.total_merged_prs > 0 || !newcomers.includes(c.username.toLowerCase()))
  .sort((a, b) => b.total_merged_prs - a.total_merged_prs);
const previousTotal = data.total_prs;
const refreshedTotal = refreshed.reduce((sum, c) => sum + c.total_merged_prs, 0);
if (refreshedTotal < previousTotal && process.env.ALLOW_DROP !== '1') throw new Error(`Total dropped from ${previousTotal} to ${refreshedTotal}; not writing (ALLOW_DROP=1 to accept)`);
console.log(`Skipped ${skipped.outsideFirstCommit} PRs whose first commit is outside the team.`);
if (Object.keys(skipped.unlinked).length) console.log('Unlinked first-commit emails (add team members to commit_aliases):', skipped.unlinked);

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
data.methodology = 'Public merged pull requests in the specified Frappe ecosystem GitHub repositories, made as part of work at Aerele. Each PR, backports included, is credited to the Aerele engineer who made its first commit. Not a live total or an exhaustive organization-wide count.';
writeFileSync('contributions.json', JSON.stringify(data,null,2)+'\n');
writeFileSync('recent-prs.json', JSON.stringify(recentPrs,null,2)+'\n');
console.log(`Refreshed ${data.total_prs} (was ${previousTotal}) merged PRs for ${data.total_contributors} contributors and ${recentPrs.length} recent PRs as of ${data.snapshot_date}. Run npm run build and review before publishing.`);
