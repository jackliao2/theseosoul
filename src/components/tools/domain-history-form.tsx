"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { ToolError } from "@/components/tools/url-tool-form";
import { domainHistoryPathFromInput } from "@/lib/tools/domain-history-url";

export function DomainHistoryForm({
  initialDomain = "",
}: {
  initialDomain?: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialDomain);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value || pending) return;
    setError(null);
    try {
      const href = domainHistoryPathFromInput(value);
      setPending(true);
      router.push(href);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Please enter a valid domain (e.g. example.com)"
      );
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-2xl bg-[#0b1220] p-6 text-white sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 100% at 90% -10%, rgba(45,212,191,.2), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300">
            Internet Archive · WHOIS cross-check
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Look up a domain’s past lives
          </h2>
          <label
            htmlFor="domain-history-url"
            className="mt-6 block text-sm font-semibold text-slate-200"
          >
            Domain
          </label>
          <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
            <input
              id="domain-history-url"
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="theseosoul.com"
              autoComplete="url"
              className="h-14 min-w-0 flex-1 rounded-xl border border-white/15 bg-white px-5 text-lg text-slate-900 outline-none ring-teal-300/50 placeholder:text-slate-400 focus:ring-2"
              required
            />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-400 px-7 text-sm font-bold text-slate-950 hover:bg-teal-300 disabled:cursor-wait disabled:opacity-70 sm:min-w-[10.5rem]"
            >
              {pending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              {pending ? "Opening…" : "Read history"}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Free · No login · Shareable report URL · Public Wayback + RDAP only
          </p>
        </div>
      </form>
      {error ? <ToolError>{error}</ToolError> : null}
    </div>
  );
}
