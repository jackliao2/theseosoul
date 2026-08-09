---
title: "robots.txt vs noindex vs canonical — which signal to use"
description: "When to use robots.txt, noindex, or rel=canonical — with Google Search Central citations, the robots-blocks-noindex trap, and a PR decision tree."
date: "2026-07-29"
updated: "2026-08-01"
tags: ["Crawl", "Indexation", "robots.txt"]
excerpt: "Three different jobs. The expensive mistake is blocking fetch so Google never sees your noindex."
cover: "/images/blog/robots-vs-noindex.webp"
coverAlt: "Three-way diagram contrasting crawl, index, and canonical signals"
---

When someone says “just block it in robots,” I get suspicious. Same when they slap `noindex` on a duplicate that should have been a redirect. These three controls answer different questions. Mix them and Search Console starts telling a story that sounds like “Google is broken.”

## Three questions

| Control | Real question |
| --- | --- |
| **robots.txt** | May this crawler **fetch** the URL? |
| **noindex** | If fetched, may it **appear in results**? |
| **canonical** | Among near-duplicates, which URL should win? |

### The trap Google documents explicitly

From [Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing):

> Another reason could also be that the robots.txt file is blocking the URL from Google web crawlers, so they can’t see the tag. To unblock your page from Google, you must edit your robots.txt file.

Same idea in the [robots meta specification](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag):

> If a page is disallowed from crawling through the robots.txt file, then any information about indexing or serving rules will not be found and will therefore be ignored.

So: if you want `noindex` to work, Google has to be allowed to crawl the page.

And no — sticking `noindex` inside robots.txt is not a Google-supported move. Their noindex doc says that outright: specifying noindex in robots.txt is **not supported**.

## When robots.txt is the right tool

Use it to save crawl budget or keep bots out of infinite junk:

- Faceted nav that multiplies forever
- Internal search results
- Admin/API/cart paths you don’t want fetched at scale
- Huge file trees that somehow ended up public

Also remember Google’s warning from the [robots.txt intro](https://developers.google.com/search/docs/crawling-indexing/robots/intro): a disallowed URL can still show up in results *without a snippet* if it’s linked elsewhere. Robots is not a vault. Password protection or noindex (with crawl allowed) are the real “keep it out” tools depending on the goal.

Live check: [Robots.txt Checker](/tools/robots-txt-checker). Longer field guide: [What a free robots.txt checker should tell you](/blog/free-robots-txt-checker-what-matters).

## When noindex is the right tool

Thank-you pages. Empty account shells. Thin tags you’re not ready to delete. Parameter junk you can’t canonicalize cleanly yet.

Two supported implementations ([same Google doc](https://developers.google.com/search/docs/crawling-indexing/block-indexing)):

- `<meta name="robots" content="noindex">`
- `X-Robots-Tag: noindex` (handy for PDFs / edge rules)

`none` means `noindex, nofollow`. Fine on a true dead-end thank-you page. Annoying when a plugin paints it across half the site.

Verify HTML **and** headers: [Noindex Checker](/tools/noindex-checker). If you suspect a staging leftover: [Find and fix accidental noindex](/blog/find-and-fix-accidental-noindex).

## When canonical is the right tool

Duplicates / near-duplicates. Tracking params. Print views. Messy host variants while redirects aren’t finished.

Google’s [canonicalization guide](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) ranks signals roughly like this: redirects (strong) → `rel=canonical` (strong) → sitemap inclusion (weak). They also say methods stack — agreement helps.

A few lines from that doc worth tattooing on plugin settings:

- Don’t use robots.txt for canonicalization.
- Don’t use noindex as your in-site “pick a winner” trick — it blocks the page from Search entirely; canonical is preferred for duplicates.
- Don’t tell different canonical stories in the sitemap vs the `rel=canonical` tag.
- Prefer absolute canonical URLs.
- Self-referential canonicals on the preferred page are encouraged.

Canonical is a hint with weight. It is not “point every blog post at the homepage for juice.” If the content isn’t duplicative, that pattern mostly gets ignored — and it deserves to be.

Check: [Canonical Checker](/tools/canonical-checker).

## PR decision tree

1. **Secret?** Auth / network controls. Stop. Robots.txt is public.
2. **URL should move forever?** Redirect. Update internal links. Sitemap the destination.
3. **Duplicate of a better URL?** Prefer redirect; else canonical. Keep it indexable unless it’s junk.
4. **Should never appear in results, but fetch is OK?** `noindex`, and allow crawl until it’s gone.
5. **Fetch is pure waste?** robots.txt `Disallow` — accept that noindex on that URL may never be read.

If two answers fight each other, write the tradeoff in the PR. Silent contradictions are how staging leaks.

## Weekly leftovers

- Staging open, noindex missing → brand search result for a half-built theme.
- Production still `Disallow: /` after copying preview robots.
- `noindex` **and** canonical to an indexable URL — pick a story; Google’s docs prefer canonical for duplicates, noindex for “remove me.”
- Sitemap lists noindex URLs ([Sitemap Checker](/tools/sitemap-checker)).
- Canonical chain A→B→C.
- Blocked in robots **and** advertised in the sitemap.

## Fifteen-minute debug

1. Final URL + status — [Redirect Checker](/tools/redirect-checker)  
2. robots — [Robots.txt Checker](/tools/robots-txt-checker)  
3. meta + X-Robots-Tag — [Noindex Checker](/tools/noindex-checker)  
4. canonical — [Canonical Checker](/tools/canonical-checker)  
5. sitemap sample — [Sitemap Checker](/tools/sitemap-checker)  

If those disagree, fix the disagreement before you rewrite the blog strategy.

Whole-site view: [technical audit](/#home-audit-url). Primary sources above are on [Google Search Central](https://developers.google.com/search/docs) — start there when a vendor contradicts them.
