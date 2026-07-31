import { cn } from "@/lib/utils";

/** Compact Google-style SERP snippet (visual aid — not a live SERP). */
export function SerpSnippetPreview({
  domain,
  title,
  description,
  url,
  className,
  label = "Google snippet preview",
}: {
  domain: string;
  title: string | null;
  description: string | null;
  url?: string | null;
  className?: string;
  label?: string;
}) {
  const displayTitle = title?.trim() || "Missing title tag";
  const displayDesc =
    description?.trim() || "Missing meta description — Google may invent a snippet.";
  const displayUrl =
    url?.replace(/^https?:\/\//, "").replace(/\/$/, "") || domain;

  const titleLong = (title?.length ?? 0) > 60;
  const descLong = (description?.length ?? 0) > 160;

  return (
    <div className={cn("min-w-0", className)}>
      {label ? (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      ) : null}
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
        <p className="truncate text-[12px] text-[#202124] dark:text-slate-300">
          <span className="text-[#202124] dark:text-slate-200">{domain}</span>
          <span className="text-[#4d5156] dark:text-slate-500">
            {" "}
            › {displayUrl.split("/").slice(1).join(" › ") || "…"}
          </span>
        </p>
        <p
          className={cn(
            "mt-0.5 line-clamp-2 text-xl font-normal leading-snug",
            title
              ? "text-[#1a0dab] dark:text-[#8ab4f8]"
              : "text-rose-600 dark:text-rose-400"
          )}
        >
          {displayTitle}
        </p>
        <p
          className={cn(
            "mt-1 line-clamp-2 text-sm leading-snug",
            description
              ? "text-[#4d5156] dark:text-slate-400"
              : "text-amber-700 dark:text-amber-400"
          )}
        >
          {displayDesc}
        </p>
      </div>
      {(titleLong || descLong) && (
        <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
          {titleLong ? "Title may truncate in SERPs. " : null}
          {descLong ? "Description may truncate in SERPs." : null}
        </p>
      )}
    </div>
  );
}
