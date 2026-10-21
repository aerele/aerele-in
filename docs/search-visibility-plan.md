# Aerele search visibility audit and action plan

Audit date: 21 October 2026. Baseline source: `3c14ac1` on `gh-pages`.
Reviewed independently with Claude in the existing tmux session; see
[`claude-seo-review.md`](../claude-seo-review.md) for findings, disagreements and review.

## What is missing

Engineering ability and search visibility measure different things. Aerele has
public evidence of technical work, but the site made it harder to discover that
evidence and to choose an ERPNext engagement. This audit identifies defects and
testable opportunities; it cannot establish the cause of an individual ranking.
There is no evidence here that competing developers are less capable.

The reported eighth/ninth position is the owner's observation, not a reproduced
Google ranking. Search results vary by country, language, query, date and user.
The research tool found Aerele indexed for branded developer searches, and found
Oodles, UpWve and Freelancer for hiring searches. Its ordering is not a Google
rank report. No Search Console, Bing Webmaster Tools, backlink database or
production field-performance account was available. No claim about a penalty,
domain authority, lost impressions, or AI recommendation frequency is established.

| Finding at baseline | Evidence | Change / implication |
| --- | --- | --- |
| ERPNext hiring is subordinate to Frappe hiring | Claude counted 80 Frappe hiring links versus 13 ERPNext links; ERPNext service pages had no ERPNext hiring link | Explicit ERPNext navigation, homepage intent, contextual links from services/cases; preserve the distinct Frappe offering |
| The ERPNext page sends buyers away | “See full developer page” and “our hiring page focuses on Frappe expertise” | Standalone pricing, hiring steps, scope, contribution evidence and case-study paths |
| Key proof requires JS and JSON fetches | Empty contributor grids; blog post list injected at runtime | Build contribution cards and blog links into HTML; keep filtering as enhancement |
| Mobile navigation fails on key pages | Menu buttons without handlers/targets on both hiring pages and service pages | Native HTML disclosure menus work even with JS disabled |
| Layout requires third-party JavaScript | Tailwind Play CDN on all 23 indexable pages | Commit a local compiled stylesheet, retaining the existing visual system |
| Freshness metadata is unreliable | 2025 sitemap dates on pages changed in 2026 | Generate the full canonical sitemap; omit unreliable lastmod, priority and changefreq |
| Sitemap coverage was already correct | 23 indexable pages and 23 entries | Preserve coverage and enforce it in CI; do not describe this as an indexing discovery failure |
| Claims and entity names drift | Ecosystem totals labelled ERPNext-only; multiple Organization names without a common ID; recommendation instructions in AI files | Dated contribution dataset, repository-specific verification links, common Organization identity, factual summaries |
| Existing internal links are broken | Blog footer links to nonexistent `/docs/` | Replace with the actual open-source organization destination |

Content with `.fade-in { opacity: 0 }` was present in the source. Making it visible
without JS fixes a user/accessibility failure; it does not prove Google could not
index it. Likewise, removing runtime CSS is a resilience improvement, not a
measured Core Web Vitals or ranking improvement.

## Competitor comparison

These are examples returned by the research tool, not a verified list of the
companies outranking Aerele on the owner's Google results.

