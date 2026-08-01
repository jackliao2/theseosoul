---
title: "robots.txt vs noindex vs canonical — which signal to use"
description: "Clear rules for when to use robots.txt Disallow, meta/X-Robots noindex, or rel=canonical — and the mistakes that hide pages from Google."
date: "2026-07-29"
tags: ["Crawl", "Indexation", "robots.txt"]
excerpt: "Three different jobs: don’t fetch, don’t index, prefer this URL. Mixing them is how staging leaks and money pages disappear."
---

Teams often treat `robots.txt`, `noindex`, and `rel=canonical` as interchangeable “don’t show this” switches. They are not. Each answers a different question for crawlers — and using the wrong one creates problems that look like “Google hates us” when the site is simply sending mixed instructions.

## The one-line mental model

| Mechanism | Question it answers | Typical effect |
| --- | --- | --- |
| **robots.txt** | May I **fetch** this URL? | Blocks or allows crawling |
| **noindex** | May I **show** this URL in results? | Keeps URL out of the index (if seen) |
| **canonical** | Which URL is the **preferred** one among duplicates? | Consolidates signals to a preferred URL |

If you remember nothing else: **blocking a URL in robots.txt can prevent Google from seeing your noindex.** That is the classic staging foot-gun.

## When to use robots.txt

Use robots.txt when you want to save crawl budget or keep bots out of infinite spaces:

- Faceted navigation that explodes into millions of URLs
- Internal search result pages
- Admin, API, or cart endpoints that should not be fetched at scale
- Non-public file directories

Do **not** rely on robots.txt alone to “deindex” a URL that already ranks. If the URL is already known, blocking fetch may leave a snippet with “blocked by robots.txt” rather than cleanly removing it. Prefer `noindex` (while allowing crawl) for removal, then optionally tighten crawl rules later.

Check live rules with the [Robots.txt Checker](/tools/robots-txt-checker).

## When to use noindex

Use noindex when the page can be fetched but should not appear in search results:

- Thank-you and confirmation pages
- Thin tag archives you are not ready to prune
- Logged-out account shells
- Internal tools accidentally on a public host
- Parameter variants you cannot canonicalize cleanly yet

Sources Google respects in practice:

- `<meta name="robots" content="noindex">` (and googlebot-specific meta)
- `X-Robots-Tag: noindex` on the HTTP response (useful for non-HTML or CDN rules)

Verify both with the [Noindex Checker](/tools/noindex-checker). HTML-only checks miss header-based rules.

## When to use canonical

Use canonical when **multiple URLs show substantially the same content** and you want one preferred address:

- Trailing slash vs non-slash (ideally fix with redirects; canonical as backup)
- Tracking-parameter copies (`?utm_…`) when you cannot strip them earlier
- HTTP vs HTTPS or www vs non-www during a messy migration (still prefer redirects)
- Printer / AMP / partial duplicates when appropriate

Canonical is a **hint** with strong weight when consistent with redirects, internal links, and sitemaps. It is a weak fix for totally different pages. Do not point every blog post at the homepage to “funnel authority” — that pattern is obsolete and often ignored.

Inspect live tags with the [Canonical Checker](/tools/canonical-checker).

## Decision tree (use this in PRs)

1. **Is this URL a duplicate of a better URL?** → Redirect if possible; else canonical to the preferred URL. Keep it indexable unless it is junk.
2. **Should this URL never appear in results, but crawlers may fetch it?** → `noindex` (allow in robots.txt).
3. **Should crawlers not waste time fetching it at all?** → robots.txt `Disallow` (know that noindex on that URL may never be read).
4. **Is it confidential?** → Authentication / network controls. robots.txt is not access control; it is a public suggestion file.

## Mistakes we see weekly

**Staging left open with noindex missing.** Public DNS + indexable theme demo = brand-damaging results.

**Production still Disallow: /.** Especially after copying robots from a private preview.

**noindex + canonical to an indexable URL.** Engines may honor noindex and drop the page rather than transferring everything you hoped for. Pick a story: either this URL is a soft duplicate (canonical, indexable) or it is intentionally excluded (noindex).

**Sitemap includes noindex URLs.** You are asking for discovery of pages you simultaneously reject. Keep sitemaps aligned — see the [Sitemap Checker](/tools/sitemap-checker).

**Canonical chain A → B → C.** Flatten to one preferred URL.

## How this shows up in a full audit

A [TheSeoSoul technical audit](/#home-audit-url) surfaces robots, redirects, meta robots / X-Robots-Tag, and canonical behavior in one shareable report. Use the single-purpose tools when you are debugging one signal; use the audit when the team needs the whole picture without inventing traffic charts.

## Quick reference

- **Remove from results, allow fetch:** noindex  
- **Stop fetch / save budget:** robots.txt  
- **Consolidate duplicates:** canonical (+ redirects when you can)  
- **Hide private data:** auth, not robots.txt  

Clear signals beat clever ones. Search engines are good at interpreting consistent sites and bad at resolving contradictions you introduced under deadline pressure.
