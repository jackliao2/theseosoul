import Link from "next/link";
import { ShieldCheck, UserCheck, BookOpenCheck, Mail } from "lucide-react";
import { SITE_EMAIL } from "@/lib/audit/types";

export function EditorialTrustBox({
  readingMinutes,
  tags,
  lastUpdated,
}: {
  readingMinutes: number;
  tags?: string[];
  lastUpdated?: string;
}) {
  return (
    <aside
      aria-label="Editorial and verification standards"
      className="my-10 overflow-hidden rounded-2xl border border-teal-800/25 bg-gradient-to-br from-teal-950/[0.04] to-transparent p-5 sm:p-6 dark:border-teal-400/25 dark:from-teal-400/[0.05]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white dark:bg-teal-400 dark:text-slate-950">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-800 dark:text-teal-300">
              Editorial &amp; Verification Standards
            </p>
          </div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
            Written &amp; Peer-Reviewed by TheSeoSoul Technical Team
          </h3>
        </div>
        {lastUpdated ? (
          <span className="inline-flex shrink-0 items-center rounded-md bg-slate-200/70 px-2.5 py-1 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Verified {lastUpdated}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        Every guide is authored by our core infrastructure &amp; technical SEO engineering team. All diagnostics, code snippets, and crawler recommendations are tested against live production servers and cross-referenced with official Google Search Central documentation, MDN Web Docs, and RFC specifications.
      </p>

      <div className="mt-4 grid gap-3 border-t border-teal-900/10 pt-4 text-xs text-slate-600 sm:grid-cols-3 dark:border-teal-400/15 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>Primary source verification</span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>Real-world server testing</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <a
            href={`mailto:${SITE_EMAIL}?subject=Guide%20feedback`}
            className="hover:underline text-teal-800 dark:text-teal-300 font-semibold"
          >
            Submit peer correction
          </a>
        </div>
      </div>
    </aside>
  );
}
