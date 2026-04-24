---
name: aerele-design
description: Stack-agnostic design system for Aerele-branded web products. Apply whenever building or editing a marketing site, landing page, or web UI that should match the Aerele family look — navy-slate + emerald palette, Inter + JetBrains Mono, white fixed nav, dark hero with a single emerald accent, restrained semibold typography, 1280px max container. Translate the tokens to whatever styling approach the target product uses (Tailwind, plain CSS, CSS-in-JS, CSS modules, SCSS, etc.).
---

# Aerele Design System

A shareable set of rules for building Aerele-branded web products. The reference implementation is `aerele.in`, which uses Tailwind. The rules below are **stack-agnostic** — they define the intended visual outcome as raw tokens and principles. Use whatever styling tech your product already uses; just match the values.

**Philosophy in one line:** elegant and restrained. Quiet confidence, not marketing noise. Our values show in the work — the typography shouldn't shout them.

**When to apply:** any time you're building or editing presentation layers in an Aerele product. If you can't follow a rule for a technical reason, document the deviation in the PR.

---

## How to use this document

1. Read **Section 1 (Tokens)** and **Section 2 (Typography rules)** — these are the non-negotiables.
2. Map the tokens to your stack's idiom. You'll find reference implementations in the appendices for Tailwind, plain CSS custom properties, and a JSON token file.
3. When building a component, skim **Section 4 (Component patterns)**. Each pattern describes the *behavior and values*, not the code.
4. Before shipping, run through **Section 7 (Anti-patterns)** — it's the shortlist of things we learned the hard way.

The tokens are the contract. The appendix code is just example spellings.

---

## 1. Design tokens

These are the raw values. Any stack should expose them as variables / constants / tokens and consume them from there. Do not hardcode hex or rem values elsewhere in the product.

### 1.1 Colors

**Navy-slate scale (`ae`) — neutral surfaces, borders, text.**

| Token | Hex | Typical use |
|---|---|---|
| `ae-50`  | `#f7f8fb` | Page background (light theme) |
| `ae-100` | `#eef2fb` | Light hover, faint numeric markers |
| `ae-200` | `#e4e9f5` | Borders, dividers on light |
| `ae-300` | `#c9d2e8` | Borders on dark sections, secondary button border on light |
| `ae-400` | `#94a3b8` | Muted text, icons, eyebrow/kicker labels |
| `ae-500` | `#64748b` | Body paragraph text on light |
| `ae-600` | `#475569` | Nav link text |
| `ae-700` | `#1e293b` | Strong text on light (links, emphasis) |
| `ae-800` | `#0a1a3f` | Hover state for `ae-900` elements |
| `ae-900` | `#060f2b` | Dark hero background, navy CTA button fill |
| `ae-950` | `#05102a` | Deepest surface (code/terminal window bg) |

**Emerald scale (`brand`) — accent only.**

| Token | Hex | Typical use |
|---|---|---|
| `brand-400` | `#34d399` | Accent word in hero H1, "live" badge text |
| `brand-500` | `#10b981` | Primary CTA background, "live" indicator dot |
| `brand-600` | `#059669` | Primary CTA hover |

Full emerald scale (rarely needed, provided for completeness): `brand-50 #ecfdf5 · 100 #d1fae5 · 200 #a7f3d0 · 300 #6ee7b7 · 700 #047857 · 800 #065f46 · 900 #064e3b`.

**Accent rule:** brand is an accent, never a surface. One emerald accent per hero (one word, one CTA). One per pricing tier ("Popular"). One "live" indicator where real-time data is shown. That's the full brand budget on any given page.

### 1.2 Typography

**Families**

| Role | Family | Fallbacks |
|---|---|---|
| Sans (primary) | Inter | `system-ui, -apple-system, sans-serif` |
| Mono (code, logs, step numbers) | JetBrains Mono | `ui-monospace, SFMono-Regular, Menlo, monospace` |

