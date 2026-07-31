"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "theseosoul-recent-audits";

export function rememberRecentDomain(domain: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [domain, ...list.filter((d) => d !== domain)].slice(0, 8);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function RecentAudits() {
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDomains(JSON.parse(raw) as string[]);
    } catch {
      // ignore
    }
  }, []);

  function clearRecent() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setDomains([]);
  }

  if (domains.length === 0) return null;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Recent
        </p>
        <button
          type="button"
          onClick={clearRecent}
          className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-500 dark:hover:text-slate-300"
        >
          Clear recent
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
        {domains.map((domain) => (
          <Link
            key={domain}
            href={`/audit/${domain}`}
            className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
          >
            {domain}
          </Link>
        ))}
      </div>
    </div>
  );
}
