import Link from "next/link";

const LAYERS = [
  {
    id: "01",
    label: "Meta & SERP",
    score: "Sub-score",
    detail:
      "Title / description length bands, canonical integrity, Open Graph completeness, viewport + HTTPS baselines — the same signals clients ask for in a first pass.",
    signals: [
      "Title",
      "Meta description",
      "Canonical",
      "Open Graph",
      "Viewport",
      "HTTPS",
      "Meta tag checker",
    ],
  },
  {
    id: "02",
    label: "Structure & density",
    score: "Sub-score",
    detail:
      "Heading tree, H1↔title overlap, image alts, internal/external link mix, text-to-HTML ratio, and n-gram keyword density — structure you can act on, not a word cloud.",
    signals: [
      "H1–H3",
      "Title ↔ H1",
      "Image alts",
      "Links",
      "Word count",
      "Text/HTML %",
      "N-grams",
    ],
  },
  {
    id: "03",
    label: "Technical probes",
    score: "Sub-score",
    detail:
      "Live fetch with redirect chain, robots.txt, sitemap.xml, TLS expiry, DNS/SPF/DMARC, mixed content, security headers, stack sniff, and RDAP domain age when the registry answers.",
    signals: [
      "Redirect chain",
      "robots.txt",
      "sitemap.xml",
      "TLS",
      "DNS / SPF",
      "Security headers",
      "RDAP age",
    ],
  },
  {
    id: "04",
    label: "GEO readiness",
    score: "Sub-score",
    detail:
      "AI crawler allow/block map, llms.txt, FAQ/HowTo schema, answer-first and citability heuristics — plus a free GEO Content Checker for drafts. Not a live ChatGPT mention tracker.",
    signals: [
      "GPTBot / ClaudeBot",
      "llms.txt",
      "FAQ schema",
      "HowTo",
      "Answer-first",
      "Citability",
      "Content checker",
    ],
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-slate-300/70 dark:border-slate-700"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-slate-300/70 pb-10 lg:flex-row lg:items-end lg:justify-between dark:border-slate-700">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
              Free audit coverage
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Four scored layers. One shareable report.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Not four marketing tiles — a Seobility-style breakdown: Meta,
              Structure, Technical, and GEO, each with prioritized Issues (Why +
              Fix). Paste once; clients get{" "}
              <code className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[13px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                /audit/[domain]
              </code>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {["Meta", "Structure", "Technical", "GEO"].map((label) => (
              <span
                key={label}
                className="font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300"
              >
                {label}
                <span className="ml-2 text-slate-300 dark:text-slate-600">/</span>
              </span>
            ))}
          </div>
        </div>

        <ol className="divide-y divide-slate-300/70 dark:divide-slate-700">
          {LAYERS.map((layer) => (
            <li
              key={layer.id}
              className="grid gap-4 py-8 md:grid-cols-[3.5rem_11rem_1fr] md:gap-8 lg:grid-cols-[3.5rem_13rem_1fr]"
            >
              <p className="font-mono text-sm text-teal-800 dark:text-teal-300">
                {layer.id}
              </p>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {layer.label}
                </h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {layer.score}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {layer.detail}
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                  {layer.signals.map((signal) => (
                    <li
                      key={signal}
                      className="font-mono text-[11px] text-slate-500 before:mr-3 before:text-teal-700 before:content-['·'] first:before:hidden dark:text-slate-400 dark:before:text-teal-400"
                    >
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-300/70 pt-8 text-sm dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-600 dark:text-slate-300">
            Also on the{" "}
            <Link
              href="/tools"
              className="font-semibold text-teal-800 hover:underline dark:text-teal-300"
            >
              tools hub
            </Link>
            : Meta tags, Canonical, robots.txt, Keyword Density, Open Graph,
            Noindex, Redirects, GEO Content Checker. Backlinks — later.
          </p>
          <Link
            href="/audit/shopify.com"
            className="shrink-0 font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            See a live report →
          </Link>
        </div>
      </div>
    </section>
  );
}
