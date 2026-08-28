"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function DomainHistoryShare({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-teal-700/40 hover:text-teal-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-400/40 dark:hover:text-teal-200"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy share link"}
    </button>
  );
}
