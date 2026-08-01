"use client";

import { useState } from "react";
import Link from "next/link";
import { SerpSnippetPreview } from "@/components/seo/serp-snippet-preview";
import type { AuditResult } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

type Sub = "social" | "schema" | "hreflang";

export function PanelSignals({ audit }: { audit: AuditResult }) {
  const [sub, setSub] = useState<Sub>("social");
  const { social, structured, hreflangs, extras } = audit;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Signals
        </h2>
        <div className="flex rounded-md border border-slate-200 p-0.5 text-xs dark:border-slate-700">
          {(
            [
              ["social", "Social"],
              ["schema", `Schema ${structured.jsonLdCount}`],
              ["hreflang", `Hreflang ${hreflangs.total}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSub(id)}
              className={cn(
                "rounded px-2.5 py-1 font-semibold transition-colors",
                sub === id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {sub === "social" ? (
        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <SerpSnippetPreview
              domain={audit.domain}
              title={audit.title.content}
              description={audit.description.content}
              url={audit.url}
            />
            <SharePreview audit={audit} />
          </div>
          <p className="text-[11px] text-slate-500">
            Tweak a draft snippet in the{" "}
            <Link
              href="/tools/meta-tag-checker"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
            >
              Meta Tag Checker
            </Link>
            .
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <TagBlock title="Open Graph" tags={social.openGraph.tags} />
            <TagBlock title="Twitter" tags={social.twitter.tags} />
          </div>
        </div>
      ) : null}

      {sub === "schema" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{structured.message}</p>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["Breadcrumb", extras.schemaFlags.breadcrumb],
                ["Organization", extras.schemaFlags.organization],
                ["WebSite", extras.schemaFlags.website],
                ["FAQ", extras.schemaFlags.faq],
              ] as const
            ).map(([label, on]) => (
              <span
                key={label}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-semibold",
                  on
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-900"
                )}
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className={cn(
              "rounded-md border px-2.5 py-2 text-xs",
              extras.faqSchema.present
                ? "border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400"
            )}
          >
            <span className="font-semibold">FAQ schema · </span>
            {extras.faqSchema.message}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {structured.types.length ? (
              structured.types.map((t) => (
                <span
                  key={t}
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[11px]",
                    /faq|question/i.test(t)
                      ? "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">No JSON-LD types.</span>
            )}
          </div>
          <div className="space-y-2">
            {structured.snippets.slice(0, 6).map((snip, i) => (
              <pre
                key={i}
                className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-2 font-mono text-[10px] leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                {snip.slice(0, 800)}
                {snip.length > 800 ? "…" : ""}
              </pre>
            ))}
          </div>
        </div>
      ) : null}

      {sub === "hreflang" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{hreflangs.message}</p>
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-950">
                <tr>
                  <th className="px-2 py-1.5">Lang</th>
                  <th className="px-2 py-1.5">Href</th>
                </tr>
              </thead>
              <tbody>
                {hreflangs.items.map((item, i) => (
                  <tr
                    key={`${item.lang}-${i}`}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="whitespace-nowrap px-2 py-1.5 font-mono">
                      {item.lang}
                    </td>
                    <td className="max-w-[360px] truncate px-2 py-1.5">
                      <a
                        href={item.href}
                        className="text-teal-700 hover:underline dark:text-teal-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.href}
                      </a>
                    </td>
                  </tr>
                ))}
                {hreflangs.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      No hreflang tags.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SharePreview({ audit }: { audit: AuditResult }) {
  const og = audit.social.openGraph.tags;
  const image = og["og:image"] || og["og:image:url"] || null;
  const title = og["og:title"] || audit.title.content || audit.domain;
  const desc = og["og:description"] || audit.description.content || "";

  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Share preview
      </p>
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="aspect-[1.91/1] w-full bg-slate-100 object-cover"
          />
        ) : (
          <div className="flex aspect-[1.91/1] items-center justify-center bg-slate-100 text-[10px] text-slate-400 dark:bg-slate-900">
            No og:image
          </div>
        )}
        <div className="space-y-0.5 px-2 py-1.5">
          <p className="truncate text-[10px] text-slate-400">{audit.domain}</p>
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 dark:text-white">
            {title}
          </p>
          <p className="line-clamp-2 text-[11px] leading-snug text-slate-500">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function TagBlock({
  title,
  tags,
}: {
  title: string;
  tags: Record<string, string>;
}) {
  const entries = Object.entries(tags);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
        {title}
      </div>
      {entries.length === 0 ? (
        <p className="px-2.5 py-3 text-xs text-slate-500">None found</p>
      ) : (
        <dl>
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[7rem_1fr] gap-2 border-t border-slate-100 px-2.5 py-1.5 text-xs dark:border-slate-800"
            >
              <dt className="truncate font-mono text-slate-500">{k}</dt>
              <dd className="truncate text-slate-800 dark:text-slate-200">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
