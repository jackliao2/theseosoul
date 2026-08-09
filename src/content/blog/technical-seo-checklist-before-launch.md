---
title: "Technical SEO checklist before you launch (or relaunch)"
description: "A pre-launch technical SEO checklist grounded in Google’s own crawl/index docs: robots, noindex, HTTPS, sitemaps, canonicals — plus what to re-check an hour after DNS flips."
date: "2026-07-28"
updated: "2026-08-01"
tags: ["Technical SEO", "Launch", "Checklist"]
excerpt: "Most launch disasters aren’t ‘the algorithm.’ They’re staging noindex, a dead cert, or Disallow: / that nobody re-read."
cover: "/images/blog/launch-checklist.webp"
coverAlt: "Illustration of a pre-launch technical checklist with HTTPS and crawl checks"
---

I’ve lost count of how many “SEO emergencies” were just a staging leftover. Pretty homepage. Press email already sent. Then someone notices `noindex`, or `Disallow: /`, or a certificate that dies mid-campaign.

This is the list I want in the release PR the day before DNS flips — and again about an hour after. Every step is something you can check without buying a fake “authority” score.

## 1. Can crawlers even fetch the site?

Open the **production** robots file: `https://yourdomain.com/robots.txt`.

Google’s own intro is blunt about what robots.txt is *not*: it’s for managing crawl traffic, not a reliable way to hide pages from Search. From [Google’s robots.txt guide](https://developers.google.com/search/docs/crawling-indexing/robots/intro):

> Don’t use a robots.txt file as a means to hide your web pages… from Google Search results.

So for launch, the question is simpler: did we accidentally ban everyone?

- Is `User-agent: *` still sitting on `Disallow: /` from preview?
- Any path rules that made sense on staging and make no sense now?
- If you’ve got a WAF, has “bot fighting” started soft-403’ing Googlebot while Chrome still looks fine?

Blocking one AI trainer on purpose is a product call. Shipping production with a full-site disallow is usually copy-paste.

Quick pass: [Robots.txt Checker](/tools/robots-txt-checker).

## 2. Indexation matches what you meant

Crawlable ≠ indexable. People mash these together constantly.

Google’s [noindex docs](https://developers.google.com/search/docs/crawling-indexing/block-indexing) say they have to **crawl** the page to see the rule:

> We have to crawl your page in order to see `<meta>` tags and HTTP headers.

And if robots.txt blocks the URL, they can’t see the tag — same doc, same trap.

Before launch, don’t only check the homepage. Hit:

1. Home + one money page (pricing, product, flagship article)
2. A thank-you / confirmation URL
3. Account, cart, or on-site search if those are public
4. One ugly parameterized URL marketing will share anyway

Money pages: not noindex. Thank-you / cart junk: usually noindex on purpose.

The relaunch classic: CMS keeps preview `noindex` after go-live. I’ve seen it survive two “final” QA passes because everyone tested logged-in preview URLs.

Check both meta and `X-Robots-Tag`: [Noindex Checker](/tools/noindex-checker). Longer write-up: [robots vs noindex vs canonical](/blog/robots-txt-vs-noindex-vs-canonical).

## 3. One host, HTTPS, certificate days

Pick `www` or apex. Not both as equals. HTTP should land on HTTPS in one hop if you can help it.

Google prefers HTTPS when signals aren’t a mess — see their notes on [canonicalization and HTTPS](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) (invalid certs and HTTPS→HTTP redirects are called out as ways to screw that up). HTTPS as a ranking signal goes back to their [2014 announcement](https://developers.google.com/search/blog/2014/08/https-as-ranking-signal); the operational point in 2026 is still: don’t ship a flaky cert.

Don’t trust “padlock in my browser.” Check **days remaining**. Let’s Encrypt renewals die quietly when DNS challenges break after a provider swap. CDNs sometimes keep serving the old leaf after origin renewed.

HSTS comes *after* HTTPS is boring. Not during the cutover chaos.

Tools: [SSL Days Checker](/tools/ssl-checker), [Redirect Checker](/tools/redirect-checker), [Security Headers Checker](/tools/security-headers-checker).

## 4. Sitemap that isn’t lying

Google’s [sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) is refreshingly modest:

> If your site’s pages are properly linked, Google can usually discover most of your site… Even so, a sitemap can improve the crawling of larger or more complex sites…

So: discovery helper, not a ranking lever.

Also from that page — you might *not* need one if the site is small (~500 pages) and well linked. Plenty of brochure launches still benefit from a clean `/sitemap.xml` plus a robots `Sitemap:` line, especially when the site is new and barely linked.

Rules of thumb I actually use:

- Real XML, not an HTML soft-404 wearing a sitemap URL
- Only preferred-host, 200, indexable URLs
- No thank-you pages, staging hosts, or facet explosions
- Declare it in robots.txt

Validate: [Sitemap Checker](/tools/sitemap-checker). Deeper notes: [XML sitemaps that actually help](/blog/xml-sitemaps-that-actually-help).

## 5. Titles, descriptions, canonicals on the templates that matter

Day-one copy doesn’t need to win awards. It does need to not be broken.

- Titles that aren’t identical on every template
- Descriptions that aren’t empty sitewide
- Canonicals that don’t still point at staging or the old domain
- Absolute canonical URLs (Google [recommends against relying on relative ones](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) long-term)

Spot-check home, one money URL, one article with [Meta Tag Checker](/tools/meta-tag-checker) and [Canonical Checker](/tools/canonical-checker). If social posts go out launch morning, glance at [Open Graph](/tools/open-graph-checker) so you don’t share a blank card.

## 6. Status codes that match reality

Soft 404s with a 200 status are launch goblins. Custom error pages should return real 404/410. Old URLs after a redesign should 301/308 to the new ones — not a decorative chain of temporary redirects.

If the redesign reused URLs for totally different intent, that’s a content migration, not a CSS deploy. Put the redirect map in the same PR as the theme.

## 7. Schema and GEO without the cosplay

Ship `Organization` / `WebSite` / real `Article` or `Product` markup when the page content matches. Skip FAQ blocks invented only to chase rich results.

For AI-ish discovery, a short honest [`llms.txt`](https://llmstxt.org/) beats a slogan dump. More on that in [GEO and llms.txt](/blog/geo-llms-txt-practical-guide).

Draft check: [GEO Content Checker](/tools/geo-content-checker). Whole-site pass: [free audit](/#home-audit-url).

## Cutover day (boring on purpose)

1. Freeze URL-structure changes for the window.
2. Ship with 5xx + TLS alerts on.
3. Re-run robots, noindex on money templates, SSL days, sitemap, three meta/canonical spot checks.
4. In Search Console, request indexing for a *handful* of priority URLs — not the whole sitemap.
5. Watch indexing reports for a week before you declare victory.
6. *Then* get cute with HSTS preload, aggressive cache, bulk pings, etc.

## What I’m not promising

A green checklist does not buy rankings. It stops you from donating the first month to avoidable crawl/index accidents. When those are clean, content and distribution can do their jobs.

If the team wants one shareable pass, run a [TheSeoSoul audit](/#home-audit-url) and drop the `/audit/[domain]` link in the launch channel.
