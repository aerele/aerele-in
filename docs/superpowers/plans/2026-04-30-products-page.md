# Products page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Products surface on aerele.in (`/products/` page + homepage teaser + nav + footer + sitemap/llms updates) for the AereLens launch on the week of 2026-05-04.

**Architecture:** Purely additive static HTML changes. Reuse the existing `tailwind.config` tokens (`ae-*`, `brand-*`, Inter, JetBrains Mono) and existing layout primitives (nav, footer, hero, light-section, card, button styles, anchor-pill eyebrows, `fade-in` reveal). No build step, no new tooling, no restyling of existing pages.

**Tech Stack:** Static HTML5, Tailwind via CDN (configured inline in each page's `<head>`), Inter + JetBrains Mono via Google Fonts, hosted on GitHub Pages from the `gh-pages` branch.

**Spec:** `docs/superpowers/specs/2026-04-30-products-page-design.md`

**Branch:** `products-page-launch` (already pushed; PR #6 holds the spec). Implementation commits land on this same branch.

**Verification model:** This site has no test runner. "Verification" steps are `grep` structural checks plus opening files in a browser. Each task ends in a commit; the final task pushes the branch so PR #6 picks up the new commits.

---

## File map

**Create**
- `products/index.html` — the products page
- `products/aerelens-mark.svg` — AL monogram (port of `/Users/kavin/Bookkeeping-AI/code_auditor/frontend/src/app/icon.svg`)

**Edit (additive: nav `Products` link + footer `Products` column)**
- `index.html` (also: new Products teaser section)
- `about/index.html`
- `hire-frappe-developer/index.html`
- `hire-erpnext-developer/index.html`
- `erpnext-customization/index.html`
- `erpnext-integration/index.html`
- `erpnext-performance-optimization/index.html`
- `frappe-product-engineering/index.html`
- `case-studies/india-banking/index.html`
- `case-studies/alfarsi-robotics/index.html`
- `dpa/index.html`
- `privacy-policy/index.html`
- `terms-of-service/index.html`

**Edit (SEO/discoverability)**
- `sitemap.xml`
- `llms.txt`
- `llms-full.txt`

---

## Task 1: Create the AereLens AL-monogram SVG

**Files:**
- Create: `products/aerelens-mark.svg`

- [ ] **Step 1: Confirm directory does not yet exist**

Run: `ls products 2>/dev/null; echo "exit=$?"`
Expected: `exit=2` (no such file or directory) — directory will be created in Step 2.

- [ ] **Step 2: Create the SVG file**

Write file `products/aerelens-mark.svg` with content:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="AereLens">
  <rect width="64" height="64" rx="12" ry="12" fill="#ffffff"/>
  <text
    x="32"
    y="46"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    font-weight="800"
    font-size="34"
    fill="#0a1a3f"
    text-anchor="middle"
    letter-spacing="-1.5"
  >AL</text>
</svg>
```

- [ ] **Step 3: Verify file written**

Run: `ls -l products/aerelens-mark.svg && head -1 products/aerelens-mark.svg`
Expected: file exists; first line starts with `<svg`.

- [ ] **Step 4: Commit**

```bash
git add products/aerelens-mark.svg
git commit -m "Products: add AereLens AL-monogram mark"
```

---

## Task 2: Create the `/products/` page

This is the centerpiece. The full document mirrors the structure of `/about/index.html` (head meta, subpage nav, body sections, shared footer) but with the products-specific content from the spec.

**Files:**
- Create: `products/index.html`

- [ ] **Step 1: Write `products/index.html`**

Write file `products/index.html` with the following exact content. The page contains: `<head>` with full SEO meta, subpage-style nav (with `Products` link `aria-current="page"`), framing hero, AereLens featured card, narrative section, "more coming" footer note, and the standard 5-column site footer.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products by Aerele – Software we build, run, and ship</title>
    <meta name="description" content="Aerele's own products. AereLens — see what'll break before your ERPNext upgrade. More tools in development.">

    <meta property="og:title" content="Products by Aerele – Software we build, run, and ship">
    <meta property="og:description" content="Aerele's own products. AereLens — see what'll break before your ERPNext upgrade.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://aerele.in/products/">
    <meta property="og:image" content="https://aerele.in/logo-og.png">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="Aerele Technologies">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Products by Aerele – Software we build, run, and ship">
    <meta name="twitter:description" content="AereLens — see what'll break before your ERPNext upgrade.">
    <meta name="twitter:image" content="https://aerele.in/logo-og.png">

    <link rel="canonical" href="https://aerele.in/products/">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <meta name="author" content="Aerele Technologies Pvt Ltd">
    <meta name="keywords" content="aerelens, frappe code audit, erpnext migration audit, frappe upgrade check, aerele products">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Products by Aerele",
        "url": "https://aerele.in/products/",
        "inLanguage": "en",
        "isPartOf": {
            "@type": "WebSite",
            "name": "Aerele Technologies",
            "url": "https://aerele.in"
        }
    }
    </script>

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AereLens",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "url": "https://lens.aerele.in/",
        "description": "Code auditing and version-migration audits for Frappe and ERPNext. See what'll break before your upgrade.",
        "publisher": {
            "@type": "Organization",
            "name": "Aerele Technologies Pvt Ltd",
            "url": "https://aerele.in"
        }
    }
    </script>

    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'ae': {
                            50:  '#f7f8fb', 100: '#eef2fb', 200: '#e4e9f5', 300: '#c9d2e8',
                            400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#1e293b',
                            800: '#0a1a3f', 900: '#060f2b', 950: '#05102a',
                        },
                        'brand': {
                            50:  '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
                            400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
                            800: '#065f46', 900: '#064e3b',
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
                    }
                }
            }
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="preload" href="/logo-nav.png" as="image">

    <style>
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
        .fade-in { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .hero-glow { background: radial-gradient(ellipse 80% 60% at 30% 30%, rgba(16,185,129,0.08), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,50,116,0.4), transparent 70%); }
        .aerelens-mark { font-weight: 700; letter-spacing: -0.028em; color: #0a1a3f; line-height: 1; display: inline-flex; align-items: baseline; }
        .aerelens-mark .pill { background: #0a1a3f; color: #fff; padding: 0.12em 0.32em; border-radius: 0.32em; margin-left: 0.04em; }
    </style>
</head>
<body class="bg-ae-50 text-ae-900 antialiased">

    <!-- Nav -->
    <nav class="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-ae-200/60">
        <div class="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2.5">
                <img src="/logo-nav.png" alt="Aerele Technologies" class="h-8">
                <span class="text-[16px] font-semibold text-ae-900 tracking-tight">Aerele Technologies</span>
            </a>
            <div class="hidden sm:flex items-center gap-8 text-[14px] font-medium text-ae-600">
                <a href="/" class="hover:text-ae-900 transition-colors">Home</a>
                <a href="/hire-frappe-developer/" class="hover:text-ae-900 transition-colors">Hire Developers</a>
                <a href="/erpnext-customization/" class="hover:text-ae-900 transition-colors">Customization</a>
                <a href="/erpnext-integration/" class="hover:text-ae-900 transition-colors">Integrations</a>
                <a href="/products/" class="text-ae-900" aria-current="page">Products</a>
                <a href="/about/" class="hover:text-ae-900 transition-colors">About</a>
                <a href="/hire-frappe-developer/" class="inline-flex items-center gap-1.5 px-4 py-2 bg-ae-900 text-white rounded-lg font-semibold hover:bg-ae-800 transition-colors">Hire us <span aria-hidden="true">→</span></a>
            </div>
            <button id="mobile-menu-btn" class="sm:hidden p-2 text-ae-600" aria-label="Menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>
        <div id="mobile-menu" class="hidden sm:hidden border-t border-ae-200 bg-white">
            <div class="px-6 py-4 flex flex-col gap-4 text-sm text-ae-700">
                <a href="/">Home</a>
                <a href="/hire-frappe-developer/">Hire Developers</a>
                <a href="/erpnext-customization/">Customization</a>
                <a href="/erpnext-integration/">Integrations</a>
                <a href="/products/" aria-current="page">Products</a>
                <a href="/about/">About</a>
                <a href="/hire-frappe-developer/">Hire us</a>
            </div>
        </div>
    </nav>

    <!-- ===== HERO ===== -->
    <section class="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden bg-ae-900 text-white">
        <div class="absolute inset-0 hero-glow pointer-events-none"></div>
        <div class="relative max-w-7xl mx-auto px-6 sm:px-8">
            <p class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-ae-200 mb-7 uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                Products by Aerele
            </p>
            <h1 class="font-semibold tracking-tight leading-[1.15] text-white max-w-3xl" style="font-size: clamp(1.5rem, 4.4vw, 3.25rem);">
                Software we build, run, and ship — not just code we write for clients.
            </h1>
            <p class="mt-6 text-lg text-ae-200 leading-relaxed max-w-2xl">
                For years we've been the engineering team behind other companies' products. Now we're shipping our own — tools we use every day, packaged up for the rest of the Frappe community.
            </p>
        </div>
    </section>

    <!-- ===== AERELENS FEATURED CARD ===== -->
    <section class="bg-ae-50 py-20 sm:py-28">
        <div class="max-w-7xl mx-auto px-6 sm:px-8 fade-in">
            <div class="bg-white border border-ae-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div class="grid lg:grid-cols-2 gap-0">
                    <div class="p-8 sm:p-10 lg:p-12">
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-medium text-brand-700 mb-6 uppercase tracking-wider">
                            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                            New · launching this week
                        </span>
                        <div class="aerelens-mark mb-5" style="font-size: 28px;">Aere<span class="pill">Lens</span></div>
                        <h2 class="text-3xl sm:text-[34px] font-semibold tracking-tight leading-[1.15] text-ae-900">
                            See what'll break before your ERPNext upgrade.
                        </h2>
                        <p class="mt-5 text-ae-500 leading-relaxed">
                            Run a deep audit on your custom Frappe app — surface breaking changes, deprecated APIs, and version-incompatible patterns before you ship the upgrade. Built by the team that contributes to Frappe core.
                        </p>
                        <div class="mt-7 space-y-3">
                            <div class="flex gap-3">
                                <span class="text-brand-500 mt-1 leading-none">●</span>
                                <div><span class="font-semibold text-ae-900">Migration audit</span> <span class="text-ae-500">— see exactly what breaks when you move between Frappe / ERPNext versions.</span></div>
                            </div>
                            <div class="flex gap-3">
                                <span class="text-brand-500 mt-1 leading-none">●</span>
                                <div><span class="font-semibold text-ae-900">Code review</span> <span class="text-ae-500">— deprecated APIs and Frappe-specific issues, ranked by severity.</span></div>
                            </div>
                            <div class="flex gap-3">
                                <span class="text-brand-500 mt-1 leading-none">●</span>
                                <div><span class="font-semibold text-ae-900">Shareable reports</span> <span class="text-ae-500">— findings your team can ship from, with file/line references.</span></div>
                            </div>
                        </div>
                        <div class="mt-8 flex flex-wrap gap-3">
                            <a href="https://lens.aerele.in/" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">Try AereLens <span aria-hidden="true">→</span></a>
                            <a href="mailto:hello@aerele.in?subject=AereLens%20walkthrough" class="inline-flex items-center px-5 py-2.5 border border-ae-300 text-ae-700 rounded-lg text-sm font-medium hover:bg-ae-50 transition-colors">Book a walkthrough</a>
                        </div>
                    </div>
                    <div class="bg-ae-950 p-6 lg:p-8 flex items-center">
                        <div class="w-full rounded-xl bg-ae-950 border border-white/10 overflow-hidden shadow-2xl shadow-black/40">
                            <div class="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-black/30">
                                <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span>
                                <span class="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span>
                                <span class="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
                                <span class="ml-3 text-[11px] font-mono text-ae-300">aerelens audit ./my-erpnext-app</span>
                            </div>
                            <div class="p-5 font-mono text-[12px] leading-[1.7] text-ae-200">
                                <div class="text-ae-400">scanning 142 files…</div>
                                <div class="mt-3"><span class="text-[#ff8a8a]">●</span> <span class="text-ae-100">deprecated</span> <span class="text-ae-400">frappe.db.sql_list()</span> <span class="text-ae-500">· custom_app/api.py:88</span></div>
                                <div><span class="text-[#ffcd6e]">●</span> <span class="text-ae-100">breaking</span> <span class="text-ae-400">@frappe.whitelist removed</span> <span class="text-ae-500">· custom_app/utils.py:34</span></div>
                                <div><span class="text-[#ffcd6e]">●</span> <span class="text-ae-100">breaking</span> <span class="text-ae-400">renamed: get_value &rarr; db.get_value</span> <span class="text-ae-500">· custom_app/hooks.py:12</span></div>
                                <div><span class="text-[#6ee7b7]">●</span> <span class="text-ae-100">info</span> <span class="text-ae-400">9 unused imports</span> <span class="text-ae-500">· 4 files</span></div>
                                <div class="mt-4 pt-3 border-t border-white/10 text-ae-300">
                                    <span class="text-white font-semibold">3 breaking</span> <span class="text-ae-500">·</span> <span class="text-ae-100">12 warnings</span> <span class="text-ae-500">·</span> <span class="text-ae-400">v14 &rarr; v15</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ===== STORY BEHIND THE NAME ===== -->
    <section class="bg-white py-16 sm:py-20 border-t border-ae-200/60">
        <div class="max-w-4xl mx-auto px-6 sm:px-8">
            <div class="text-center fade-in">
                <p class="text-xs text-ae-400 uppercase tracking-widest mb-3">The story behind the name</p>
                <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-ae-900 leading-[1.2]">
                    Aere meets Lens &mdash; our contributor experience, focused on your code.
                </h2>
            </div>

            <div class="mt-12 fade-in">
                <div class="flex flex-col sm:flex-row items-stretch justify-center gap-6 sm:gap-4 text-center">
                    <div class="flex-1 max-w-xs mx-auto">
                        <div class="aerelens-mark mb-3 justify-center" style="font-size: 32px;">Aere</div>
                        <p class="text-sm text-ae-500 leading-relaxed">The team &mdash; 30+ engineers with 600+ merged PRs in Frappe, ERPNext, HRMS, and Payments core.</p>
                    </div>
                    <span class="self-center text-2xl text-ae-300 font-light" aria-hidden="true">+</span>
                    <div class="flex-1 max-w-xs mx-auto">
                        <div class="mb-3 flex justify-center" style="font-size: 32px;">
                            <span class="aerelens-mark"><span class="pill">Lens</span></span>
                        </div>
                        <p class="text-sm text-ae-500 leading-relaxed">The product &mdash; what we built so the same eyes that review Frappe core can look at your code too.</p>
                    </div>
                    <span class="self-center text-2xl text-ae-300 font-light" aria-hidden="true">=</span>
                    <div class="flex-1 max-w-xs mx-auto">
                        <div class="aerelens-mark mb-3 justify-center" style="font-size: 32px;">Aere<span class="pill">Lens</span></div>
                        <p class="text-sm text-ae-500 leading-relaxed">Contributor expertise, codified &mdash; applied to your app so the ERPNext ecosystem grows stronger.</p>
                    </div>
                </div>
            </div>

            <p class="mt-12 text-ae-500 leading-relaxed text-center max-w-2xl mx-auto fade-in">
                Every check AereLens runs is informed by the work we do every day on the framework itself. When the audit flags a deprecated API, it's because we've watched it deprecate. When it warns about a breaking change, it's because we've reviewed &mdash; and often written &mdash; the patch upstream.
            </p>
        </div>
    </section>

    <!-- ===== WHY THIS MATTERS ===== -->
    <section class="bg-white py-16">
        <div class="max-w-3xl mx-auto px-6 sm:px-8 text-center fade-in">
            <p class="text-xs text-ae-400 uppercase tracking-widest mb-3">Why this matters</p>
            <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-ae-900">
                We've built other companies' products. Now we're building our own.
            </h2>
            <p class="mt-6 text-ae-500 text-lg leading-relaxed max-w-xl mx-auto">
                AereLens is the first tool in a small line of products built on top of the work we do every day. The same engineers who contribute to Frappe core build them — which means they're built right.
            </p>
        </div>
    </section>

    <!-- ===== MORE COMING ===== -->
    <section class="bg-ae-50 py-12">
        <div class="max-w-3xl mx-auto px-6 sm:px-8 text-center text-ae-500 text-sm">
            More products in development. <em class="text-ae-700 not-italic font-medium">Want to know first?</em>
            <a href="mailto:hello@aerele.in" class="ml-1 text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">Get in touch</a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-ae-200/60 py-10 bg-ae-50">
        <div class="max-w-7xl mx-auto px-6 sm:px-8">
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8 text-xs">
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Products</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="https://lens.aerele.in/" class="hover:text-ae-700">AereLens</a>
                        <a href="/products/" class="hover:text-ae-700">All products</a>
                    </div>
                </div>
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Services</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="/hire-frappe-developer/" class="hover:text-ae-700">Hire Frappe Developer</a>
                        <a href="/hire-erpnext-developer/" class="hover:text-ae-700">Hire ERPNext Developer</a>
                        <a href="/erpnext-customization/" class="hover:text-ae-700">ERPNext Customization</a>
                        <a href="/erpnext-integration/" class="hover:text-ae-700">ERPNext Integration</a>
                        <a href="/erpnext-performance-optimization/" class="hover:text-ae-700">Performance Optimization</a>
                        <a href="/frappe-product-engineering/" class="hover:text-ae-700">Product Engineering</a>
                    </div>
                </div>
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Case Studies</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="/case-studies/india-banking/" class="hover:text-ae-700">India Banking Suite</a>
                        <a href="/case-studies/alfarsi-robotics/" class="hover:text-ae-700">Warehouse Robotics</a>
                    </div>
                </div>
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Company</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="/about/" class="hover:text-ae-700">About</a>
                        <a href="https://github.com/aerele" class="hover:text-ae-700">GitHub</a>
                    </div>
                </div>
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Open Source</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="https://github.com/aerele/india-banking" class="hover:text-ae-700">india-banking</a>
                        <a href="https://github.com/aerele/pwa-builder" class="hover:text-ae-700">pwa-builder</a>
                        <a href="https://github.com/aerele/medusa_integration" class="hover:text-ae-700">medusa_integration</a>
                        <a href="https://github.com/aerele/emSigner" class="hover:text-ae-700">emSigner</a>
                    </div>
                </div>
            </div>
            <div class="border-t border-ae-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="text-xs text-ae-400">&copy; 2025 Aerele Technologies Pvt Ltd · Tiruppur, India</div>
                <div class="flex gap-4 text-xs text-ae-400">
                    <a href="/privacy-policy/" class="hover:text-ae-700">Privacy</a>
                    <a href="/terms-of-service/" class="hover:text-ae-700">Terms</a>
                    <a href="/dpa/" class="hover:text-ae-700">DPA</a>
                </div>
                <div class="text-xs text-ae-400">hello@aerele.in · +91 77908 44832</div>
            </div>
        </div>
    </footer>

    <script>
        // Mobile menu
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        if (btn && menu) {
            btn.addEventListener('click', () => menu.classList.toggle('hidden'));
        }
        // Fade-in observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    </script>
</body>
</html>
```

- [ ] **Step 2: Verify file**

Run:
```bash
ls -l products/index.html
grep -c "AereLens" products/index.html
grep -c "lens.aerele.in" products/index.html
grep -c 'aria-current="page"' products/index.html
```
Expected: file exists; AereLens occurrences ≥ 5; `lens.aerele.in` occurrences ≥ 2 (CTA + footer + JSON-LD); `aria-current="page"` occurrences = 2 (desktop + mobile nav).

- [ ] **Step 3: Open in browser to visually verify**

Run: `open products/index.html`
Visual checks:
- Hero renders with dark navy bg + glow
- AereLens card renders with wordmark, badge, tagline, 3 bullets, both CTAs
- Mac-style report window renders on the right side at desktop width
- "The story behind the name" section renders with the three-tile Aere + Lens = AereLens breakdown
- "Why this matters" centered statement renders
- Footer shows 5 columns with Products as the first column
- Click `Try AereLens →` opens `https://lens.aerele.in/` in a new tab
- Resize to ~375px wide: card stacks, footer wraps cleanly

- [ ] **Step 4: Commit**

```bash
git add products/index.html
git commit -m "Products: add /products/ page with AereLens featured card"
```

---

## Task 3: Add Products teaser section to homepage

Insert a new `<section id="products">` into `index.html` between the existing "What we do" services section and the "Work / case studies" section. The section is a single horizontal teaser card linking to `/products/`.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Locate the insertion point**

Run: `grep -n 'id="work"\|===== WORK\|===== CASE\|===== Work\|===== SERVICES\|===== What\|case-studies\|case studies' index.html | head -20`
Use the output to find the comment that opens the case-studies/work section (e.g. `<!-- ===== WORK ===== -->` or similar). The new Products section is inserted **immediately above** that comment, after the closing `</section>` of the services block.

- [ ] **Step 2: Insert the Products section**

Use Edit to insert this block immediately above the case-studies/work section opening comment. The exact `old_string` must include the closing `</section>` of the previous block plus the opening comment of the work block — capture enough surrounding context to make the match unique.

Block to insert (the new section, with a leading blank line):

```html

    <!-- ===== PRODUCTS ===== -->
    <section id="products" class="py-20 sm:py-28 bg-ae-50">
        <div class="max-w-7xl mx-auto px-6 sm:px-8">
            <div class="max-w-3xl fade-in">
                <p class="text-xs text-ae-400 uppercase tracking-widest mb-3">Products by Aerele</p>
                <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-ae-900">We build software too — not just for clients, for ourselves.</h2>
                <p class="mt-4 text-ae-500 text-lg leading-relaxed">Tools we use every day, packaged up for the rest of the Frappe community.</p>
            </div>

            <a href="/products/" class="group mt-10 fade-in flex items-center gap-6 sm:gap-8 p-6 sm:p-8 bg-white border border-ae-200/60 hover:border-ae-300 rounded-xl transition-colors">
                <img src="/products/aerelens-mark.svg" alt="AereLens" class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-ae-200/60 shrink-0">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap">
                        <span class="aerelens-mark" style="font-size: 22px;">Aere<span class="pill">Lens</span></span>
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-medium text-brand-700 uppercase tracking-wider">
                            <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                            New
                        </span>
                    </div>
                    <p class="mt-2 text-ae-700 text-sm sm:text-base leading-snug">See what'll break before your ERPNext upgrade.</p>
                </div>
                <span class="text-ae-400 group-hover:text-ae-700 transition-colors hidden sm:inline" aria-hidden="true">→</span>
            </a>

            <p class="mt-6 text-sm text-ae-500">
                More products in development.
                <a href="/products/" class="text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">See all →</a>
            </p>
        </div>
    </section>
```

- [ ] **Step 3: Add the `.aerelens-mark` styles to the existing `<style>` block in index.html**

The `aerelens-mark` class is used in the new section. Add the same two CSS rules to the `<style>` block in `index.html` (the block that already contains `.fade-in` and `.hero-glow`).

Edit `index.html`: find the existing `.hero-glow { … }` line; immediately after it add:

```css
        .aerelens-mark { font-weight: 700; letter-spacing: -0.028em; color: #0a1a3f; line-height: 1; display: inline-flex; align-items: baseline; }
        .aerelens-mark .pill { background: #0a1a3f; color: #fff; padding: 0.12em 0.32em; border-radius: 0.32em; margin-left: 0.04em; }
```

- [ ] **Step 4: Verify the section is in place**

Run:
```bash
grep -n 'id="products"' index.html
grep -c "aerelens-mark" index.html
grep -n "Products by Aerele" index.html
```
Expected: `id="products"` appears once; `aerelens-mark` appears at least 4 times (style rules + wordmark uses); `Products by Aerele` appears at least once.

- [ ] **Step 5: Visually verify**

Run: `open index.html`
Visual checks:
- Scroll down past services — new "Products by Aerele" section appears before the work/case-studies section
- AereLens card shows AL-monogram mark, wordmark, "New" pill, tagline
- Hovering the card shifts the border + arrow color
- Clicking the card navigates to `/products/`

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Homepage: add Products teaser section linking to /products/"
```

---

## Task 4: Update homepage nav + footer

Add a `Products` link to the homepage nav (anchor `#products`) and add a `Products` column to the footer (bumping `sm:grid-cols-4` → `sm:grid-cols-5`).

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `Products` link to desktop nav**

In `index.html`, find the desktop nav block (the `<div class="hidden sm:flex items-center gap-8 …">` near the top of `<body>`). Insert a `Products` link between the existing `Work` and `Team` links.

Edit — replace:

```html
                <a href="#work" class="hover:text-ae-900 transition-colors">Work</a>
                <a href="#team" class="hover:text-ae-900 transition-colors">Team</a>
```

with:

```html
                <a href="#work" class="hover:text-ae-900 transition-colors">Work</a>
                <a href="#products" class="hover:text-ae-900 transition-colors">Products</a>
                <a href="#team" class="hover:text-ae-900 transition-colors">Team</a>
```

- [ ] **Step 2: Add `Products` link to mobile nav**

Find the mobile menu block (the `<div id="mobile-menu" …>` in `index.html`). Replace the existing flat link list with one that includes `#products`.

Edit — replace:

```html
                <a href="#why">Why Us</a><a href="#work">Work</a><a href="#team">Team</a><a href="#pricing">Pricing</a><a href="/about/">About</a><a href="/hire-frappe-developer/">Hire us</a>
```

with:

```html
                <a href="#why">Why Us</a><a href="#work">Work</a><a href="#products">Products</a><a href="#team">Team</a><a href="#pricing">Pricing</a><a href="/about/">About</a><a href="/hire-frappe-developer/">Hire us</a>
```

- [ ] **Step 3: Add `Products` footer column and bump grid**

Find the footer in `index.html` (`<footer class="border-t border-ae-200/60 py-10 bg-ae-50">`).

Edit — replace:

```html
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 text-xs">
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Services</p>
```

with:

```html
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8 text-xs">
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Products</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="https://lens.aerele.in/" class="hover:text-ae-700">AereLens</a>
                        <a href="/products/" class="hover:text-ae-700">All products</a>
                    </div>
                </div>
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Services</p>
```

- [ ] **Step 4: Verify**

Run:
```bash
grep -c '#products' index.html
grep -c 'sm:grid-cols-5' index.html
grep -c '>Products<' index.html
```
Expected: `#products` ≥ 3 (desktop nav + mobile nav + section id); `sm:grid-cols-5` = 1; `>Products<` ≥ 3 (desktop nav + mobile nav + footer column header).

- [ ] **Step 5: Visually verify**

Run: `open index.html`
- Top nav now shows: Why Us · Work · Products · Team · Pricing · About · Hire us
- Click `Products` in nav: page scrolls smoothly to the Products section
- Scroll to footer: 5 columns with Products as the first
- On narrow viewport: mobile menu shows the Products entry; footer wraps to 2 columns

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Homepage: add Products nav link and footer column"
```

---

## Task 5: Update subpage navs and footers

Twelve subpages share the same nav/footer pattern. Each gets the same two edits: insert the `Products` link in nav (desktop + mobile) and add the `Products` footer column (with grid bump). The exact strings to find and replace are the same on each page.

**Files (one step per file):**
- Modify: `about/index.html`
- Modify: `hire-frappe-developer/index.html`
- Modify: `hire-erpnext-developer/index.html`
- Modify: `erpnext-customization/index.html`
- Modify: `erpnext-integration/index.html`
- Modify: `erpnext-performance-optimization/index.html`
- Modify: `frappe-product-engineering/index.html`
- Modify: `case-studies/india-banking/index.html`
- Modify: `case-studies/alfarsi-robotics/index.html`
- Modify: `dpa/index.html`
- Modify: `privacy-policy/index.html`
- Modify: `terms-of-service/index.html`

**The three edits applied to each file:**

**Edit A — desktop nav.** Find:
```html
                <a href="/erpnext-integration/" class="hover:text-ae-900 transition-colors">Integrations</a>
                <a href="/about/" class="hover:text-ae-900 transition-colors">About</a>
```
Replace with:
```html
                <a href="/erpnext-integration/" class="hover:text-ae-900 transition-colors">Integrations</a>
                <a href="/products/" class="hover:text-ae-900 transition-colors">Products</a>
                <a href="/about/" class="hover:text-ae-900 transition-colors">About</a>
```

**Edit B — mobile nav.** Find the mobile nav block in the file (search for `id="mobile-menu"` or the simpler flat list on smaller subpages). The exact text varies per page; the goal is to insert one `<a href="/products/">Products</a>` link before the existing `<a href="/about/">About</a>` link inside the mobile menu container. Use Read to view the exact lines first, then Edit with the exact context.

**Edit C — footer.** Find:
```html
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 text-xs">
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Services</p>
```
Replace with:
```html
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8 text-xs">
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Products</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="https://lens.aerele.in/" class="hover:text-ae-700">AereLens</a>
                        <a href="/products/" class="hover:text-ae-700">All products</a>
                    </div>
                </div>
                <div>
                    <p class="font-semibold text-ae-700 mb-3">Services</p>
```

**Note on subpage variation:** Some subpages may use slightly different nav markup (e.g., shorter pages like `dpa`, `privacy-policy`, `terms-of-service` may have a smaller nav). For those, the executing agent should `Read` the file first, locate the relevant nav and footer blocks, and apply equivalent edits. The intent is universal: every page must contain a `Products` link in its nav and a `Products` column in its footer.

- [ ] **Step 1: Apply edits A, B, C to `about/index.html`**

Read the file first (or relevant sections). Apply edits A, B, C.

Verify: `grep -c "/products/" about/index.html` returns ≥ 3.

- [ ] **Step 2: Apply edits A, B, C to `hire-frappe-developer/index.html`**

Verify: `grep -c "/products/" hire-frappe-developer/index.html` returns ≥ 3.

- [ ] **Step 3: Apply edits A, B, C to `hire-erpnext-developer/index.html`**

Verify: `grep -c "/products/" hire-erpnext-developer/index.html` returns ≥ 3.

- [ ] **Step 4: Apply edits A, B, C to `erpnext-customization/index.html`**

Verify: `grep -c "/products/" erpnext-customization/index.html` returns ≥ 3.

- [ ] **Step 5: Apply edits A, B, C to `erpnext-integration/index.html`**

Verify: `grep -c "/products/" erpnext-integration/index.html` returns ≥ 3.

- [ ] **Step 6: Apply edits A, B, C to `erpnext-performance-optimization/index.html`**

Verify: `grep -c "/products/" erpnext-performance-optimization/index.html` returns ≥ 3.

- [ ] **Step 7: Apply edits A, B, C to `frappe-product-engineering/index.html`**

Verify: `grep -c "/products/" frappe-product-engineering/index.html` returns ≥ 3.

- [ ] **Step 8: Apply edits A, B, C to `case-studies/india-banking/index.html`**

Verify: `grep -c "/products/" case-studies/india-banking/index.html` returns ≥ 3.

- [ ] **Step 9: Apply edits A, B, C to `case-studies/alfarsi-robotics/index.html`**

Verify: `grep -c "/products/" case-studies/alfarsi-robotics/index.html` returns ≥ 3.

- [ ] **Step 10: Apply edits A, B, C to `dpa/index.html`**

Verify: `grep -c "/products/" dpa/index.html` returns ≥ 3.

- [ ] **Step 11: Apply edits A, B, C to `privacy-policy/index.html`**

Verify: `grep -c "/products/" privacy-policy/index.html` returns ≥ 3.

- [ ] **Step 12: Apply edits A, B, C to `terms-of-service/index.html`**

Verify: `grep -c "/products/" terms-of-service/index.html` returns ≥ 3.

- [ ] **Step 13: Cross-page verification**

Run:
```bash
grep -L "/products/" about/index.html hire-frappe-developer/index.html hire-erpnext-developer/index.html erpnext-customization/index.html erpnext-integration/index.html erpnext-performance-optimization/index.html frappe-product-engineering/index.html case-studies/india-banking/index.html case-studies/alfarsi-robotics/index.html dpa/index.html privacy-policy/index.html terms-of-service/index.html
```
Expected: empty output (every page contains `/products/`).

Run:
```bash
grep -L "sm:grid-cols-5" about/index.html hire-frappe-developer/index.html hire-erpnext-developer/index.html erpnext-customization/index.html erpnext-integration/index.html erpnext-performance-optimization/index.html frappe-product-engineering/index.html case-studies/india-banking/index.html case-studies/alfarsi-robotics/index.html dpa/index.html privacy-policy/index.html terms-of-service/index.html
```
Expected: empty output (every page's footer was bumped to 5 columns).

- [ ] **Step 14: Open three pages in a browser to spot-check**

Run: `open about/index.html hire-frappe-developer/index.html dpa/index.html`
Confirm the Products link is in the nav and the Products column is the first footer column on each.

- [ ] **Step 15: Commit**

```bash
git add about/index.html hire-frappe-developer/index.html hire-erpnext-developer/index.html erpnext-customization/index.html erpnext-integration/index.html erpnext-performance-optimization/index.html frappe-product-engineering/index.html case-studies/india-banking/index.html case-studies/alfarsi-robotics/index.html dpa/index.html privacy-policy/index.html terms-of-service/index.html
git commit -m "Subpages: add Products nav link and footer column site-wide"
```

---

## Task 6: Update sitemap.xml

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1: Read the current sitemap to find a good insertion point**

Run: `cat sitemap.xml`

- [ ] **Step 2: Insert the Products URL entry**

Insert (using Edit) a new `<url>` block immediately after the homepage `<url>` block (the one for `https://aerele.in/`). The block:

```xml
    <url>
        <loc>https://aerele.in/products/</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
```

(Match the existing indentation in the file — adjust to whatever the existing `<url>` blocks use.)

- [ ] **Step 3: Verify**

Run: `grep -c "aerele.in/products/" sitemap.xml`
Expected: 1.

- [ ] **Step 4: Commit**

```bash
git add sitemap.xml
git commit -m "Sitemap: add /products/ URL"
```

---

## Task 7: Update llms.txt and llms-full.txt

**Files:**
- Modify: `llms.txt`
- Modify: `llms-full.txt`

- [ ] **Step 1: Append a Products section to `llms.txt`**

Read the file first to see its formatting. Then append (or insert in the appropriate location, mirroring the file's existing section structure):

```
## Products

- AereLens (https://lens.aerele.in/) — code auditing and version-migration audits for Frappe and ERPNext. See what'll break before your upgrade.

Products page: https://aerele.in/products/
```

- [ ] **Step 2: Append a Products section to `llms-full.txt`**

Read the file first, then append (or place in the file's flow):

```
## Products by Aerele

Aerele ships its own software, in addition to building software for clients.

### AereLens

URL: https://lens.aerele.in/
Tagline: See what'll break before your ERPNext upgrade.

Run a deep audit on your custom Frappe app — surface breaking changes, deprecated APIs, and version-incompatible patterns before you ship the upgrade. Built by the team that contributes to Frappe core.

Capabilities:
- Migration audit — see exactly what breaks when you move between Frappe / ERPNext versions.
- Code review — deprecated APIs and Frappe-specific issues, ranked by severity.
- Shareable reports — findings your team can ship from, with file/line references.

More products are in development. Products page: https://aerele.in/products/
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -c "AereLens" llms.txt
grep -c "AereLens" llms-full.txt
```
Expected: each ≥ 1.

- [ ] **Step 4: Commit**

```bash
git add llms.txt llms-full.txt
git commit -m "LLM index: add Products section with AereLens"
```

---

## Task 8: Final cross-site verification + push

- [ ] **Step 1: Confirm every existing page references the new route**

Run:
```bash
grep -L "/products/" index.html about/index.html hire-frappe-developer/index.html hire-erpnext-developer/index.html erpnext-customization/index.html erpnext-integration/index.html erpnext-performance-optimization/index.html frappe-product-engineering/index.html case-studies/india-banking/index.html case-studies/alfarsi-robotics/index.html dpa/index.html privacy-policy/index.html terms-of-service/index.html
```
Expected: empty output.

- [ ] **Step 2: Confirm footer was bumped on every page**

Run:
```bash
grep -L "sm:grid-cols-5" index.html about/index.html hire-frappe-developer/index.html hire-erpnext-developer/index.html erpnext-customization/index.html erpnext-integration/index.html erpnext-performance-optimization/index.html frappe-product-engineering/index.html case-studies/india-banking/index.html case-studies/alfarsi-robotics/index.html dpa/index.html privacy-policy/index.html terms-of-service/index.html
```
Expected: empty output.

- [ ] **Step 3: Open final spot-check pages**

Run: `open index.html products/index.html`
Confirm:
- Homepage: Products link in nav scrolls to the new section; teaser card → /products/; footer 5 columns
- Products page: hero, AereLens card, narrative, "more coming", footer all render; CTAs work; mobile viewport stacks cleanly

- [ ] **Step 4: Push the branch — PR #6 picks up the new commits automatically**

Run:
```bash
git push origin products-page-launch
```

- [ ] **Step 5: Report PR status**

Run: `gh pr view 6 --json url,state,title,statusCheckRollup -q '.url + " | " + .state + " | " + .title'`
Expected: PR is OPEN at https://github.com/aerele/aerele-in/pull/6.

---

## Self-review checklist (post-write)

- ✅ Every spec section maps to a task: `/products/` page → Task 2; homepage section → Task 3; nav → Tasks 4 + 5; footer → Tasks 4 + 5; sitemap → Task 6; llms.txt → Task 7; AL-monogram asset → Task 1.
- ✅ No placeholders. Every code block is final content; every command has expected output.
- ✅ Class names and ids are consistent: `aerelens-mark` and `.aerelens-mark .pill` defined identically in `products/index.html` (Task 2) and `index.html` (Task 3); `id="products"` is the anchor target referenced from the homepage nav (Task 4).
- ✅ Verification works without a test runner — uses `grep`, `ls`, and visual checks.
- ✅ Frequent commits — one per task (8 commits total) keeps the PR diff readable.
