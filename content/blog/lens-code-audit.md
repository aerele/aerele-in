---
title: "Lens Code Audit: catch risky Frappe customizations before they ship"
excerpt: "Most ERPNext upgrade pain starts in custom code. Lens reads your apps the way a senior reviewer would and flags the patterns that break - before they reach production."
category: Product
tags: [Lens, Frappe, Code Review, Migration]
date: 2026-06-02
readingTime: 6 min read
author: Aerele Engineering
featured: true
coverGlyph: "</>"
coverTone: emerald
---

Every long-running ERPNext deployment accumulates custom code: a few server scripts here, an override there, a custom app that quietly grew into the backbone of the business. None of it is a problem - until you try to upgrade, and the things you forgot you wrote start failing in ways nobody can explain.

**Lens Code Audit** is the part of Lens that reads that code the way one of our senior contributors would, and tells you where the risk actually is.

## What it looks at

A code audit isn't a linter. Style nits don't break migrations - *assumptions* do. Lens focuses on the patterns that have actually bitten real ERPNext teams:

- **Private API usage** - calls into framework internals that aren't part of the public contract and move between versions.
- **Monkey-patches and overrides** that silently stop applying when the underlying method changes.
- **Direct SQL** against tables whose schema shifts across releases.
- **Deprecated hooks and fields** that still work today and won't after the next upgrade.
- **Hard dependencies** on app versions that haven't been pinned.

## How a Lens audit runs

Point Lens at a repository or a bench, and it produces a ranked report:

```bash
lens audit ./apps/your_custom_app
# → 4 high, 11 medium, 23 low findings
# → grouped by file, with the upgrade that breaks each one
```

Each finding includes **where** it is, **why** it's risky, and **what to do** about it - not just a rule ID. The output is a shareable report you can hand to a client or drop into a sprint, not a wall of warnings you'll ignore.

## Why this is different

Static analysis tools know the language. They don't know Frappe. The value of Lens is that the rules come from people who have **merged 600+ PRs into the framework** and migrated dozens of production instances - so the audit reflects what actually breaks, weighted by how often it does.

For the findings that genuinely need a human, every Lens plan includes a **30-minute strategy call** with a senior contributor to walk through the report.

## Where it fits

Run a Lens audit:

- **Before quoting a migration** - so your estimate is based on the real surface area, not a guess.
- **Before every major ERPNext upgrade** - to turn a scary weekend into a planned change.
- **On a schedule** - to stop new risky patterns from accumulating in the first place.

Custom code is where the value of an ERPNext deployment lives. Lens makes sure it's not also where the next outage starts.
