---
title: "Integrating ERPNext with India's banking rails: production lessons"
excerpt: "NEFT, RTGS, UPI and host-to-host files in a regulated workflow. The retries, idempotency, and audit trails that kept it reliable when money was on the line."
category: Use Case
tags: [ERPNext, Banking, Integrations]
date: 2026-04-12
readingTime: 9 min read
author: Aerele Engineering
featured: false
coverGlyph: "⇄"
coverTone: navy
---

Connecting ERPNext to a bank is not like connecting it to most APIs. The request isn't "fetch some data" - it's "move real money, exactly once, and be able to prove what happened." We've built these integrations into production for several Indian businesses. Here's what the experience taught us.

## The rails aren't one thing

"Bank integration" hides a lot of variety. In India alone we've worked across:

- **NEFT / RTGS** - batch and high-value transfers, often via uploaded files.
- **UPI** - real-time, with its own success/pending/failed lifecycle.
- **Host-to-host (H2H)** - SFTP file exchange with the bank, on the bank's schedule and format.

Each has different timing, different failure modes, and a different definition of "done." The integration layer's job is to hide that variety from ERPNext, so a payment is a payment regardless of how it leaves the building.

## Idempotency is the whole game

The single most important property: **a payment must execute exactly once, even when everything around it is unreliable.** Networks time out. Files get resent. Someone clicks twice.

We give every outgoing instruction a stable, business-derived key and refuse to act on a duplicate:

```python
key = idempotency_key(payment)         # derived from the document, not the clock
if already_submitted(key):
    return existing_result(key)        # safe to retry forever
submit_to_bank(payment, key)
```

If you only take one thing from this post: **derive the key from the document, never from the time of the call.** A retry must produce the same key as the original.

## Reconcile what the bank says, not what you sent

Submitting an instruction is not confirmation. The bank's acknowledgement - a status file, a callback, a statement line - is the source of truth. We treat our side as *pending* until the bank confirms, and we reconcile against the bank's record rather than assuming success.

This matters most for the awkward middle state: instruction sent, no response yet. Treating that as "failed" causes double payments; treating it as "succeeded" hides real failures. It's neither - it's **pending**, and the system has to model that honestly.

## Audit trails are a feature, not a log

In a regulated workflow, "what happened to this payment" must have a complete, tamper-evident answer. Every state change - created, submitted, acknowledged, reconciled, failed - is recorded with who, when, and the raw payload from the bank. When a dispute arrives months later, the answer is one query, not an investigation.

## What we'd tell anyone starting

- **Model the lifecycle explicitly.** Pending is a real state. Design for it.
- **Make every external call retry-safe.** Assume it will be retried, because it will.
- **Keep the bank-specific quirks at the edge.** ERPNext should never know which rail was used.
- **Test the failure paths harder than the happy path.** The happy path was never the problem.

Much of this work is open source in our [india-banking](https://github.com/aerele/india-banking) app - built from exactly these production lessons.
