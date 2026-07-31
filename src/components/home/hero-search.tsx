"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  focusHomeAudit,
  HOME_AUDIT_HASH,
  HOME_AUDIT_INPUT_ID,
} from "@/lib/focus-home-audit";
import { normalizeUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

export function HeroSearch({
  className,
  size = "default",
  /** When true, this instance is the homepage target for #home-audit-url */
  anchorTarget = false,
}: {
  className?: string;
  size?: "default" | "lg";
  anchorTarget?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputId = anchorTarget ? HOME_AUDIT_INPUT_ID : "audit-url";

  useEffect(() => {
    if (!anchorTarget) return;

    const timers: number[] = [];

    function run(smooth = true) {
      if (window.location.hash !== `#${HOME_AUDIT_HASH}`) return;
      focusHomeAudit(smooth ? "smooth" : "auto");
    }

    function onHashChange() {
      run(true);
    }

    // Next.js soft-nav often resets scroll after paint — nudge a few times.
    run(true);
    timers.push(window.setTimeout(() => run(false), 80));
    timers.push(window.setTimeout(() => run(false), 320));

    window.addEventListener("hashchange", onHashChange);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [anchorTarget]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const { domain } = normalizeUrl(value);
      startTransition(() => {
        router.push(`/audit/${domain}`);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please enter a valid URL");
    }
  }

  return (
    <div
      id={anchorTarget ? HOME_AUDIT_HASH : undefined}
      className={cn(anchorTarget && "scroll-mt-28", className)}
    >
      <form onSubmit={onSubmit} className="w-full max-w-2xl">
        <label htmlFor={inputId} className="sr-only">
          Website URL to audit
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id={inputId}
              name="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="shopify.com or https://example.com"
              className={cn("pl-11", size === "lg" && "h-14 text-base")}
              autoComplete="url"
              inputMode="url"
              disabled={isPending}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className={cn(size === "lg" && "h-14 px-8")}
            disabled={isPending || !value.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Auditing…
              </>
            ) : (
              <>
                Free SEO Audit
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        {error ? (
          <p
            className="mt-3 text-sm text-rose-600 dark:text-rose-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
