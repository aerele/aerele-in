// Build static blog pages from Markdown.
//
// Reads  content/blog/*.md  (YAML-ish front matter + Markdown body)
// Writes blog/posts.json            (index data, consumed by blog/index.html)
//        blog/<slug>/index.html     (one static, SEO-friendly page per post)
//
// Run:   npm run build:blog
import { marked } from 'marked';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'blog');
const SITE = 'https://aerele.in';

marked.setOptions({ mangle: false, headerIds: true });

// ---- tiny front-matter parser (controlled input, no extra deps) ----
function parseFrontMatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (val === 'true' || val === 'false') {
      val = val === 'true';
    }
    data[key] = val;
  }
  return { data, body: m[2] };
}

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// Extract an 11-char YouTube video id from common URL forms (or a bare id). Returns null if none.
function youtubeId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ---- shared chrome (must match blog/index.html) ----
const HEAD_COMMON = `    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = { theme: { extend: {
            colors: {
                'ae': { 50:'#f7f8fb',100:'#eef2fb',200:'#e4e9f5',300:'#c9d2e8',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#1e293b',800:'#0a1a3f',900:'#060f2b',950:'#05102a' },
                'brand': { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b' }
            },
            fontFamily: { sans:['Inter','system-ui','-apple-system','sans-serif'], mono:['JetBrains Mono','ui-monospace','SFMono-Regular','Menlo','monospace'] }
        } } }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

const STYLE = `    <style>
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
        .fade-in { opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .hero-glow { background: radial-gradient(ellipse 80% 60% at 30% 30%, rgba(16,185,129,0.08), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,50,116,0.4), transparent 70%); }
        .cover-glow { background: radial-gradient(ellipse 70% 80% at 25% 20%, rgba(16,185,129,0.18), transparent 70%), radial-gradient(ellipse 60% 60% at 85% 30%, rgba(26,50,116,0.55), transparent 70%); }
        /* Prose - styles the Markdown body, on-brand (no typography plugin needed) */
        .prose { color: #475569; font-size: 1.0625rem; line-height: 1.75; }
        .prose > * + * { margin-top: 1.25em; }
        .prose h2 { color: #05102a; font-weight: 600; font-size: 1.5rem; line-height: 1.25; letter-spacing: -0.02em; margin-top: 2.25em; margin-bottom: 0.25em; }
        .prose h3 { color: #05102a; font-weight: 600; font-size: 1.1875rem; line-height: 1.3; margin-top: 1.75em; margin-bottom: 0.25em; }
        .prose a { color: #059669; text-decoration: underline; text-underline-offset: 2px; }
        .prose a:hover { color: #047857; }
        .prose strong { color: #060f2b; font-weight: 600; }
        .prose ul, .prose ol { padding-left: 1.4em; }
        .prose ul { list-style: disc; } .prose ol { list-style: decimal; }
        .prose li { margin-top: 0.4em; }
        .prose li::marker { color: #94a3b8; }
        .prose blockquote { border-left: 3px solid #10b981; padding-left: 1rem; color: #64748b; font-style: italic; }
        .prose code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.875em; background: #eef2fb; color: #1e293b; padding: 0.15em 0.4em; border-radius: 6px; }
        .prose pre { background: #05102a; color: #e4e9f5; padding: 1.25rem; border-radius: 12px; overflow-x: auto; font-size: 0.875rem; line-height: 1.6; }
        .prose pre code { background: transparent; color: inherit; padding: 0; font-size: inherit; }
        .prose img { border-radius: 12px; margin: 1.75em 0; }
        .prose hr { border: 0; border-top: 1px solid #e4e9f5; margin: 2.5em 0; }
        @media (prefers-reduced-motion: reduce) { .fade-in { opacity: 1; transform: none; transition: none; } }
    </style>`;

const NAV = `    <nav class="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-ae-200/60">
        <div class="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2.5">
                <img src="/logo-nav.png" alt="Aerele Technologies" class="h-8">
                <span class="text-[16px] font-semibold text-ae-900 tracking-tight">Aerele Technologies</span>
            </a>
            <div class="hidden sm:flex items-center gap-8 text-[14px] font-medium text-ae-600">
                <a href="/#why" class="hover:text-ae-900 transition-colors">Why Us</a>
                <a href="/#work" class="hover:text-ae-900 transition-colors">Work</a>
                <a href="/#team" class="hover:text-ae-900 transition-colors">Team</a>
                <a href="/#pricing" class="hover:text-ae-900 transition-colors">Pricing</a>
                <a href="/#products" class="hover:text-ae-900 transition-colors">Products</a>
                <a href="/blog/" class="text-ae-900" aria-current="page">Blog</a>
                <a href="/about/" class="hover:text-ae-900 transition-colors">About</a>
                <a href="/hire-frappe-developer/" class="inline-flex items-center gap-1.5 px-4 py-2 bg-ae-900 text-white rounded-lg font-semibold hover:bg-ae-800 transition-colors">Hire us <span aria-hidden="true">→</span></a>
            </div>
            <button id="mobile-menu-btn" class="sm:hidden p-2 text-ae-600" aria-label="Menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>
        <div id="mobile-menu" class="hidden sm:hidden border-t border-ae-200 bg-white">
            <div class="px-6 py-4 flex flex-col gap-4 text-sm text-ae-700">
                <a href="/#why">Why Us</a><a href="/#work">Work</a><a href="/#team">Team</a><a href="/#pricing">Pricing</a><a href="/#products">Products</a><a href="/blog/">Blog</a><a href="/about/">About</a><a href="/hire-frappe-developer/">Hire us</a>
            </div>
        </div>
    </nav>`;

const FOOTER = `    <footer class="border-t border-ae-200/60 py-10 bg-ae-50">
        <div class="max-w-7xl mx-auto px-6 sm:px-8">
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8 text-xs">
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
                    <p class="font-semibold text-ae-700 mb-3">Resources</p>
                    <div class="flex flex-col gap-2 text-ae-400">
                        <a href="/blog/" class="hover:text-ae-700">Blog</a>
                        <a href="/docs/" class="hover:text-ae-700">Documentation</a>
                        <a href="/#products" class="hover:text-ae-700">Products</a>
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
                <div class="text-xs text-ae-400">&copy; 2026 Aerele Technologies Pvt Ltd · Tiruppur, India</div>
                <div class="flex gap-4 text-xs text-ae-400">
                    <a href="/privacy-policy/" class="hover:text-ae-700">Privacy</a>
                    <a href="/terms-of-service/" class="hover:text-ae-700">Terms</a>
                    <a href="/dpa/" class="hover:text-ae-700">DPA</a>
                </div>
                <div class="text-xs text-ae-400">hello@aerele.in · +91 77908 44832</div>
            </div>
        </div>
    </footer>`;

const MENU_JS = `    <script>
        document.getElementById('mobile-menu-btn').addEventListener('click', () => document.getElementById('mobile-menu').classList.toggle('hidden'));
        document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', () => document.getElementById('mobile-menu').classList.add('hidden')));
        const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
        document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
        document.querySelectorAll('[data-ytid]').forEach(b => b.addEventListener('click', () => {
            const i = document.createElement('iframe');
            i.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.ytid + '?autoplay=1&rel=0';
            i.title = b.dataset.yttitle || 'Video';
            i.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            i.allowFullscreen = true;
            i.className = 'absolute inset-0 w-full h-full';
            b.replaceWith(i);
        }));
    </script>`;

function coverBlock(post, big) {
  const glyphSize = big ? 'text-7xl sm:text-8xl' : 'text-6xl';
  const h = big ? 'h-56 sm:h-64' : 'h-44';
  const badge = post.category === 'Use Case'
    ? 'bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30'
    : post.category === 'Product'
      ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/40'
      : 'bg-white/10 text-ae-200 ring-1 ring-white/15';
  return `<div class="relative ${h} bg-ae-950 cover-glow overflow-hidden flex items-center justify-center">
        <span class="font-mono ${glyphSize} font-semibold text-white/10 select-none">${esc(post.cover.glyph)}</span>
        <span class="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${badge}">${esc(post.category)}</span>
    </div>`;
}

// Lazy "lite-YouTube" facade: poster + play button; the real iframe loads only on click.
function videoBlock(post) {
  if (!post.video) return '';
  const poster = post.videoPoster || `https://i.ytimg.com/vi/${post.video}/maxresdefault.jpg`;
  const label = post.videoTitle || 'Watch the demo';
  return `
    <div class="bg-ae-50">
        <div class="max-w-3xl mx-auto px-6 sm:px-8 mt-10">
            <figure class="m-0">
                <div class="relative aspect-video rounded-2xl overflow-hidden border border-ae-200/60 shadow-sm bg-ae-950 cover-glow">
                    <button type="button" data-ytid="${esc(post.video)}" data-yttitle="${esc(label)}" aria-label="Play video: ${esc(label)}" class="group absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer">
                        <img src="${esc(poster)}" onerror="this.style.display='none'" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
                        <span class="absolute inset-0 bg-ae-950/30 group-hover:bg-ae-950/20 transition-colors"></span>
                        <span class="relative z-10 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-500 text-white shadow-lg shadow-black/30 group-hover:scale-105 group-hover:bg-brand-600 transition-all">
                            <svg class="w-7 h-7 sm:w-8 sm:h-8 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                        </span>
                        <span class="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2 text-left">
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-[11px] font-medium text-white uppercase tracking-wider"><span class="w-1.5 h-1.5 rounded-full bg-brand-400"></span>Demo</span>
                            <span class="text-sm font-medium text-white drop-shadow">${esc(label)}</span>
                        </span>
                    </button>
                </div>
            </figure>
        </div>
    </div>`;
}

function relatedCard(post) {
  const tags = post.tags.slice(0, 3).map(t => `<span class="text-[11px] text-ae-400 font-mono">#${esc(t)}</span>`).join('');
  return `<a href="/blog/${esc(post.slug)}/" class="group flex flex-col bg-white border border-ae-200/60 hover:border-ae-300 rounded-xl overflow-hidden transition-colors">
        ${coverBlock(post, false)}
        <div class="p-6 flex flex-col flex-1">
            <h3 class="text-base font-semibold text-ae-950 leading-snug mb-2 group-hover:text-ae-700 transition-colors">${esc(post.title)}</h3>
            <p class="text-sm text-ae-500 leading-relaxed mb-4 flex-1">${esc(post.excerpt)}</p>
            <div class="flex items-center gap-3 mb-3">${tags}</div>
            <div class="flex items-center justify-between text-[11px] text-ae-400 pt-3 border-t border-ae-200/60">
                <span>${esc(post.author)}</span><span>${fmtDate(post.date)} · ${esc(post.readingTime)}</span>
            </div>
        </div>
    </a>`;
}

function postPage(post, bodyHtml, related) {
  const url = `${SITE}/blog/${post.slug}/`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description: post.excerpt, datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Aerele Technologies Pvt Ltd', logo: { '@type': 'ImageObject', url: `${SITE}/logo-nav.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, url,
    keywords: post.tags.join(', ')
  };
  const ldScripts = [ld];
  if (post.video) {
    const poster = post.videoPoster || `https://i.ytimg.com/vi/${post.video}/maxresdefault.jpg`;
    ldScripts.push({
      '@context': 'https://schema.org', '@type': 'VideoObject',
      name: post.videoTitle || post.title, description: post.excerpt,
      thumbnailUrl: poster, uploadDate: post.date,
      embedUrl: `https://www.youtube-nocookie.com/embed/${post.video}`,
      contentUrl: `https://www.youtube.com/watch?v=${post.video}`
    });
  }
  const tagLine = post.tags.map(t => `<span class="text-[12px] text-ae-400 font-mono">#${esc(t)}</span>`).join('');
  const relatedHtml = related.length ? `
    <section class="py-16 sm:py-20 bg-ae-50 border-t border-ae-200/60">
        <div class="max-w-7xl mx-auto px-6 sm:px-8">
            <p class="text-xs text-ae-400 uppercase tracking-[0.1em] mb-6 font-medium">More from the blog</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${related.map(relatedCard).join('\n                ')}
            </div>
        </div>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(post.title)} – Aerele Blog</title>
    <meta name="description" content="${esc(post.excerpt)}">
    <meta property="og:title" content="${esc(post.title)}">
    <meta property="og:description" content="${esc(post.excerpt)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${SITE}/logo-og.png">
    <meta property="og:site_name" content="Aerele Technologies">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(post.title)}">
    <meta name="twitter:description" content="${esc(post.excerpt)}">
    <meta name="twitter:image" content="${SITE}/logo-og.png">
    <link rel="canonical" href="${url}">
    <link rel="alternate" type="text/plain" href="${SITE}/llms.txt" title="LLM-friendly content">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <meta name="author" content="${esc(post.author)}">
    <meta name="keywords" content="${esc(post.tags.join(', '))}">
    ${ldScripts.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n    ')}
${HEAD_COMMON}
${STYLE}
</head>
<body class="bg-ae-50 text-ae-900 antialiased">

${NAV}

    <!-- ===== HERO ===== -->
    <article>
    <header class="relative pt-28 pb-12 sm:pt-32 sm:pb-14 overflow-hidden bg-ae-900 text-white">
        <div class="absolute inset-0 hero-glow pointer-events-none"></div>
        <div class="relative max-w-3xl mx-auto px-6 sm:px-8">
            <nav class="flex items-center gap-2 text-[12px] text-ae-400 mb-6" aria-label="Breadcrumb">
                <a href="/" class="hover:text-ae-200">Home</a><span aria-hidden="true">/</span>
                <a href="/blog/" class="hover:text-ae-200">Blog</a><span aria-hidden="true">/</span>
                <span class="text-ae-300">${esc(post.category)}</span>
            </nav>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30 mb-5">${esc(post.category)}</span>
            <h1 class="font-semibold tracking-tight leading-[1.15] text-white" style="font-size: clamp(1.5rem, 4vw, 2.75rem);">${esc(post.title)}</h1>
            <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ae-300">
                <span>${esc(post.author)}</span><span class="text-ae-600">·</span>
                <span>${fmtDate(post.date)}</span><span class="text-ae-600">·</span>
                <span>${esc(post.readingTime)}</span>
            </div>
        </div>
    </header>

    <!-- ===== COVER ===== -->
    <div class="bg-ae-50">
        <div class="max-w-3xl mx-auto px-6 sm:px-8 -mt-8 sm:-mt-10 relative z-10">
            <div class="rounded-2xl overflow-hidden border border-ae-200/60 shadow-sm">
                ${coverBlock(post, true)}
            </div>
        </div>
    </div>
${videoBlock(post)}
    <!-- ===== BODY ===== -->
    <div class="bg-ae-50 py-12 sm:py-16">
        <div class="max-w-3xl mx-auto px-6 sm:px-8">
            <div class="prose max-w-none">
${bodyHtml}
            </div>
            <div class="mt-10 pt-6 border-t border-ae-200/60 flex flex-wrap gap-3">${tagLine}</div>
        </div>
    </div>
    </article>
${relatedHtml}

    <!-- ===== CTA ===== -->
    <section class="py-20 sm:py-24 bg-ae-900 text-white relative overflow-hidden">
        <div class="absolute inset-0 hero-glow pointer-events-none"></div>
        <div class="relative max-w-7xl mx-auto px-6 sm:px-8 text-center">
            <h2 class="text-[1.625rem] sm:text-3xl md:text-[2.25rem] font-semibold tracking-tight leading-[1.2] text-white max-w-2xl mx-auto">Want this kind of result on your ERPNext?</h2>
            <p class="mt-4 text-ae-200 max-w-xl mx-auto leading-relaxed">We're active Frappe contributors with 600+ merged PRs. Tell us what you're building.</p>
            <div class="mt-8 flex flex-wrap gap-3 justify-center">
                <a href="/hire-frappe-developer/" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">Work with us <span aria-hidden="true">→</span></a>
                <a href="/products/lens/" class="inline-flex items-center px-5 py-2.5 border border-white/15 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">Explore Lens</a>
            </div>
        </div>
    </section>

${FOOTER}
${MENU_JS}
</body>
</html>
`;
}

// ---- build ----
if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`No content directory at ${CONTENT_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
const posts = [];
const bodies = {};

for (const file of files) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
  const { data, body } = parseFrontMatter(raw);
  const slug = file.replace(/\.md$/, '');
  const post = {
    slug,
    title: data.title || slug,
    excerpt: data.excerpt || '',
    category: data.category || 'Experience',
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    date: data.date || '1970-01-01',
    readingTime: data.readingTime || '',
    author: data.author || 'Aerele Engineering',
    featured: data.featured === true,
    cover: { glyph: data.coverGlyph || '#', tone: data.coverTone || 'navy' },
    video: youtubeId(data.video),
    videoTitle: data.videoTitle || '',
    videoPoster: data.videoPoster || ''
  };
  posts.push(post);
  bodies[slug] = marked.parse(body.trim());
}

posts.sort((a, b) => b.date.localeCompare(a.date));

// write per-post pages
for (const post of posts) {
  const related = posts.filter(p => p.slug !== post.slug).slice(0, 3);
  const dir = path.join(OUT_DIR, post.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), postPage(post, bodies[post.slug], related));
}

// write index data (consumed by blog/index.html)
fs.writeFileSync(path.join(OUT_DIR, 'posts.json'), JSON.stringify({ posts }, null, 2) + '\n');

console.log(`Built ${posts.length} post(s):`);
for (const p of posts) console.log(`  /blog/${p.slug}/ - ${p.title}${p.featured ? '  [featured]' : ''}`);
console.log(`Wrote ${path.relative(ROOT, path.join(OUT_DIR, 'posts.json'))}`);
