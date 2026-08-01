---
title: "Technical SEO checklist before you launch (or relaunch)"
description: "A practical pre-launch technical SEO checklist: crawl access, indexation, HTTPS, sitemaps, canonicals, redirects, and GEO signals — without fake DA scores."
date: "2026-07-28"
tags: ["Technical SEO", "Launch", "Checklist"]
excerpt: "Ship without leaving staging noindex, broken HTTPS, or a silent robots block. Use this checklist the day before you flip DNS."
---

Launch day is when quiet technical mistakes become public. A beautiful homepage with `noindex`, a certificate that expires in nine days, or a `Disallow: /` left over from staging will not show up in a brand mood board — they show up in Search Console three weeks later.

This checklist is what we run mentally before any site goes live (or before a redesign cutover). Every item maps to something you can verify with a browser, Search Console, or a free checker — not a made-up “authority” score.

## 1. Confirm crawlers can fetch what you want indexed

Start with **crawl access**, not keywords.

- Open `https://yourdomain.com/robots.txt`. Can a general crawler reach `/`?
- Search the file for leftover staging rules: `Disallow: /`, environment hostnames, or basic-auth workarounds that no longer apply.
- If you use a CDN or WAF, confirm Googlebot is not rate-throttled into soft 403s.

Use the [Robots.txt Checker](/tools/robots-txt-checker) for a quick read of Sitemap lines and common AI-crawler blocks. Blocking GPTBot is a product choice; blocking `User-agent: *` with `Disallow: /` on production is usually an accident.

## 2. Prove indexation signals match intent

Crawlable ≠ indexable.

| Signal | Typical intent |
| --- | --- |
| robots.txt `Disallow` | “Don’t fetch this path” |
| `noindex` (meta or `X-Robots-Tag`) | “You may fetch, don’t show in results” |
| Canonical to another URL | “Index the preferred URL, not this variant” |
| Soft 404 / thin template | “Looks live, wastes crawl budget” |

Before launch:

1. Spot-check key templates (home, category, product/article, thank-you, account) with the [Noindex Checker](/tools/noindex-checker).
2. Confirm production URLs are **not** noindex.
3. Confirm staging, cart, filter, and thank-you URLs **are** noindex or blocked on purpose.

A common relaunch failure: the CMS keeps `noindex` from the preview environment after DNS flips. Catch it before you announce.

## 3. HTTPS, redirects, and one preferred host

Pick **one** canonical host story and enforce it:

- `https://example.com` **or** `https://www.example.com` (not both as equals)
- HTTP → HTTPS
- Short redirect chains (ideally one hop)

Check certificate **days remaining**, not just “padlock in Chrome today.” Let’s Encrypt renewals fail quietly when DNS or ACME challenges break. The [SSL Days Checker](/tools/ssl-checker) and [Redirect Checker](/tools/redirect-checker) cover the boring half of cutovers.

After HTTPS is stable, add HSTS deliberately — not on day one of a flaky cert. The [Security Headers Checker](/tools/security-headers-checker) shows what you actually return.

## 4. Sitemap discovery that matches reality

A sitemap is a discovery hint, not a ranking lever.

- Serve a real XML `urlset` or `sitemapindex` (not an HTML 404 page at `/sitemap.xml`).
- Declare it in robots.txt with a `Sitemap:` line.
- Include only **canonical, indexable, 200** URLs.
- Exclude staging hosts, parameterized junk, and noindex templates.

Validate with the [Sitemap Checker](/tools/sitemap-checker), then submit in Google Search Console / Bing Webmaster Tools. If Search Console later reports “Couldn’t fetch,” re-check CDN auth and XML content-type — do not “fix” it by stuffing more URLs into a broken file.

## 5. Titles, descriptions, and canonicals on primary templates

You do not need perfect copy for every URL on day one. You **do** need non-broken defaults:

- Unique `<title>` patterns per template type
- Meta descriptions that are not empty or identical sitewide
- Self-referencing or correctly cross-host canonicals
- No accidental absolute canonicals pointing at the old domain

Use the [Meta Tag Checker](/tools/meta-tag-checker) and [Canonical Checker](/tools/canonical-checker) on home, a money page, and a content URL.

## 6. Structured data and GEO without cargo cult

Ship schema that matches visible content: `Organization`, `WebSite`, `Article` / `Product` where real. Skip fake FAQ blocks stuffed with keyword variants.

For AI-assisted discovery, a short honest [`llms.txt`](https://theseosoul.com/llms.txt) beats a wall of marketing claims. Our [GEO Content Checker](/tools/geo-content-checker) is for drafts; the full [technical audit](/#home-audit-url) surfaces citability and crawl signals together — including Site Soul archetypes if you want a readable summary of the pattern, not a vanity grade.

## 7. Cutover day sequence (keep it boring)

1. Freeze content freezes that change URL structure.
2. Flip DNS / release with monitoring on 5xx and TLS.
3. Re-run robots, noindex, SSL days, sitemap, and three template meta checks.
4. Request indexing for a handful of priority URLs in Search Console — not every URL in the sitemap.
5. Watch Coverage / Pages and crawl stats for a week before you declare victory.

## What we deliberately skip

- Invented Domain Authority, “traffic value,” or backlink theater
- Guaranteeing rankings from a green checklist
- Mass-indexing every audited URL as a growth hack

Technical SEO before launch is about **not shooting yourself in the foot**. When the basics are green, content and distribution can actually compound.

When you want one shareable pass across meta, structure, technical, and GEO, run a [free TheSeoSoul audit](/#home-audit-url) and keep the report URL for the team.