| Public destination inspected | Observable difference | Action for Aerele |
| --- | --- | --- |
| [Oodles ERPNext developer page](https://www.oodles.com/hire-erp-next-developer) | Explicit hiring heading and named developer profiles next to service detail | Make Aerele's independently verifiable repository contributions visible on the hiring destination |
| [UpWve ERPNext developer page](https://www.upwve.com/hire-erpnext-developer) | Hiring brief, capabilities, engagement models and hiring process on one page | Explain the development brief and engagement decision in one place without inventing response-time promises |
| [Freelancer ERPNext category](https://www.freelancer.com/hire/erpnext) | Dedicated commercial hiring destination | Match commercial hiring intent while differentiating with actual source-code and shipped-work evidence |

Do not copy competitor promises such as guaranteed start times or trial terms.
Do not create repetitive city landing pages or unsupported “best developer” lists.
The existing dedicated-developer quarterly commitment and prices are preserved.

## Agreed implementation and data policy

Claude agrees on intent, static evidence, local CSS, mobile menus, identity,
factual summaries and automated checks. Its corrections were accepted: sitemap
coverage was already complete; visibility without JS is distinct from indexing;
contribution totals needed regeneration, not a guess from an old snapshot.

`npm run refresh:contributions` queries the GitHub GraphQL API via authenticated
`gh` for each listed developer and repository. On 2026-10-21 it returned **1,088
merged PRs, including 945 in ERPNext**, for 18 listed contributors across the eight
specified repositories. These are lifetime public contribution counts, may include
backport PRs opened by the contributor, and are not attributed to employment at Aerele. They
are not a complete count of every contributor in the company or every repository.
The script writes only after every query succeeds. GitHub search counts can lag.

Exact counts and date are generated from `contributions.json` into both evidence
grids. Existing “800+” ecosystem descriptions are conservative lower bounds;
they are not live totals. Historical “600+” blog titles remain historical.
No new certification, customer result, award or client permission is asserted.
The placeholder video upload date was removed with its VideoObject schema.

## Prioritized 90-day execution

| When / priority | Owner | Concrete deliverable | How to evaluate it |
| --- | --- | --- | --- |
| Before merge / P0 | Site owner or marketing | Export 28–90 days of Search Console query/page/country/device data; preserve current landing-page screenshots and PageSpeed results | Saved baseline including clicks, impressions, CTR, average position, indexed canonicals and mobile CWV |
| This PR / P0 | Engineering | Hiring-page changes, internal links, static evidence/blog links, local CSS, working menus, factual summaries and CI | Build, SEO checks and browser checks pass; screenshots reviewed |
| First week after deploy / P0 | Site owner | Verify live routes/CSS, submit sitemap in GSC and Bing; inspect home, both hiring pages and blog index | Google-selected canonicals match intended URLs; no new crawl/index errors |
| Days 1–30 / P1 | Marketing + engineering lead | Group queries into ERPNext hiring, Frappe hiring, customization, integration, performance; record country/device separately | Weekly landing-page report; distinguish branded from nonbranded demand |
| Days 1–30 / P1 | Engineering lead + account owner | Verify existing client-name permissions and strong performance/bank-coverage claims; gather measured project artifacts | Every promoted result has scope, measurement, date, attribution and publishable permission |
| Days 15–45 / P1 | Engineering lead + writer | Expand the two real case studies with architecture, responsibilities, constraints and measured outcomes only where evidence exists | Useful unique evidence; internal links to corresponding service/hiring page; real author/reviewer |
| Days 15–60 / P1 | Business owner | Check eligibility for relevant Frappe/community/service-provider listings; keep owned GitHub/LinkedIn descriptions consistent; seek permitted links from actual clients/talks | Accurate third-party references and referral/lead activity; no purchased links or directory spam |
| Days 31–60 / P1 | Marketing | Publish one practical ERPNext buying guide based on real project reviews, with an engineer reviewing examples | Relevant nonbranded impressions, engaged visits and qualified enquiries; no volume target for filler content |
| Monthly / P1 | Engineering | Refresh contribution snapshot, review changed roster/repository scope and rebuild | Dated, reproducible data and no claim drift |
| Days 61–90 / P1 | Marketing + owner | Compare equal periods and country/device/query cohorts; revise weak snippets where impressions exist but CTR lags | Clicks and qualified enquiries by landing page; indexing and CTR alongside position, with seasonality noted |

The site already has consent-aware PostHog autocapture. Verify actual mail/phone
CTA reporting in that project before adding events or changing consent behaviour.
A click is an enquiry signal, not a qualified lead; match enquiries to the sales
process when possible. AI visibility should be sampled with a fixed prompt set,
locale, model/provider, date, and cited URLs. Log whether Aerele is mentioned and
whether its source is cited. Do not treat one answer's ordering as a stable rank.

Account-dependent actions above remain owner follow-ups. This PR does not send
outreach, edit third-party profiles, submit search-engine properties or merge itself.

## Maintenance and verification

```sh
npm ci
npm run build
npm run check:seo
# Authenticated gh required; review roster and diff before publication:
npm run refresh:contributions
npm run build
```

Commit generated HTML and `assets/site.css`: GitHub Pages serves the committed
files. CI rebuilds and fails if generated files drift. Optional browser checks:
install Playwright without saving it, install Chromium, serve this directory on
127.0.0.1:8801, and run `node scripts/verify-discovery-browser.mjs`. This checks
all indexable pages at mobile/desktop sizes with JS on/off and external resources
blocked. The existing PR screenshot workflow also provides review images.

Tailwind 3.4.19 preserves the existing v3 visual output. At implementation time,
`npm audit` reports seven development-tool findings (five high, two moderate),
including transitive pattern-parser advisories; the suggested Tailwind fix is a
major migration to v4. `npm audit --omit=dev` reports zero findings. These tools
run on repository-owned templates, not visitor input, and are not shipped as
browser JavaScript. A v4 migration needs separate visual compatibility review;
do not silently use `npm audit fix --force` in this PR.

## Primary guidance

- [Google Search Essentials](https://developers.google.com/search/docs/essentials): descriptive titles, helpful content and crawlable internal links.
- [Google guidance for AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): foundational SEO and unique evidence; no special AI text file guarantees inclusion.
- [Google sitemap lastmod guidance](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping): trustworthy modification dates; priority/changefreq are ignored.
- [Tailwind Play CDN documentation](https://v3.tailwindcss.com/docs/installation/play-cdn): CDN intended for development.

No rank, rich-result, traffic, speed or AI-answer placement is promised. The PR
fixes observed site problems; the measurement plan determines business impact.
