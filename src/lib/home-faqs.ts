/** Homepage FAQ copy — used by the visible accordion and homepage-only JSON-LD. */
export const HOME_FAQS = [
  {
    q: "Is TheSeoSoul free — and what isn’t?",
    a: "The technical SEO + GEO audit is free forever for public URLs: no signup, no credit card. You get on-page checks, structure, keywords, AI crawler / llms.txt signals, TLS, DNS, security headers, RDAP domain age when registries answer, and a shareable /audit/[host/path] report. What we do not invent on the free tier: Domain Authority, traffic charts, or a full backlink index. Tools like Seobility’s backlink checker need paid link databases and daily query caps — when we add backlinks / SERP / traffic, it will be a clear Pro layer with real data, not fake numbers.",
  },
  {
    q: "How does an audit work?",
    a: "You paste a URL. Our servers normalize the host (apex vs www), fetch that page’s live HTML over HTTP/1.1, follow the redirect chain, and in parallel probe site-level signals such as robots.txt, sitemap.xml, TLS certificate metadata, DNS/SPF/DMARC, and RDAP/WHOIS. We parse titles, metas, headings, alts, links, Open Graph, schema, and GEO citability signals, then score Meta / Structure / Technical / GEO subscores plus a prioritized Issues list with Why and Fix guidance. This is a focused URL audit with site-level probes, not a crawl of every URL on the domain. The dashboard publishes at /audit/[host/path]. Results are lightly cached (about 15 minutes in memory) so free upstreams stay healthy and shared links stay fast — hit Refresh on a report when you need a new crawl.",
  },
  {
    q: "Can I generate, share, or download a free SEO report?",
    a: "Yes. Run the free audit and you get a live /audit/[host/path] report URL that you can send to a client or teammate. Use Print / PDF to print the report or save it as a PDF through your browser, or use Download JSON for the underlying audit data. No account is required.",
  },
  {
    q: "How is this different from other free SEO tools?",
    a: "Most free checkers bury results in a private popup or behind signup. TheSeoSoul ships a real report URL you can send to a client. We combine classic on-page SEO with GEO readiness (AI bots, llms.txt, FAQ/HowTo schema, answer-first structure) and honest tech probes (TLS, DNS, redirects) — without pretending we have Moz-style authority or Ahrefs-scale backlinks. Full-site crawlers and live ChatGPT brand-mention trackers are different products; we score what we can prove from public HTML and public signals.",
  },
  {
    q: "Are audit pages indexed by Google?",
    a: "Reports are shareable for humans — that is the product. Mass-indexing thousands of thin /audit/ URLs is not. Most reports use noindex,follow. Only a small curated set of example domains appears in our sitemap. So you can still send a link to a teammate; we just do not spam search engines with every random audit.",
  },
] as const;
