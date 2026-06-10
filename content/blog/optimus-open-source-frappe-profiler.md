---
title: "We built Optimus to profile our own Frappe work, then open-sourced it"
excerpt: "Optimus started as an internal tool for profiling whole Frappe business flows on client performance work. We made it public as a contribution to the Frappe ecosystem. Here's the story, and what it does."
category: Experience
tags: [Optimus, Open Source, Frappe, Performance]
date: 2026-06-09
readingTime: 6 min read
author: Aerele Engineering
featured: false
coverGlyph: "Δt"
coverTone: navy
---

Most of our performance work starts the same way: a client says a process is slow, and nobody can say exactly *where*. The instinct is to profile a single request. The problem is that a slow ERPNext process is rarely a single request.

**Optimus** is the tool we built to deal with that, and it's now [open source on GitHub](https://github.com/Aerele-RnD/optimus).

## The thing single-request profilers miss

A real business flow in ERPNext fans out. One click submits a document, which queues a background job, which writes to a dozen tables, which fires more hooks. Profile only the HTTP request and you see the fast part. The slow part ran somewhere you weren't looking.

We needed a profiler that followed the whole flow, not one endpoint. When we couldn't find one that fit how Frappe actually runs, we wrote it.

## What Optimus does

Optimus is **flow-aware**. It captures a complete business workflow, including the HTTP requests and the background jobs they trigger, and turns it into something you can act on:

- **Whole-flow capture** so nothing important falls outside the trace.
- **Two reports on purpose**: a customer-safe version with redacted data you can hand to an outside dev shop, and a detailed raw version for your own debugging.
- **Real call trees and queries**, built on pyinstrument call-tree sampling and query analysis, rendered to clean HTML.

It runs where your bench runs. It's Python, pip-installable, and MIT licensed, so no data has to leave your infrastructure.

## Why we made it public

We use Optimus on real client work. It would have been easy to keep it as an internal edge. We open-sourced it for the same reason we send patches upstream instead of forking: **the Frappe ecosystem is the thing our business stands on, and tools that make it easier to run are worth giving back.**

> The team that profiles the framework is the team that understands the framework. We'd rather everyone profiling Frappe have a better starting point than guard ours.

It's the same instinct behind our [600+ merged PRs into Frappe core](/blog/frappe-upstream-first-600-prs/): fix it once, in the open, for everyone.

## If you want to try it

Clone the repo, point Optimus at a slow flow, and read the report. If the finding is "this background job is the problem," you'll see it instead of guessing.

- The code and docs live on [GitHub](https://github.com/Aerele-RnD/optimus).
- A short overview is on the [Optimus product page](/products/optimus/).
- If you'd rather we do the digging, that's our [performance optimization](/erpnext-performance-optimization/) work, and Optimus is one of the tools behind it.

Open source, MIT, and built from the same work we do on the framework every day.
