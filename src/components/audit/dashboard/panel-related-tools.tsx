import Link from "next/link";
import type { AuditTabId } from "@/lib/audit/types";
import { getToolByHref } from "@/lib/tools/catalog";

type Related = { href: string; label: string };

const TAB_TOOLS: Record<AuditTabId, Related[]> = {
  overview: [
    { href: "/tools/domain-history", label: "Domain history" },
    { href: "/tools/adsense-readiness-checker", label: "AdSense readiness" },
    { href: "/tools/seo-ladder", label: "SEO ladder" },
    { href: "/tools/robots-txt-checker", label: "Robots.txt" },
  ],
  soul: [
    { href: "/about#site-soul", label: "About Site Soul" },
    { href: "/tools/seo-ladder", label: "SEO ladder" },
    { href: "/tools/geo-content-checker", label: "GEO content" },
  ],
  issues: [
    { href: "/tools/meta-tag-checker", label: "Meta tags" },
    { href: "/tools/canonical-checker", label: "Canonical" },
    { href: "/tools/noindex-checker", label: "Noindex" },
    { href: "/tools/robots-txt-checker", label: "Robots.txt" },
  ],
  structure: [
    { href: "/tools/meta-tag-checker", label: "Meta tags" },
    { href: "/tools/open-graph-checker", label: "Open Graph" },
    { href: "/tools/keyword-density-checker", label: "Density" },
  ],
  keywords: [
    { href: "/tools/keyword-density-checker", label: "Density checker" },
    { href: "/tools/geo-content-checker", label: "GEO content" },
    { href: "/tools/meta-tag-checker", label: "Meta tags" },
  ],
  signals: [
    { href: "/tools/meta-tag-checker", label: "Meta tags" },
    { href: "/tools/open-graph-checker", label: "Open Graph" },
    { href: "/tools/canonical-checker", label: "Canonical" },
  ],
  geo: [
    { href: "/tools/geo-content-checker", label: "GEO content" },
    { href: "/tools/robots-txt-checker", label: "Robots.txt" },
    { href: "/tools/noindex-checker", label: "Noindex" },
  ],
  domain: [
    { href: "/tools/domain-history", label: "Domain history" },
    { href: "/tools/redirect-checker", label: "Redirects" },
    { href: "/tools/robots-txt-checker", label: "Robots.txt" },
  ],
  insights: [
    { href: "/tools/seo-ladder", label: "SEO ladder" },
    { href: "/tools/adsense-readiness-checker", label: "AdSense readiness" },
    { href: "/tools/domain-history", label: "Domain history" },
  ],
};

const NEW_TAB = {
  target: "_blank" as const,
  rel: "noopener noreferrer",
};

export function PanelRelatedTools({ tab }: { tab: AuditTabId }) {
  const tools = TAB_TOOLS[tab];
  return (
    <aside className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Related free tools
        </p>
        <Link
          href="/tools"
          {...NEW_TAB}
          className="text-[11px] font-semibold text-teal-800 hover:underline dark:text-teal-300"
        >
          All tools →
        </Link>
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {tools.map((tool) => {
          const mark = getToolByHref(tool.href)?.mark;
          return (
            <li key={tool.href}>
              <Link
                href={tool.href}
                {...NEW_TAB}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-700/35 hover:bg-teal-800/[0.06] hover:text-teal-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-400/35 dark:hover:bg-teal-400/[0.08] dark:hover:text-teal-200"
              >
                {mark ? (
                  <span
                    aria-hidden
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-[#0b1220] px-1 font-mono text-[9px] font-bold tracking-wide text-teal-300 dark:bg-teal-400/15 dark:text-teal-300"
                  >
                    {mark}
                  </span>
                ) : null}
                {tool.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
