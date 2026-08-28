---
title: "Crawled – currently not indexed: what it actually means"
description: "Google crawled the URL and chose not to index it. How that differs from noindex, robots.txt, and Discovered-not-indexed — and the checks that are worth doing before you hit Request indexing again."
date: "2026-08-28"
tags: ["Indexation", "Search Console", "Crawl"]
excerpt: "Crawled is not a compliment. It means Google fetched the page and still declined to show it. Treat it as a quality or duplicate decision, not a crawl-budget mystery."
cover: "/images/blog/crawled-not-indexed.jpg"
coverAlt: "Illustration of a crawled page left outside an index tray of accepted documents"
---

Search Console’s **Crawled – currently not indexed** status is the one that makes people rebuild a site for no reason. The crawler already visited. The HTML was fetched. Google then decided the URL does not belong in results *right now*.

That is a different job from “Google never found it,” and a different job from “we taped a noindex sign on the door.” Mixing those three is how you spend a week editing robots.txt while the real issue is a thin, duplicate, or brand-new page.

Google’s [Page indexing report](https://support.google.com/webmasters/answer/7440203) describes this bucket as: the URL was crawled, but it isn’t currently indexed — and they may recrawl later. They do **not** promise that hitting Request indexing will override the decision.

If you have not yet ruled out an actual noindex, stop and use [How to find and fix accidental noindex](/blog/find-and-fix-accidental-noindex) first. This article assumes the live HTML is allowed to be indexed.

## Three Search Console states people mash together

| Report status | What already happened | What to check first |
| --- | --- | --- |
| **Crawled – currently not indexed** | Google fetched the URL | Quality, duplication, canonical, usefulness |
| **Discovered – currently not indexed** | Google knows the URL exists; it has not fetched it yet (or not enough) | Internal links, sitemap honesty, crawl capacity |
| **Excluded by ‘noindex’ tag** | Google saw a noindex in HTML or `X-Robots-Tag` | [Noindex checker](/tools/noindex-checker) — meta robots **and** headers |

Related, but not the same:

- **Blocked by robots.txt** — they were asked not to fetch. They cannot see a noindex on a blocked URL. See [robots vs noindex vs canonical](/blog/robots-txt-vs-noindex-vs-canonical).
- **Page with redirect / 404** — they fetched something that is not a 200 indexable document.

A URL can move between “crawled, not indexed” and indexed without you changing a tag. That is normal on a new site. It is also normal when Google thinks it already has a better document for the same intent.

## What this status is *not*

It is not a penalty notice. It is not “your domain is banned.” It is not proof that crawl budget is exhausted — Google [does not recommend obsessing over crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget) unless you run a large, frequently changing site.

It is also not a robots problem you can fix by adding `Allow: /`. They already crawled.

## The useful diagnostic order

Do these in order. Stop when you find a real signal. Do not start with “submit 400 URLs for inspection.”

### 1. Confirm the URL is allowed to be indexed

Fetch the **live** URL the way a crawler would: after redirects, on the final host.

- [Noindex checker](/tools/noindex-checker) — `meta robots`, `googlebot`, `X-Robots-Tag`
- [Robots.txt checker](/tools/robots-txt-checker) — can Googlebot fetch this path?
- [Canonical checker](/tools/canonical-checker) — does `rel=canonical` point at a different URL or host?

If canonical says “the preferred page is over there,” Google indexing *this* URL would be the bug. The crawled-not-indexed row is often Google agreeing with your canonical.

### 2. Ask whether this URL deserves its own result

Google does not owe every valid 200 a blue link. Typical honest reasons:

- Near-duplicate of a stronger page (HTTP/HTTPS, www/apex, parameters, filtered listings)
- Thin utility URL: tag archives, empty search results, boilerplate legal pages
- New site / new section with little unique text and few internal links
- Soft 404 in a 200 (empty cart, “no results,” parked leftover)

The [indexing report](https://support.google.com/webmasters/answer/7440203) also lists reasons they crawled but skipped indexing. Quality and duplication show up more often than a mysterious “crawl budget” story.

### 3. Look at internal links, not another sitemap ping

Google already said it in the [sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview): if pages are properly linked, they can usually discover the site. Sitemaps help the awkward cases; they do not force indexing.

If the only inbound link is the sitemap, the URL is a suggestion. Put a real link on a page people and crawlers already use — then wait.

### 4. Request indexing once, after a real change

URL Inspection → Request indexing is for “I shipped a fix.” It is not a refresh button. If nothing unique changed, you taught Google the same thin document again.

## What I change when this status sits on a money page

- Merge or 301 true duplicates. Do not keep three titles for one intent.
- Write the missing specific: numbers, constraints, failure modes, original examples. Filler paragraphs do not help.
- Make the preferred URL obvious: one canonical, one redirect chain, one internal-link target.
- Un-orphan the page. One contextual link from a related, already-indexed URL beats a homepage footer dump.
- Leave parameter and faceted junk out of the sitemap. See [XML sitemaps that actually help](/blog/xml-sitemaps-that-actually-help).

If the URL is a tool or a form with almost no unique HTML, Google may keep sampling it and still decline. That is a product problem (more unique, stable content around the form), not a meta-tag problem.

## New sites get this a lot

A site that just entered the index often shows **Crawled – currently not indexed** on pages Google fetched during discovery. Some will index on a later pass. Some never will, because they are not distinct enough from the homepage or from each other.

On a second-hand domain, leftover 404s and parked URLs can also sit in this bucket until you [410 the junk](/tools/domain-history) instead of hoping Google forgets it.

For a single URL, the [full technical audit](/#home-audit-url) is the fastest way to see noindex, canonical, robots, and redirects in one report. Use the focused checkers when you already know which signal you are hunting.

## When to stop poking Search Console

If:

- the page is indexable (no noindex, robots allows fetch, canonical is self or intentional)
- it is a distinct document
- it has at least one real internal link
- you already requested indexing after the last substantial change

…then wait. Recrawling the same URL every morning is not a ranking strategy. Indexing is a decision; crawl is only the input.
