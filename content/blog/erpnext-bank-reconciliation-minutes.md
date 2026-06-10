---
title: "How we cut ERPNext bank reconciliation from days to minutes"
excerpt: "A finance team was closing books a week late because reconciliation was manual. Here's the ingestion pipeline and matching logic we built on Frappe to make it near-instant."
category: Use Case
tags: [ERPNext, Banking, Automation]
date: 2026-05-14
readingTime: 7 min read
author: Aerele Engineering
featured: false
coverGlyph: "₹"
coverTone: emerald
---

When a client came to us, their month-end close was running a full week late. The cause wasn't the accounting - it was **reconciliation**. One person was matching thousands of bank lines against ERPNext payments by hand, in a spreadsheet, every month.

We rebuilt that process on Frappe. Close now happens on time, and reconciliation is a review step, not a marathon.

## Where the time actually went

Before touching code, we watched the work. The week wasn't spent *deciding* matches - it was spent *finding* them: exporting statements, reformatting columns, scrolling for the payment that matched a credit. The actual judgement calls were a small fraction of the effort.

That's the pattern worth automating: **the mechanical 90%, leaving the human the 10% that needs a decision.**

## The pipeline

We built three pieces inside their existing ERPNext instance:

1. **Ingestion** - bank statements (and a direct feed where the bank supported it) normalized into a single internal format, so downstream logic never cares about the source.
2. **Matching** - a tiered matcher: exact reference match first, then amount + date windows, then fuzzy party matching for the long tail.
3. **Review queue** - anything the matcher wasn't confident about lands in a queue with the top suggestions, one click to confirm.

```python
# Tiered matching - confident matches auto-clear, the rest go to review
for line in statement_lines:
    match = (exact_reference(line)
             or amount_and_date(line, window_days=3)
             or fuzzy_party(line, threshold=0.9))
    line.status = "Matched" if match else "Needs Review"
```

## What made it reliable

The first version matched too eagerly and created wrong reconciliations - worse than doing nothing. Two changes fixed it:

- **Confidence over coverage.** We tuned the matcher to only auto-clear when it was *sure*. A larger review queue beats a single wrong match in the ledger.
- **Idempotent re-runs.** Re-importing a statement never double-counts. Every run is safe to repeat - essential when banks resend files.

## The result

- Reconciliation dropped from **~5 days to under 30 minutes** of review.
- Month-end close moved back **on schedule**.
- The work stopped depending on one person's spreadsheet.

> The lesson we keep relearning: don't automate the judgement. Automate everything around it so the judgement is all that's left.

This is the kind of problem [Lens](/products/lens/) grew out of - codifying the parts of the work that don't need a human, so the senior people spend their time where it counts.
