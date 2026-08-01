---
title: "XML sitemaps that actually help (and how to validate them)"
description: "Practical XML sitemap guidance with Google Search Central and sitemaps.org references: when you need one, what to exclude, lastmod honesty, and Search Console errors."
date: "2026-07-31"
updated: "2026-08-01"
tags: ["Sitemaps", "Crawl", "Technical SEO"]
excerpt: "Google already said it: good internal links discover most sites. Sitemaps help the awkward cases — if the file isn’t lying."
---

People treat sitemaps like a ranking cheat code. They’re not. They’re a hint list: “these URLs exist; please consider them.”

Google’s [sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) says the quiet part:

> If your site’s pages are properly linked, Google can usually discover most of your site.

And then — usefully — when you *might* need one: large sites, new sites with few external links, lots of media/news you care about in Search. Also when you might *not*: roughly ≤500 important pages, strong internal linking, no special media needs.

If you only remember one rule from me: **a smaller honest sitemap beats a bloated dishonest one.**

## urlset vs index

Per the [sitemaps.org protocol](https://www.sitemaps.org/protocol.html), you’ve got:

- **urlset** — list of URLs  
- **sitemap index** — list of other sitemap files (size splits, sections, locales)

Both fine. HTML at `/sitemap.xml` pretending to be a map is not fine. That soft-404 costume burns hours.

Size ceilings in the protocol (50,000 URLs / 50MB uncompressed per file) are why indexes exist. Don’t invent your own “unlimited” file and hope.

## Discovery paths

1. robots.txt: `Sitemap: https://example.com/sitemap.xml`  
2. Search Console / Bing submit  
3. Conventional `/sitemap.xml` (helpful, not sufficient alone)

Google’s build docs also cover submitting and formats — start from [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) once the file is real XML.

Check both file + robots declaration: [Sitemap Checker](/tools/sitemap-checker), [Robots.txt Checker](/tools/robots-txt-checker).

## Include / exclude (the part teams skip)

**Include:** preferred host, HTTPS, 200s, indexable, actually important.

**Exclude:** thank-you, cart, account, internal search, facet explosions, staging hosts, URLs that only redirect (list the destination), noindex templates, anything robots.txt disallows.

If the sitemap and noindex disagree, you trained Search Console to distrust you. Canonical story should agree too — Google treats sitemap inclusion as a *weak* canonical signal in their [canonicalization guide](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), and they warn against conflicting canonical techniques.

## lastmod, priority, changefreq

Be honest or omit.

`priority` and `changefreq` have been shrugged at for years in practice; don’t spend engineering time generating decorative fiction.

`<lastmod>` helps when it’s true. Fake “updated daily” trains systems to ignore your dates. Google’s sitemap docs discuss lastmod in the build guidance — the spirit is accuracy, not theater.

## Validation after deploys that touch URLs

1. Fetch `/sitemap.xml` + every robots `Sitemap:` URL  
2. Confirm XML, not HTML  
3. Sample locs for wrong host / HTTP leftovers / UTM junk  
4. Spot-check five URLs for status, canonical, noindex  
5. *Then* submit or re-submit in Search Console  

Steps 1–3: [Sitemap Checker](/tools/sitemap-checker). Step 4: [Noindex](/tools/noindex-checker), [Canonical](/tools/canonical-checker).

## Search Console messages, decoded

**Couldn’t fetch** — wrong URL, auth, non-XML, edge timeout. Fix fetch first.

**Sitemap is HTML** — theme soft-404. Fix the route.

**URL not allowed** — often host mismatch or robots disallow.

**Submitted URL noindex / wrong canonical** — stop resubmitting the contradiction; fix the page or remove the loc.

**Discovered but not indexed** — discovery worked. Quality/demand problem now. Submitting harder won’t save thin pages.

## Migrations

New host → new sitemap with new locs only. Redirect old URLs. Don’t keep advertising a dead map on the old host forever. Change-of-address in Search Console where it applies; sitemaps alone aren’t a migration plan.

## Myths

More URLs ≠ more traffic. Sitemap ≠ guaranteed indexing. Image/video sitemap extensions help those surfaces ([Google’s overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) covers why media/news sites care) — they don’t fix empty HTML. CMS default sitemaps are often full of junk after a year of plugins; always sample.

For the whole technical picture: [audit](/#home-audit-url). For sitemap-only: [Sitemap Checker](/tools/sitemap-checker). Spec roots: [sitemaps.org](https://www.sitemaps.org/protocol.html) + [Search Central sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