Load from Google Fonts (or self-host). Weights needed: Inter 400 / 500 / 600 / 700 / 800; JetBrains Mono 400 / 500 / 600.

**Weight rule:** default to **600 (semibold)** for all display typography. Reserve 700 (bold) and 800 (extrabold) for small stat numbers where weight is the only hierarchy cue. Never use 900 (black).

Why: heavy weights at large sizes read as shouting. Semibold at large sizes reads as confident.

**Type scale**

| Role | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Hero H1 | fluid: `clamp(1.5rem, 4.4vw, 3.25rem)` (24px → 52px) | 600 | 1.15 | tight (`-0.02em`) |
| Section H2 | 1.625rem (26px) mobile → 1.875rem (30px) `sm` → 2.25rem (36px) `md+` | 600 | 1.2 | tight (`-0.02em`) |
| Card H3 | 1rem (16px) | 600 | 1.4 | normal |
| Hero lead (body) | 1.125rem (18px) | 400 | 1.625 | normal |
| Section body | 0.875rem (14px) or 1rem (16px) | 400 | 1.625 | normal |
| Eyebrow / kicker | 0.75rem (12px) | 500 | 1.4 | wide (`0.1em` or more), UPPERCASE |
| Mono labels | 0.6875rem–0.75rem (11–12px) | 400–500 | 1.4 | normal |

**The clamp rule:** hero H1 must use `clamp()` for fluid sizing. Flat `text-7xl` or `font-size: 72px` breaks on small viewports and looks crude on huge ones.

### 1.3 Spacing scale

Using a 4px base. Prefer these steps; don't invent new values.

| Token | Value | px |
|---|---|---|
| `space-1` | 0.25rem | 4 |
| `space-2` | 0.5rem | 8 |
| `space-3` | 0.75rem | 12 |
| `space-4` | 1rem | 16 |
| `space-5` | 1.25rem | 20 |
| `space-6` | 1.5rem | 24 |
| `space-7` | 1.75rem | 28 |
| `space-8` | 2rem | 32 |
| `space-10` | 2.5rem | 40 |
| `space-12` | 3rem | 48 |
| `space-16` | 4rem | 64 |
| `space-20` | 5rem | 80 |
| `space-24` | 6rem | 96 |
| `space-28` | 7rem | 112 |
| `space-32` | 8rem | 128 |

**Component defaults:**
- Card padding: 28px (`space-7`). Small cards: 20px (`space-5`).
- Section vertical padding: 80px mobile / 112px ≥ `sm` (`space-20` / `space-28`). Final CTA section: 96 / 128 (`space-24` / `space-32`).
- Container horizontal padding: 24px mobile / 32px ≥ `sm` (`space-6` / `space-8`).
- Nav height: approximately 72px (via 16px vertical padding on the inner row).

### 1.4 Radii

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 0.375rem (6px) | Small pills, badges |
| `radius-md` | 0.5rem (8px) | Buttons, inputs |
| `radius-lg` | 0.75rem (12px) | Cards, code/terminal windows |
| `radius-xl` | 1rem (16px) | Large cards, video embeds |
| `radius-full` | 9999px | Status pills, traffic-light dots, circular badges |

**Rule:** action buttons use `radius-md` (8px), not full-pill. Pill buttons read as dated.

### 1.5 Breakpoints

