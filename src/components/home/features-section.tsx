import Link from "next/link";

const LAYERS = [
  {
    id: "01",
    label: "Meta & SERP",
    detail:
      "Titles, descriptions, canonicals, social cards, viewport, and HTTPS.",
    signals: ["Title", "Description", "Canonical", "Open Graph", "HTTPS"],
  },
  {
    id: "02",
    label: "Structure & content",
    detail:
      "Heading hierarchy, image alts, link mix, word count, and keyword density.",
    signals: ["H1–H3", "Image alts", "Links", "Word count", "N-grams"],
  },
  {
    id: "03",
    label: "Technical probes",
    detail:
      "Redirects, crawl files, TLS, DNS, security headers, and domain age.",
    signals: ["Redirects", "robots.txt", "Sitemap", "TLS / DNS", "RDAP"],
  },
  {
    id: "04",
    label: "GEO readiness",
    detail:
      "AI crawler access, llms.txt, schema, answer-first writing, and citability.",
    signals: ["AI bots", "llms.txt", "Schema", "Answer-first", "Citability"],
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-16 border-t border-slate-300/70 dark:border-slate-700 lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
              Free audit coverage
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Four scored layers. One report.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              A complete technical snapshot with prioritized Why + Fix issues,
              published at a shareable{" "}
              <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[12px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                /audit/[host/path]
              </code>
              .
            </p>
          </div>
          <Link
            href="/audit/theseosoul.com"
            className="shrink-0 text-sm font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Open our sample report →
          </Link>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {LAYERS.map((layer) => (
            <li
              key={layer.id}
              className="group relative overflow-hidden rounded-xl border border-slate-300/70 bg-[color:var(--surface)]/55 p-4 transition-colors hover:border-teal-700/35 hover:bg-teal-800/[0.03] dark:border-slate-700 dark:hover:border-teal-400/30 dark:hover:bg-teal-400/[0.04]"
            >
              <span className="absolute inset-y-0 left-0 w-0.5 bg-teal-700/45 dark:bg-teal-300/45" />
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[11px] font-semibold text-teal-800 dark:text-teal-300">
                  {layer.id}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {layer.label}
                    </h3>
                    <span className="rounded-full bg-teal-800/[0.08] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-teal-800 dark:bg-teal-400/10 dark:text-teal-300">
                      scored
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {layer.detail}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {layer.signals.map((signal) => (
                      <li
                        key={signal}
                        className="rounded-md border border-slate-200 bg-white/55 px-2 py-1 font-mono text-[9px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/35 dark:text-slate-400"
                      >
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-300/70 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Need one check only? Meta, canonical, robots.txt, density, Open
            Graph, noindex, redirects, and GEO are available separately.
          </p>
          <Link
            href="/tools"
            className="shrink-0 font-semibold text-teal-800 hover:underline dark:text-teal-300"
          >
            Browse free tools →
          </Link>
        </div>
      </div>
    </section>
  );
}
