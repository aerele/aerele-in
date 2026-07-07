---
title: "Why we built Lens - codifying migration audits into software"
excerpt: "Years of migration reviews turned into a tool. What we automated, what still needs a senior human, and what we learned shipping our first product."
category: Experience
tags: [Lens, Product, Frappe]
date: 2026-03-20
readingTime: 5 min read
author: Aerele Engineering
featured: false
coverGlyph: "◎"
coverTone: emerald
---

For years, one of our most valuable services was also our least scalable: a senior engineer reading a client's Frappe customizations before a migration and writing up what would break. It was accurate, it was trusted - and it lived entirely in people's heads.

**Lens** is what happened when we decided to write that knowledge down as software.

## The bottleneck was expertise, not effort

The audit itself wasn't slow because the work was hard to *do*. It was slow because only a few people could do it well. The judgement - "this override is fine, that one is a time bomb" - came from having seen the same patterns fail across dozens of instances.

That's a classic codification opportunity: **the expensive part is a pattern, and patterns can be encoded.**

## What we automated

We started by listing every recurring finding from past audits and asking, for each: *can a tool detect this reliably?* A surprising amount could:

- Private API usage and internal calls
- Overrides and monkey-patches that silently stop applying
- Deprecated hooks and fields
- Direct SQL against shifting schemas
- Dependency version mismatches

These became the [code audit](/blog/lens-code-audit/) and [compatibility check](/blog/lens-compat-check/) at the core of Lens.

## What we deliberately didn't automate

Some judgement doesn't reduce to a rule - *should* this customization exist at all, what's the right migration strategy, how risky is this for **your** business specifically. Pretending a tool can answer those would make Lens less trustworthy, not more.

So every Lens plan includes a **30-minute call with a senior contributor**. The tool does the exhaustive, mechanical reading; the human does the strategy. Neither pretends to be the other.

> We didn't build Lens to replace the expert. We built it so the expert spends their thirty minutes on the decisions, not on scrolling through files.

## What shipping a product taught a services team

Building software *for* the work is different from doing the work. A few things we learned:

- **A report people will act on beats a report that's complete.** Ranking and clarity mattered more than catching everything.
- **Wrong findings cost trust fast.** We tuned hard for precision over recall - a false alarm is worse than a quiet miss.
- **The hard part was naming the knowledge,** not coding it. Once a pattern was written down clearly, the implementation was the easy half.

Lens is our first product, and it came from the most honest place a product can: a thing we were already good at, finally written down. You can [see what it does here](/products/lens/).
