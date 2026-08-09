---
title: "GEO and llms.txt: a practical guide for site owners"
description: "A grounded GEO guide: citability vs training crawls, what to put in llms.txt (per llmstxt.org), and how Google-Extended differs from Googlebot — without fake AI-traffic scores."
date: "2026-07-30"
updated: "2026-08-01"
tags: ["GEO", "llms.txt", "AI search"]
excerpt: "GEO is mostly clear writing and fetchable pages. llms.txt is a curated brief — not a Google ranking factor."
cover: "/images/blog/geo-llms-txt.webp"
coverAlt: "Illustration of AI crawlers reading a structured site summary file"
---

“GEO” gets sold like a new religion. Strip the slides and you’re left with something older: make pages easy to fetch, easy to understand, and easy to trust — then decide, deliberately, what AI crawlers are allowed to do.

That’s the version I care about.

## Don’t mash three problems into one

| You’re worrying about… | Different job |
| --- | --- |
| Blue-link SEO | Rankings / clicks in classic search |
| Answers & overviews | Getting cited or selected inside generated answers |
| Training crawls | Whether trainer bots may fetch you for corpora |

GEO, as people mean it in 2026, is mostly the middle row. Training policy is robots + legal. Confusing them is how you `Disallow: /` the whole site and then ask why nobody cites you.

## What actually helps citability

No peer-reviewed “do this meta tag, win ChatGPT” recipe. The boring patterns show up again and again:

- Fetchable (robots isn’t accidentally blocking you)
- Answer up top, nuance after
- Specifics: numbers, dates, constraints, failure modes
- Real publisher identity — About, contact, dates you didn’t fake
- Same facts on the page and in any schema you emit
- A stable canonical URL

If that sounds like good documentation, yes. Draft pass: [GEO Content Checker](/tools/geo-content-checker). Site-wide: [audit](/#home-audit-url).

Skip cloaking a different body to “AI user agents.” That’s the kind of clever that ages into a penalty story.

## llms.txt — useful when it’s honest

The convention is documented at [llmstxt.org](https://llmstxt.org/). Idea in one line: put a Markdown brief at `/llms.txt` so tools that care can learn what your site *is* and which URLs matter.

It is **not** something Google has announced as a ranking factor. Some assistants and scrapers look for it; many ignore it. Still worth writing — mostly because it forces you to describe the product without hallucinating features.

What I put in ours ([theseosoul.com/llms.txt](https://theseosoul.com/llms.txt)):

- One sentence definition a stranger would accept
- Canonical links (home, tools, guides, contact)
- Explicit “what we don’t do”
- A monitored email
- A short list of guides worth citing — not every URL ever

What I delete on sight in other people’s files: slogan salad, “#1 platform” cosplay, affiliate dumps, outdated product names.

Optional `/llms-full.txt` only if you’ll maintain it. Stale full dumps are worse than a tight root file.

## AI crawlers and robots.txt

Product/legal decision first. Robots second.

Google documents its crawlers — including **Google-Extended** — in the [common crawlers list](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers). Their note is worth reading before you paste a viral “block all AI” robots snippet:

> Google-Extended does not impact a site’s inclusion in Google Search nor is it used as a ranking signal in Google Search.

It *does* control whether crawled content may be used for certain Gemini / Vertex training and grounding cases (details on that same page). Search crawling and that control are different levers — don’t confuse them.

Other agents people name explicitly (policies change — verify current docs when you edit robots): GPTBot, Anthropic’s crawlers, PerplexityBot, Bytespider, etc.

Blocking trainers can be the right call. Blocking *everything* still nukes classic SEO. See what’s live today: [Robots.txt Checker](/tools/robots-txt-checker).

Also: robots.txt is not DRM. Cooperative bots honor it; hostile scrapers don’t. It’s still the right place to publish intent.

## A week of work, not a quarter of theater

**Mon** — Crawl/index basics. GEO on a site that’s accidentally noindex is cosplay. Use the [launch checklist](/blog/technical-seo-checklist-before-launch) if you’re mid-migration.

**Tue–Wed** — Ten money pages. First screen answers the query in two sentences, then evidence. Kill fluff intros.

**Thu** — About, contact, Organization schema, honest updated dates.

**Fri** — Write `llms.txt`. Link only URLs you’d be proud to see quoted.

**Whenever you’re ready** — Document AI crawler policy in the repo; deploy robots on purpose, not from a tweet.

Re-audit quarterly. Models and crawlers move faster than most CMS themes.

## Where we fit

We stuck GEO-ish checks next to meta and technical signals because that’s how the work shows up in real audits — not as a separate “AI traffic” chart. We won’t invent one.

Strategy is this page. Inspection is a [free audit](/#home-audit-url). Primary references: [llmstxt.org](https://llmstxt.org/), [Google crawler docs](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers), and ordinary Search Central crawl/index material linked above.
