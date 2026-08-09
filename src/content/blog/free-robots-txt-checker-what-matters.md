---
title: "What a free robots.txt checker should actually tell you"
description: "How to read a robots.txt file like an SEO: path tests by user-agent, the Disallow:/ trap, AI crawlers, Sitemap lines, and what Google’s own docs say checkers often skip."
date: "2026-08-09"
tags: ["robots.txt", "Crawl", "Free tools"]
excerpt: "‘File found’ is useless. You need: can Googlebot fetch /pricing, and did staging leave Disallow: / behind?"
---

Most “robots.txt checkers” on the internet do one of two things. They either dump the file into a text box and call it a day, or they paint a green checkmark because `https://yoursite.com/robots.txt` returned 200. Neither answers the question you actually have at 11pm with Search Console open: **is this URL fetchable for the bot I care about?**

This write-up is the checklist I wish those tools shipped with. You can run it against our [Robots.txt Checker](/tools/robots-txt-checker) (it has a path + user-agent tester), or against any raw file — the logic doesn’t change.

## First: what robots.txt is allowed to mean

Google’s [robots.txt introduction](https://developers.google.com/search/docs/crawling-indexing/robots/intro) is still the cleanest framing:

> A robots.txt file tells search engine crawlers which URLs the crawler can access on your site.

Two consequences people keep forgetting:

1. **Access ≠ indexing.** Blocking fetch does not reliably “hide” a URL from results if other sites link to it. Google says disallowed URLs can still appear, often *without* a snippet.
2. **robots.txt is public.** Anything you list there is a map of paths you care about enough to mention. Don’t put secrets in comments and pretend the web won’t read them.

So when a free checker says “robots.txt present,” smile politely and keep going.

## The only output that matters: path × user-agent

Open your production file. Pick a money URL — `/pricing`, `/blog/your-best-post`, `/products/sku`. Then ask, separately:

- For `Googlebot`, is that path **allowed** or **disallowed**?
- For `Bingbot`?
- For `*` (the default group)?
- For `GPTBot` / `ClaudeBot` / `Google-Extended` if you actually have a policy?

Matching is not “first rule wins.” Google documents [group matching and rule length](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt): within the chosen user-agent group, the **most specific** (longest matching) Allow/Disallow wins; if Allow and Disallow tie on length, Allow wins. Wildcards (`*`) and end anchors (`$`) exist. Empty `Disallow:` means “allow everything” for that group — which has confused more juniors than any algorithm update.

If your checker can’t say:

> Googlebot → `/pricing` → **allowed** (matched `Allow: /pricing`)

…it isn’t doing the job. Ours does; paste the site, set the path, pick the agent, hit test. Same mental model if you’re reading the file by hand.

## The staging leftover that still kills launches

I see this monthly: preview environment had

```txt
User-agent: *
Disallow: /
```

Someone copied the file to production “temporarily.” Marketing hits publish. Homepage looks fine in Chrome. Googlebot gets told to go away.

A checker should surface **sitewide crawl blocks** for `User-agent: *` as a hard failure, not a footnote. “Crawl-all: Blocked” is the right severity. If that’s green on a brand-new domain with zero organic, dig into WAF/bot fights next — but fix the file first.

Related launch checklist: [Technical SEO checklist before you launch](/blog/technical-seo-checklist-before-launch).

## AI crawler lines: mention ≠ block ≠ allow

Vendors love dashboards that scream “GPTBot blocked!” after scanning for a string. Reality is messier:

- Bot **not mentioned** → usually falls under `*` rules (or the crawler’s own defaults).
- Bot **mentioned** with `Disallow: /` → intentional full block for that agent group.
- Bot mentioned with a narrow `Disallow: /wp-admin` → not a full block; don’t celebrate or panic.

Product teams argue about training vs search. Fine. Just don’t ship a PR that blocks `Googlebot` because someone confused it with `Google-Extended`. Those are different tokens; Google documents them separately in their crawler lists.

A useful free checker reports, per known AI agent: mentioned / fully blocked / default. Anything more poetic is marketing.

## Sitemap: lines are part of the robots job

The [robots.txt spec practice](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt) allows `Sitemap:` directives anywhere in the file (they’re not tied to a user-agent group). A checker that ignores them is half-blind.

What you want next to that list:

- Absolute HTTPS URLs when possible
- Files that actually return XML (not an HTML soft-404 theme)
- Agreement with what you submitted in Search Console

Deep dive: [XML sitemaps that actually help](/blog/xml-sitemaps-that-actually-help). Quick dual check: [Sitemap Checker](/tools/sitemap-checker) after you leave the robots tool.

## Things people put in robots.txt that aren’t Google’s job

### noindex in robots.txt

Not supported for Google. Their [block indexing guide](https://developers.google.com/search/docs/crawling-indexing/block-indexing) says so without hedging. If the goal is “don’t show in results,” use meta robots or `X-Robots-Tag`, and **allow crawl** so the tag can be read. Full comparison: [robots.txt vs noindex vs canonical](/blog/robots-txt-vs-noindex-vs-canonical).

### Password protection via Disallow

Cute idea. Fails the moment someone links the URL. Use auth.

### “SEO boost” Allow lists for every folder

You don’t need to Allow the world. Absence of Disallow already allows. Bloated Allow trees are usually generated by plugins that want to look busy.

## A 20-minute robots audit you can repeat

1. **Fetch the live file** — not staging, not a CDN cache of last Tuesday. Incognito or a checker that hits production.
2. **Scan for `Disallow: /` under `*`** — if present, stop and escalate.
3. **Path-test three URLs** you care about for Googlebot: home (`/`), one commercial page, one article.
4. **Path-test one URL you want blocked** (cart, search, filter hell). Confirm the rule actually matches.
5. **Read Sitemap: lines** — open each; confirm XML.
6. **Diff AI policy vs intent** — if legal said “block trainers,” verify the tokens you named; if they said nothing, don’t invent blocks in a panic.
7. **Check internal tooling** — some “security” plugins rewrite robots on deploy. Re-check after the next release.

If step 3 fails on a money page, you don’t have an “SEO content” problem yet. You have a fetch problem.

## How to use TheSeoSoul’s free robots checker without fooling yourself

Workflow I use:

1. Paste the **homepage or any URL on the host** — we resolve origin and load `/robots.txt`.
2. Read the summary: file found? sitewide allow? how many Sitemap lines?
3. Open **Path tester**. Put `/` or a full URL; pick `Googlebot`. Read allowed/blocked + the matched rule line.
4. Switch agent to `GPTBot` (or `*`) and re-test the same path if your policy cares.
5. Skim the AI crawler table — treat “Default” as “no specific group,” not “safe forever.”
6. If the file is huge, remember preview in the UI may truncate; the matcher still uses a large slice of the file. For monster enterprise files, download and diff in git.

Then leave robots and check whether the page is *indexable* separately: [Noindex Checker](/tools/noindex-checker). Fetchable + noindex is a valid state. Blocked + “why isn’t noindex working?” is the classic self-own Google already documented.

## Host mismatches: the silent second robots.txt

Apex serves one file. `www` serves another. A marketing subdomain serves a third that still says `Disallow: /` from an old Heroku app. Your checker is only as honest as the **origin you pointed it at**.

When someone swears they “fixed robots” and Google still shows blocked:

1. Note the host in the Coverage URL.  
2. Fetch `https://that-exact-host/robots.txt`.  
3. Path-test on that host, not the one in your browser bookmark.

CDN configuration that rewrites robots per environment is especially good at this. If your deploy pipeline uploads `robots.production.txt` → `/robots.txt`, confirm the upload step ran on the project that owns the custom domain — not only on the preview project.

## Real rules that look wrong until you test them

### Trailing wildcards

`Disallow: /*?` styles of rule (syntax varies by engine; Google supports `*` and `$` as documented) are often meant to cut parameter sprawl. They also catch legitimate URLs that happen to carry a tracking query. Path-test the **exact** URL from your sitemap or ad platform, query string included. Our normalizer keeps search strings when you paste a full URL into the path tester.

### Allow exceptions inside a Disallowed tree

```txt
User-agent: *
Disallow: /folder/
Allow: /folder/public.pdf
```

Whether `/folder/public.pdf` is fetchable depends on longest-match rules. Don’t argue from intuition — paste both `/folder/` and `/folder/public.pdf` into the tester. I’ve watched legal and SEO debate this for an hour when a ten-second check would have ended it.

### Separate groups for Googlebot-Image / AdsBot

Google publishes several agent names. Blocking `Googlebot` is not identical to blocking every Google fetcher. If Shopping or Ads folks report fetch failures while “Googlebot can access /” looks green, widen the agent list in your tests. Don’t copy a random “block all bots” gist into production and hope Ads still works.

## When the checker is green and Search Console still cries

Possible, because robots is only one door:

- Soft 403 / challenge pages for datacenter IPs while Chrome works
- DNS or TLS failures on the host Google crawls
- Correct robots, wrong host (`www` vs apex) and you’re staring at the other file
- “Blocked by robots.txt” in Coverage for URLs you **meant** to block — that’s success, not an outage
- “Blocked by robots.txt” for URLs you need indexed — fix the rule, request a crawl after deploy

Coverage is not a vibe check. Match the exact URL Search Console shows against your path tester.

### A note on crawl budget theater

People Disallow half the site to “save crawl budget,” then wonder why new product URLs take forever to appear. On small and medium sites, budget anxiety is usually misplaced — Google’s own public commentary has cooled the myth for years. Block fetch when the URLs are infinite junk or expensive to serve. Don’t block fetch on content you want discovered just to make a log file prettier.

## What I ignore in competitor checkers

- Letter grades for “robots.txt SEO score”
- Advice to Disallow CSS/JS (ancient; Google needs assets to render)
- Claims that a perfect robots file will raise rankings by itself
- Auto-generated files that Disallow half of WordPress “just in case”

Crawl control is plumbing. Plumbing either leaks or it doesn’t. A free checker earns its keep when it shows the leak with a path, an agent, and a rule line — not when it awards you a badge.

## Related tools and reading

- [Robots.txt Checker](/tools/robots-txt-checker) — path + UA tester  
- [Noindex Checker](/tools/noindex-checker) — meta + `X-Robots-Tag`  
- [Sitemap Checker](/tools/sitemap-checker) — nested indexes + sample URL probes  
- [Full technical audit](/#home-audit-url) — when you want robots in context with TLS, canonicals, and on-page  

Primary sources: [Google robots.txt intro](https://developers.google.com/search/docs/crawling-indexing/robots/intro), [robots.txt specification as Google interprets it](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt), [block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing). If a SaaS blog disagrees with those three, keep the Google tabs open.
