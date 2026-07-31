"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is TheSeoSoul free — and what isn’t?",
    a: "The technical SEO + GEO audit is free forever for public URLs: no signup, no credit card. You get on-page checks, structure, keywords, AI crawler / llms.txt signals, TLS, DNS, security headers, RDAP domain age when registries answer, and a shareable /audit/[domain] report. What we do not invent on the free tier: Domain Authority, traffic charts, or a full backlink index. Tools like Seobility’s backlink checker need paid link databases and daily query caps — when we add backlinks / SERP / traffic, it will be a clear Pro layer with real data, not fake numbers.",
  },
  {
    q: "How does an audit work?",
    a: "You paste a URL. Our servers normalize the host (apex vs www), fetch live HTML over HTTP/1.1, follow the redirect chain, and in parallel probe robots.txt, sitemap.xml, TLS certificate metadata, DNS/SPF/DMARC, and RDAP/WHOIS. We parse titles, metas, headings, alts, links, Open Graph, schema, and GEO citability signals, then score Meta / Structure / Technical / GEO subscores plus a prioritized Issues list with Why and Fix guidance. The dashboard publishes at /audit/[domain]. Results are lightly cached (about 15 minutes in memory) so free upstreams stay healthy and shared links stay fast — hit Refresh on a report when you need a new crawl.",
  },
  {
    q: "How is this different from other free SEO tools?",
    a: "Most free checkers bury results in a private popup or behind signup. TheSeoSoul ships a real report URL you can send to a client. We combine classic on-page SEO with GEO readiness (AI bots, llms.txt, FAQ/HowTo schema, answer-first structure) and honest tech probes (TLS, DNS, redirects) — without pretending we have Moz-style authority or Ahrefs-scale backlinks. Full-site crawlers and live ChatGPT brand-mention trackers are different products; we score what we can prove from public HTML and public signals.",
  },
  {
    q: "Are audit pages indexed by Google?",
    a: "Reports are shareable for humans — that is the product. Mass-indexing thousands of thin /audit/ URLs is not. Most reports use noindex,follow. Only a small curated set of example domains appears in our sitemap. So you can still send a link to a teammate; we just do not spam search engines with every random audit.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-t border-slate-200 bg-[color:var(--surface)] dark:border-slate-700"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
          FAQ
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Short list. Straight answers.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Four questions covering free vs Pro, how the crawl works, positioning,
          and indexing.
        </p>
        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="font-display text-base text-slate-900 dark:text-slate-50">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
