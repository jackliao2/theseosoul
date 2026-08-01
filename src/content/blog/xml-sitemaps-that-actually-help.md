---
title: "XML sitemaps that actually help (and how to validate them)"
description: "How to build, declare, and validate XML sitemaps: urlset vs index, robots.txt Sitemap lines, what to exclude, and common Search Console errors."
date: "2026-07-31"
tags: ["Sitemaps", "Crawl", "Technical SEO"]
excerpt: "Sitemaps do not rank pages. They discover the right ones. Here’s how to keep yours honest and fetchable."
---

An XML sitemap is a **hint list** for crawlers: “these URLs exist and matter.” It will not overcome thin content, `noindex`, or a site that returns 500s. Used well, it speeds discovery after launches and migrations. Used poorly, it teaches Search Console to distrust you.

## urlset vs sitemap index

- **urlset** — a file of page URLs (`<url><loc>…`).  
- **sitemapindex** — a file of *other sitemap files*, used when you exceed size/URL limits or split by section (blog, products, videos).

Both are valid. Serving HTML at `/sitemap.xml` (a soft 404 theme page) is not.

## Discovery paths that matter

1. robots.txt `Sitemap: https://example.com/sitemap.xml`  
2. Search Console / Bing manual submit  
3. Internal links and prior crawls (still primary for many URLs)

If robots.txt is silent and you never submit, crawlers may still find a conventional `/sitemap.xml` — but declaring it removes guesswork. Validate both with the [Sitemap Checker](/tools/sitemap-checker) and [Robots.txt Checker](/tools/robots-txt-checker).

## What to include

Include URLs that are:

- Canonical (or the preferred host you want indexed)  
- Returning **200** for Googlebot  
- Indexable (not noindex)  
- Representative of real content you care about  

### What to leave out

- Thank-you, cart, account, internal search  
- Facet explosions and sort parameters  
- Staging hosts and preview URLs  
- Redirecting URLs (list the final destination instead)  
- Infinite calendar archives you do not want crawled

A smaller truthful sitemap beats a bloated one full of junk.

## Size and hygiene rules (practical)

- Stay under common limits (~50k URLs or 50MB uncompressed per file); split with an index when needed.  
- Keep `<lastmod>` honest if you send it — fake daily bumps train systems to ignore you.  
- UTF-8, absolute `https` locs, consistent host.  
- Update generation in CI or your CMS — stale sitemaps after a migration are a classic miss.

## Validation workflow

1. Fetch `/sitemap.xml` and any robots-declared URLs.  
2. Confirm XML shape (urlset vs index), not HTML.  
3. Sample locs for wrong hosts or leftover UTM copies.  
4. Spot-check five URLs for status, canonical, and noindex.  
5. Submit in Search Console; fix “Couldn’t fetch” / “Has errors” before adding more URLs.

Our [Sitemap Checker](/tools/sitemap-checker) covers steps 1–3 quickly. Pair with [Noindex](/tools/noindex-checker) and [Canonical](/tools/canonical-checker) for step 4.

## Migrations

During a domain or HTTPS move:

1. New sitemap on the **new** host with new locs only.  
2. Redirects from old locs (don’t list dead URLs as if live).  
3. Update robots `Sitemap:` lines on both hosts carefully — old host should not keep advertising a dead map forever.  
4. Use Search Console change-of-address where applicable; sitemaps alone are not a migration plan.

## Myths

- “More URLs in the sitemap = more traffic.” No.  
- “Sitemap guarantees indexing.” No.  
- “Images/video sitemaps replace on-page discovery.” They help specific surfaces; they do not fix blank pages.

When you want sitemap presence next to the rest of technical SEO, run a [full audit](/#home-audit-url). For a focused pass, start at the [Sitemap Checker](/tools/sitemap-checker).
