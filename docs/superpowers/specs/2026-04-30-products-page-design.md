# Products page — design spec

**Date:** 2026-04-30
**Status:** Approved for implementation
**Driver:** AereLens launches the week of 2026-05-04. Aerele needs a products surface on aerele.in to host the announcement and support future products.

## Goal

Add a Products surface to aerele.in:

1. A dedicated `/products/` page that markets AereLens (Aerele's first own-product) and signals more products are coming.
2. A homepage teaser section that funnels homepage traffic to `/products/`.
3. A `Products` link in the top nav of every page.
4. A `Products` column in the footer of every page.

The work is **purely additive**. The existing aerele.in design system, layout grid, typography, and color tokens are NOT changed. The new surfaces reuse existing patterns (nav, footer, hero, light-section, fade-in, card styles, button styles, anchor-pill eyebrows) so the products work visually belongs on the host site.

## Non-goals

- Redesigning any existing page or component.
- Building or hosting AereLens marketing on aerele.in (AereLens lives at `https://lens.aerele.in/`; aerele.in only links out).
- Adding a second product to the page now. Page is designed for a confident single-product launch; a second product is a future, additive change.
- Build tooling. The site is static HTML + Tailwind CDN with no build step. Stays that way.

## Product brand reference

AereLens canonical brand (sourced from `/Users/kavin/Bookkeeping-AI/code_auditor`):

- **Name:** AereLens (one word, capital A and L). Wordmark = "Aere" + "Lens" wrapped in an inverse-fill pill.
- **Brand color:** navy `#0a1a3f` (matches aerele.in's `ae-800`).
- **Mark:** rounded-square white tile with navy "AL" monogram (port of `frontend/src/app/icon.svg`).
- **Origin note:** the aerele.in `tailwind.config` already labels its palette "lens.aerele.in design language" (line 242 of `index.html`). aerele.in is already styled in the AereLens palette — uniformity is intrinsic, not engineered.

## Design tokens reused (no new tokens introduced)

From the existing `tailwind.config` in `index.html`:

- `ae-50 … ae-950` (navy-slate scale)
- `brand-50 … brand-900` (emerald accent)
- Inter (sans), JetBrains Mono (mono)
- Existing utility classes: `fade-in`, `hero-glow`, `max-w-7xl`, `bg-ae-50`, `bg-ae-900`, `bg-white`, `border-ae-200/60`, `rounded-2xl`, `text-ae-{500,700,900}`, `bg-brand-500`, etc.

Buttons reuse existing styles:
- Primary: `inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors`
- Secondary (light bg): `inline-flex items-center px-5 py-2.5 border border-ae-300 text-ae-700 rounded-lg text-sm font-medium hover:bg-ae-50 transition-colors`
- Secondary (dark bg): `inline-flex items-center px-5 py-2.5 border border-white/15 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-colors`

Anchor-pill eyebrow style (existing pattern):
- Dark sections: `bg-white/5 border border-white/10 text-ae-200`
- Light sections: `bg-brand-50 border border-brand-200 text-brand-700`

## File changes

### New files

- `/products/index.html` — the dedicated products page (full document with site nav and footer).
- `/products/aerelens-mark.svg` — port of `code_auditor/frontend/src/app/icon.svg`, navy `#0a1a3f` "AL" monogram on white rounded square. Used in the homepage teaser card and as a meta image asset.

### Edited files (additive only)

Top-nav `Products` link added, mobile menu updated, and footer "Products" column added in:

- `/index.html` (also gets the new homepage Products teaser section)
- `/about/index.html`
- `/hire-frappe-developer/index.html`
- `/hire-erpnext-developer/index.html`
- `/erpnext-customization/index.html`
- `/erpnext-integration/index.html`
- `/erpnext-performance-optimization/index.html`
- `/frappe-product-engineering/index.html`
- `/case-studies/india-banking/index.html`
- `/case-studies/alfarsi-robotics/index.html`
- `/dpa/index.html`
- `/privacy-policy/index.html`
- `/terms-of-service/index.html`

SEO/discoverability:

- `/sitemap.xml` — add `<url>` entry for `https://aerele.in/products/`.
- `/llms.txt` and `/llms-full.txt` — add a Products section listing AereLens with its tagline and external URL.

## `/products/` page layout

`<head>` follows the same structure as `/about/index.html` and other subpages:

- Title: `Products by Aerele – Software we build, run, and ship`
- Meta description (~155 chars): `Aerele's own products. AereLens — see what'll break before your ERPNext upgrade. More tools in development.`
- Canonical: `https://aerele.in/products/`
- OG image: `/logo-og.png` (existing site OG image, reused for consistency until a Products-specific OG is shot)
- JSON-LD: `WebPage` schema; the AereLens entry as a `SoftwareApplication` schema with `applicationCategory: "DeveloperApplication"`, `operatingSystem: "Web"`, `url: https://lens.aerele.in/`, and `publisher` referencing the existing `Organization` block.

`<body>` structure (top to bottom):

### 1. Subpage nav (existing pattern)

Identical to `/about/index.html` nav: `Home · Hire Developers · Customization · Integrations · About · Hire us` — but with a new `Products` link inserted between `Integrations` and `About`. Logo links to `/`. The `Products` link on this page is `aria-current="page"` for accessibility.

### 2. Hero section — framing hero (dark)

`bg-ae-900 text-white` with `hero-glow` overlay. `pt-28 pb-16 sm:pt-32 sm:pb-20`. `max-w-7xl mx-auto px-6 sm:px-8`.

- Anchor-pill eyebrow: `▸ PRODUCTS BY AERELE` (dark-bg variant: `bg-white/5 border-white/10 text-ae-200`, with the existing pulsing `bg-brand-500` dot).
- H1, same `clamp(1.5rem, 4.4vw, 3.25rem)` size as homepage H1, `text-white`, `font-semibold tracking-tight leading-[1.15]`:

  > Software we build, run, and ship — not just code we write for clients.

- Subhead in `text-ae-200 text-lg leading-relaxed max-w-2xl`:

  > For years we've been the engineering team behind other companies' products. Now we're shipping our own — tools we use every day, packaged up for the rest of the Frappe community.

- No CTAs in this hero. It's framing, not conversion. Conversion happens in section 3.

### 3. Featured product — AereLens (light, two-column card)

`bg-ae-50` section, `py-20 sm:py-28`, `max-w-7xl mx-auto px-6 sm:px-8`. Single oversized card: `bg-white border border-ae-200/60 rounded-2xl shadow-sm overflow-hidden`. Two-column on `lg:` (`grid lg:grid-cols-2`), stacked below.

**Left column (`p-8 sm:p-10`):**

- Status pill (light-bg variant): `NEW · LAUNCHING THIS WEEK` with pulsing brand dot.
- AereLens wordmark, plain HTML/CSS (port of `Wordmark.tsx`):
  ```html
  <div class="aerelens-mark" style="font-size: 28px;">
    Aere<span class="pill">Lens</span>
  </div>
  ```
  with scoped CSS in the page `<style>` block:
  ```css
  .aerelens-mark { font-weight: 700; letter-spacing: -0.028em; color: #0a1a3f; line-height: 1; display: inline-flex; align-items: baseline; }
  .aerelens-mark .pill { background: #0a1a3f; color: #fff; padding: 0.12em 0.32em; border-radius: 0.32em; margin-left: 0.04em; }
  ```
- H2 tagline (selected): **"See what'll break before your ERPNext upgrade."** Sized `text-3xl sm:text-[34px]`, `font-semibold tracking-tight leading-[1.15] text-ae-900`.
- Supporting paragraph (`text-ae-500 leading-relaxed`):

  > Run a deep audit on your custom Frappe app — surface breaking changes, deprecated APIs, and version-incompatible patterns before you ship the upgrade. Built by the team that contributes to Frappe core.

- Three feature bullets (small `bg-brand-500` dot + bolded label + supporting clause):
  1. **Migration audit** — see exactly what breaks when you move between Frappe / ERPNext versions.
  2. **Code review** — deprecated APIs and Frappe-specific issues, ranked by severity.
  3. **Shareable reports** — findings your team can ship from, with file/line references.

- Two CTAs (existing button styles):
  - Primary `bg-brand-500`: `Try AereLens →` → `https://lens.aerele.in/` (`target="_blank" rel="noopener"`).
  - Secondary outline: `Book a walkthrough` → `mailto:hello@aerele.in?subject=AereLens%20walkthrough`.

**Right column (the visual):**

A static, decorative Mac-style code window — same idiom as the homepage hero's PR ticker, so the visual language is consistent. `bg-ae-950 border-white/10`, traffic lights, mono header `aerelens audit ./my-erpnext-app`. Body shows a stylized audit report:

```
scanning 142 files…
● deprecated   frappe.db.sql_list()              · custom_app/api.py:88
● breaking     @frappe.whitelist removed         · custom_app/utils.py:34
● breaking     renamed: get_value → db.get_value · custom_app/hooks.py:12
● info         9 unused imports                  · 4 files
─────
3 breaking · 12 warnings · v14 → v15
```

Severity dots use existing color palette: red `#ff8a8a`, amber `#ffcd6e`, emerald `#6ee7b7`. Pure HTML/CSS — no JS, no live data, no fetch. The window is purely illustrative and uses fictitious file paths.

### 3b. The story behind the name (brand-meaning section)

`bg-white py-16 sm:py-20 border-t border-ae-200/60`, `max-w-4xl mx-auto px-6 sm:px-8`. Sits between the AereLens featured card and the "Why we build our own products" narrative.

Purpose: explain that AereLens = `Aere` (the team — 30+ engineers, 600+ merged PRs in Frappe core) + `Lens` (the product — that team's contributor expertise focused on your code). Positions the product as a credible extension of the existing contributor narrative aerele.in already tells, and ties it to the broader ERPNext ecosystem.

Structure:

- Eyebrow: `▸ THE STORY BEHIND THE NAME`
- H2 (centered, same scale as the "Why this matters" H2):

  > Aere meets Lens — our contributor experience, focused on your code.

- A typographic breakdown row (three "tiles" separated by `+` and `=`, stacked on mobile, row on `sm:`):
  - **Aere** — wordmark in the navy color · "The team — 30+ engineers with 600+ merged PRs in Frappe, ERPNext, HRMS, and Payments core."
  - **`+`** glyph
  - **Lens** — the navy pill alone (no "Aere" prefix) · "The product — what we built so the same eyes that review Frappe core can look at your code too."
  - **`=`** glyph
  - **AereLens** — the full wordmark · "Contributor expertise, codified — applied to your app so the ERPNext ecosystem grows stronger for everyone."

- Closing paragraph below the breakdown (centered, `max-w-2xl mx-auto`):

  > Every check AereLens runs is informed by the work we do every day on the framework itself. When the audit flags a deprecated API, it's because we've watched it deprecate. When it warns about a breaking change, it's because we've reviewed — and often written — the patch upstream.

Reuses the existing `.aerelens-mark` styles defined in the page; introduces no new tokens.

### 4. Why we build our own products (centered narrative)

`bg-white py-16`, `max-w-3xl mx-auto px-6 sm:px-8 text-center`.

- Eyebrow: `▸ WHY THIS MATTERS`
- H2 (matches homepage centered-statement scale, `text-3xl sm:text-4xl font-semibold tracking-tight`):

  > We've built other companies' products. Now we're building our own.

- Two-sentence body (`text-ae-500 text-lg leading-relaxed max-w-xl mx-auto`):

  > AereLens is the first tool in a small line of products built on top of the work we do every day. The same engineers who contribute to Frappe core build them — which means they're built right.

### 5. More coming + footer note

`bg-ae-50 py-12`, centered, `text-ae-500 text-sm`:

> More products in development. *Want to know first?* [Get in touch](mailto:hello@aerele.in)

### 6. Standard site footer

The shared footer pattern with the new `Products` column added (see Footer section below).

## Homepage teaser section

Inserted into `/index.html` **between the existing `What we do` (services) section and the `Work / case studies` section**.

Layout: `<section id="products" class="bg-ae-50 py-20 sm:py-28">` (the `id="products"` is required so the homepage nav's `#products` anchor resolves), `max-w-7xl mx-auto px-6 sm:px-8`, with the existing `fade-in` reveal pattern.

Structure:

- Eyebrow: `▸ PRODUCTS BY AERELE`
- H2: **"We build software too — not just for clients, for ourselves."**
- One-line subhead in `text-ae-500`: "Tools we use every day, packaged up for the rest of the Frappe community."
- A single horizontal teaser card linking to `/products/` (NOT directly to `lens.aerele.in` — homepage funnel goes to the products page where we control narrative; the products page hosts the external CTA). Card styling: `bg-white border-ae-200/60 hover:border-ae-300 rounded-xl transition-colors group`.
  - Card flex layout, stacked on mobile, row on `sm:`.
  - Left content: AereLens wordmark + a "New" pill + the same one-line tagline ("See what'll break before your ERPNext upgrade.") + a small chevron arrow on hover.
  - Right asset: AL-monogram square (`/products/aerelens-mark.svg`), 64×64.
- Below the card, a small line: `More products in development →` linking to `/products/`.

The whole section uses identical card/typography styling to the existing homepage "What we do" cards — visual rhythm is preserved.

## Nav changes (every page)

The site has two nav variants in use today. Both are updated identically: insert one `Products` link.

**Homepage nav (`/index.html`)** — current order: `Why Us · Work · Team · Pricing · About · Hire us`.
After: `Why Us · Work · Products · Team · Pricing · About · Hire us`.
The `Products` link is `href="#products"` (anchor to the new teaser section).

**Subpage nav (every other page, including the new `/products/`)** — current order: `Home · Hire Developers · Customization · Integrations · About · Hire us`.
After: `Home · Hire Developers · Customization · Integrations · Products · About · Hire us`.
The `Products` link is `href="/products/"`.

Mobile menus on every page get the same `Products` link inserted in the corresponding position. Styling reuses existing classes (`text-ae-600 hover:text-ae-900 transition-colors`, etc.) — no nav restyling.

## Footer changes (every page)

Today: 4 columns — `Services · Case Studies · Company · Open Source`. Grid is `grid-cols-2 sm:grid-cols-4`.

After: 5 columns — `Products · Services · Case Studies · Company · Open Source`. Grid bumps to `grid-cols-2 sm:grid-cols-5`. On mobile (`grid-cols-2`) the new column simply wraps into the existing 2-column flow — no layout regression.

Products column entries:

- AereLens → `https://lens.aerele.in/`
- All products → `/products/`

Column header style identical to existing columns: `font-semibold text-ae-700 mb-3 text-xs`. Link style identical: `text-ae-400 hover:text-ae-700`.

## SEO / discoverability

**`sitemap.xml`** — add:
```xml
<url>
  <loc>https://aerele.in/products/</loc>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

**`llms.txt`** — append a `## Products` section listing AereLens with one-line description and external URL `https://lens.aerele.in/`.

**`llms-full.txt`** — append a fuller Products section with the page H1, the AereLens tagline, the supporting paragraph, the three feature bullets, and the external URL.

## Verification (no test framework — manual visual checks)

This is a static HTML site with no test runner. After implementation, the agent verifies:

1. Open `/Users/kavin/aerele/aerele-in/index.html` in a browser. Confirm the nav `Products` link appears, scrolls smoothly to the new teaser section, and the section renders. Confirm the footer has 5 columns.
2. Open `/Users/kavin/aerele/aerele-in/products/index.html`. Confirm the hero, AereLens card, narrative section, "more coming" line, nav, and footer all render. Confirm `Try AereLens` opens `https://lens.aerele.in/` in a new tab.
3. Open at least two other subpages (e.g. `/about/`, `/hire-frappe-developer/`). Confirm the new `Products` nav link and the new footer column render correctly.
4. Mobile viewport check at 375px width on `/products/` and `/index.html` — confirm the two-column AereLens card stacks, the homepage teaser card stacks, and the footer wraps cleanly.
5. View page source on `/products/` — confirm canonical, OG meta, and JSON-LD `SoftwareApplication` schema are present and valid.
6. Run `grep -L "/products/" index.html */index.html */*/index.html` to confirm every existing page references the new route in nav and footer (output should be empty).

## Out of scope (explicitly)

- Redesigning, restyling, or refactoring any existing page or component.
- Componentizing the duplicated nav/footer (the site already accepts duplication; "extract a partial" is its own project).
- Adding a second product card. Page is designed for one confident card; a second product is a future additive change that does not require a redesign.
- Tracking/analytics events for the AereLens CTA. The site is currently analytics-free; adding tracking is a separate decision.
- Writing or hosting any AereLens marketing copy or screenshots. The external site at `lens.aerele.in` owns that.
