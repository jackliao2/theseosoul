import { cn } from "@/lib/utils";
import {
  MARK_BAR_1,
  MARK_BAR_2,
  MARK_BAR_3,
  MARK_FLAME,
  MARK_FLAME_INNER,
  MARK_SPARK,
  MARK_VIEWBOX,
} from "@/components/brand/mark-geometry";

type Size = "sm" | "md" | "lg" | "hero";

const sizeClass: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-2xl",
  hero: "text-4xl sm:text-5xl md:text-6xl",
};

const logoSize: Record<Size, string> = {
  sm: "h-7 w-7",
  md: "h-8 w-8 sm:h-9 sm:w-9",
  lg: "h-10 w-10",
  hero: "h-12 w-12 sm:h-14 sm:w-14",
};

/**
 * Wordmark: TheSeoSoul.
 * Uses CSS theme tokens (--ink / --accent) so it stays readable even if a
 * Tailwind dark: variant fails to apply.
 */
export function SiteWordmark({
  size = "md",
  className,
  withDomain,
}: {
  size?: Size;
  className?: string;
  withDomain?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline justify-center font-display font-extrabold tracking-tight",
        sizeClass[size],
        className
      )}
    >
      <span className="text-[color:var(--ink)]">The</span>
      <span className="text-[color:var(--accent)]">Seo</span>
      <span className="text-[color:var(--ink)]">Soul</span>
      {withDomain ? (
        <span className="font-semibold text-slate-500 dark:text-slate-400">
          .com
        </span>
      ) : null}
    </span>
  );
}

/** Shared glyph: rising SEO signal + soul flame + spark. */
export function MarkGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      fill="none"
      aria-hidden
    >
      {/* SEO — rank signal */}
      <path d={MARK_BAR_1} fill="#2dd4bf" fillOpacity="0.45" />
      <path d={MARK_BAR_2} fill="#2dd4bf" fillOpacity="0.72" />
      <path d={MARK_BAR_3} fill="#2dd4bf" />
      {/* Soul — flame + spark */}
      <path d={MARK_FLAME} fill="#5eead4" />
      <path d={MARK_FLAME_INNER} fill="#0b1220" fillOpacity="0.35" />
      <path d={MARK_SPARK} fill="#ccfbf1" />
    </svg>
  );
}

/**
 * Brand mark: SEO signal bars + soul flame — Seo + Soul in one glyph.
 */
export function SiteLogo({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.65rem] bg-[#0b1220] shadow-sm ring-1 ring-teal-900/20 dark:bg-[#0e1a22] dark:ring-teal-400/30",
        logoSize[size],
        className
      )}
      aria-hidden
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(45,212,191,0.32),transparent_52%),radial-gradient(circle_at_25%_80%,rgba(45,212,191,0.12),transparent_50%)]" />
      <MarkGlyph className="relative h-[82%] w-[82%]" />
    </span>
  );
}

export function SiteBrand({
  size = "md",
  className,
  showWordmark = true,
}: {
  size?: Size;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SiteLogo size={size} />
      {showWordmark ? <SiteWordmark size={size} /> : null}
    </span>
  );
}