Follow the Tailwind-style defaults (they're widely understood):

| Name | Min-width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

Mobile-first: write base styles for the smallest viewport and layer up at breakpoints.

### 1.6 Layout

- **Container max-width: 1280px.** This is the single most important layout token.
- Apply it to the nav's inner row, every section's inner row, and the footer's inner row. No exceptions.
- Horizontal padding inside the container: 24px (mobile) / 32px (`sm+`).
- The container is always centered (`margin-inline: auto`).

Inner content *inside* a section may have its own narrower max-width for readability (e.g., 768px for a centered heading block, 576px for a hero text column). That's fine — the 1280px rule is about the *outer* section container.

### 1.7 Elevation and glows

Use elevation sparingly. Flat surfaces are the default.

- Cards: 1px border in `ae-200/60` (ae-200 at 60% opacity). No shadow by default.
- Featured/popular card: 1px ring in `brand-500/20` + soft emerald shadow (`0 20px 25px -5px rgba(16,185,129,0.1)`).
- Terminal/code window: `0 25px 50px -12px rgba(0,0,0,0.4)`.
- **Hero glow** (the one gradient in the system):
  ```
  radial-gradient(ellipse 80% 60% at 30% 30%, rgba(16,185,129,0.08), transparent 70%),
  radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,50,116,0.4), transparent 70%)
  ```
  Layered as an absolutely positioned overlay inside the dark hero. Two soft ellipses: emerald at top-left, deep navy at top-right.

---

## 2. Typography rules (prose)

1. One family for display and body (Inter). Mono (JetBrains Mono) only for terminal windows, code snippets, numeric step markers, and log-like content.
2. Weight defaults to 600 (semibold) for all display sizes. 400 for body. Never 800+ on anything bigger than a stat number.
3. Hero H1 uses `clamp()` fluid sizing. Section H2 steps through three breakpoints (26 / 30 / 36 px). Card H3 is a flat 16px.
4. Headings use `letter-spacing: -0.02em` ("tracking-tight"). Body is neutral.
5. Eyebrow labels (the tiny all-caps line above an H2) use `letter-spacing: 0.1em` or more, and `ae-400` color.
6. Line-height: 1.15 for hero H1, 1.2 for section H2, 1.4 for H3 and mono, 1.625 for body paragraphs.
7. Never center long body copy. Centered headings are fine; centered paragraphs longer than ~2 lines read poorly.

---

## 3. Layout rules (prose)

1. **Single container width (1280px) across the whole product.** Nav, sections, footer all use the same outer container. Mixing widths between nav and sections is the most common design bug — it makes wide viewports look misaligned.
2. **Content inside a section may have narrower inner wrappers** for readability (a 768px centered heading block, a 576px hero text column). That's encouraged. The 1280px rule is only about the outer boundary.
3. **Vertical rhythm:** sections are 80px / 112px (mobile / desktop) top and bottom. Hero adds top padding for the fixed nav.
4. **Horizontal rhythm:** 24px / 32px container padding. Gaps between columns: 24–40px depending on density.
5. **Hero when it has a right-column visual:** use a flex row with `justify-content: space-between` so the visual's right edge aligns with the container's right edge (same edge as the nav's CTA button).
6. **Footer container shares nav's width and padding.**

---

## 4. Component patterns

Each pattern is described behaviorally (values, not syntax). Implementations in any stack should match these values. Copy-paste-ready reference code is in the appendices.

### 4.1 Nav (fixed, white)

- Position: fixed top, full width.
- Background: white at 90% opacity with a 12px backdrop blur. *Never* dark — a dark nav over a dark hero disappears.
- Bottom border: 1px `ae-200` at 60% opacity.
- Height: approximately 72px (16px vertical padding on the inner row).
- Inner row: 1280px max container, horizontal padding 24/32px.
- Left: logo mark + wordmark. Wordmark is 16px / weight 600 / `ae-900`.
- Right (≥ `sm`): inline nav links at 14px / weight 500 / `ae-600`, hover `ae-900`, gap 32px between links.
- Primary CTA button at the right end: **navy** fill (`ae-900`), white text, 8px radius, 16×32px padding, 600 weight, arrow (→) on the right. Hover: `ae-800`.
- Primary CTA uses *navy* in the nav — emerald is reserved for the hero / in-page CTAs. This keeps the emerald signal rare and intentional.
- Below `sm`: replace the inline links with a hamburger button (20×20 icon, `ae-600`).

### 4.2 Hero (dark navy with glow)

- Background: `ae-900` navy, white text.
- Radial glow overlay: the two-ellipse gradient from §1.7, absolutely positioned inside the section, pointer-events none.
- Top padding: 112px (mobile) / 128px (`sm+`), to clear the fixed nav plus breathing room. Bottom padding: 80 / 96px.
- Content row: flex column on mobile, flex row `≥ lg`. When there's a right-column visual, use `justify-between`.
- Eyebrow pill: 11px UPPERCASE label with a pulsing 6×6px `brand-500` dot. Background `rgba(255,255,255,0.05)`, 1px border `rgba(255,255,255,0.1)`, full radius.
- H1: `clamp(1.5rem, 4.4vw, 3.25rem)`, weight 600, line-height 1.15, tracking tight. Plain white except for **exactly one accent word** colored `brand-400`.
- Lead paragraph: 18px, `ae-200`, line-height 1.625, max-width 576px.
- Optional supporting paragraph below: 16px, `ae-400`.
- CTA row: primary button + secondary button.
  - Primary (emerald): `brand-500` fill, white text, 8px radius, 10×20px padding, 14px / weight 500. Hover `brand-600`.
  - Secondary (outlined on dark): transparent fill, 1px border `rgba(255,255,255,0.15)`, white text. Hover: background `rgba(255,255,255,0.05)`.
- Optional right-column visual: a screenshot, illustration, or terminal window (see §4.6). Width 560px max, aligned to container right edge.

### 4.3 Section heading block

The three-line header that precedes most sections.

- Centered, max-width 672px, auto margins.
- Line 1: eyebrow — 12px UPPERCASE, `ae-400`, wide letter-spacing, 12px margin-bottom.
- Line 2: section H2 — 26 / 30 / 36px responsive, weight 600, tracking tight, line-height 1.2, `ae-950`.
- Line 3 (optional): 14px supporting text, `ae-500`, 12px margin-top.

### 4.4 Cards (three variants)

**Default card (light surface)**
- Background: white.
- Border: 1px `ae-200/60`.
- Radius: 12px.
- Padding: 28px (`space-7`).
- H3 (if present): 16px / weight 600 / `ae-950` / 8px margin-bottom.
- Body: 14px / `ae-500` / line-height 1.625.

**Featured / "Popular" card (dark surface with emerald accent)**
- Background: `ae-900`.
- Ring: 1px `brand-500` at 20% opacity.
- Shadow: soft emerald drop shadow at 10% opacity.
- Same radius/padding as default.
- Body text: `ae-200`.
- "Popular" badge: `brand-500` fill, white text, full radius, 10px uppercase tracked label.

**Numbered step card (process / how-it-works)**
- Default card shell (white, 1px border, 12px radius, 28px padding).
- Leading element: a large monospace digit. Size 48px (`font-size: 3rem`). Weight 700. Color **`ae-100`** (deliberately faint — it's an anchor, not a shout). Line-height 1.0. 16px margin-bottom.
- Followed by H3 + body as usual.

### 4.5 Buttons

Four canonical button styles. Don't invent a fifth.

| Variant | Fill | Text | Border | Radius | Padding | Size |
|---|---|---|---|---|---|---|
| Primary — page CTA | `brand-500`, hover `brand-600` | white | none | 8px | 10×20px | 14px / 500 |
| Primary — nav CTA | `ae-900`, hover `ae-800` | white | none | 8px | 8×16px | 14px / 600 |
| Secondary — on dark | transparent, hover 5% white | white | 1px `rgba(255,255,255,0.15)` | 8px | 10×20px | 14px / 500 |
| Secondary — on light | transparent, hover white | `ae-800` | 1px `ae-300`, hover `ae-400` | 8px | 10×20px | 14px / 500 |

**Rules:**
- Always include a trailing arrow (`→`) on primary CTAs that move the user forward.
- Never `border-radius: 9999px` on action buttons. Use 8px. (9999px is reserved for status pills and dots.)
- Hover states change only color. Never padding, radius, or transform.

### 4.6 Terminal / log window (social-proof widget)

When showing live or semi-live data (merged PRs, deploy log, activity feed), use a Mac-terminal-style window. It reads as authentic proof rather than a marketing claim.

- Background: `ae-950` (deepest navy).
- Border: 1px `rgba(255,255,255,0.1)`.
- Radius: 12px.
- Shadow: heavy (`0 25px 50px -12px rgba(0,0,0,0.4)`).
- Header row: 48px tall, 16px horizontal padding, bottom border 1px `rgba(255,255,255,0.05)`, subtle darker background (`rgba(0,0,0,0.3)`).
  - Three traffic-light dots, 10px diameter, left-aligned, gap 6px. **Exact colors** (macOS reference): `#ff5f57 #febc2e #28c840`. Do not alter.
  - Label after the dots: 11px mono, `ae-300`, looks like a shell command (`tail -f something.log`). 12px left margin.
  - Optional "live" indicator at the right end: 6px `brand-500` pulsing dot + 10px UPPERCASE "live" label in `brand-400`.
- Body: scrolling content area, 12px top padding, fades at top and bottom with small `ae-950→transparent` gradients.

---

## 5. Motion

- Entrance: fade-in with a 16px translate-up. Duration 500ms, ease. Triggered on scroll via IntersectionObserver.
- Live indicators: 2s pulse animation on the brand-500 dot.
- Vertical auto-scroll: only for genuinely-live content (activity tickers). 50s linear infinite is the reference speed. Pause on hover.
- No parallax. No auto-rotating carousels. No anything that moves without user action.
- Transitions: `transition: color 150ms, background-color 150ms, border-color 150ms`. Don't transition padding, width, or transform on hover.

---

## 6. Content patterns

Reuse these. Don't invent new section archetypes unless the product genuinely needs one.

- **Section header (eyebrow → H2 → sub)**, as in §4.3.
- **Three-up feature/pricing grid.** Three cards, same width. If one is featured, it gets the dark variant. Two or four tiers: the pattern still holds — one is visually dominant.
- **Numbered process cards (01 / 02 / 03)** with faint mono digits. See §4.4.
- **Social-proof bar:** eyebrow ("Companies that chose …"), then a flex row of company *names* (not logos) separated by a middle-dot `·`. Only use logos if every client has granted permission *and* you can keep their visual weights consistent.
- **FAQ:** native `<details>` elements with a chevron that rotates 180° on open. No JS accordion library.
- **Live activity ticker:** terminal window pattern (§4.6) containing a vertically scrolling list of real events with repo/author metadata.

---

## 7. Anti-patterns

These are mistakes we've made and undone. Learn from them.

1. **Heavy weights (700+) on hero or section headings.** Shouts. Use 600.
2. **Mismatched container widths between nav and sections.** Nav 1024px + sections 1280px → the page doesn't line up on wide screens. Pick one (always 1280).
3. **Inner max-widths narrower than the section that make card grids float in the middle** of a wider section. If pricing is inside a 1280px section, pricing fills 1280px. Don't cap it at 896px centered — it looks narrower than the nav.
4. **Flat `font-size: 72px` on hero H1.** Breaks on mobile, crude on 4K. Always `clamp()`.
5. **Dark nav over a dark hero.** The nav disappears. White nav is the rule.
6. **More than one emerald accent per hero headline.** Dilutes the signal. Pick one word.
7. **`border-radius: 9999px` on action buttons.** Dated. Use 8px.
8. **Subpages that skip the dark hero.** They feel like a different site. Every top-level page gets the same hero treatment, even when the hero content is short.
9. **Ad-hoc emerald / green shades.** Don't reach for `#22c55e` or a framework's default green. Use `brand-400/500/600` exclusively. Centralize.
10. **Gradients anywhere except the hero glow.** Gradients age fast. Flat + one subtle radial glow is the whole atmospheric budget.

---

## 8. Mobile

- Test at 375px viewport width (iPhone SE). If text clips, the heading is too large or a wrapper is missing a min-width-0 / flex-shrink fix.
- Nav: collapse everything behind a hamburger at `sm` (640px). Don't try to keep five links + a CTA visible below that.
- Hero flex row: stack on mobile. Any right-column visual moves below the text block with ~48px top margin.
- Never rely on horizontal scroll. Always ensure `overflow-x: hidden` on html + body as a safety net — but don't use it as a layout solution.
- Touch targets: minimum 44×44 CSS px. Inline nav links on mobile get expanded padding for this reason.
- Body font size on mobile: never below 14px for primary copy. 12px is reserved for labels, metadata, captions.

---

## 9. Accessibility

- All interactive elements have visible hover AND focus states. Don't suppress focus outlines unless you replace them with something equally visible (2px ring).
- Decorative icons: `aria-hidden="true"`. Action icons inside buttons: keep the text label too — no icon-only buttons for primary actions.
- Color contrast (WCAG AA): `ae-500 on ae-50`, `ae-200 on ae-900`, `white on brand-500`, `white on ae-900` all pass. If you introduce a new background, re-check body-text contrast.
- Never convey state through color alone. "Popular" on a pricing tier is a word in a badge, not just an emerald border.
- Respect `prefers-reduced-motion`: disable fade-ins, vertical auto-scroll, and any pulse animations.
- Semantic HTML first. `<nav>`, `<section>`, `<article>`, `<button>`, `<details>`/`<summary>`. ARIA only when semantics aren't sufficient.

---

## Appendix A — Tailwind reference implementation

This is what the reference site (`aerele.in`) uses. If your product uses Tailwind, you can paste these directly.

### Tailwind config

```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ae: {
          50:'#f7f8fb',100:'#eef2fb',200:'#e4e9f5',300:'#c9d2e8',
          400:'#94a3b8',500:'#64748b',600:'#475569',700:'#1e293b',
          800:'#0a1a3f',900:'#060f2b',950:'#05102a',
        },
        brand: {
          50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',
          400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',
          800:'#065f46',900:'#064e3b',
        },
      },
      fontFamily: {
        sans: ['Inter','system-ui','-apple-system','sans-serif'],
        mono: ['JetBrains Mono','ui-monospace','SFMono-Regular','Menlo','monospace'],
      },
    },
  },
};
```

### Global styles

```html
<style>
  html { scroll-behavior: smooth; overflow-x: hidden; }
  body { font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
  .fade-in { opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s ease; }
  .fade-in.visible { opacity: 1; transform: translateY(0); }
  .hero-glow {
    background:
      radial-gradient(ellipse 80% 60% at 30% 30%, rgba(16,185,129,0.08), transparent 70%),
      radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,50,116,0.4), transparent 70%);
  }
</style>
```

### Nav

```html
<nav class="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-ae-200/60">
  <div class="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2.5">
      <img src="/logo.png" alt="..." class="h-8">
      <span class="text-[16px] font-semibold text-ae-900 tracking-tight">Product name</span>
    </a>
    <div class="hidden sm:flex items-center gap-8 text-[14px] font-medium text-ae-600">
      <a href="#" class="hover:text-ae-900 transition-colors">Link</a>
      <a href="#" class="inline-flex items-center gap-1.5 px-4 py-2 bg-ae-900 text-white rounded-lg font-semibold hover:bg-ae-800 transition-colors">
        Primary CTA <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</nav>
```

### Hero

```html
<section class="relative pt-28 pb-20 sm:pt-32 sm:pb-24 overflow-hidden bg-ae-900 text-white">
  <div class="absolute inset-0 hero-glow pointer-events-none"></div>
  <div class="relative max-w-7xl mx-auto px-6 sm:px-8">
    <h1 class="font-semibold tracking-tight leading-[1.15] text-white"
        style="font-size: clamp(1.5rem, 4.4vw, 3.25rem);">
      Plain words with <span class="text-brand-400 font-semibold">one accent</span>.
    </h1>
    <p class="mt-6 text-lg text-ae-200 leading-relaxed max-w-xl">Supporting paragraph.</p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href="#" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">Primary →</a>
      <a href="#" class="inline-flex items-center px-5 py-2.5 border border-white/15 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">Secondary</a>
    </div>
  </div>
</section>
```

### Section H2

```html
<h2 class="text-[1.625rem] sm:text-3xl md:text-[2.25rem] font-semibold tracking-tight leading-[1.2] text-ae-950">Heading</h2>
```

### Card

```html
<div class="p-7 rounded-xl border border-ae-200/60 bg-white">
  <h3 class="text-base font-semibold text-ae-950 mb-2">Title</h3>
  <p class="text-sm text-ae-500 leading-relaxed">Body.</p>
</div>
```

---

## Appendix B — Plain CSS / custom-properties reference

For products using vanilla CSS, CSS modules, SCSS, CSS-in-JS, or any styling approach that isn't Tailwind. Drop this in your global stylesheet and consume the variables.

### Design tokens

```css
:root {
  /* Colors — navy-slate */
  --ae-50:  #f7f8fb;
  --ae-100: #eef2fb;
  --ae-200: #e4e9f5;
  --ae-300: #c9d2e8;
  --ae-400: #94a3b8;
  --ae-500: #64748b;
  --ae-600: #475569;
  --ae-700: #1e293b;
  --ae-800: #0a1a3f;
  --ae-900: #060f2b;
  --ae-950: #05102a;

  /* Colors — emerald accent */
  --brand-400: #34d399;
  --brand-500: #10b981;
  --brand-600: #059669;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  /* Spacing (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-7: 1.75rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-28: 7rem;
  --space-32: 8rem;

  /* Radii */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Container */
  --container-max: 80rem; /* 1280px */
}

html { scroll-behavior: smooth; overflow-x: hidden; }
body {
  font-family: var(--font-sans);
  background: var(--ae-50);
  color: var(--ae-900);
  overflow-x: hidden;
}

.container {
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--space-6);
}
@media (min-width: 640px) {
  .container { padding-inline: var(--space-8); }
}
```

### Example components in plain CSS

```css
/* Nav */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgb(228 233 245 / 0.6); /* ae-200 / 60 */
}
.nav-inner {
  max-width: var(--container-max);
  margin-inline: auto;
  padding: var(--space-4) var(--space-6);
  display: flex; align-items: center; justify-content: space-between;
}
.nav-cta {
  display: inline-flex; align-items: center; gap: 6px;
  padding: var(--space-2) var(--space-4);
  background: var(--ae-900); color: #fff;
  border-radius: var(--radius-md);
  font-weight: 600; font-size: 14px;
  transition: background-color 150ms;
}
.nav-cta:hover { background: var(--ae-800); }

/* Hero */
.hero {
  position: relative; overflow: hidden;
  background: var(--ae-900); color: #fff;
  padding: var(--space-28) 0 var(--space-20);
}
.hero-glow {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 30% 30%, rgba(16,185,129,0.08), transparent 70%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,50,116,0.4), transparent 70%);
}
.hero h1 {
  font-size: clamp(1.5rem, 4.4vw, 3.25rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #fff;
}
.hero h1 .accent { color: var(--brand-400); }

/* Section H2 */
.section h2 {
  font-size: 1.625rem;  /* 26px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ae-950);
}
@media (min-width: 640px)  { .section h2 { font-size: 1.875rem; } } /* 30px */
@media (min-width: 768px)  { .section h2 { font-size: 2.25rem;  } } /* 36px */

/* Primary CTA */
.btn-primary {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 10px var(--space-5);
  background: var(--brand-500); color: #fff;
  border-radius: var(--radius-md);
  font-weight: 500; font-size: 14px;
  transition: background-color 150ms;
}
.btn-primary:hover { background: var(--brand-600); }

/* Card */
.card {
  padding: var(--space-7);
  background: #fff;
  border: 1px solid rgb(228 233 245 / 0.6);
  border-radius: var(--radius-lg);
}
.card h3 {
  font-size: 1rem; font-weight: 600; color: var(--ae-950);
  margin-bottom: var(--space-2);
}
```

---

## Appendix C — Tokens as JSON

For importing into Figma, Style Dictionary, or other design-token tools.

```json
{
  "color": {
    "ae": {
      "50":  "#f7f8fb", "100": "#eef2fb", "200": "#e4e9f5", "300": "#c9d2e8",
      "400": "#94a3b8", "500": "#64748b", "600": "#475569", "700": "#1e293b",
      "800": "#0a1a3f", "900": "#060f2b", "950": "#05102a"
    },
    "brand": {
      "50":  "#ecfdf5", "100": "#d1fae5", "200": "#a7f3d0", "300": "#6ee7b7",
      "400": "#34d399", "500": "#10b981", "600": "#059669", "700": "#047857",
      "800": "#065f46", "900": "#064e3b"
    }
  },
  "font": {
    "sans": "Inter, system-ui, -apple-system, sans-serif",
    "mono": "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
  },
  "fontSize": {
    "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem",
    "h3": "1rem", "h2Mobile": "1.625rem", "h2Sm": "1.875rem", "h2Md": "2.25rem",
    "h1Min": "1.5rem", "h1Max": "3.25rem", "h1Fluid": "clamp(1.5rem, 4.4vw, 3.25rem)"
  },
  "fontWeight": { "regular": 400, "medium": 500, "semibold": 600, "bold": 700 },
  "lineHeight": { "tight": 1.15, "snug": 1.2, "normal": 1.4, "relaxed": 1.625 },
  "letterSpacing": { "tight": "-0.02em", "normal": "0", "wide": "0.1em" },
  "spacing": {
    "1": "0.25rem",  "2": "0.5rem",  "3": "0.75rem", "4": "1rem",
    "5": "1.25rem",  "6": "1.5rem",  "7": "1.75rem", "8": "2rem",
    "10": "2.5rem",  "12": "3rem",   "16": "4rem",   "20": "5rem",
    "24": "6rem",    "28": "7rem",   "32": "8rem"
  },
  "radius": {
    "sm": "0.375rem", "md": "0.5rem", "lg": "0.75rem", "xl": "1rem", "full": "9999px"
  },
  "breakpoint": {
    "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px", "2xl": "1536px"
  },
  "container": { "max": "1280px", "paddingMobile": "1.5rem", "paddingDesktop": "2rem" }
}
```

---

## Installing this skill

**As a Claude Code skill (recommended for teams using Claude Code):**

Project-scoped — commit into the product repo so the whole team gets it:

```
<your-repo>/.claude/skills/aerele-design/SKILL.md
```

User-scoped — one-time install on a developer's machine, applies to every repo they work in:

```
~/.claude/skills/aerele-design/SKILL.md
```

Claude Code reads the frontmatter `description` to auto-apply the skill when a task matches. You can also invoke it explicitly with `/aerele-design`.

**As plain documentation (for devs not using Claude Code):**

The file is valid Markdown and stands alone. Link to it from the product's `README.md`, or paste the path into your team wiki. The tokens in §1 and the anti-patterns in §7 are the minimum a dev needs to read.

---

## Reference implementation

`aerele.in` is the canonical implementation. When something in this doc is ambiguous, check the live site. When the live site contradicts this doc, the doc wins — the site is a snapshot, the rules are the system.
