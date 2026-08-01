---
title: "GEO and llms.txt: a practical guide for site owners"
description: "What generative engine optimization (GEO) really means, how to write llms.txt, which on-page signals aid citability, and how to treat AI crawlers — without hype or fake AI-traffic scores."
date: "2026-07-30"
updated: "2026-08-01"
tags: ["GEO", "llms.txt", "AI search"]
excerpt: "GEO is citability and clarity under AI answers — not a new keyword-density game. Here’s what a small team can ship this quarter."
---

**GEO** (generative engine optimization) is the practice of making your pages easier for AI systems and answer engines to **understand, trust, and cite**. It overlaps heavily with good technical SEO and clear writing. It is not a secret schema tag that guarantees ChatGPT referrals, and it is not an excuse to stuff pages with “As an AI language model…” filler.

This guide is opinionated toward what a small team can ship in a week: clearer pages, honest provenance, deliberate AI-crawler policy, and a useful `llms.txt`.

## Separate three different “AI” problems

People mash these together and then buy the wrong tool:

| Problem | What you are optimizing for |
| --- | --- |
| **Classic search** | Rankings and clicks in Google/Bing blue links |
| **AI answers / overviews** | Being selected or cited inside generated summaries |
| **Model training crawl** | Whether trainer bots may fetch your content for training corpora |

GEO mostly targets the middle row: **citability under retrieval-augmented or browsing-assisted answers**. Training policy is a licensing and robots.txt decision. Confusing the three leads to blocking every bot and then wondering why nothing cites you — or opening everything and then being surprised by scrapers.

## What GEO is not

- Not a replacement for rankings in classic search
- Not “Domain Authority for AI”
- Not buying fake citations or invented “AI visibility scores”
- Not cloaking a different body to “AI user agents”
- Not guaranteed placement inside a closed model’s answers (treat those pitches like 2012 “page-one guaranteed” SEO)

If a vendor cannot explain *which* surface they measure (training crawl, browsing tool, answer engine UI), walk away.

## What actually helps citability

Answer engines and retrieval systems tend to prefer pages that are:

1. **Fetchable** — not blocked unintentionally in robots.txt  
2. **Clear** — one primary question answered early, in plain language  
3. **Specific** — numbers, dates, definitions, procedures, constraints, failure modes  
4. **Attributed** — who published it, when it was updated, what organization stands behind it  
5. **Consistent** — same facts on the page, in structured data, and on About / Contact  
6. **Stable** — a canonical URL that does not churn every redesign  

That list looks like quality journalism and good documentation because GEO mostly *is* those things under a new acquisition channel.

### On-page patterns that travel well

- Lead with a direct answer, then nuance and caveats  
- Use descriptive headings that match questions people actually ask  
- Prefer original explanations and primary data over spun roundups  
- Mark up `Organization` / `Article` / `Product` only when it matches visible content  
- Keep authors and update dates real — fake “updated today” erodes trust when facts are stale  
- Avoid interstitial walls that block the first useful paragraph from ever rendering

Draft-oriented checks: [GEO Content Checker](/tools/geo-content-checker). Site-wide crawl + citability: [free technical audit](/#home-audit-url) (Site Soul archetypes summarize the pattern without inventing an AI traffic chart).

## llms.txt without the cargo cult

[`llms.txt`](https://llmstxt.org/) is an emerging community convention: a Markdown file at `/llms.txt` that gives language models a curated map of your site — what you are, what matters, which URLs to prefer.

Think of it as a **curated site brief for assistants**, not a ranking factor Google has confirmed. Some tools look for it; many ignore it. That is fine. A short honest file still helps humans, partner integrations, and future crawlers — and it forces *you* to write a non-hallucinated product definition.

### A useful llms.txt usually includes

- One-sentence product definition a stranger would accept  
- Canonical URLs: home, docs or guides, pricing (if any), contact  
- Explicit “what we do **not** do” (reduces invented features in answers)  
- Preferred citation / brand name and a monitored email  
- Policy links when compliance matters in your niche  
- Optional pointers to your best evergreen explainers — not every blog URL ever

### A useless llms.txt

- Pure marketing slogans and superlatives  
- Hundreds of thin affiliate URLs  
- Claims you cannot defend (“#1 AI SEO platform according to us”)  
- Outdated product names after a rebrand  
- A dump of your entire sitemap with no curation  

Our public file: [theseosoul.com/llms.txt](https://theseosoul.com/llms.txt). Keep yours short enough that a human would still finish it.

### Optional companions

Some sites also publish `/llms-full.txt` or deep doc indexes. Only do that if you will maintain them. A stale full dump is worse than a tight root file.

## AI crawlers in robots.txt

Publishers disagree — correctly — about training crawlers versus user-triggered retrieval. Decide the product/legal position first; encode it in robots second.

Agents people commonly call out explicitly:

- GPTBot  
- ClaudeBot / Anthropic-related crawlers  
- Google-Extended (training-related control distinct from Googlebot search crawling — verify current Google documentation when you change policy)  
- PerplexityBot  
- Bytespider  

Blocking training crawlers may be right for your license strategy. Blocking *everything* with `Disallow: /` still breaks classic SEO.

**Verify what you currently declare:** [Robots.txt Checker](/tools/robots-txt-checker).

Also remember: robots.txt is not DRM. Determined scrapers ignore it. It is still the right place for cooperative crawlers and for making your intent legible.

## A one-week GEO workflow

**Day 1 — Foundations.** Fix crawl/index basics: robots, HTTPS, canonical host, sitemap honesty. GEO on a site that is accidentally `noindex` is cosplay.

**Day 2–3 — Ten money pages.** For each, rewrite the first screen so a skeptical reader gets the answer in two sentences, then evidence. Remove fluff intros.

**Day 4 — Provenance.** About page, contact path, Organization schema, real updated dates on evergreen guides.

**Day 5 — llms.txt.** Write the honest brief. Link only URLs you are proud to have cited.

**Day 6 — AI crawler policy.** Document the decision in the repo; deploy robots.txt deliberately.

**Day 7 — Re-audit.** Run a [full audit](/#home-audit-url) and fix anything embarrassing. Schedule a quarterly pass — models and crawlers change faster than most CMS themes.

## How TheSeoSoul fits

We put GEO checks beside meta and technical signals because that is how the work actually happens — not in a separate vanity dashboard. We will not invent an “AI traffic” chart to upsell you.

If you want strategy, you are reading it. If you want a shareable inspection, [run an audit](/#home-audit-url) and send the `/audit/[domain]` link to your team. For adjacent technical hygiene, start with the [launch checklist](/blog/technical-seo-checklist-before-launch).
