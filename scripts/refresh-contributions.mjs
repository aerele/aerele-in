// Requires an authenticated GitHub CLI. Run manually, review the diff, then build.
// Counts all public lifetime PRs of listed contributors in these repositories;
// these are not claims about work completed during employment at Aerele.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('contributions.json', 'utf8'));
const repos = data.repos_touched;
// Bare names are frappe/<name>; other ecosystem repositories are listed as owner/name.
const fullName = repo => repo.includes('/') ? repo : `frappe/${repo}`;
const refreshed = [];
for (const contributor of data.contributors) {
  const fields = repos.map((repo, i) => `r${i}: search(query: ${JSON.stringify(`repo:${fullName(repo)} is:pr is:merged author:${contributor.username}`)}, type: ISSUE, first: 1) { issueCount }`).join('\n');
  let result;
  for (let attempt=0;attempt<5;attempt++) {
    try {
      result = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=query { ${fields} }`], { encoding: 'utf8', stdio:['ignore','pipe','pipe'] }));
      if (result.errors) throw new Error(JSON.stringify(result.errors));
      // Lifetime merged counts never decrease; a drop means a flaky search response, so retry and never write it.
      const dropped = repos.filter((repo, i) => result.data[`r${i}`].issueCount < (contributor.repos[repo] || 0));
      if (dropped.length) throw new Error(`${contributor.username}: count dropped for ${dropped.join(', ')}`);
      break;
    } catch(error) {
      if(attempt===4) throw error;
      await new Promise(resolve=>setTimeout(resolve,5000 * 2 ** attempt));
    }
  }
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  const counts = Object.fromEntries(repos.map((repo, i) => [repo, result.data[`r${i}`].issueCount]).filter(([, n]) => n > 0));
  refreshed.push({ ...contributor, repos: counts, total_merged_prs: Object.values(counts).reduce((a,b) => a+b,0) });
  await new Promise(resolve=>setTimeout(resolve,500));
}
// Atomic at application level: do not write a partial result on API failures.
data.contributors = refreshed;
data.total_prs = refreshed.reduce((sum,c) => sum+c.total_merged_prs,0);
data.total_contributors = refreshed.filter(c=>c.total_merged_prs>0).length;
data.snapshot_date = new Date().toISOString().slice(0,10);
data.methodology = 'Public lifetime merged pull requests by the listed contributors in the specified frappe GitHub repositories. May include backport PRs opened by the contributor, counted separately. Does not attribute work to an employment period; not a live total or an exhaustive organization-wide count.';
writeFileSync('contributions.json', JSON.stringify(data,null,2)+'\n');
console.log(`Refreshed ${data.total_prs} merged PRs for ${data.total_contributors} contributors as of ${data.snapshot_date}. Run npm run build and review before publishing.`);
