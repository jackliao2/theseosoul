---
title: "SSL days and security headers — what actually matters for SEO"
description: "TLS certificate days and HTTPS hygiene first; HSTS/CSP second. With Google HTTPS guidance and MDN header references — no fake ‘security SEO score.’"
date: "2026-07-31"
updated: "2026-08-01"
tags: ["HTTPS", "SSL", "Security headers"]
excerpt: "Expired certs create interstitials. Missing CSP usually doesn’t. Fix days remaining before you debate header trivia."
---

Security-and-SEO conversations go off the rails when someone opens with CSP theater while the certificate dies in nine days.

Users and crawlers need a trustworthy HTTPS endpoint. That’s the job. Headers help browsers. They are not a substitute for “is TLS actually valid on the hostname people hit?”

## Blast radius order

1. **Expired / mismatched cert** — interstitial city  
2. **HTTP/HTTPS/www chaos** — duplicates, analytics splits, canonical fights  
3. **Mixed active content** — broken scripts on an “HTTPS” page  
4. **Missing headers** — real hardening value; weak *direct* ranking drama for most brochure sites  

Reorder your backlog if #4 is scheduled before #1.

## Certificate days (the unsexy KPI)

Automation fails. ACME DNS challenges break after a provider change. The CDN keeps the old leaf after origin renews. I’ve watched teams debug “SEO drops” that were just browsers screaming about TLS.

Habits that prevent the pager:

- Track **days remaining**, not only today’s padlock  
- Alert humans before ~21 days  
- Probe the **edge**, not only origin  
- Check apex *and* www if both resolve  
- Keep redirect chains short and ending on `https://` of the preferred host  

Google’s canonicalization docs note that an **invalid SSL certificate** is one of the ways HTTPS can lose to HTTP in their preference logic — see [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls). Separately, HTTPS as a ranking signal was announced in Google’s [2014 HTTPS post](https://developers.google.com/search/blog/2014/08/https-as-ranking-signal). The 2026 ops lesson is still: don’t ship flaky TLS.

Check: [SSL Days Checker](/tools/ssl-checker). Host moves: also [Redirect Checker](/tools/redirect-checker).

## HTTPS migration hygiene

1. Pick one canonical host  
2. HTTP → HTTPS (+ non-preferred host → preferred)  
3. Update internal links, canonicals, sitemap locs  
4. HSTS after HTTPS is boring  
5. Sweep mixed **active** content on money pages first  

Google’s same canonical doc prefers HTTPS over HTTP when signals aren’t conflicting — and lists HTTPS→HTTP redirects and insecure dependencies as ways to poison that preference.

## Headers: useful vs. decorative

We surface the cores in [Security Headers Checker](/tools/security-headers-checker). For what they *mean*, MDN is the adult in the room:

| Header | Read this |
| --- | --- |
| **Strict-Transport-Security** | [MDN: HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) |
| **Content-Security-Policy** | [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) |
| **X-Content-Type-Options** | [MDN: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options) |
| **X-Frame-Options** | [MDN: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) (CSP `frame-ancestors` is the modern cousin) |
| **Referrer-Policy** | [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) |

My priority list for SEO-minded owners:

1. Valid TLS + HTTPS final URL  
2. No mixed active content on money pages  
3. HSTS once stable (moderate `max-age` first; [preload](https://hstspreload.org/) later — it’s sticky on purpose)  
4. `nosniff`  
5. Framing control  
6. CSP iteratively (report-only → enforce). Don’t brick analytics on a Friday.

Missing CSP + healthy cert: often fine. Perfect CSP score + expired cert: not fine.

### HSTS caution (from scars)

HSTS sticks in browsers. Enable it while HTTPS is flaky and you get support tickets that cannot be fixed with “clear your cache?” Ship redirects first; HSTS second; preload last with eyes open. MDN’s HSTS page covers the preload implications better than another blog listicle will.

## Cert incident playbook

1. Days remaining + issuer on the hostname users hit — [SSL Days](/tools/ssl-checker)  
2. Renew where TLS terminates (often CDN ≠ origin)  
3. Wait/purge edge; re-probe apex + www  
4. Trace redirects still end HTTPS — [Redirect Checker](/tools/redirect-checker)  
5. Confirm robots/sitemap fetch over HTTPS  
6. Only then restore any temporary HSTS looseness  

Write the *owner* of each step into a runbook before the first interstitial. Worst time to learn nobody has the CDN login: launch week.

## What we won’t invent

There’s no honest “security SEO score” that predicts rankings from header bingo. We show presence and values. Same philosophy as the rest of TheSeoSoul.

Monthly: SSL days on both hosts, headers after CDN changes, quarterly [full audit](/#home-audit-url). Start: [SSL](/tools/ssl-checker) → [Headers](/tools/security-headers-checker).
