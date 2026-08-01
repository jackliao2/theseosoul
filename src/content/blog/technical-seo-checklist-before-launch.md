---
title: "Technical SEO checklist before you launch (or relaunch)"
description: "A field-tested pre-launch technical SEO checklist: crawl access, indexation, HTTPS, sitemaps, canonicals, redirects, schema, and GEO — without fake DA scores."
date: "2026-07-28"
updated: "2026-08-01"
tags: ["Technical SEO", "Launch", "Checklist"]
excerpt: "Ship without leaving staging noindex, broken HTTPS, or a silent robots block. Run this the day before you flip DNS — and again an hour after."
---

Launch day is when quiet technical mistakes become public. A polished homepage with `noindex`, a certificate that expires in nine days, or a leftover `Disallow: /` will not show up in a brand review — they show up in Search Console three weeks later, after the campaign already spent the budget.

This is the checklist we use before a site goes live or a redesign cutover. Every item maps to something you can verify with a browser, Search Console, or a free checker. Nothing here depends on invented “Domain Authority,” traffic guesses, or a vendor dashboard turning green.

## Who this is for

- Shipping a new marketing site or docs site
- Moving hosts, CDNs, or CMS themes
- Merging www / non-www or HTTP → HTTPS
- Taking a staging hostname public (or realizing you already did)

If you only have thirty minutes, do sections **1–4**. If you have two hours, finish the list and keep the notes in the release PR.

## 1. Crawl access before keywords

Start with whether crawlers can **fetch** what you want indexed.

Open `https://yourdomain.com/robots.txt` on the **production** host (not the preview URL). Ask:

- Can `User-agent: *` reach `/`?
- Are there leftover staging rules: `Disallow: /`, environment paths, or “block everything until launch”?
- Did a WAF / bot fight start returning soft 403s to Googlebot while browsers still work?

Blocking a specific AI trainer (for example GPTBot) can be a deliberate product choice. Blocking `User-agent: *` with `Disallow: /` on production is almost always an accident copied from preview.

**Verify:** [Robots.txt Checker](/tools/robots-txt-checker) — read Sitemap lines and AI-crawler blocks in one pass.

**Release note to leave yourself:** paste the live robots.txt into the PR so someone notices if CI redeploys the staging file.

## 2. Indexation signals must match intent

Crawlable is not the same as indexable. Teams blur three different instructions and then blame “the algorithm.”

| Signal | Question it answers | Typical intent |
| --- | --- | --- |
| robots.txt `Disallow` | May I **fetch** this URL? | Save crawl budget / keep bots out of infinite spaces |
| `noindex` (meta or `X-Robots-Tag`) | May I **show** this URL in results? | Thank-you, thin, private-ish templates |
| Canonical | Which URL is the **preferred** duplicate? | Consolidate variants |
| Soft 404 / empty template | Does this look like a real page? | Avoid wasting discovery on junk |

Before launch, spot-check templates — not just the homepage:

1. Home, a category/hub, a money page (product, pricing, or flagship article)
2. Thank-you / confirmation
3. Account, cart, or search results if they exist on the public host
4. One parameterized URL you know marketing will share

Production money pages must **not** be noindex. Staging, cart, and thank-you pages usually **should** be noindex (or blocked on purpose — pick one story).

The classic relaunch failure: the CMS keeps preview `noindex` after DNS flips. Catch it before the press release.

**Verify:** [Noindex Checker](/tools/noindex-checker) (reads meta robots **and** `X-Robots-Tag`). Deeper context: [robots vs noindex vs canonical](/blog/robots-txt-vs-noindex-vs-canonical).

## 3. One host story: HTTPS, redirects, certificate days

Pick a single preferred host and enforce it:

- `https://example.com` **or** `https://www.example.com` — not both as equals
- HTTP → HTTPS
- Prefer **one** redirect hop to the final URL (long chains break analytics and patience)

Do not trust “Chrome shows a padlock today.” Check **days remaining** on the certificate. Let’s Encrypt and ACME renewals fail quietly when DNS challenges break after a provider change. CDN edges sometimes keep serving an old cert after the origin renewed.

Add HSTS only after HTTPS is boringly stable — not on day one of a flaky cutover.

