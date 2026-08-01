"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { auditHref, normalizeUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

export function DashboardSearch({
  currentDomain,
  className,
  compact,
}: {
  currentDomain: string;
  className?: string;
  /** Icon-only trigger on very small screens when used in a row */
  compact?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const normalized = normalizeUrl(value || currentDomain);
      startTransition(() => router.push(auditHref(normalized)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid URL");
    }
  }

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white",
          className
        )}
        aria-label="Audit another website"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("relative min-w-0 max-w-md flex-1", className)}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Domain or full URL…"
        className="h-8 pl-9 text-sm sm:h-9"
        disabled={isPending}
        aria-label="Audit another website"
        autoFocus={compact}
        onBlur={() => {
          if (compact && !value) setOpen(false);
        }}
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400" />
      ) : null}
      {error ? (
        <p className="absolute left-0 top-full z-10 mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
