---
title: "Lens Compatibility Check: know if your apps survive the next ERPNext upgrade"
excerpt: "Upgrades stall on one question - will our customizations still work? Lens answers it up front with a per-app compatibility report against your target version."
category: Product
tags: [Lens, ERPNext, Upgrade, Compatibility]
date: 2026-05-26
readingTime: 5 min read
author: Aerele Engineering
featured: true
coverGlyph: "≅"
coverTone: navy
---

The hardest part of an ERPNext upgrade isn't the upgrade. It's the uncertainty before it: a dozen custom apps, years of customizations, and one unanswered question - **will any of this still work on the new version?**

Teams answer that question the expensive way: clone to a staging bench, upgrade, and find out what breaks by clicking around. **Lens Compatibility Check** answers it before you spend the weekend.

## What it tells you

Give Lens your current stack and a **target version**, and it produces a per-app verdict:

- **Compatible** - nothing in this app references anything that changed.
- **Needs changes** - specific symbols, hooks, or fields that were removed or renamed, with the exact lines.
- **Blocked** - a dependency that doesn't support the target version yet.

```bash
lens compat --target v15
# your_custom_app      needs changes (6)
# india_banking        compatible
# legacy_reports       blocked - depends on frappe < v15
```

## Why it's accurate

A compatibility check is only as good as its map of *what changed between versions*. Lens is built and maintained by a team that **contributes to those changes upstream** - so the diff between releases isn't reverse-engineered, it's known. When a method is deprecated in the framework, Lens knows the release it disappears in and what replaces it.

## What you do with it

The report turns an upgrade from a leap into a checklist:

1. **Scope the work** - count the "needs changes" findings before committing to a date.
2. **Sequence it** - fix blockers (dependencies) first, then the per-app changes.
3. **Prove it's done** - re-run the check until every app reads *compatible*.

> An upgrade you can scope is an upgrade you can schedule. That's the whole point.

## Pair it with the audit

[The Lens code audit](/blog/lens-code-audit/) tells you which custom code is *risky*. The compatibility check tells you which code is *incompatible with a specific target*. Run together, they give you the two things every upgrade plan needs: a risk list and a work list - before anyone touches production.

Stop discovering breakage on staging. Find it in a report instead.