**Verify:** [SSL Days Checker](/tools/ssl-checker), [Redirect Checker](/tools/redirect-checker), then [Security Headers Checker](/tools/security-headers-checker). More nuance: [SSL and security headers](/blog/ssl-and-security-headers-for-seo).

## 4. Sitemaps that match reality

A sitemap is a discovery hint, not a ranking lever.

- Serve real XML (`urlset` or `sitemapindex`) — not an HTML soft-404 at `/sitemap.xml`
- Declare it in robots.txt: `Sitemap: https://example.com/sitemap.xml`
- Include only canonical, indexable, **200** URLs on the preferred host
- Exclude staging hosts, thank-you pages, facet explosions, and noindex templates

Submit in Google Search Console and Bing Webmaster Tools after the file is honest. If Search Console reports “Couldn’t fetch,” fix auth, content-type, or XML shape — do not “fix” it by stuffing more URLs into a broken file.

**Verify:** [Sitemap Checker](/tools/sitemap-checker). Long-form: [XML sitemaps that actually help](/blog/xml-sitemaps-that-actually-help).

## 5. Titles, descriptions, and canonicals on primary templates

You do not need perfect marketing copy for every URL on day one. You do need non-broken defaults:

- Unique `<title>` patterns per template type (home ≠ category ≠ article)
- Meta descriptions that are not empty and not identical sitewide
- Self-referencing canonicals on preferred URLs — or deliberate cross-URL canonicals when a variant should consolidate
- No absolute canonicals still pointing at the old domain, staging host, or HTTP

Also open one shared URL in a private window and glance at the [Open Graph Checker](/tools/open-graph-checker) if social launch posts matter on day one. Broken `og:image` will not tank rankings; it will make the launch look unfinished in Slack and LinkedIn.

**Verify:** [Meta Tag Checker](/tools/meta-tag-checker), [Canonical Checker](/tools/canonical-checker) on home, one money page, one content URL.

## 6. Status codes and “looks live” traps

Before you announce:

- Spot-check critical URLs for **200**, not soft 404 HTML with a 200 status
- Confirm custom 404 pages return **404** (or 410 for deliberate removals)
- After migrations, sample old URLs for **301/308** to the new equivalents — not chains of 302s forever
- Pagination / filtered views: either noindex, canonical to a clean view, or blocked from crawl if they explode

If a redesign reused URLs with totally different intent, treat it as a content change, not only a CSS change. Redirect maps belong in the same release as the theme.

## 7. Structured data and GEO without cargo cult

Ship schema that matches **visible** content: `Organization`, `WebSite`, `Article` or `Product` where real. Skip FAQ blocks invented only to chase rich results with keyword-stuffed Q&A nobody asked.

For AI-assisted discovery, a short honest [`llms.txt`](https://theseosoul.com/llms.txt) beats a wall of slogans. GEO is mostly citability and clarity — not a new density game. See [GEO and llms.txt](/blog/geo-llms-txt-practical-guide).

**Verify:** [GEO Content Checker](/tools/geo-content-checker) for drafts; a [full technical audit](/#home-audit-url) for crawl + citability together (including Site Soul archetypes as a readable pattern summary — not a vanity grade).

## 8. Cutover sequence (keep it boring)

1. Freeze changes that alter URL structure for the freeze window.
2. Flip DNS / release with alerts on 5xx and TLS.
3. Immediately re-run: robots, noindex on money templates, SSL days, sitemap, three meta/canonical spot checks.
4. In Search Console, request indexing for a **handful** of priority URLs — not every loc in the sitemap.
5. Watch Pages / indexing reports and crawl stats for a week before you declare victory.
6. Only then enable HSTS preload considerations, aggressive caching, or large IndexNow bursts.

Print this as a release checklist. The team that documents the boring steps is the team that sleeps after launch.

## What we deliberately skip

- Invented Domain Authority, “traffic value,” or backlink theater
- Guaranteeing rankings from a green checklist
- Mass-indexing every audited URL as a growth hack
- Core Web Vitals as a launch blocker for a brochure site (measure them, yes — delay launch for a perfect LCP chase, usually no)

Technical SEO before launch is about **not shooting yourself in the foot**. When crawl, indexation, HTTPS, and discovery are honest, content and distribution can actually compound.

For one shareable pass across meta, structure, technical, and GEO, run a [free TheSeoSoul audit](/#home-audit-url) and keep the `/audit/[domain]` link in the launch channel.
