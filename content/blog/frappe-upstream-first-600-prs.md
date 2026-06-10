---
title: "What 600+ merged PRs into Frappe taught us about upstream-first work"
excerpt: "Forking is easy; contributing upstream is hard and worth it. The habits that got our patches merged into the framework your ERPNext runs on."
category: Experience
tags: [Frappe, Open Source, Engineering Culture]
date: 2026-04-30
readingTime: 8 min read
author: Aerele Engineering
featured: false
coverGlyph: "{ }"
coverTone: navy
---

When you find a bug or a missing feature in Frappe, you have two choices. Patch it locally and move on, or fix it **upstream** so it lands in the framework for everyone. We've chosen upstream more than 600 times. Here's what that choice taught us.

## The fork tax is real and compounding

A local patch feels faster. It is - once. Then the framework moves, your patch drifts, and every upgrade becomes an archaeology project to figure out what you changed and why. Multiply that across years and a dozen patches and you're maintaining a private fork of Frappe whether you meant to or not.

**Upstream-first is the cheaper option on any timeline longer than a quarter.** The fix becomes the framework's responsibility to keep working, not yours.

## What actually gets a PR merged

Contributing to a project you don't own is a skill. The patches that got merged shared a few traits:

- **Small and single-purpose.** One change, one reason. A 40-line PR with a clear title gets reviewed; a 2,000-line "improvements" PR sits forever.
- **A reproduction, not a description.** "Here's the exact steps and the failing case" moves faster than a paragraph of explanation.
- **Tests that encode the bug.** A test that fails before and passes after does the convincing for you.
- **Respect for the maintainers' constraints.** They're balancing every other user. A fix that's right *for the framework* beats one that's right *for us*.

## It changes how you write code

The surprising part: contributing upstream made our client work better, not slower. When you regularly read and modify the framework's source, you stop guessing about how it behaves. You know which APIs are stable, which are internal, and which are about to change - because you're often the one changing them.

> The team that fixes the framework is the team that understands the framework. There's no shortcut to that understanding.

## Why it matters for the people who hire us

If your business runs on ERPNext, it runs on Frappe. When something breaks deep in the framework, there's a real difference between a team that can only work *around* it and a team that can fix it *at the source* - and has done so hundreds of times.

That's not a marketing line; it's a merge history. And it's the same instinct behind [Lens](/products/lens/): take what we've learned fixing the framework and codify it into something repeatable.

## If you want to start

Pick the smallest real bug you've hit. Reproduce it cleanly. Write the failing test. Open the PR. The first one is the hardest; after that, upstream-first stops being a principle and becomes a habit.
